const express = require('express');
const { get } = require('../db/articles');

const router = express.Router();

router.get('/:date', async (req, res) => {
  const { date } = req.params;
  const articles = await get(date);
  res.json(articles);
});

module.exports = router;
