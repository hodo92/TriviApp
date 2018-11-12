import {Directionality} from '@angular/cdk/bidi';
import {
  ENTER,
  LEFT_ARROW,
  RIGHT_ARROW,
  UP_ARROW,
  DOWN_ARROW,
  SPACE,
  HOME,
  END,
} from '@angular/cdk/keycodes';
// import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {Component, DebugElement} from '@angular/core';
import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule,
  ValidationErrors, Validators} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {StepperOrientation} from '@angular/cdk/stepper';
import {map} from 'rxjs/operators/map';
import {take} from 'rxjs/operators/take';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MatStepperModule} from './index';
import {MatHorizontalStepper, MatStep, MatStepper,
  // MatVerticalStepper
} from './stepper';
import {MatStepperNext, MatStepperPrevious} from './stepper-button';
import {MatStepperIntl} from './stepper-intl';

const VALID_REGEX = /valid/;

describe('MatHorizontalStepper', () => {
  let dir = 'ltr';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatStepperModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [
        SimpleMatHorizontalStepperApp,
        SimplePreselectedMatHorizontalStepperApp,
        LinearMatHorizontalStepperApp,
        SimpleStepperWithoutStepControl,
        SimpleStepperWithStepControlAndCompletedBinding,
        IconOverridesStepper,
      ],
      providers: [
        {provide: Directionality, useFactory: () => ({value: dir})}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic horizontal stepper', () => {
    let fixture: ComponentFixture<SimpleMatHorizontalStepperApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleMatHorizontalStepperApp);
      fixture.detectChanges();
    });

    it('should default to the first step', () => {
      const stepperComponent = fixture.debugElement
          .query(By.css('mat-horizontal-stepper')).componentInstance;
      expect(stepperComponent.selectedIndex).toBe(0);
    });

    it('should throw when a negative `selectedIndex` is assigned', () => {
      const stepperComponent: MatHorizontalStepper = fixture.debugElement
          .query(By.css('mat-horizontal-stepper')).componentInstance;

      expect(() => {
        stepperComponent.selectedIndex = -10;
        fixture.detectChanges();
      }).toThrowError(/Cannot assign out-of-bounds/);
    });

    it('should throw when an out-of-bounds `selectedIndex` is assigned', () => {
      const stepperComponent: MatHorizontalStepper = fixture.debugElement
          .query(By.css('mat-horizontal-stepper')).componentInstance;

      expect(() => {
        stepperComponent.selectedIndex = 1337;
        fixture.detectChanges();
      }).toThrowError(/Cannot assign out-of-bounds/);
    });

    it('should change selected index on header click', () => {
      const stepHeaders = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      assertSelectionChangeOnHeaderClick(fixture, stepHeaders);
    });

    it('should set the "tablist" role on stepper', () => {
      const stepperEl = fixture.debugElement.query(By.css('mat-horizontal-stepper')).nativeElement;
      expect(stepperEl.getAttribute('role')).toBe('tablist');
    });

    it('should set the proper "aria-orientation"', () => {
      const stepperEl = fixture.debugElement.query(By.css('mat-horizontal-stepper')).nativeElement;
      expect(stepperEl.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('should set aria-expanded of content correctly', () => {
      const stepContents = fixture.debugElement.queryAll(By.css(`.mat-horizontal-stepper-content`));
      assertCorrectAriaExpandedAttribute(fixture, stepContents);
    });

    it('should display the correct label', () => {
      assertCorrectStepLabel(fixture);
    });

    it('should go to next available step when the next button is clicked', () => {
      assertNextStepperButtonClick(fixture);
    });

    it('should set the next stepper button type to "submit"', () => {
      assertStepperButtonType(fixture, MatStepperNext, 'submit');
    });

    it('should go to previous available step when the previous button is clicked', () => {
      assertPreviousStepperButtonClick(fixture);
    });

    it('should set the previous stepper button type to "button"', () => {
      assertStepperButtonType(fixture, MatStepperPrevious, 'button');
    });

    it('should set the correct step position for animation', () => {
      assertCorrectStepAnimationDirection(fixture);
    });

    it('should support using the left/right arrows to move focus', () => {
      const stepHeaders = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      assertCorrectKeyboardInteraction(fixture, stepHeaders, 'horizontal');
    });

    it('should not set focus on header of selected step if header is not clicked', () => {
      assertStepHeaderFocusNotCalled(fixture);
    });

    it('should only be able to return to a previous step if it is editable', () => {
      assertEditableStepChange(fixture);
    });

    it('should set create icon if step is editable and completed', () => {
      assertCorrectStepIcon(fixture, true, 'edit');
    });

    it('should set done icon if step is not editable and is completed', () => {
      assertCorrectStepIcon(fixture, false, 'done');
    });

    it('should re-render when the i18n labels change',
      inject([MatStepperIntl], (intl: MatStepperIntl) => {
        const header = fixture.debugElement.queryAll(By.css('mat-step-header'))[2].nativeElement;
        const optionalLabel = header.querySelector('.mat-step-optional');

        expect(optionalLabel).toBeTruthy();
        expect(optionalLabel.textContent).toBe('Optional');

        intl.optionalLabel = 'Valgfri';
        intl.changes.next();
        fixture.detectChanges();

        expect(optionalLabel.textContent).toBe('Valgfri');
      }));
  });

  describe('RTL', () => {
    let fixture: ComponentFixture<SimpleMatHorizontalStepperApp>;

    beforeEach(() => {
      dir = 'rtl';
      fixture = TestBed.createComponent(SimpleMatHorizontalStepperApp);
      fixture.detectChanges();
    });

    it('should reverse arrow key focus in RTL mode', () => {
      const stepHeaders = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      assertArrowKeyInteractionInRtl(fixture, stepHeaders);
    });

    it('should reverse animation in RTL mode', () => {
      assertCorrectStepAnimationDirection(fixture, 'rtl');
    });
  });

  describe('icon overrides', () => {
    let fixture: ComponentFixture<IconOverridesStepper>;

    beforeEach(() => {
      fixture = TestBed.createComponent(IconOverridesStepper);
      fixture.detectChanges();
    });

    it('should allow for the `edit` icon to be overridden', () => {
      const stepperDebugElement = fixture.debugElement.query(By.directive(MatStepper));
      const stepperComponent: MatStepper = stepperDebugElement.componentInstance;

      stepperComponent._steps.toArray()[0].editable = true;
      stepperComponent.next();
      fixture.detectChanges();

      const header = stepperDebugElement.nativeElement.querySelector('mat-step-header');

      expect(header.textContent).toContain('Custom edit');
    });

    it('should allow for the `done` icon to be overridden', () => {
      const stepperDebugElement = fixture.debugElement.query(By.directive(MatStepper));
      const stepperComponent: MatStepper = stepperDebugElement.componentInstance;

      stepperComponent._steps.toArray()[0].editable = false;
      stepperComponent.next();
      fixture.detectChanges();

      const header = stepperDebugElement.nativeElement.querySelector('mat-step-header');

      expect(header.textContent).toContain('Custom done');
    });
  });

  describe('linear horizontal stepper', () => {
    let fixture: ComponentFixture<LinearMatHorizontalStepperApp>;
    let testComponent: LinearMatHorizontalStepperApp;
    let stepperComponent: MatHorizontalStepper;

    beforeEach(() => {
      fixture = TestBed.createComponent(LinearMatHorizontalStepperApp);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
      stepperComponent = fixture.debugElement
          .query(By.css('mat-horizontal-stepper')).componentInstance;
    });

    it('should have true linear attribute', () => {
      expect(stepperComponent.linear).toBe(true);
    });

    it('should not move to next step if current step is invalid', () => {
      // tslint:disable-next-line:no-non-null-assertion
      expect(testComponent.oneGroup.get('oneCtrl')!.value).toBe('');
      // tslint:disable-next-line:no-non-null-assertion
      expect(testComponent.oneGroup.get('oneCtrl')!.valid).toBe(false);
      expect(testComponent.oneGroup.valid).toBe(false);
      expect(testComponent.oneGroup.invalid).toBe(true);
      expect(stepperComponent.selectedIndex).toBe(0);

      const stepHeaderEl = fixture.debugElement
          .queryAll(By.css('.mat-horizontal-stepper-header'))[1].nativeElement;
      assertLinearStepperValidity(stepHeaderEl, testComponent, fixture);
    });

    it('should not move to next step if current step is pending', () => {
      const stepHeaderEl = fixture.debugElement
          .queryAll(By.css('.mat-horizontal-stepper-header'))[2].nativeElement;

      assertLinearStepperPending(stepHeaderEl, testComponent, fixture);
    });

    it('should not focus step header upon click if it is not able to be selected', () => {
      assertStepHeaderBlurred(fixture);
    });

    it('should be able to move to next step even when invalid if current step is optional', () => {
      assertOptionalStepValidity(testComponent, fixture);
    });

    it('should not throw when there is a pre-defined selectedIndex', () => {
      fixture.destroy();

      const preselectedFixture = TestBed.createComponent(SimplePreselectedMatHorizontalStepperApp);
      const debugElement = preselectedFixture.debugElement;

      expect(() => preselectedFixture.detectChanges()).not.toThrow();

      const stepHeaders = debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      assertSelectionChangeOnHeaderClick(preselectedFixture, stepHeaders);
    });

    it('should not move to the next step if the current one is not completed ' +
      'and there is no `stepControl`', () => {
        fixture.destroy();

        const noStepControlFixture = TestBed.createComponent(SimpleStepperWithoutStepControl);

        noStepControlFixture.detectChanges();

        const stepper: MatHorizontalStepper = noStepControlFixture.debugElement
            .query(By.directive(MatHorizontalStepper)).componentInstance;

        const headers = noStepControlFixture.debugElement
            .queryAll(By.css('.mat-horizontal-stepper-header'));

        expect(stepper.selectedIndex).toBe(0);

        headers[1].nativeElement.click();
        noStepControlFixture.detectChanges();

        expect(stepper.selectedIndex).toBe(0);
      });

      it('should have the `stepControl` take precedence when both `completed` and ' +
        '`stepControl` are set', () => {
          fixture.destroy();

          const controlAndBindingFixture =
              TestBed.createComponent(SimpleStepperWithStepControlAndCompletedBinding);

          controlAndBindingFixture.detectChanges();

          expect(controlAndBindingFixture.componentInstance.steps[0].control.valid).toBe(true);
          expect(controlAndBindingFixture.componentInstance.steps[0].completed).toBe(false);

          const stepper: MatHorizontalStepper = controlAndBindingFixture.debugElement
              .query(By.directive(MatHorizontalStepper)).componentInstance;

          const headers = controlAndBindingFixture.debugElement
              .queryAll(By.css('.mat-horizontal-stepper-header'));

          expect(stepper.selectedIndex).toBe(0);

          headers[1].nativeElement.click();
          controlAndBindingFixture.detectChanges();

          expect(stepper.selectedIndex).toBe(1);
        });

    it('should be able to reset the stepper to its initial state', () => {
      assertLinearStepperResetable(fixture);
    });

    it('should not clobber the `complete` binding when resetting', () => {
      assertLinearStepperResetComplete(fixture);
    });
  });
});

