const fs = require('fs');
const path = require('path');
const request = require('supertest');
const fetch = require('node-fetch');
const { dml, cleanup } = require('@eunmo/mysql');
const app = require('../../app');

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

afterAll(async () => {
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE articles;');
});

const fixedDate = '20200424';
const expected = {
  lemonde: {
    hrefs: [
      'https://www.lemonde.fr/idees/article/2020/04/23/coronavirus-le-modele-francais-a-l-epreuve-du-deconfinement_6037531_3232.html',
    ],
    titles: ['Coronavirus : le modèle français à l’épreuve du déconfinement'],
  },
};
const lemondeData = fs.readFileSync(
  path.join(__dirname, `lemonde-${fixedDate}.html`)
);
const data = {
  lemonde: lemondeData,
};

const papers = ['lemonde'];

test.each(papers)('fetch %s', async (paper) => {
  fetch.mockReturnValue(Promise.resolve(new Response(data[paper])));

  const url = `/api/fetch/${paper}/${fixedDate}`;
  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.length).toBe(expected[paper].hrefs.length);

  body.forEach((article, index) => {
    expect(article.published).toBe(fixedDate);
    expect(article.paper).toBe(paper);
    expect(article.href).toBe(expected[paper].hrefs[index]);
    expect(article.title).toBe(expected[paper].titles[index]);
  });
});

test('fetch mock', async () => {
  const url = `/api/fetch/mock/${fixedDate}`;
  const response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.length).toBe(0);
});

test.each(papers)('fetch then select %s', async (paper) => {
  fetch.mockReturnValue(Promise.resolve(new Response(data[paper])));

  let url = `/api/fetch/${paper}/${fixedDate}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  url = `/api/select/${fixedDate}`;
  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.length).toBe(expected[paper].hrefs.length);

  body.forEach((article, index) => {
    expect(article.published).toBe(fixedDate);
    expect(article.paper).toBe(paper);
    expect(article.href).toBe(expected[paper].hrefs[index]);
    expect(article.title).toBe(expected[paper].titles[index]);
  });
});

test.each(papers)('fetch then clear %s', async (paper) => {
  fetch.mockReturnValue(Promise.resolve(new Response(data[paper])));

  let url = `/api/fetch/${paper}/${fixedDate}`;
  let response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  url = `/api/clear/${paper}/${fixedDate}`;
  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  url = `/api/select/${fixedDate}`;
  response = await request(app).get(url);
  expect(response.statusCode).toBe(200);

  const { body } = response;
  expect(body.length).toBe(0);
});
