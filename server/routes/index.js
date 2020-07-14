const express = require('express');
const path = require('path');

const clear = require('./clear');
const fetch = require('./fetch');
const select = require('./select');

const router = express.Router();
router.use('/api/clear/', clear);
router.use('/api/fetch/', fetch);
router.use('/api/select/', select);

router.get('*', (req, res) => {
  res.sendFile(path.resolve('build', 'index.html'));
});

module.exports = router;
