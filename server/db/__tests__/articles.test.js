const { dml, query, cleanup } = require('@eunmo/mysql');
const { add, clear, get } = require('../articles');

afterAll(async () => {
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
