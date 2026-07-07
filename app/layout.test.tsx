import React from 'react';
import RootLayout, { metadata, viewport } from './layout';

describe('RootLayout', () => {
  test('renders the expected html shell and metadata exports', () => {
    const element = RootLayout({ children: <main>child</main> }) as React.ReactElement;

    expect(element.type).toBe('html');
    expect(element.props.lang).toBe('en');
    expect(metadata.title).toContain('Satisfactory Production Calculator');
    expect(viewport.width).toBe('device-width');
  });
});
