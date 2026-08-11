import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { pluginId } from './plugin-id';
import { RuleRecommendation } from '@typescript-eslint/utils/dist/ts-eslint/Rule';
import { RECOMMENDED_RULE_NAMES } from './recommended-rule-names';

const rootDir = resolve(__dirname, '../../src/rules/');

export interface RuleInfo {
  filePath: string;
  id: string;
  name: string;
  description: string;
  recommended: RuleRecommendation | false;
  deprecated: boolean;
  fixable: boolean;
  replacedBy: string[];
}

export const rules: RuleInfo[] = readdirSync(rootDir)
  .filter((filename) => filename.endsWith('.ts') && filename !== 'types.ts' && filename !== 'utils.ts')
  .sort()
  .map((filename): RuleInfo => {
    const filePath = join(rootDir, filename);
    const name = filename.slice(0, -3);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loadedRule = require(filePath);
    const rule = loadedRule.default ?? loadedRule;

    return {
      filePath,
      id: `${pluginId}/${name}`,
      name,
      deprecated: Boolean(rule.meta?.deprecated),
      fixable: Boolean(rule.meta?.fixable),
      replacedBy: [],
      description: rule.meta?.docs?.description ?? '',
      recommended: RECOMMENDED_RULE_NAMES.has(name) ? 'recommended' : false,
    };
  });
