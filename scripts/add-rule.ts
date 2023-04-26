import { existsSync, writeFileSync } from 'fs';
import { relative, resolve } from 'path';
import { pluginId } from './lib/plugin-id';

(() => {
  const ruleId = process.argv[2];

  // Require rule ID.
  if (!ruleId) {
    console.error('Usage: npm run add-rule <RULE_ID>');
    process.exitCode = 1;
    return;
  }

  const docPath = resolve(__dirname, '../docs/rules', `${ruleId}.md`);
  const rulePath = resolve(__dirname, '../src/rules', `${ruleId}.ts`);
  const testPath = resolve(__dirname, '../tests/rules', `${ruleId}.ts`);

  // Overwrite check.
  for (const filePath of [docPath, rulePath, testPath]) {
    if (existsSync(filePath)) {
      console.error(
        '%o has existed already.',
        relative(process.cwd(), filePath)
      );
      process.exitCode = 1;
      return;
    }
  }

  // Generate files.
  writeFileSync(
    docPath,
    `# ${pluginId}/${ruleId}
> (TODO: summary)

(TODO: why is this rule useful?)

## Rule Details

(TODO: how does this rule check code?)

## Options

(TODO: what do options exist?)
`
  );

  writeFileSync(
    rulePath,
    `import { TSESLint } from "@typescript-eslint/experimental-utils";

const rule: TSESLint.RuleModule<"", []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: "",
      recommended: false,
      url: "",
    },
    fixable: undefined,
    messages: {
      "": "",
    },
    schema: [],

    // TODO: choose the rule type.
    type: "problem",
    type: "suggestion",
    type: "layout",
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    return {};
  },
};

export default rule;
`
  );

  writeFileSync(
    testPath,
    `
import { TSESLint } from "@typescript-eslint/experimental-utils";
import rule from "../../src/rules/${ruleId}";

new TSESLint.RuleTester().run("${ruleId}", rule, {
  valid: [],
  invalid: [],
});
`
  );
})();
