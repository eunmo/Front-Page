import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import App from './App';
import papers from './papers';
import { toUTCDate, getDateUrl } from './utils';

let container = null;
let mockResponse = null;
let calledUrls = null;

jest.mock('./papers');

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);

  mockResponse = null;
  calledUrls = [];
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    calledUrls.push(url);
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
  });
  papers.reset();
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

const today = toUTCDate(new Date());
const todayUrl = getDateUrl(today);
const selectResponse = [];
papers.codes.forEach((code) => {
  const paper = papers[code];
  const day = today.getDay();
  if (paper.skip[day] === true) {
    return;
  }

  selectResponse.push({
    published: todayUrl,
    paper: code,
    href: code,
    title: code,
  });
});

const renderApp = async () => {
  mockResponse = selectResponse;
  await act(async () => {
    render(<App />, container);
  });
};

test('renders without crashing', async () => {
  await renderApp();
});

const expectedDate = (date) => {
  const yy = date.substr(2, 2);
  const mm = date.substr(4, 2);
  const dd = date.substr(6, 2);

  return `${yy}.${mm}.${dd}`;
};

test('renders date', async () => {
  await renderApp();

  const header = document.querySelector('.App-header');
  const formatted = expectedDate(todayUrl);
  expect(header.textContent).toStrictEqual(expect.stringContaining(formatted));
  expect(calledUrls).toStrictEqual([`/api/select/${todayUrl}`]);
});

test('renders articles', async () => {
  await renderApp();

  const links = document.querySelectorAll('a');
  expect(links.length).toBe(selectResponse.length);
  selectResponse.forEach((res, i) => {
    const link = links[i];
    expect(link.textContent).toBe(res.paper);
    expect(link.getAttribute('href')).toBe(res.paper);
  });
});

test.each([
  ['clear', selectResponse],
  ['fetch', []],
])('%s', async (code, res) => {
  mockResponse = res;
  await act(async () => {
    render(<App />, container);
  });

  const header = document.querySelector('.App-paper-header');

  await act(async () => {
    header.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const selectUrl = `/api/select/${todayUrl}`;
  const urls = [
    selectUrl,
    expect.stringMatching(new RegExp(`^/api/${code}/`)),
    selectUrl,
  ];
  expect(calledUrls).toStrictEqual(urls);
});

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

test.each([
  ['prev', 0, getDateUrl(yesterday)],
  ['next', 1, getDateUrl(tomorrow)],
])('%s', async (name, buttonIndex, url) => {
  await renderApp();
  const buttons = document.querySelectorAll('.App-btn');
  const button = buttons[buttonIndex];

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  const header = document.querySelector('.App-header');
  const formatted = expectedDate(url);
  expect(header.textContent).toStrictEqual(expect.stringContaining(formatted));

  const urls = [`/api/select/${todayUrl}`, `/api/select/${url}`];
  expect(calledUrls).toStrictEqual(urls);
});

test('skip', async () => {
  papers.lemonde.skip = {
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  };
  await renderApp();
  expect(document.querySelectorAll('.App-paper-header').length).toBe(1);
});

test('no skip', async () => {
  jest.doMock('./papers');
  papers.lemonde.skip = {};
  await renderApp();
  expect(document.querySelectorAll('.App-paper-header').length).toBe(2);
});