// describe('MatVerticalStepper', () => {
//   let dir = 'ltr';

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [MatStepperModule, NoopAnimationsModule, ReactiveFormsModule],
//       declarations: [
//         SimpleMatVerticalStepperApp,
//         LinearMatVerticalStepperApp
//       ],
//       providers: [
//         {provide: Directionality, useFactory: () => ({value: dir})}
//       ]
//     });

//     TestBed.compileComponents();
//   }));

//   describe('basic vertical stepper', () => {
//     let fixture: ComponentFixture<SimpleMatVerticalStepperApp>;

//     beforeEach(() => {
//       fixture = TestBed.createComponent(SimpleMatVerticalStepperApp);
//       fixture.detectChanges();
//     });

//     it('should default to the first step', () => {
//       let stepperComponent = fixture.debugElement
//           .query(By.css('mat-vertical-stepper')).componentInstance;
//       expect(stepperComponent.selectedIndex).toBe(0);
//     });

//     it('should change selected index on header click', () => {
//       let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
//       assertSelectionChangeOnHeaderClick(fixture, stepHeaders);

//     });

//     it('should set the "tablist" role on stepper', () => {
//       let stepperEl = fixture.debugElement.query(By.css('mat-vertical-stepper')).nativeElement;
//       expect(stepperEl.getAttribute('role')).toBe('tablist');
//     });

