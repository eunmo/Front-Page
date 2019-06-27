'use strict';

const path = require('path');
const exec = require('child_process').exec;
const Promise = require('bluebird');

module.exports = function(router, db) {
  const Papers = db.collection('Papers');

  function promiseFromChildProcess(child) {
    return new Promise(function(resolve, reject) {
      child.addListener('error', reject);
      child.addListener('exit', resolve);
    });
  }

  function fetchPaper(paper, date) {
    const execStr =
      'perl ' +
      path.join(__dirname, '../../../perl', paper + '.pl') +
      ' ' +
      date;

    var stdout = '';
    var child = exec(execStr);
    child.stdout.on('data', function(chunk) {
      stdout += chunk;
    });

    return promiseFromChildProcess(child)
      .then(function() {
        if (stdout === '') return;

        const data = JSON.parse(stdout);
        if (data.length === 0) return;

        const newPaper = {
          name: paper,
          date: date,
          list: data
        };

        return Papers.insert(newPaper);
      })
      .catch(function(error) {
        console.log(execStr);
        throw error;
      });
  }

  router.get('/api/paper/fetch/:_paper/:_date', function(req, res) {
    const paper = req.params._paper;
    const date = req.params._date;

    Papers.find({ name: paper, date: date })
      .toArray()
      .then(function(papers) {
        if (papers.length > 0) {
          res.sendStatus(200);
        } else {
          fetchPaper(paper, date).then(function() {
            res.sendStatus(200);
          });
        }
      });
  });
};
