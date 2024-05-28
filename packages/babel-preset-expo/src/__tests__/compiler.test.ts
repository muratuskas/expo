import * as babel from '@babel/core';
import * as path from 'node:path';

import preset from '..';

function getCaller(props: Record<string, string | boolean>): babel.TransformCaller {
  return props as unknown as babel.TransformCaller;
}

const options = {
  caller: getCaller({
    name: 'metro',
    supportsReactCompiler: true,
    engine: 'hermes',
    platform: 'ios',
    isDev: false,
  }),
  babelrc: false,
  presets: [preset],
  sourceMaps: false,

  compact: false,
  comments: true,
  retainLines: true,
};

it(`allows destructuring in the catch block`, () => {
  // Ensuring the transform doesn't throw.
  const { code } = babel.transformFileSync(
    path.resolve(__dirname, 'samples/destructure-catch.tsx'),
    options
  )!;

  expect(code).toMatchSnapshot();
  expect(code).not.toContain('react.memo_cache_sentinel');
});

it(`supports functions with discarded return values in try/catch blocks that run in memos`, () => {
  // Ensuring the transform doesn't throw.
  const { code } = babel.transformFileSync(
    path.resolve(__dirname, 'samples/try-catch-hook.tsx'),
    options
  )!;

  expect(code).toMatchSnapshot();
  expect(code).not.toContain('react.memo_cache_sentinel');
});

it(`supports memoizing`, () => {
  // Ensuring the transform doesn't throw.
  const { code } = babel.transformFileSync(path.resolve(__dirname, 'samples/App.tsx'), options)!;

  expect(code).toMatchSnapshot();
  expect(code).toContain('react.memo_cache_sentinel');
});

it(`supports disabling memoizing`, () => {
  // Ensuring the transform doesn't throw.
  const { code } = babel.transformFileSync(path.resolve(__dirname, 'samples/App.tsx'), {
    ...options,
    caller: getCaller({
      name: 'metro',
      supportsReactCompiler: false,
      engine: 'hermes',
      platform: 'ios',
      isDev: false,
    }),
  })!;

  expect(code).not.toContain('react.memo_cache_sentinel');
});

it(`compiles to CJS`, () => {
  const code = babel.transformFileSync(path.resolve(__dirname, 'samples/compile-memo.tsx'), {
    ...options,
    caller: getCaller({
      name: 'metro',
      supportsReactCompiler: true,
      supportsStaticESM: false,
      engine: 'hermes',
      platform: 'ios',
      isDev: true,
    }),
  })!.code!;
  expect(code).not.toContain('import {');
  expect(code).toContain('react.memo_cache_sentinel');
});
it(`compiles CJS to CJS`, () => {
  const code = babel.transformFileSync(path.resolve(__dirname, 'samples/compile-memo-cjs.js'), {
    ...options,
    caller: getCaller({
      name: 'metro',
      bundler: 'metro',
      platform: 'web',
      isServer: false,
      isReactServer: false,
      baseUrl: '',
      routerRoot: '__e2e__/compiler/app',
      isDev: true,
      // preserveEnvVars: undefined,
      // asyncRoutes: undefined,
      // engine: undefined,
      projectRoot: '/Users/evanbacon/Documents/GitHub/expo/apps/router-e2e',
      isNodeModule: false,
      isHMREnabled: true,
      supportsStaticESM: false,
      supportsReactCompiler: true,
    }),
  })!.code!;
  expect(code).not.toContain('import ');
});

it(`skips memoizing in server bundling passes`, () => {
  const { code } = babel.transformFileSync(path.resolve(__dirname, 'samples/PureComponent.tsx'), {
    ...options,
    caller: getCaller({
      isServer: true,
      name: 'metro',
      supportsReactCompiler: true,
      engine: 'hermes',
      platform: 'ios',
      isDev: false,
    }),
  })!;
  expect(code).not.toContain('react.memo_cache_sentinel');
});

it(`skips memoizing in react-server bundling passes`, () => {
  const { code } = babel.transformFileSync(path.resolve(__dirname, 'samples/PureComponent.tsx'), {
    ...options,
    caller: getCaller({
      isReactServer: true,
      name: 'metro',
      supportsReactCompiler: true,
      engine: 'hermes',
      platform: 'ios',
      isDev: false,
    }),
  })!;
  expect(code).not.toContain('react.memo_cache_sentinel');
});

it(`skips memoizing in node modules`, () => {
  const { code } = babel.transformFileSync(path.resolve(__dirname, 'samples/PureComponent.tsx'), {
    ...options,
    caller: getCaller({
      isNodeModule: true,
      name: 'metro',
      supportsReactCompiler: true,
      engine: 'hermes',
      platform: 'ios',
      isDev: false,
    }),
  })!;
  expect(code).not.toContain('react.memo_cache_sentinel');
});