//     it('should set the proper "aria-orientation"', () => {
//       let stepperEl = fixture.debugElement.query(By.css('mat-vertical-stepper')).nativeElement;
//       expect(stepperEl.getAttribute('aria-orientation')).toBe('vertical');
//     });

//     it('should set aria-expanded of content correctly', () => {
//       let stepContents = fixture.debugElement.queryAll(By.css(`.mat-vertical-stepper-content`));
//       assertCorrectAriaExpandedAttribute(fixture, stepContents);
//     });

//     it('should display the correct label', () => {
//       assertCorrectStepLabel(fixture);
//     });

//     it('should go to next available step when the next button is clicked', () => {
//       assertNextStepperButtonClick(fixture);
//     });

//     it('should set the next stepper button type to "submit"', () => {
//       assertStepperButtonType(fixture, MatStepperNext, 'submit');
//     });

//     it('should go to previous available step when the previous button is clicked', () => {
//       assertPreviousStepperButtonClick(fixture);
//     });

//     it('should set the previous stepper button type to "button"', () => {
//       assertStepperButtonType(fixture, MatStepperPrevious, 'button');
//     });

//     it('should set the correct step position for animation', () => {
//       assertCorrectStepAnimationDirection(fixture);
//     });

//     it('should support using the left/right arrows to move focus', () => {
//       let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
//       assertCorrectKeyboardInteraction(fixture, stepHeaders, 'horizontal');
//     });

//     it('should support using the up/down arrows to move focus', () => {
//       let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
//       assertCorrectKeyboardInteraction(fixture, stepHeaders, 'vertical');
//     });

//     it('should not set focus on header of selected step if header is not clicked', () => {
//       assertStepHeaderFocusNotCalled(fixture);
//     });

