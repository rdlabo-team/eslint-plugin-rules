import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { pluginId } from './plugin-id';
import { RuleRecommendation } from '@typescript-eslint/utils/dist/ts-eslint/Rule';

const rootDir = resolve(__dirname, '../../src/rules/');

export interface RuleInfo {
  filePath: string;
  id: string;
  name: string;
  category: string;
  description: string;
  recommended: RuleRecommendation;
  deprecated: boolean;
  fixable: boolean;
  replacedBy: string[];
}

export interface CategoryInfo {
  id: string;
  rules: RuleInfo[];
}

export const rules: RuleInfo[] = readdirSync(rootDir)
  .filter((filename) => filename.endsWith('.ts') && !filename.includes('types') && !filename.includes('utils'))
  .sort()
  .map((filename): RuleInfo => {
    const filePath = join(rootDir, filename);
    const name = filename.slice(0, -3);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rule = require(filePath);

    return {
      filePath,
      id: `${pluginId}/${name}`,
      name,
      deprecated: Boolean(rule.meta?.deprecated),
      fixable: Boolean(rule.meta?.fixable),
      replacedBy: [],
      ...rule.meta?.docs,
    };
  });

export const categories: CategoryInfo[] = ['Possible Errors', 'Best Practices', 'Stylistic Issues'].map(
  (id): CategoryInfo => ({
    id,
    rules: rules.filter((rule) => rule.category === id && !rule.deprecated),
  }),
);
