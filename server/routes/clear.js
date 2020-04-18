const { clear } = require('../db/articles');

module.exports = (router) => {
  router.get('/api/clear/:date', async (req, res) => {
    const { date } = req.params;
    await clear(date);
    res.sendStatus(200);
  });
};
