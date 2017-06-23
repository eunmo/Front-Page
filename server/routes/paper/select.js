'use strict';

const Promise = require('bluebird');

module.exports = function(router, db) {
	const Papers = db.collection('Papers');

	router.get('/api/paper/select/:_date', function (req, res) {
		const date = req.params._date;

		Papers.find({date: date}).toArray()
			.then(function(papers) {
				res.json(papers);
			});
	});
};
