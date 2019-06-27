import React, { Component } from 'react';
import './App.css';

import papers from './data/papers';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { date: this.toUTCDate(new Date()), fetched: {} };

    this.moveDate = this.moveDate.bind(this);
    this.selectPapers = this.selectPapers.bind(this);
    this.togglePaper = this.togglePaper.bind(this);
  }

  componentDidMount() {
    this.selectPapers();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.date !== this.state.date) {
      this.selectPapers();
    }
  }

  render() {
    let papers = this.filterPapers();

    return (
      <div className="App">
        <div className="App-side"></div>
        <div>
          <h1 className="App-header">
            <span className="App-btn" onClick={() => this.moveDate(-1)}>
              ◁{' '}
            </span>
            {this.displayDate()}
            <span className="App-btn" onClick={() => this.moveDate(1)}>
              {' '}
              ▷
            </span>
          </h1>
          {papers.codes.map(code => {
            var paper = papers[code];
            paper.list = this.state.fetched[code];

            if (paper.list === undefined) paper.list = [];

            return (
              <div key={code}>
                <h2
                  className="App-paper-header"
                  onClick={() => this.togglePaper(code)}
                >
                  {paper.name}
                </h2>
                {paper.list.map(article => {
                  return (
                    <div className="App-article" key={article.href}>
                      ■{' '}
                      <a href={paper.url + article.href} className="App-link">
                        {article.title}
                      </a>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="App-side"></div>
      </div>
    );
  }

  filterPapers() {
    var newPapers = { codes: [] };
    var day = this.state.date.getDay();

    papers.codes.forEach(code => {
      var paper = papers[code];
      if (paper.skip[day] !== true) {
        newPapers.codes.push(code);
        newPapers[code] = paper;
      }
    });

    return newPapers;
  }

  toUTCDate(date) {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  }

  moveDate(diff) {
    var date = this.toUTCDate(this.state.date);
    date.setDate(date.getDate() + diff);

    this.setState({ date: date });
  }

  displayDate() {
    let abbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      abbr[this.state.date.getDay()] +
      ' ' +
      this.state.date
        .toISOString()
        .substring(2, 10)
        .replace(/-/g, '.')
    );
  }

  getDateUrl() {
    return this.state.date
      .toISOString()
      .substring(0, 10)
      .replace(/-/g, '');
  }

  selectPapers() {
    const url = 'api/paper/select/' + this.getDateUrl();
    const that = this;
    fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        const fetched = that.getMap(data);
        that.setState({ fetched: fetched });
      });
  }

  togglePaper(code) {
    const api = this.state.fetched[code] === undefined ? 'fetch' : 'clear';
    const url = 'api/paper/' + api + '/' + code + '/' + this.getDateUrl();
    const that = this;
    fetch(url).then(function(response) {
      that.selectPapers();
    });
  }

  getMap(array) {
    var map = {};
    var paper;

    for (var i = 0; i < array.length; i++) {
      paper = array[i];
      map[paper.name] = paper.list;
    }

    return map;
  }
}

export default App;
