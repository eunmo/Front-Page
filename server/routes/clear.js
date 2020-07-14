const express = require('express');
const { clear } = require('../db/articles');

const router = express.Router();

router.get('/:paper/:date', async (req, res) => {
  const { paper, date } = req.params;
  await clear(paper, date);
  res.sendStatus(200);
});

module.exports = router;
