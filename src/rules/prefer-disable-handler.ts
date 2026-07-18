import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';

interface TemplateLoc {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

interface TemplateAstNode {
  type: string;
  name?: string;
  loc?: TemplateLoc;
  children?: TemplateAstNode[];
  branches?: TemplateAstNode[];
  then?: { children?: TemplateAstNode[] };
  else?: { children?: TemplateAstNode[] };
  outputs?: BoundEventNode[];
  handler?: TemplateExpression;
  [key: string]: unknown;
}

interface SourceSpanPoint {
  line: number;
  col: number;
}

interface BoundEventNode extends TemplateAstNode {
  name: string;
  handler?: TemplateExpression;
  loc?: TemplateLoc;
  sourceSpan?: {
    start: SourceSpanPoint;
    end: SourceSpanPoint;
  };
}

interface TemplateExpression {
  type: string;
  name?: string;
  ast?: TemplateExpression;
  receiver?: TemplateExpression;
  args?: TemplateExpression[];
}

interface Target {
  /** Event names to enforce (e.g. click, submit, ionComplete). */
  events: string[];
  /**
   * Element names to match. Omit or empty = any element for those events.
   */
  elements?: string[];
}

interface Scheme {
  /** Wrapper method name required on matching bindings. Default: disableHandler */
  method?: string;
  /** Required first argument identifier. Default: $event */
  eventParam?: string;
  /**
   * Which (element, event) pairs require the wrapper method.
   * Fully replaces the default list (not merged).
   * Default: click on ion-button/button, submit on any element.
   */
  targets?: Target[];
  /** Sole `$event.<name>()` calls allowed without the wrapper. */
  allowEventMethods?: string[];
}

const DEFAULT_METHOD = 'disableHandler';
const DEFAULT_EVENT_PARAM = '$event';
const DEFAULT_TARGETS: Target[] = [{ events: ['click'], elements: ['ion-button', 'button'] }, { events: ['submit'] }];
const DEFAULT_ALLOW_EVENT_METHODS = ['stopPropagation', 'preventDefault'];

const unwrapExpression = (expression: TemplateExpression | undefined): TemplateExpression | undefined => {
  if (!expression) return undefined;
  if (expression.type === 'ASTWithSource' && expression.ast) {
    return expression.ast;
  }
  return expression;
};

const isPropertyRead = (expression: TemplateExpression | undefined, name: string): boolean => expression?.type === 'PropertyRead' && expression.name === name;

const isWrapperCall = (expression: TemplateExpression | undefined, method: string, eventParam: string): boolean => {
  const ast = unwrapExpression(expression);
  if (ast?.type !== 'Call' || !isPropertyRead(ast.receiver, method)) {
    return false;
  }
  // Require method(eventParam, work) — work must be present (Promise-returning expression).
  if (!ast.args || ast.args.length < 2) {
    return false;
  }
  return isPropertyRead(ast.args[0], eventParam);
};

const isAllowedEventOnlyCall = (expression: TemplateExpression | undefined, eventParam: string, allowEventMethods: string[]): boolean => {
  const ast = unwrapExpression(expression);
  if (ast?.type !== 'Call' || !ast.receiver || ast.receiver.type !== 'PropertyRead') {
    return false;
  }
  if (!allowEventMethods.includes(ast.receiver.name ?? '')) {
    return false;
  }
  return isPropertyRead(ast.receiver.receiver, eventParam);
};

const matchesTarget = (elementName: string, eventName: string, targets: Target[]): boolean => {
  return targets.some((target) => {
    if (!target.events.includes(eventName)) return false;
    if (!target.elements || target.elements.length === 0) return true;
    return target.elements.includes(elementName);
  });
};

/** Prefer parser `loc` (1-based line / 0-based column); fall back to sourceSpan. */
const resolveReportLoc = (output: BoundEventNode): TemplateLoc | undefined => {
  if (output.loc?.start && output.loc?.end) {
    return output.loc;
  }
  if (output.sourceSpan?.start && output.sourceSpan?.end) {
    return {
      start: { line: output.sourceSpan.start.line + 1, column: output.sourceSpan.start.col },
      end: { line: output.sourceSpan.end.line + 1, column: output.sourceSpan.end.col },
    };
  }
  return undefined;
};

const rule: TSESLint.RuleModule<'preferDisableHandler', [Scheme]> = {
  defaultOptions: [
    {
      method: DEFAULT_METHOD,
      eventParam: DEFAULT_EVENT_PARAM,
      targets: DEFAULT_TARGETS,
      allowEventMethods: DEFAULT_ALLOW_EVENT_METHODS,
    },
  ],
  meta: {
    docs: {
      description:
        'Require a wrapper method (default: disableHandler($event, work)) on configured element/event bindings to prevent double taps while async work runs',
      url: '',
    },
    fixable: undefined,
    messages: {
      preferDisableHandler: 'Use {{ method }}({{ eventParam }}, work) for ({{ event }}) so the control stays disabled until the Promise settles.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          method: { type: 'string' },
          eventParam: { type: 'string' },
          targets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                events: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                },
                elements: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['events'],
              additionalProperties: false,
            },
          },
          allowEventMethods: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  create(context) {
    const option = context.options[0] ?? {};
    const method = option.method ?? DEFAULT_METHOD;
    const eventParam = option.eventParam ?? DEFAULT_EVENT_PARAM;
    const targets = option.targets ?? DEFAULT_TARGETS;
    const allowEventMethods = option.allowEventMethods ?? DEFAULT_ALLOW_EVENT_METHODS;

    const isHtmlFile = (filename: string) => !filename.includes('.spec') && filename.includes('.html');

    const checkBoundEvent = (elementName: string, output: BoundEventNode) => {
      const eventName = output.name;
      if (!matchesTarget(elementName, eventName, targets)) return;
      if (isWrapperCall(output.handler, method, eventParam)) return;
      if (isAllowedEventOnlyCall(output.handler, eventParam, allowEventMethods)) return;

      const loc = resolveReportLoc(output);
      context.report({
        node: output as unknown as TSESTree.Node,
        ...(loc ? { loc } : {}),
        messageId: 'preferDisableHandler',
        data: { event: eventName, method, eventParam },
      });
    };

    const processElement = (node: TemplateAstNode) => {
      if (!node.name || !Array.isArray(node.outputs)) return;
      for (const output of node.outputs) {
        if (output?.type === 'BoundEvent') {
          checkBoundEvent(node.name, output);
        }
      }
    };

    const traverseTemplateNodes = (nodes: TemplateAstNode[] | undefined) => {
      if (!Array.isArray(nodes)) return;

      for (const node of nodes) {
        if (!node || typeof node !== 'object' || !('type' in node)) continue;

        if (String(node.type).includes('Element')) {
          processElement(node);
        }

        if (Array.isArray(node.children)) {
          traverseTemplateNodes(node.children);
        }
        if (Array.isArray(node.branches)) {
          traverseTemplateNodes(node.branches);
        }
        if (node.then?.children) {
          traverseTemplateNodes(node.then.children);
        }
        if (node.else?.children) {
          traverseTemplateNodes(node.else.children);
        }
      }
    };

    return {
      Program(node) {
        if (!isHtmlFile(context.filename)) return;

        const templateNodes = (
          node as unknown as {
            templateNodes: TemplateAstNode[];
          }
        ).templateNodes;

        traverseTemplateNodes(templateNodes);
      },
    };
  },
};

export = rule;
