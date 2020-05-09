const express = require('express');
const path = require('path');

const clear = require('./clear');
const fetch = require('./fetch');
const select = require('./select');

const router = express.Router();
clear(router);
fetch(router);
select(router);

router.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

module.exports = router;
