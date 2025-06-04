import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';

export interface DecoratorProperties {
  key: {
    name: string;
  };
  value: {
    value: string;
  };
}

export interface TemplateInfo {
  template: string | null;
  templateNode?: TSESTree.Node;
  templatePropNode?: TSESTree.Node;
  sourceUrl?: string;
  isInlineTemplate?: boolean;
}

export interface TemplateExpression {
  type: string;
  name?: string;
  receiver?: TemplateExpression;
  left?: TemplateExpression;
  right?: TemplateExpression;
  condition?: TemplateExpression;
  trueExp?: TemplateExpression;
  falseExp?: TemplateExpression;
  exp?: TemplateExpression;
  args?: TemplateExpression[];
}
