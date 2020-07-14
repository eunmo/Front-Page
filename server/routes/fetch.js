const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { add } = require('../db/articles');

const router = express.Router();

const getDoc = async (url) => {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html, { url });
  return dom.window.document;
};

const fetchAsahi = async (date) => {
  const paper = 'asahi';
  const url = `http://www.asahi.com/shimen/${date}/index_tokyo_list.html`;
  const doc = await getDoc(url);
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

const fetchLeMonde = async (date) => {
  const paper = 'lemonde';
  const url = 'http://www.lemonde.fr/editoriaux';
  const doc = await getDoc(url);
  const articles = [];
  const year = date.substr(0, 4);
  const month = date.substr(4, 2);
  const day = date.substr(6, 2);
  let targetDate = new Date(Date.UTC(year, month - 1, day - 1));
  targetDate = targetDate.toISOString().substring(0, 10).replace(/-/g, '/');

  doc.querySelectorAll('section[class*="teaser"]').forEach((section) => {
    const a = section.querySelector('a');
    const { href } = a;

    if (!href.includes(targetDate)) {
      return;
    }

    const { textContent: title } = a.querySelector('h3');

    articles.push({ published: date, paper, href, title });
  });

  return articles;
};

const fetchFunctions = {
  asahi: fetchAsahi,
  lemonde: fetchLeMonde,
};

router.get('/:paper/:date', async (req, res) => {
  const { paper, date } = req.params;
  const articles = (await fetchFunctions[paper]?.(date)) ?? [];

  if (articles.length > 0) {
    await add(articles);
  }

  res.json(articles);
});

module.exports = router;
