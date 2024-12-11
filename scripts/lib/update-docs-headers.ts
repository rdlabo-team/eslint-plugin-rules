import { readFileSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { pluginId } from './plugin-id';
import type { RuleInfo } from './rules';
import { rules } from './rules';

interface ListFormatOptions {
  type?: 'conjunction' | 'disjunction' | 'unit';
  style?: 'long' | 'short' | 'narrow';
  localeMatcher?: 'lookup' | 'best fit';
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Intl {
  class ListFormat {
    constructor(locale: string, options: ListFormatOptions);
    public format: (items: string[]) => string;
  }
}

const headerPattern = /^#.+\n(?:>.+\n)*\n+/u;
const footerPattern = /\n+## Implementation[\s\S]*$/u;
const ruleRoot = resolve(__dirname, '../../src/rules');
const testRoot = resolve(__dirname, '../../tests/rules');
const docsRoot = resolve(__dirname, '../../docs/rules');
const listFormatter = new Intl.ListFormat('en', { type: 'conjunction' });

/**
 * Render the document header of a given rule.
 */
function renderHeader(rule: RuleInfo): string {
  const lines = [`# ${rule.id}`, `> ${rule.description}`];

  if (rule.recommended === 'recommended') {
    lines.push(
      `> - ⭐️ This rule is included in \`plugin:${pluginId}/recommended\` preset.`
    );
  }
  if (rule.fixable) {
    lines.push(
      '> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.'
    );
  }
  if (rule.deprecated) {
    const replace = rule.replacedBy.map(
      (ruleId) => `[${ruleId}](./${ruleId.replace(`${pluginId}/`, '')}.md)`
    );
    const replaceText =
      replace.length === 0
        ? ''
        : ` Use ${listFormatter.format(replace)} instead.`;

    lines.push(`> - ⛔ This rule has been deprecated.${replaceText}`);
  }
  lines.push('', '');

  return lines.join('\n');
}

/**
 * Render the document header of a given rule.
 */
function renderFooter(rule: RuleInfo): string {
  const docsPath = dirname(resolve(docsRoot, `${rule.name}.md`));
  const rulePath = relative(
    docsPath,
    join(ruleRoot, `${rule.name}.ts`)
  ).replace(/\\/gu, '/');
  const testPath = relative(
    docsPath,
    join(testRoot, `${rule.name}.ts`)
  ).replace(/\\/gu, '/');

  return `\n\n## Implementation\n\n- [Rule source](${rulePath})\n- [Test source](${testPath})`;
}

for (const rule of rules) {
  const filePath = resolve(docsRoot, `${rule.name}.md`);
  const original = readFileSync(filePath, 'utf8');
  const body = original.replace(headerPattern, '').replace(footerPattern, '');
  const content = `${renderHeader(rule)}${body}${renderFooter(rule)}\n`;

  writeFileSync(filePath, content);
}
