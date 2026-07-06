import { Component, NgModule, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'test-cmp2',
  template: `<div data-testid="test-cmp2">Test Component 2</div>`
})
class TestCmp2 { }

@NgModule({
  imports: [TestCmp2],
  exports: [TestCmp2]
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

  @Component({
    template: `<div data-testid="test-host"><test-cmp2/></div>`,
    standalone: false
  })
  class TestHostComponent { }

  @NgModule({
    declarations: [TestHostComponent],
    imports: [TestModule]
  })
  class TestHostModule { }

  it('creates host component with child component from module', async () => {
    const testBed = TestBed.configureTestingModule({
      imports: [TestHostModule]
    });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(TestHostComponent);

    await expectContainsTestCmp1(fixture);
  });

  it('creates empty component with overridden template and imported child component', async () => {
    const testBed = TestBed.configureTestingModule({
        declarations: [ WrapperComponent ],
      imports: [TestCmp2]
      })
      .overrideComponent(WrapperComponent, {
        set: {
          template: `<test-cmp2/>`
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
        template: `<test-cmp2/>`,
      }
    });
    await testBed.compileComponents();

    const fixture = testBed.createComponent(WrapperComponent);

    await expectContainsTestCmp1(fixture);
  });

  async function expectContainsTestCmp1(fixture: ComponentFixture<unknown>) {
    expect(findDirective(fixture, TestCmp2)).toBeInstanceOf(TestCmp2);
    await expect(fixture.nativeElement.querySelector('[data-testid="test-cmp2"]')).toBeTruthy();
  }

});

function findDirective<TDirective>(fixture: ComponentFixture<unknown>, directiveType: Type<TDirective>): TDirective | null {
  const debugElement = fixture.debugElement.query(By.directive(directiveType));
  if (!debugElement) {
    return null;
  }
  return debugElement.injector.get(directiveType);
}