//     it('should only be able to return to a previous step if it is editable', () => {
//       assertEditableStepChange(fixture);
//     });

//     it('should set create icon if step is editable and completed', () => {
//       assertCorrectStepIcon(fixture, true, 'edit');
//     });

//     it('should set done icon if step is not editable and is completed', () => {
//       assertCorrectStepIcon(fixture, false, 'done');
//     });
//   });

//   describe('RTL', () => {
//     let fixture: ComponentFixture<SimpleMatVerticalStepperApp>;

//     beforeEach(() => {
//       dir = 'rtl';
//       fixture = TestBed.createComponent(SimpleMatVerticalStepperApp);
//       fixture.detectChanges();
//     });

//     it('should reverse arrow key focus in RTL mode', () => {
//       let stepHeaders = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
//       assertArrowKeyInteractionInRtl(fixture, stepHeaders);
//     });

//     it('should reverse animation in RTL mode', () => {
//       assertCorrectStepAnimationDirection(fixture, 'rtl');
//     });
//   });

//   describe('linear vertical stepper', () => {
//     let fixture: ComponentFixture<LinearMatVerticalStepperApp>;
//     let testComponent: LinearMatVerticalStepperApp;
//     let stepperComponent: MatVerticalStepper;

//     beforeEach(() => {
//       fixture = TestBed.createComponent(LinearMatVerticalStepperApp);
//       fixture.detectChanges();

//       testComponent = fixture.componentInstance;
//       stepperComponent = fixture.debugElement
//           .query(By.css('mat-vertical-stepper')).componentInstance;
//     });

//     it('should have true linear attribute', () => {
//       expect(stepperComponent.linear).toBe(true);
//     });

//     it('should not move to next step if current step is invalid', () => {
//       expect(testComponent.oneGroup.get('oneCtrl')!.value).toBe('');
//       expect(testComponent.oneGroup.get('oneCtrl')!.valid).toBe(false);
//       expect(testComponent.oneGroup.valid).toBe(false);
//       expect(testComponent.oneGroup.invalid).toBe(true);
//       expect(stepperComponent.selectedIndex).toBe(0);

//       let stepHeaderEl = fixture.debugElement
//           .queryAll(By.css('.mat-vertical-stepper-header'))[1].nativeElement;

//       assertLinearStepperValidity(stepHeaderEl, testComponent, fixture);
//     });

//     it('should not move to next step if current step is pending', () => {
//       let stepHeaderEl = fixture.debugElement
//           .queryAll(By.css('.mat-vertical-stepper-header'))[2].nativeElement;

//       assertLinearStepperPending(stepHeaderEl, testComponent, fixture);
//     });

//     it('should not focus step header upon click if it is not able to be selected', () => {
//       assertStepHeaderBlurred(fixture);
//     });

//     it('should be able to move to next step even when invalid if current step is optional', () => {
//       assertOptionalStepValidity(testComponent, fixture);
//     });

//     it('should be able to reset the stepper to its initial state', () => {
//       assertLinearStepperResetable(fixture);
//     });

//     it('should not clobber the `complete` binding when resetting', () => {
//       assertLinearStepperResetComplete(fixture);
//     });
//   });
// });

/** Asserts that `selectedIndex` updates correctly when header of another step is clicked. */
function assertSelectionChangeOnHeaderClick(fixture: ComponentFixture<any>,
                                            stepHeaders: DebugElement[]) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent.selectedIndex).toBe(0);
  expect(stepperComponent.selected instanceof MatStep).toBe(true);

  // select the second step
  let stepHeaderEl = stepHeaders[1].nativeElement;
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);
  expect(stepperComponent.selected instanceof MatStep).toBe(true);

  // select the third step
  stepHeaderEl = stepHeaders[2].nativeElement;
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);
  expect(stepperComponent.selected instanceof MatStep).toBe(true);
}

/** Asserts that 'aria-expanded' attribute is correct for expanded content of step. */
function assertCorrectAriaExpandedAttribute(fixture: ComponentFixture<any>,
                                            stepContents: DebugElement[]) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  const firstStepContentEl = stepContents[0].nativeElement;
  expect(firstStepContentEl.getAttribute('aria-expanded')).toBe('true');

  stepperComponent.selectedIndex = 1;
  fixture.detectChanges();

  expect(firstStepContentEl.getAttribute('aria-expanded')).toBe('false');
  const secondStepContentEl = stepContents[1].nativeElement;
  expect(secondStepContentEl.getAttribute('aria-expanded')).toBe('true');
}

/** Asserts that step has correct label. */
function assertCorrectStepLabel(fixture: ComponentFixture<any>) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  let selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('Step 1');

  stepperComponent.selectedIndex = 2;
  fixture.detectChanges();

  selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('Step 3');

  fixture.componentInstance.inputLabel = 'New Label';
  fixture.detectChanges();

  selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('New Label');
}

