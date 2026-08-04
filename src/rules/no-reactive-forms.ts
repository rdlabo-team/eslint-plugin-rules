import { TSESLint, TSESTree } from '@typescript-eslint/utils';

const REACTIVE_IMPORTS = new Set([
  'AbstractControl',
  'FormArray',
  'FormBuilder',
  'FormControl',
  'FormGroup',
  'FormRecord',
  'NonNullableFormBuilder',
  'ReactiveFormsModule',
  'Validators',
]);
const REACTIVE_TEMPLATE_BINDINGS = new Set(['formArrayName', 'formControl', 'formControlName', 'formGroup', 'formGroupName']);

type MessageIds = 'reactiveFormsImport' | 'reactiveFormsBinding';

function importedName(node: TSESTree.Identifier | TSESTree.StringLiteral): string {
  return node.type === 'Identifier' ? node.name : node.value;
}

interface TemplateNode {
  type: string;
  name?: string;
  loc: TSESTree.SourceLocation;
  children?: TemplateNode[];
  branches?: TemplateNode[];
  cases?: TemplateNode[];
  inputs?: TemplateNode[];
  attributes?: TemplateNode[];
}

function visitTemplate(nodes: TemplateNode[] | undefined, visit: (node: TemplateNode) => void): void {
  for (const node of nodes ?? []) {
    visit(node);
    visitTemplate(node.inputs, visit);
    visitTemplate(node.attributes, visit);
    visitTemplate(node.children, visit);
    visitTemplate(node.branches, visit);
    visitTemplate(node.cases, visit);
  }
}

const rule: TSESLint.RuleModule<MessageIds, []> = {
  defaultOptions: [],
  meta: {
    docs: { description: 'Disallow Angular Reactive Forms in favor of Signal Forms.', url: '' },
    messages: {
      reactiveFormsImport: '`{{name}}` is a Reactive Forms API. Use `@angular/forms/signals` instead.',
      reactiveFormsBinding: '`{{name}}` is a Reactive Forms template binding. Use `[formField]` from Signal Forms instead.',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== '@angular/forms') {
          return;
        }
        for (const specifier of node.specifiers) {
          const name = specifier.type === 'ImportSpecifier' ? importedName(specifier.imported) : null;
          if (name && REACTIVE_IMPORTS.has(name)) {
            context.report({
              node: specifier,
              messageId: 'reactiveFormsImport',
              data: { name },
            });
          }
        }
      },
      Program(node) {
        const templateNodes = (node as unknown as { templateNodes?: TemplateNode[] }).templateNodes;
        visitTemplate(templateNodes, (templateNode) => {
          if (
            (templateNode.type === 'BoundAttribute' || templateNode.type === 'TextAttribute') &&
            templateNode.name &&
            REACTIVE_TEMPLATE_BINDINGS.has(templateNode.name)
          ) {
            context.report({
              node: templateNode as unknown as TSESTree.Node,
              loc: templateNode.loc,
              messageId: 'reactiveFormsBinding',
              data: { name: templateNode.name },
            });
          }
        });
      },
    };
  },
};

export = rule;
