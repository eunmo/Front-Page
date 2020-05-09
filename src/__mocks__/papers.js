const moduleLoc = '../papers';
const original = jest.requireActual(moduleLoc).default;
const module = jest.genMockFromModule(moduleLoc).default;

module.reset = () => {
  module.codes = original.codes;
  module.codes.forEach((c) => {
    module[c] = original[c];
  });
};

module.reset();
export default module;
