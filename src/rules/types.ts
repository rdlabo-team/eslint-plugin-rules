import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';
import { AST } from 'eslint';
import SourceLocation = AST.SourceLocation;
import { TemplateLiteral } from '@angular/compiler';

export interface DecoratorProperties {
  key: {
    name: string;
  };
  value: {
    value: string;
    quasis?: {
      type: 'TemplateElement';
      value: {
        raw: string;
        cooked: string;
      };
      tail: boolean;
      loc?: SourceLocation;
      range?: [number, number];
      parent?: TemplateLiteral;
    }[];
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
