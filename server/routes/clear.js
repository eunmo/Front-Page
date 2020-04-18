const { clear } = require('../db/articles');

module.exports = (router) => {
  router.get('/api/clear/:paper/:date', async (req, res) => {
    const { paper, date } = req.params;
    await clear(paper, date);
    res.sendStatus(200);
  });
};
