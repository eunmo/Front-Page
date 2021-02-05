const { dml, query } = require('@eunmo/mysql');

const add = (articles) => {
  const values = articles.map(({ published, paper, href, title }) => [
    published,
    paper,
    href,
    title,
  ]);
  return dml('INSERT INTO articles VALUES ?', [values]);
};

const clear = (paper, targetDate) => {
  return dml('DELETE FROM articles WHERE paper = ? AND published = ?', [
    paper,
    targetDate,
  ]);
};

const get = (targetDate) => {
  return query('SELECT * FROM articles WHERE published = ?', targetDate);
};

module.exports = { add, clear, get };
