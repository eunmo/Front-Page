const fs = require('fs');
const path = require('path');
const request = require('supertest');
const fetch = require('node-fetch');
const app = require('../../app');
const { dml } = require('../../db/query');

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

jest.mock('../../db/db.json', () => {
  return {
    host: 'localhost',
    user: 'news',
    password: 'news',
    database: 'newstest',
  };
});

beforeAll(async () => {
  await dml('DROP TABLE IF EXISTS articles;');
  await dml('CREATE TABLE articles LIKE news.articles;');
});

afterAll(async () => {
  await dml('DROP TABLE IF EXISTS articles;');
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE articles;');
});

const fixedDate = '20200424';
const expected = {
  asahi: {
    hrefs: [
      'http://www.asahi.com/articles/DA3S14453801.html',
      'http://www.asahi.com/articles/DA3S14453808.html',
      'http://www.asahi.com/articles/DA3S14453805.html',
      'http://www.asahi.com/articles/DA3S14453807.html',
      'http://www.asahi.com/articles/DA3S14453799.html',
    ],
    titles: [
      '軽症者療養、宿泊施設で　自宅より優先に転換　厚労省　新型コロナ',
      'スーパー入店、政府「制限を」　混雑回避、知事に要請　新型コロナ',
      '景気判断「急速に悪化」　リーマン後以来　４月・月例経済報告',
      '湘南、立ち入り控えて　海岸に看板設置　新型コロナ',
      '（天声人語）金正恩氏の健康状態',
    ],
  },
  lemonde: {
    hrefs: [
      'https://www.lemonde.fr/idees/article/2020/04/23/coronavirus-le-modele-francais-a-l-epreuve-du-deconfinement_6037531_3232.html',
    ],
    titles: ['Coronavirus : le modèle français à l’épreuve du déconfinement'],
  },
};
const asahiData = fs.readFileSync(
  path.join(__dirname, `asahi-${fixedDate}.html`)
);
const lemondeData = fs.readFileSync(
  path.join(__dirname, `lemonde-${fixedDate}.html`)
);
const data = {
  asahi: asahiData,
  lemonde: lemondeData,
};

const papers = ['asahi', 'lemonde'];

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
