import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Module = require('node:module');
const originalLoad = Module._load;

try {
  Module._load = function loadWithoutAngular(request, parent, isMain) {
    if (request.startsWith('@angular') || request.startsWith('@ionic')) {
      throw new Error(`TypeScript entry point loaded an Angular/Ionic module: ${request}`);
    }
    return Reflect.apply(originalLoad, this, [request, parent, isMain]);
  };
  const typescript = require('@rdlabo/eslint-plugin-rules/typescript');
  const expectedRules = ['deny-soft-private-modifier', 'restrict-try-block'];
  if (JSON.stringify(Object.keys(typescript.rules ?? {}).sort()) !== JSON.stringify(expectedRules)) {
    throw new Error('TypeScript entry point does not expose every framework-independent rule');
  }
} finally {
  Module._load = originalLoad;
}

const extensionless = require('@rdlabo/eslint-plugin-rules/dist/index');
const withExtension = require('@rdlabo/eslint-plugin-rules/dist/index.js');
if (extensionless !== withExtension) {
  throw new Error('Legacy dist import paths do not resolve to the same plugin');
}
