import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal-template';

new RuleTester().run('signal-use-as-signal-template', rule, {
  valid: [],
  invalid: [],
});
