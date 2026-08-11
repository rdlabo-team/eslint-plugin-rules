import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type { RuleInfo } from './rules';
import { rules } from './rules';

function ruleCells(rule: RuleInfo): string[] {
  const link = `[${rule.id}](./docs/rules/${rule.name}.md)`;
  const description = rule.description || '(no description)';

  return [link, description, rule.fixable ? '✅' : '❌'];
}

const filePath = resolve(__dirname, '../../README.md');
const headers = ['Rule', 'Description', 'Auto-fixable'];
const rows = rules.map(ruleCells);
const widths = headers.map((header, index) => Math.max(header.length, ...rows.map((row) => row[index].length)));
const renderCell = (cell: string, index: number) => {
  if (index !== 2 || cell === headers[index]) {
    return cell.padEnd(widths[index]);
  }
  const displayWidth = cell === '✅' || cell === '❌' ? 2 : cell.length;
  const padding = widths[index] - displayWidth;
  return `${' '.repeat(Math.ceil(padding / 2))}${cell}${' '.repeat(Math.floor(padding / 2))}`;
};
const renderRow = (cells: string[]) => `| ${cells.map(renderCell).join(' | ')} |`;
const divider = `| ${widths.map((width, index) => (index === 2 ? `:${'-'.repeat(width - 2)}:` : `:${'-'.repeat(width - 1)}`)).join(' | ')} |`;
const content = [renderRow(headers), divider, ...rows.map(renderRow)].join('\n');

writeFileSync(
  filePath,
  readFileSync(filePath, 'utf8').replace(
    /<!--RULE_TABLE_BEGIN-->[\s\S]*<!--RULE_TABLE_END-->/u,
    `<!--RULE_TABLE_BEGIN-->\n\n${content}\n\n<!--RULE_TABLE_END-->`,
  ),
);