/** Asserts that clicking on MatStepperNext button updates `selectedIndex` correctly. */
function assertNextStepperButtonClick(fixture: ComponentFixture<any>) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent.selectedIndex).toBe(0);

  let nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[0].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[1].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);

  nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[2].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);
}

/** Asserts that the specified type of stepper button has the given type. */
function assertStepperButtonType(fixture: ComponentFixture<any>, stepperClass: any, type: string) {
  const buttonElement = fixture.debugElement.query(By.directive(stepperClass)).nativeElement;

  expect(buttonElement.type).toBe(type, `Expected the button to have "${type}" set as type.`);
}

/** Asserts that clicking on MatStepperPrevious button updates `selectedIndex` correctly. */
function assertPreviousStepperButtonClick(fixture: ComponentFixture<any>) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent.selectedIndex).toBe(0);

  stepperComponent.selectedIndex = 2;
  let previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperPrevious))[2].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperPrevious))[1].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperPrevious))[0].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);
}

/** Asserts that step position is correct for animation. */
function assertCorrectStepAnimationDirection(fixture: ComponentFixture<any>, rtl?: 'rtl') {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent._getAnimationDirection(0)).toBe('current');
  if (rtl === 'rtl') {
    expect(stepperComponent._getAnimationDirection(1)).toBe('previous');
    expect(stepperComponent._getAnimationDirection(2)).toBe('previous');
  } else {
    expect(stepperComponent._getAnimationDirection(1)).toBe('next');
    expect(stepperComponent._getAnimationDirection(2)).toBe('next');
  }

  stepperComponent.selectedIndex = 1;
  fixture.detectChanges();

  if (rtl === 'rtl') {
    expect(stepperComponent._getAnimationDirection(0)).toBe('next');
    expect(stepperComponent._getAnimationDirection(2)).toBe('previous');
  } else {
    expect(stepperComponent._getAnimationDirection(0)).toBe('previous');
    expect(stepperComponent._getAnimationDirection(2)).toBe('next');
  }
  expect(stepperComponent._getAnimationDirection(1)).toBe('current');

  stepperComponent.selectedIndex = 2;
  fixture.detectChanges();

  if (rtl === 'rtl') {
    expect(stepperComponent._getAnimationDirection(0)).toBe('next');
    expect(stepperComponent._getAnimationDirection(1)).toBe('next');
  } else {
    expect(stepperComponent._getAnimationDirection(0)).toBe('previous');
    expect(stepperComponent._getAnimationDirection(1)).toBe('previous');
  }
  expect(stepperComponent._getAnimationDirection(2)).toBe('current');
}

/** Asserts that keyboard interaction works correctly. */
function assertCorrectKeyboardInteraction(fixture: ComponentFixture<any>,
                                          stepHeaders: DebugElement[],
                                          orientation: StepperOrientation) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  const nextKey = orientation === 'vertical' ? DOWN_ARROW : RIGHT_ARROW;
  const prevKey = orientation === 'vertical' ? UP_ARROW : LEFT_ARROW;

  expect(stepperComponent._focusIndex).toBe(0);
  expect(stepperComponent.selectedIndex).toBe(0);

  let stepHeaderEl = stepHeaders[0].nativeElement;
  // dispatchKeyboardEvent(stepHeaderEl, 'keydown', nextKey);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(1, 'Expected index of focused step to increase by 1 after pressing the next key.');
  expect(stepperComponent.selectedIndex)
      .toBe(0, 'Expected index of selected step to remain unchanged after pressing the next key.');

  stepHeaderEl = stepHeaders[1].nativeElement;
  // dispatchKeyboardEvent(stepHeaderEl, 'keydown', ENTER);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(1, 'Expected index of focused step to remain unchanged after ENTER event.');
  expect(stepperComponent.selectedIndex)
      .toBe(1,
          'Expected index of selected step to change to index of focused step after ENTER event.');

  stepHeaderEl = stepHeaders[1].nativeElement;
  // dispatchKeyboardEvent(stepHeaderEl, 'keydown', prevKey);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(0, 'Expected index of focused step to decrease by 1 after pressing the previous key.');
  expect(stepperComponent.selectedIndex).toBe(1,
      'Expected index of selected step to remain unchanged after pressing the previous key.');

  // When the focus is on the last step and right arrow key is pressed, the focus should cycle
  // through to the first step.
  stepperComponent._focusIndex = 2;
  stepHeaderEl = stepHeaders[2].nativeElement;
  // dispatchKeyboardEvent(stepHeaderEl, 'keydown', nextKey);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(0,
      'Expected index of focused step to cycle through to index 0 after pressing the next key.');
  expect(stepperComponent.selectedIndex)
      .toBe(1, 'Expected index of selected step to remain unchanged after pressing the next key.');

  stepHeaderEl = stepHeaders[0].nativeElement;
  // dispatchKeyboardEvent(stepHeaderEl, 'keydown', SPACE);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex)
      .toBe(0, 'Expected index of focused to remain unchanged after SPACE event.');
  expect(stepperComponent.selectedIndex)
      .toBe(0,
          'Expected index of selected step to change to index of focused step after SPACE event.');

  // const endEvent = dispatchKeyboardEvent(stepHeaderEl, 'keydown', END);
  expect(stepperComponent._focusIndex)
      .toBe(stepHeaders.length - 1, 'Expected last step to be focused when pressing END.');
  // expect(endEvent.defaultPrevented).toBe(true, 'Expected default END action to be prevented.');

  // const homeEvent = dispatchKeyboardEvent(stepHeaderEl, 'keydown', HOME);
  expect(stepperComponent._focusIndex)
      .toBe(0, 'Expected first step to be focused when pressing HOME.');
  // expect(homeEvent.defaultPrevented).toBe(true, 'Expected default HOME action to be prevented.');
}

