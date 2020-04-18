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

const fixedDate = '20200418';
const expected = {
  asahi: {
    hrefs: [
      'http://www.asahi.com/articles/DA3S14446226.html',
      'http://www.asahi.com/articles/DA3S14446224.html',
      'http://www.asahi.com/articles/DA3S14446225.html',
      'http://www.asahi.com/articles/DA3S14446223.html',
    ],
    titles: [
      '重症者ら対応、診療報酬倍増　１０万円、郵送・オンライン手続き　首相会見　新型コロナ',
      '中国ＧＤＰ、初のマイナス　６．８％減、コロナ影響　１～３月',
      '休業対策で道場開放　神奈川県、漫喫など利用者向け',
      '（天声人語）一犯一語',
    ],
  },
  lemonde: {
    hrefs: [
      'https://www.lemonde.fr/idees/article/2020/04/17/le-grand-age-un-enjeu-prioritaire_6036901_3232.html',
    ],
    titles: [
      'Le grand âge, un enjeu prioritaire',
    ],
  },
};
const asahiData = fs.readFileSync(path.join(__dirname, 'asahi-20200418.html'));
const lemondeData = fs.readFileSync(path.join(__dirname, 'lemonde-20200418.html'));
const data = {
  asahi: asahiData,
  lemonde: lemondeData,
};

const papers = [ 'asahi', 'lemonde' ];

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
