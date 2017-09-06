import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

/**
 * Basic control class for the various grade-input directives
 */
export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  enterGrade(value: string) {
    var input = this._getGradeInput();
    input.click().clear();
    if (value) {
      input.sendKeys(value);
    }
    input.waitUntil('.ng-valid'); // the text box has an async validator, and if enter is pressed before it is valid, it won't get saved
    this.rootElement.parent().click();  // click off the grade pill to save the grade

    // after initiating the saving of the grade by clicking off, wait until the input is "pristine" again (which is manually set in the save-grade callback)
    // to ensure that the save has been completed before proceeding with the e2e test (see grade-input-directive.ts validateAndSave())
    input.waitUntil('.ng-pristine');

    return this;
  }

  assertScore(score: string) {
    polledExpect(() => this._getValue()).toEqual(score);
    return this;
  }

  /** Assert the color of the grade input pill */
  assertColor(color: string) {
    polledExpect(() => this.rootElement.findVisible('.wrapping-input-style').hasClass(color)).toBeTruthy();

    return this;
  }

  private _getGradeInput() {
    return this.rootElement.findVisible('.grade-input-wrapper input.js-grade-input');
  }

  private _getValue() {
    return this._getGradeInput().getAttribute('value');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}