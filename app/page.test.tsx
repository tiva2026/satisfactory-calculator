const redirectMock = jest.fn((url: string) => {
  throw new Error(url);
});

jest.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to /calc', async () => {
    const { default: HomePage } = await import('./page');

    expect(() => HomePage()).toThrow('/calc');
    expect(redirectMock).toHaveBeenCalledWith('/calc');
  });
});
