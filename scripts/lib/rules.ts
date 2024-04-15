import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { pluginId } from './plugin-id';
import { RuleRecommendation } from '@typescript-eslint/utils/dist/ts-eslint/Rule';

const rootDir = resolve(__dirname, '../../src/rules/');

export type RuleInfo = {
  filePath: string;
  id: string;
  name: string;
  category: string;
  description: string;
  recommended: RuleRecommendation;
  deprecated: boolean;
  fixable: boolean;
  replacedBy: string[];
};

export type CategoryInfo = {
  id: string;
  rules: RuleInfo[];
};

export const rules: RuleInfo[] = readdirSync(rootDir)
  .sort()
  .map((filename): RuleInfo => {
    const filePath = join(rootDir, filename);
    const name = filename.slice(0, -3);
    const { meta } = require(filePath);

    return {
      filePath,
      id: `${pluginId}/${name}`,
      name,
      deprecated: Boolean(meta.deprecated),
      fixable: Boolean(meta.fixable),
      replacedBy: [],
      ...meta.docs,
    };
  });

export const categories: CategoryInfo[] = [
  'Possible Errors',
  'Best Practices',
  'Stylistic Issues',
].map(
  (id): CategoryInfo => ({
    id,
    rules: rules.filter((rule) => rule.category === id && !rule.deprecated),
  })
);
