import plugin from '../src/typescript';
import denySoftPrivateModifier from '../src/rules/deny-soft-private-modifier';
import restrictTryBlock from '../src/rules/restrict-try-block';

describe('framework-independent TypeScript entry point', () => {
  it('exposes every framework-independent TypeScript rule', () => {
    expect(plugin).toEqual({
      rules: {
        'deny-soft-private-modifier': denySoftPrivateModifier,
        'restrict-try-block': restrictTryBlock,
      },
    });
  });
});
