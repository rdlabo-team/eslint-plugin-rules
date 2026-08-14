import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Module = require('node:module');
const originalLoad = Module._load;

try {
  Module._load = function loadWithoutAngular(request, parent, isMain) {
    if (request.startsWith('@angular') || request.startsWith('@ionic')) {
      throw new Error(`Minimal entry point loaded an Angular/Ionic module: ${request}`);
    }
    return Reflect.apply(originalLoad, this, [request, parent, isMain]);
  };
  const minimal = require('@rdlabo/eslint-plugin-rules/restrict-try-block');
  if (!minimal.rules?.['restrict-try-block']) {
    throw new Error('Minimal entry point does not expose restrict-try-block');
  }
} finally {
  Module._load = originalLoad;
}

const extensionless = require('@rdlabo/eslint-plugin-rules/dist/index');
const withExtension = require('@rdlabo/eslint-plugin-rules/dist/index.js');
if (extensionless !== withExtension) {
  throw new Error('Legacy dist import paths do not resolve to the same plugin');
}
