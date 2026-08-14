import restrictTryBlock from './rules/restrict-try-block';

/**
 * Minimal plugin entry point for non-Angular TypeScript projects.
 *
 * Importing the package root intentionally exposes every Angular/Ionic rule.
 * Backend projects only need this rule and must not have to install Angular's
 * template parser just to load the plugin.
 */
export = {
  rules: {
    'restrict-try-block': restrictTryBlock,
  },
};
