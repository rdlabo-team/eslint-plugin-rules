import { type TemplateAstNode, isTransparentTemplateStructure, walkTemplateNodes } from '../../src/rules/template-ast-utils';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const parser = require('@angular-eslint/template-parser') as {
  parseForESLint(code: string, options: { filePath: string }): { ast: { templateNodes?: TemplateAstNode[] } };
};

function parseTemplate(code: string): TemplateAstNode[] | undefined {
  return parser.parseForESLint(code, { filePath: 'template.html' }).ast.templateNodes;
}

describe('template AST utilities', () => {
  it('walks every Angular control-flow branch', () => {
    const nodes = parseTemplate(`
      @if (visible) {
        <ion-item>If</ion-item>
      } @else {
        <ion-item>Else</ion-item>
      }
      @for (item of items; track item.id) {
        <ion-item>For</ion-item>
      } @empty {
        <ion-item>Empty</ion-item>
      }
      @switch (selected) {
        @case ('first') { <ion-item>Case</ion-item> }
        @default { <ion-item>Default</ion-item> }
      }
      @defer (when ready) {
        <ion-item>Deferred</ion-item>
      } @placeholder {
        <ion-item>Placeholder</ion-item>
      } @loading {
        <ion-item>Loading</ion-item>
      } @error {
        <ion-item>Error</ion-item>
      }
    `);
    const itemLabels: string[] = [];

    walkTemplateNodes(nodes, (node) => {
      if (node.type === 'Element' && node.name === 'ion-item') {
        const text = node.children?.find((child) => child.type === 'Text')?.value;
        if (typeof text === 'string') {
          itemLabels.push(text);
        }
      }
    });

    expect(itemLabels).toEqual(['If', 'Else', 'For', 'Empty', 'Case', 'Default', 'Deferred', 'Placeholder', 'Loading', 'Error']);
  });

  it('visits a binding shared by a structural Template and Element once', () => {
    const nodes = parseTemplate('<form *ngIf="show" [formGroup]="form"></form>');
    const formGroupBindings: TemplateAstNode[] = [];

    walkTemplateNodes(
      nodes,
      (node) => {
        if (node.type === 'BoundAttribute' && node.name === 'formGroup') {
          formGroupBindings.push(node);
        }
      },
      ['inputs'],
    );

    expect(formGroupBindings).toHaveLength(1);
  });

  it('only treats statically transparent containers as transparent', () => {
    const nodes = parseTemplate(`
      <ng-container></ng-container>
      <ng-template></ng-template>
      <ng-container *ngTemplateOutlet="template"></ng-container>
      <ng-container *ngComponentOutlet="component"></ng-container>
      <ng-content></ng-content>
    `);
    const structures: TemplateAstNode[] = [];
    walkTemplateNodes(nodes, (node) => {
      if (node.type !== 'Text') {
        structures.push(node);
      }
    });

    expect(isTransparentTemplateStructure(structures[0])).toBe(true);
    expect(isTransparentTemplateStructure(structures[1])).toBe(true);
    expect(structures.some((node) => node.type === 'Template' && !isTransparentTemplateStructure(node))).toBe(true);
    expect(structures.some((node) => node.type === 'Content' && !isTransparentTemplateStructure(node))).toBe(true);
  });
});
