'use strict';

module.exports = function(router, db) {
  const Papers = db.collection('Papers');

  router.get('/api/paper/clear/:_paper/:_date', function(req, res) {
    const paper = req.params._paper;
    const date = req.params._date;

    Papers.remove({ name: paper, date: date }).then(function() {
      res.sendStatus(200);
    });
  });
};
