import { Component, NgModule, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'test-cmp1',
  template: `<div data-testid="test-cmp1">Test Component 1</div>`
})
class TestCmp1 { }

@NgModule({
  imports: [TestCmp1],
  exports: [TestCmp1]
})
class TestModule { }

/** Standalone replacement for WrapperComponent in @testing-library/angular */
@Component({
  selector: 'test-wrapper-component',
  template: '',
  standalone: false
})
class WrapperComponent { }


describe('TestBed with non-standalone host components', () => {

  // Does not compile using `@angular/build:unit-test` builder, so first test can't be run
  // When running using unit-test builder, comment out this component and the first test.
  @Component({
    template: `<div data-testid="test-host"><test-cmp1/></div>`,
    standalone: false
  })
  class TestHostComponent { }

  it('creates host component with child component from module', async () => {
    const testBed = TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [TestModule]
    });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(TestHostComponent);

    await expectContainsTestCmp1(fixture);
  });

  it('creates empty component with overridden template and imported child component', async () => {
    const testBed = TestBed.configureTestingModule({
        declarations: [ WrapperComponent ],
        imports: [TestCmp1]
      })
      .overrideComponent(WrapperComponent, {
        set: {
          template: `<test-cmp1/>`
        }
      });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(WrapperComponent);

    await expectContainsTestCmp1(fixture);
  });

  it('FAILS unit-test builder: creates empty component with overridden template and child component from module', async () => {
    const testBed = TestBed.configureTestingModule({
      declarations: [WrapperComponent],
      imports: [
        TestModule
      ]
    }).overrideComponent(WrapperComponent, {
      set: {
        template: `<test-cmp1/>`,
      }
    });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(WrapperComponent);

    await expectContainsTestCmp1(fixture);
  });

  async function expectContainsTestCmp1(fixture: ComponentFixture<unknown>) {
    expect(findDirective(fixture, TestCmp1)).toBeInstanceOf(TestCmp1);
    await expect(fixture.nativeElement.querySelector('[data-testid="test-cmp1"]')).toBeTruthy();
  }

});

function findDirective<TDirective>(fixture: ComponentFixture<unknown>, directiveType: Type<TDirective>): TDirective | null {
  const debugElement = fixture.debugElement.query(By.directive(directiveType));
  if (!debugElement) {
    return null;
  }
  return debugElement.injector.get(directiveType);
}
