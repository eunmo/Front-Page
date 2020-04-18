const papers = {
  codes: ['chosun', 'asahi', 'lemonde'],
  chosun: {
    name: '조선일보',
    url: 'http://m.news.naver.com',
    skip: { 0: true },
  },
  asahi: {
    name: '朝日新聞',
    url: 'http://www.asahi.com',
    skip: {},
  },
  lemonde: {
    name: 'Le Monde',
    url: 'http://www.lemonde.fr',
    skip: { 1: true },
  },
};

export default papers;
