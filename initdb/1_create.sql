USE news;

DROP TABLE IF EXISTS articles;

CREATE TABLE articles (
  published VARCHAR(255),
  paper VARCHAR(255),
  href VARCHAR(255),
  title VARCHAR(255)
);

CREATE INDEX index_articles
ON articles (published);
