# Test Cases for TestBed compile bugs using @angular/build:unit-test

This repo provides additional test cases for https://github.com/angular/angular-cli/issues/33064 .

Using Angular 22 and `@angular/build:unit-test`:

```ts
TestBed.overrideComponent(Cmp, {
      set: {
        template: `<test-cmp1/>`,
        imports: [TestModule]
      }
    }).compileComponents()
```
fails - it acts as if the module import is missing or has no effect.

[Test Case](https://github.com/johncrim/ng-testbed-compile-bug/blob/main/src/tests/testbedStandaloneOverrideImports.spec.ts#L85)

It also fails if `Cmp` correctly imports `<test-cmp1>`, the call to `overrideComponent()` is sufficient to break imports.

[Test Case](https://github.com/johncrim/ng-testbed-compile-bug/blob/main/src/tests/testbedStandaloneOverrideImports.spec.ts#L66)


This case works using the `@angular-devkit/build-angular:karma` (legacy) builder.

This breaks tests that use test helpers like `@testing-library/angular`'s `render(template string, { imports: [TestModule]})`.

## Other cases that work
Aside from the legacy builder, other similar but less convenient cases work (see other test cases for details):

1. If a test component imports the same module (but isn't overridden with it) the TestBed compile works. [Test Case](https://github.com/johncrim/ng-testbed-compile-bug/blob/main/src/tests/testbedStandaloneOverrideImports.spec.ts#L34)


2. It also works if the components inside `TestModule` are directly imported, eg:
```ts
TestBed.overrideComponent(Cmp, {
      set: {
        template: `<test-cmp1/>`,
        imports: [TestCmp1]
      }
    }).compileComponents()
```

[Test Case](https://github.com/johncrim/ng-testbed-compile-bug/blob/main/src/tests/testbedStandaloneOverrideImports.spec.ts#L47)

## Related Compile Failure

In addition, this code compiles using the `@angular-devkit/build-angular:karma` builder, and fails to compile using the `@angular/build:unit-test` builder:
```ts
  @Component({
    template: `<test-cmp1/>`,
    standalone: false
  })
  class TestHostComponent { }
```

[Test Code](https://github.com/johncrim/ng-testbed-compile-bug/blob/main/src/tests/testbedNotStandaloneOverrideImports.spec.ts#L28)

It is valid code and should compile, though it should fail at runtime unless the `<test-cmp1>` component is added via `.overrideComponent()`.

## Reproduction

1. Run these tests using the legacy karma builder (all pass):

   ```
   pnpm install
   ng test
   ```

2. Run tests using the unit test builder using either vitest or karma:
   * In angular.json, rename "test" target to "test-devkit", and rename "test-karma" or "test-vitest" to "test"
   * `ng test`
   * Note that the cases where a module is added in `.overrideComponent()` fail.
