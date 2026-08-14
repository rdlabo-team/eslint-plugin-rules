import plugin from '../src/restrict-try-block';
import restrictTryBlock from '../src/rules/restrict-try-block';

describe('restrict-try-block entry point', () => {
  it('exposes only the backend-safe rule', () => {
    expect(plugin).toEqual({
      rules: {
        'restrict-try-block': restrictTryBlock,
      },
    });
  });
});
