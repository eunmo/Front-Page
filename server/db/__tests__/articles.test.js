const { dml, query, cleanup } = require('../query.js');
const { add, clear, get } = require('../articles.js');

jest.mock('../db.json', () => {
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
  await cleanup();
});

beforeEach(async () => {
  await dml('TRUNCATE TABLE articles;');
});

const oldDate = '20000101';

test('inserts one', async () => {
  const [paper, href, title] = ['paper', 'href', 'title'];
  await add([{ published: oldDate, paper, href, title }]);
  const rows = await query('SELECT * FROM articles');
  expect(rows.length).toBe(1);
});

test.each([1, 10])('clears %d', async (count) => {
  const [paper, href, title] = ['paper', 'href', 'title'];
  const articles = [];
  for (let i = 0; i < count; i += 1) {
    articles.push({ published: oldDate, paper, href, title });
  }
  await add(articles);
  let rows = await query('SELECT * FROM articles');
  expect(rows.length).toBe(count);

  await clear(paper, '20200202');
  rows = await query('SELECT * FROM articles');
  expect(rows.length).toBe(count);

  await clear(paper, oldDate);
  rows = await query('SELECT * FROM articles');
  expect(rows.length).toBe(0);
});

test.each([0, 1, 10])('get %d', async (count) => {
  const [paper, href, title] = ['paper', 'href', 'title'];
  if (count > 0) {
    const articles = [];
    for (let i = 0; i < count; i += 1) {
      articles.push({ published: oldDate, paper, href, title });
    }
    await add(articles);
  }
  const rows = await get(oldDate);
  expect(rows.length).toBe(count);
});