/** Asserts that step selection change using stepper buttons does not focus step header. */
function assertStepHeaderFocusNotCalled(fixture: ComponentFixture<any>) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  const stepHeaderEl = fixture.debugElement.queryAll(By.css('mat-step-header'))[1].nativeElement;
  const nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[0].nativeElement;
  spyOn(stepHeaderEl, 'focus');
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);
  expect(stepHeaderEl.focus).not.toHaveBeenCalled();
}

/** Asserts that arrow key direction works correctly in RTL mode. */
function assertArrowKeyInteractionInRtl(fixture: ComponentFixture<any>,
                                        stepHeaders: DebugElement[]) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  expect(stepperComponent._focusIndex).toBe(0);

  let stepHeaderEl = stepHeaders[0].nativeElement;
  // dispatchKeyboardEvent(stepHeaderEl, 'keydown', LEFT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(1);

  stepHeaderEl = stepHeaders[1].nativeElement;
  // dispatchKeyboardEvent(stepHeaderEl, 'keydown', RIGHT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(0);
}

/**
 * Asserts that linear stepper does not allow step selection change if current step is not valid.
 */
function assertLinearStepperValidity(stepHeaderEl: HTMLElement,
                                     testComponent:
                                         LinearMatHorizontalStepperApp/* |
                                         LinearMatVerticalStepperApp*/,
                                     fixture: ComponentFixture<any>) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  const nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[0].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  // tslint:disable-next-line:no-non-null-assertion
  testComponent.oneGroup.get('oneCtrl')!.setValue('answer');
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(testComponent.oneGroup.valid).toBe(true);
  expect(stepperComponent.selectedIndex).toBe(1);
}

/** Asserts that linear stepper does not allow step selection change if current step is pending. */
function assertLinearStepperPending(stepHeaderEl: HTMLElement,
                                    testComponent:
                                        LinearMatHorizontalStepperApp/* |
                                        LinearMatVerticalStepperApp*/,
                                    fixture: ComponentFixture<any>) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  const nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[1].nativeElement;

  // tslint:disable-next-line:no-non-null-assertion
  testComponent.oneGroup.get('oneCtrl')!.setValue('input');
  // tslint:disable-next-line:no-non-null-assertion
  testComponent.twoGroup.get('twoCtrl')!.setValue('input');
  stepperComponent.selectedIndex = 1;
  fixture.detectChanges();
  expect(stepperComponent.selectedIndex).toBe(1);

  // Step status = PENDING
  // Assert that linear stepper does not allow step selection change
  expect(testComponent.twoGroup.pending).toBe(true);

  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  // Trigger asynchronous validation
  testComponent.validationTrigger.next();
  // Asynchronous validation completed:
  // Step status = VALID
  expect(testComponent.twoGroup.pending).toBe(false);
  expect(testComponent.twoGroup.valid).toBe(true);

  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);

  stepperComponent.selectedIndex = 1;
  fixture.detectChanges();
  expect(stepperComponent.selectedIndex).toBe(1);

  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);
}

/** Asserts that step header focus is blurred if the step cannot be selected upon header click. */
function assertStepHeaderBlurred(fixture: ComponentFixture<any>) {
  const stepHeaderEl = fixture.debugElement
      .queryAll(By.css('mat-step-header'))[1].nativeElement;
  spyOn(stepHeaderEl, 'blur');
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepHeaderEl.blur).toHaveBeenCalled();
}

/** Asserts that it is only possible to go back to a previous step if the step is editable. */
function assertEditableStepChange(fixture: ComponentFixture<any>) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;

  stepperComponent.selectedIndex = 1;
  stepperComponent._steps.toArray()[0].editable = false;
  const previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperPrevious))[1].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  stepperComponent._steps.toArray()[0].editable = true;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);
}

