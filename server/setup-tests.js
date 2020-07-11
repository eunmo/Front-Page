jest.mock('./db/db.json', () => {
  return {
    host: 'localhost',
    user: 'news',
    password: 'news',
    database: 'newstest',
  };
});
