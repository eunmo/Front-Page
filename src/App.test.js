import { act, render, fireEvent, screen } from '@testing-library/react';
import App from './App';
import papers from './papers';
import { toUTCDate, getDateUrl } from './utils';

let mockResponse = null;
let calledUrls = null;

jest.mock('./papers');

beforeEach(() => {
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
    title: `${code}_title`,
  });
});

const renderApp = async (response = selectResponse) => {
  mockResponse = response;
  await act(async () => {
    render(<App />);
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

  const formatted = expectedDate(todayUrl);
  expect(screen.getByText(formatted, { exact: false })).toBeInTheDocument();
  expect(calledUrls).toStrictEqual([`/api/select/${todayUrl}`]);
});

test('renders articles', async () => {
  await renderApp();

  expect(screen.getAllByRole('link').length).toBe(selectResponse.length);
  expect(screen.getByText('lemonde_title')).toBeInTheDocument();
});

test.each([
  ['clear', selectResponse],
  ['fetch', []],
])('%s', async (code, res) => {
  await renderApp(res);

  expect(screen.getByText('Le Monde')).toBeInTheDocument();

  await act(async () => {
    fireEvent.click(screen.getByText('Le Monde'));
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
  ['◁', getDateUrl(yesterday)],
  ['▷', getDateUrl(tomorrow)],
])('%s', async (text, url) => {
  await renderApp();

  await act(async () => {
    fireEvent.click(screen.getByText(text, { exact: false }));
  });

  const formatted = expectedDate(url);
  expect(screen.getByText(formatted, { exact: false })).toBeInTheDocument();

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
  expect(screen.queryByText('Le Monde')).not.toBeInTheDocument();
});

test('no skip', async () => {
  jest.doMock('./papers');
  papers.lemonde.skip = {};
  await renderApp();

  expect(screen.queryByText('Le Monde')).toBeInTheDocument();
});
