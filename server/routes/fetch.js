const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { add } = require('../db/articles');

const fetchAsahi = async (date) => {
  const paper = 'asahi';
  const url = `http://www.asahi.com/shimen/${date}/index_tokyo_list.html`;
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  const articles = [];

  doc.querySelectorAll('div[id="page1"] li').forEach((li) => {
    const { className } = li;

    if (className === 'HeadlineImage') {
      return;
    }

    const { href, textContent: title } = li.querySelector('a');

    if (
      title.startsWith('折々のことば') ||
      title.startsWith('（しつもん！ドラえもん')
    ) {
      return;
    }

    articles.push({ published: date, paper, href, title });
  });

  return articles;
};

module.exports = (router) => {
  router.get('/api/fetch/:paper/:date', async (req, res) => {
    const { paper, date } = req.params;
    let articles = [];

    if (paper === 'asahi') {
      articles = await fetchAsahi(date);
      if (articles.length > 0) {
        await add(articles);
      }
    }

    res.json(articles);
  });
};
