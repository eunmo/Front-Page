const { get } = require('../db/articles');

module.exports = (router) => {
  router.get('/api/select/:date', async (req, res) => {
    const { date } = req.params;
    const articles = await get(date);
    res.json(articles);
  });
};
