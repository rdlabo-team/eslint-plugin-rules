import denySoftPrivateModifier from './rules/deny-soft-private-modifier';
import restrictTryBlock from './rules/restrict-try-block';

/**
 * Plugin entry point for framework-independent TypeScript rules.
 *
 * Importing this entry point must not load Angular or Ionic modules. Rules
 * whose behavior assumes Angular components, signals, DI, or templates belong
 * to the package root instead.
 */
export = {
  rules: {
    'deny-soft-private-modifier': denySoftPrivateModifier,
    'restrict-try-block': restrictTryBlock,
  },
};