/**
 * Asserts that it is possible to skip an optional step in linear
 * stepper if there is no input or the input is invalid.
 */
function assertOptionalStepValidity(testComponent:
                                        LinearMatHorizontalStepperApp/* | LinearMatVerticalStepperApp*/,
                                    fixture: ComponentFixture<any>) {
  const stepperComponent: MatStepper = fixture.debugElement
      .query(By.directive(MatStepper)).componentInstance;

  // tslint:disable-next-line:no-non-null-assertion
  testComponent.oneGroup.get('oneCtrl')!.setValue('input');
  // tslint:disable-next-line:no-non-null-assertion
  testComponent.twoGroup.get('twoCtrl')!.setValue('input');
  testComponent.validationTrigger.next();
  stepperComponent.selectedIndex = 2;
  fixture.detectChanges();

  expect(stepperComponent._steps.toArray()[2].optional).toBe(true);
  expect(stepperComponent.selectedIndex).toBe(2);
  // tslint:disable-next-line:no-non-null-assertion
  expect(testComponent.threeGroup.get('threeCtrl')!.valid).toBe(true);

  const nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[2].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex)
      .toBe(3, 'Expected selectedIndex to change when optional step input is empty.');

  stepperComponent.selectedIndex = 2;
  // tslint:disable-next-line:no-non-null-assertion
  testComponent.threeGroup.get('threeCtrl')!.setValue('input');
  nextButtonNativeEl.click();
  fixture.detectChanges();

  // tslint:disable-next-line:no-non-null-assertion
  expect(testComponent.threeGroup.get('threeCtrl')!.valid).toBe(false);
  expect(stepperComponent.selectedIndex)
      .toBe(3, 'Expected selectedIndex to change when optional step input is invalid.');
}

/** Asserts that step header set the correct icon depending on the state of step. */
function assertCorrectStepIcon(fixture: ComponentFixture<any>,
                               isEditable: boolean,
                               icon: String) {
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  const nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MatStepperNext))[0].nativeElement;
  expect(stepperComponent._getIndicatorType(0)).toBe('number');
  stepperComponent._steps.toArray()[0].editable = isEditable;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent._getIndicatorType(0)).toBe(icon);
}

function asyncValidator(minLength: number, validationTrigger: Observable<any>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return validationTrigger.pipe(
      map(() => control.value && control.value.length >= minLength ? null : {asyncValidation: {}}),
      take(1)
    );
  };
}


/** Asserts that a stepper can be reset. */
function assertLinearStepperResetable(
    fixture: ComponentFixture<LinearMatHorizontalStepperApp/*|LinearMatVerticalStepperApp*/>) {

  const testComponent = fixture.componentInstance;
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  const steps = stepperComponent._steps.toArray();

  // tslint:disable-next-line:no-non-null-assertion
  testComponent.oneGroup.get('oneCtrl')!.setValue('value');
  fixture.detectChanges();

  stepperComponent.next();
  fixture.detectChanges();

  stepperComponent.next();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);
  expect(steps[0].interacted).toBe(true);
  expect(steps[0].completed).toBe(true);
  // tslint:disable-next-line:no-non-null-assertion
  expect(testComponent.oneGroup.get('oneCtrl')!.valid).toBe(true);
  // tslint:disable-next-line:no-non-null-assertion
  expect(testComponent.oneGroup.get('oneCtrl')!.value).toBe('value');

  expect(steps[1].interacted).toBe(true);
  expect(steps[1].completed).toBe(false);
  // tslint:disable-next-line:no-non-null-assertion
  expect(testComponent.twoGroup.get('twoCtrl')!.valid).toBe(false);

  stepperComponent.reset();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);
  expect(steps[0].interacted).toBe(false);
  expect(steps[0].completed).toBe(false);
  // tslint:disable-next-line:no-non-null-assertion
  expect(testComponent.oneGroup.get('oneCtrl')!.valid).toBe(false);
  // tslint:disable-next-line:no-non-null-assertion
  expect(testComponent.oneGroup.get('oneCtrl')!.value).toBeFalsy();

  expect(steps[1].interacted).toBe(false);
  expect(steps[1].completed).toBe(false);
  // tslint:disable-next-line:no-non-null-assertion
  expect(testComponent.twoGroup.get('twoCtrl')!.valid).toBe(false);
}


