import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [angularMajor, typescriptRange, ionicAngularFixture] = process.argv.slice(2);
if (!angularMajor || !typescriptRange || !ionicAngularFixture) {
  throw new Error('Usage: node scripts/check-compatibility-versions.mjs <angular-major> <typescript-range> <ionic-angular-fixture>');
}

const expectedMajors = new Map([
  ['@angular-eslint/template-parser', angularMajor],
  ['@angular-eslint/test-utils', angularMajor],
  ['@angular/compiler', angularMajor],
  ['@angular/core', angularMajor],
  ['@ionic/core', '9'],
  ['typescript', typescriptRange.match(/\d+/)?.[0]],
]);

for (const [packageName, expectedMajor] of expectedMajors) {
  const packageJson = JSON.parse(readFileSync(new URL(`../node_modules/${packageName}/package.json`, import.meta.url), 'utf8'));
  const actualMajor = String(packageJson.version).split('.')[0];
  if (actualMajor !== expectedMajor) {
    throw new Error(`${packageName}: expected major ${expectedMajor}, received ${packageJson.version}`);
  }
  console.log(`${packageName}@${packageJson.version}`);
}

const ionicAngularPackage = JSON.parse(readFileSync(resolve(ionicAngularFixture, 'node_modules/@ionic/angular/package.json'), 'utf8'));
if (String(ionicAngularPackage.version).split('.')[0] !== '9') {
  throw new Error(`@ionic/angular: expected major 9, received ${ionicAngularPackage.version}`);
}
console.log(`@ionic/angular@${ionicAngularPackage.version}`);
