import {
  createApolloAdapter,
  createYogaAdapter
} from '../src/index';

describe(
  'public GraphQL adapter exports',
  () => {
    it(
      'exports createApolloAdapter',
      () => {
        expect(
          typeof createApolloAdapter
        ).toBe('function');
      }
    );

    it(
      'exports createYogaAdapter',
      () => {
        expect(
          typeof createYogaAdapter
        ).toBe('function');
      }
    );
  }
);