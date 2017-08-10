import React, { Component } from 'react';
import './App.css';

import papers from './data/papers';

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {date: this.toUTCDate(new Date()), fetched: {}};

		this.moveDate = this.moveDate.bind(this);
		this.selectPapers = this.selectPapers.bind(this);
		this.fetchPaper = this.fetchPaper.bind(this);
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
    return (
      <div className="App">
				<div className="App-side"></div>
				<div>
				<h1 className="App-header">
					<span className="App-btn" onClick={() => this.moveDate(-1)}>◁ </span>
					{this.displayDate()}
					<span className="App-btn" onClick={() => this.moveDate(1)}> ▷</span>
				</h1>
				{papers.codes.map(code => {
					var paper = papers[code];
					paper.list = this.state.fetched[code];

					if (paper.list === undefined)
						paper.list = [];

					return (
						<div key={code}>
							<h2 className="App-paper-header" onClick={() => this.fetchPaper(code)}>{paper.name}</h2>
							{paper.list.map(article => {
								return (
									<div className="App-article" key={article.href}>
										■ <a href={paper.url + article.href} className="App-link">{article.title}</a>
									</div>);
							})}
						</div>);
				})}
				</div>
				<div className="App-side"></div>
      </div>
    );
  }

	toUTCDate(date) {
		return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	}

	moveDate(diff) {
		var date = this.toUTCDate(this.state.date);
		date.setDate(date.getDate() + diff);

		this.setState({date: date});
	}

	displayDate() {
		return this.state.date.toISOString().substring(0, 10).replace(/-/g,'.');
	}

	selectPapers() {
		const dateString = this.state.date.toISOString().substring(0, 10).replace(/-/g,'');
		const url = 'api/paper/select/' + dateString;
		const that = this;
		fetch(url)
			.then(function(response) {
				return response.json();
			})
		.then(function(data) {
			const fetched = that.getMap(data);
			that.setState({fetched: fetched});
		});
	}

	fetchPaper(code) {
		const dateString = this.state.date.toISOString().substring(0, 10).replace(/-/g,'');
		const url = 'api/paper/fetch/' + code + '/' + dateString;
		const that = this;
		fetch(url)
			.then(function(response) {
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
