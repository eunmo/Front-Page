import React, { useState, useEffect } from 'react';
import './App.css';

import papers from './papers';

const get = (url, callback) => {
  fetch(url)
    .then((response) => response.json())
    .then(callback);
};

const toUTCDate = (date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
};

const getDateUrl = (date) => {
  return date.toISOString().substring(0, 10).replace(/-/g, '');
};

export default () => {
  const [date, setDate] = useState(toUTCDate(new Date()));
  const [articles, setArticles] = useState({});
  const [filteredPapers, setFilteredPapers] = useState({ codes: [] });

  useEffect(() => {
    const url = `/api/select/${getDateUrl(date)}`;
    get(url, (res) => {
      const map = {};
      res.forEach((article) => {
        if (map[article.paper] === undefined) {
          map[article.paper] = [];
        }
        map[article.paper].push(article);
      });
      setArticles(map);
    });

    const newPapers = { codes: [] };
    const day = date.getDay();

    papers.codes.forEach((code) => {
      const paper = papers[code];
      if (paper.skip[day] !== true) {
        newPapers.codes.push(code);
        newPapers[code] = paper;
      }
    });

    setFilteredPapers(newPapers);
  }, [date]);

  const displayDate = () => {
    const abbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = abbr[date.getDay()];
    const formatted = date.toISOString().substring(2, 10).replace(/-/g, '.');
    return `${day} ${formatted}`;
  };

  const moveDate = (diff) => {
    const d = new Date(date);
    d.setDate(d.getDate() + diff);
    setDate(d);
  };

  const toggle = (code) => {
    const api = articles[code] === undefined ? 'fetch' : 'clear';
    const url = `api/${api}/${code}/${getDateUrl(date)}`;
    fetch(url).then(() => {
      setDate(new Date(date));
    });
  };

  return (
    <div className="App">
      <div className="App-side" />
      <div>
        <h1 className="App-header">
          <span className="App-btn" onClick={() => moveDate(-1)}>
            {'◁ '}
          </span>
          {displayDate()}
          <span className="App-btn" onClick={() => moveDate(1)}>
            {' ▷'}
          </span>
        </h1>
        {filteredPapers.codes.map((code) => (
          <div key={code}>
            <h2 className="App-paper-header" onClick={() => toggle(code)}>
              {filteredPapers[code].name}
            </h2>
            {articles[code] &&
              articles[code].map((article) => (
                <div className="App-article" key={article.href}>
                  {`■ `}
                  <a href={article.href} className="App-link">
                    {article.title}
                  </a>
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className="App-side" />
    </div>
  );
};
