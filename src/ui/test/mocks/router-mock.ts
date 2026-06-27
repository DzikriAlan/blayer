// Mock Next.js Router for testing

import type { NextRouter } from 'next/router';

/**
 * Creates a mock Next.js router for testing purposes
 * @param overrides - Custom router properties to override defaults
 * @returns Mock router object
 */
export const createMockRouter = (
  overrides: Partial<NextRouter> = {},
): NextRouter => {
  return {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    basePath: '',
    locale: 'en',
    locales: ['en', 'id'],
    defaultLocale: 'en',
    domainLocales: [],
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    reload: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
    ...overrides,
  };
};
