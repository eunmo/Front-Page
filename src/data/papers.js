const papers = {
	codes: ["joongang", "asahi", "lemonde"],
	asahi: {
		name: "朝日新聞",
 		url: "http://www.asahi.com",
		skip: {},
	 },
	lemonde: {
		name: "Le Monde",
		url: "http://www.lemonde.fr",
		skip: {1: true},
	},
	joongang: {
		name: "중앙일보",
		url: "http://news.naver.com",
		skip: {0: true},
	}
};

export default papers;
