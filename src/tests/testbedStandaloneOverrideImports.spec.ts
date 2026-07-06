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

@Component({
  template: `<div data-testid="test-host"><test-cmp1/></div>`,
  imports: [TestModule]
})
class TestHostComponent { }

/** Standalone replacement for WrapperComponent in @testing-library/angular */
@Component({
  selector: 'test-wrapper-component',
  template: '',
  standalone: true
})
class StandaloneWrapperComponent { }


describe('TestBed with standalone host components', () => {

  it('creates host component with child component from module', async () => {
    const testBed = TestBed.configureTestingModule({
      imports: [
        TestHostComponent
      ]
    });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(TestHostComponent);

    await expectContainsTestCmp1(fixture);
  });

  it('creates empty component with overridden template and imported child component', async () => {
    const testBed = TestBed.configureTestingModule({
        imports: [
          StandaloneWrapperComponent
        ]
      })
      .overrideComponent(StandaloneWrapperComponent, {
        set: {
          template: `<test-cmp1/>`,
          imports: [TestCmp1]
        }
      });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(StandaloneWrapperComponent);

    await expectContainsTestCmp1(fixture);
  });

  it('FAILS unit-test builder: creates host component with child component from module, and overrideComponent() called', async () => {
    const testBed = TestBed.configureTestingModule({
      imports: [
        TestHostComponent
      ]
    })
      // The test also fails if overrideComponent() is empty - it just has to be called
      .overrideComponent(TestHostComponent, {
        set: {
          template: `<test-cmp1/><test-cmp1/>`,
        }
      });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(TestHostComponent);

    await expectContainsTestCmp1(fixture);
  });

  it('FAILS unit-test builder: creates empty component with overridden template and child component from module', async () => {
    const testBed = TestBed.configureTestingModule({
      imports: [
        StandaloneWrapperComponent
      ]
    }).overrideComponent(StandaloneWrapperComponent, {
      set: {
        template: `<test-cmp1/>`,
        imports: [TestModule]
      }
    });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(StandaloneWrapperComponent);

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
