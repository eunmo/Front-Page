import React, { Component } from 'react';
import './App.css';

import newspapers from './data/news';

class App extends Component {
  render() {
    return (
      <div className="App">
				{newspapers.map(paper => {
					return (
						<div key={paper.name}>
							<h2 className="App-paper-header">{paper.name}</h2>
							{paper.list.map(article => {
								return (
									<div className="App-article" key={article.href}>
										■ <a href={paper.url + article.href} className="App-link">{article.title}</a>
									</div>);
							})}
						</div>);
				})}
      </div>
    );
  }
}

export default App;
