import { TSESLint, TSESTree } from '@typescript-eslint/utils';

interface RuleOptions {
  additionalAllowedMethods?: string[];
}

/** interface name → lifecycle method name */
const LIFECYCLE_BY_INTERFACE: Record<string, string> = {
  // Angular
  OnChanges: 'ngOnChanges',
  OnInit: 'ngOnInit',
  DoCheck: 'ngDoCheck',
  AfterContentInit: 'ngAfterContentInit',
  AfterContentChecked: 'ngAfterContentChecked',
  AfterViewInit: 'ngAfterViewInit',
  AfterViewChecked: 'ngAfterViewChecked',
  OnDestroy: 'ngOnDestroy',
  // Ionic
  ViewWillEnter: 'ionViewWillEnter',
  ViewDidEnter: 'ionViewDidEnter',
  ViewWillLeave: 'ionViewWillLeave',
  ViewDidLeave: 'ionViewDidLeave',
  ViewWillUnload: 'ionViewWillUnload',
};

const LIFECYCLE_METHOD_TO_INTERFACE = Object.fromEntries(Object.entries(LIFECYCLE_BY_INTERFACE).map(([iface, method]) => [method, iface])) as Record<
  string,
  string
>;

type MessageIds = 'noComponentMethodExceptLifecycle' | 'lifecycleMethodRequiresImplements';

const rule: TSESLint.RuleModule<MessageIds, [RuleOptions?]> = {
  defaultOptions: [{ additionalAllowedMethods: [] }],
  meta: {
    docs: {
      description: 'Disallow non-lifecycle methods on `@Component`. Allowed lifecycle methods are derived from `implements` (properties are allowed).',
      url: '',
    },
    messages: {
      noComponentMethodExceptLifecycle:
        'Component method `{{method}}` is not allowed. Only lifecycle methods declared via `implements` are permitted; move behavior to ViewModel (or a launcher).',
      lifecycleMethodRequiresImplements: 'Lifecycle method `{{method}}` is not allowed without `implements {{interface}}`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          additionalAllowedMethods: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  create(context: TSESLint.RuleContext<MessageIds, [RuleOptions?]>) {
    const additional = new Set(context.options[0]?.additionalAllowedMethods ?? []);

    function isComponentClass(node: TSESTree.ClassDeclaration): boolean {
      return (
        node.decorators?.some(
          (decorator) =>
            decorator.expression.type === 'CallExpression' &&
            decorator.expression.callee.type === 'Identifier' &&
            decorator.expression.callee.name === 'Component',
        ) ?? false
      );
    }

    function getImplementedInterfaceNames(node: TSESTree.ClassDeclaration): Set<string> {
      const names = new Set<string>();
      for (const impl of node.implements ?? []) {
        const expression = impl.expression;
        if (expression.type === 'Identifier') {
          names.add(expression.name);
          continue;
        }
        // implements Foo.Bar — use the rightmost identifier
        if (expression.type === 'MemberExpression' && !expression.computed) {
          let current: TSESTree.Expression | TSESTree.PrivateIdentifier = expression;
          while (current.type === 'MemberExpression' && !current.computed) {
            current = current.property;
          }
          if (current.type === 'Identifier') {
            names.add(current.name);
          }
        }
      }
      return names;
    }

    function allowedMethodsFromImplements(interfaces: Set<string>): Set<string> {
      const methods = new Set<string>();
      for (const iface of interfaces) {
        const method = LIFECYCLE_BY_INTERFACE[iface];
        if (method) {
          methods.add(method);
        }
      }
      return methods;
    }

    function getMethodName(member: TSESTree.MethodDefinition): string {
      if (member.key.type === 'Identifier' || member.key.type === 'PrivateIdentifier') {
        return member.key.name;
      }
      if (member.key.type === 'Literal' && typeof member.key.value === 'string') {
        return member.key.value;
      }
      return context.sourceCode.getText(member.key);
    }

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        if (!isComponentClass(node)) {
          return;
        }

        const implemented = getImplementedInterfaceNames(node);
        const allowedLifecycleMethods = allowedMethodsFromImplements(implemented);

        for (const member of node.body.body) {
          if (member.type !== 'MethodDefinition') {
            continue;
          }
          // constructor / getters / setters are out of scope
          if (member.kind !== 'method') {
            continue;
          }
          const methodName = getMethodName(member);
          if (additional.has(methodName) || allowedLifecycleMethods.has(methodName)) {
            continue;
          }

          const requiredInterface = LIFECYCLE_METHOD_TO_INTERFACE[methodName];
          if (requiredInterface) {
            context.report({
              node: member.key,
              messageId: 'lifecycleMethodRequiresImplements',
              data: { method: methodName, interface: requiredInterface },
            });
            continue;
          }

          context.report({
            node: member.key,
            messageId: 'noComponentMethodExceptLifecycle',
            data: { method: methodName },
          });
        }
      },
    };
  },
};

export = rule;
