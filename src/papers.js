const papers = {
  codes: ['asahi', 'lemonde'],
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
