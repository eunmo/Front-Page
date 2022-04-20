import { useState, useEffect } from 'react';
import './App.css';

import papers from './papers';
import { get, toUTCDate, getDateUrl } from './utils';

export default function App() {
  const [date, setDate] = useState(toUTCDate(new Date()));
  const [articles, setArticles] = useState({});
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    const url = `/api/select/${getDateUrl(date)}`;
    get(url, (res) => {
      const map = res.reduce(
        (m, a) => Object.assign(m, { [a.paper]: (m[a.paper] ?? []).concat(a) }),
        {}
      );
      setArticles(map);
    });

    const day = date.getDay();
    const dayCodes = papers.codes.filter((c) => !papers[c].skip[day]);
    setCodes(dayCodes);
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
    const url = `/api/${api}/${code}/${getDateUrl(date)}`;
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
        {codes.map((code) => (
          <div key={code}>
            <h2 className="App-paper-header" onClick={() => toggle(code)}>
              {papers[code].name}
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
}
