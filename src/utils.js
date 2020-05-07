const get = (url, callback) => {
  fetch(url)
    .then((response) => response.json())
    .then(callback);
};

const toUTCDate = (date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
};

const getDateUrl = (date) => {
  return date.toISOString().substring(0, 10).replace(/-/g, '');
};

export { get, toUTCDate, getDateUrl };
