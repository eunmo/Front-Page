const { dml, query } = require('./query.js');

const add = (articles) => {
  const values = [];
  articles.forEach(({ published, paper, href, title }) => {
    values.push(`('${published}', '${paper}', '${href}', '${title}')`);
  });
  return dml(`
    INSERT INTO articles
    VALUES ${values.join(',')}`);
};

const clear = (targetDate) => {
  return dml(`
    DELETE FROM articles
          WHERE published='${targetDate}'`);
};

const get = (targetDate) => {
  return query(`
    SELECT * FROM articles
          WHERE published='${targetDate}'`);
};

module.exports = { add, clear, get };
