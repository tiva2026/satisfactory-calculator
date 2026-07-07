const redirectMock = jest.fn(() => {
  throw new Error('REDIRECT');
});

jest.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}));

describe('CalcRedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to the default calculator item', async () => {
    const { default: CalcRedirectPage } = await import('./page');

    await expect(CalcRedirectPage()).rejects.toThrow('REDIRECT');
    expect(redirectMock).toHaveBeenCalledWith('/calc/iron-ingot');
  });
});