/** Asserts that the `complete` binding is being reset correctly. */
function assertLinearStepperResetComplete(
  fixture: ComponentFixture<LinearMatHorizontalStepperApp/*|LinearMatVerticalStepperApp*/>) {

  const testComponent = fixture.componentInstance;
  const stepperComponent = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
  const steps: MatStep[] = stepperComponent._steps.toArray();
  const fillOutStepper = () => {
    // tslint:disable-next-line:no-non-null-assertion
    testComponent.oneGroup.get('oneCtrl')!.setValue('input');
    // tslint:disable-next-line:no-non-null-assertion
    testComponent.twoGroup.get('twoCtrl')!.setValue('input');
    // tslint:disable-next-line:no-non-null-assertion
    testComponent.threeGroup.get('threeCtrl')!.setValue('valid');
    testComponent.validationTrigger.next();
    stepperComponent.selectedIndex = 2;
    fixture.detectChanges();
    stepperComponent.selectedIndex = 3;
    fixture.detectChanges();
  };

  fillOutStepper();

  expect(steps[2].completed)
      .toBe(true, 'Expected third step to be considered complete after the first run through.');

  stepperComponent.reset();
  fixture.detectChanges();
  fillOutStepper();

  expect(steps[2].completed)
      .toBe(true, 'Expected third step to be considered complete when doing a run after a reset.');
}


@Component({
  template: `
    <mat-horizontal-stepper>
      <mat-step>
        <ng-template matStepLabel>Step 1</ng-template>
        Content 1
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Step 2</ng-template>
        Content 2
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step [label]="inputLabel" optional>
        Content 3
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
    </mat-horizontal-stepper>
  `
})
// tslint:disable-next-line:component-class-suffix
class SimpleMatHorizontalStepperApp {
  inputLabel = 'Step 3';
}

@Component({
  template: `
    <mat-horizontal-stepper linear>
      <mat-step [stepControl]="oneGroup">
        <form [formGroup]="oneGroup">
          <ng-template matStepLabel>Step one</ng-template>
          <input formControlName="oneCtrl" required>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step [stepControl]="twoGroup">
        <form [formGroup]="twoGroup">
          <ng-template matStepLabel>Step two</ng-template>
          <input formControlName="twoCtrl" required>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step [stepControl]="threeGroup" optional>
        <form [formGroup]="threeGroup">
          <ng-template matStepLabel>Step two</ng-template>
          <input formControlName="threeCtrl">
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>
      <mat-step>
        Done
      </mat-step>
    </mat-horizontal-stepper>
  `
})
// tslint:disable-next-line:component-class-suffix
class LinearMatHorizontalStepperApp {
  oneGroup: FormGroup;
  twoGroup: FormGroup;
  threeGroup: FormGroup;

  validationTrigger: Subject<any> = new Subject();

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.oneGroup = new FormGroup({
      oneCtrl: new FormControl('', Validators.required)
    });
    this.twoGroup = new FormGroup({
      twoCtrl: new FormControl('', Validators.required, asyncValidator(3, this.validationTrigger))
    });
    this.threeGroup = new FormGroup({
      threeCtrl: new FormControl('', Validators.pattern(VALID_REGEX))
    });
  }
}

@Component({
  template: `
    <mat-horizontal-stepper [linear]="true" [selectedIndex]="index">
      <mat-step label="One"></mat-step>
      <mat-step label="Two"></mat-step>
      <mat-step label="Three"></mat-step>
    </mat-horizontal-stepper>
  `
})
// tslint:disable-next-line:component-class-suffix
class SimplePreselectedMatHorizontalStepperApp {
  index = 0;
}

@Component({
  template: `
    <mat-horizontal-stepper linear>
      <mat-step
        *ngFor="let step of steps"
        [label]="step.label"
        [completed]="step.completed"></mat-step>
    </mat-horizontal-stepper>
  `
})
// tslint:disable-next-line:component-class-suffix
class SimpleStepperWithoutStepControl {
  steps = [
    {label: 'One', completed: false},
    {label: 'Two', completed: false},
    {label: 'Three', completed: false}
  ];
}

@Component({
  template: `
    <mat-horizontal-stepper linear>
      <mat-step
        *ngFor="let step of steps"
        [label]="step.label"
        [stepControl]="step.control"
        [completed]="step.completed"></mat-step>
    </mat-horizontal-stepper>
  `
})
// tslint:disable-next-line:component-class-suffix
class SimpleStepperWithStepControlAndCompletedBinding {
  steps = [
    {label: 'One', completed: false, control: new FormControl()},
    {label: 'Two', completed: false, control: new FormControl()},
    {label: 'Three', completed: false, control: new FormControl()}
  ];
}

@Component({
  template: `
    <mat-horizontal-stepper>
      <ng-template matStepperIcon="edit">Custom edit</ng-template>
      <ng-template matStepperIcon="done">Custom done</ng-template>

      <mat-step>Content 1</mat-step>
      <mat-step>Content 2</mat-step>
      <mat-step>Content 3</mat-step>
    </mat-horizontal-stepper>
`
})
// tslint:disable-next-line:component-class-suffix
class IconOverridesStepper {}
