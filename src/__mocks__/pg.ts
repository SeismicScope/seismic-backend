const Pool = jest.fn().mockImplementation(() => ({
  connect: jest.fn(),
  end: jest.fn(),
  query: jest.fn(),
}));

export default { Pool };
