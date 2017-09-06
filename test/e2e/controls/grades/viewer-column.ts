import controls = require('../index');
import enums = require('../enums/index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('js-row')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  assertDueDate(mustBe: Date) {
    var dueDate = new Date(this.rootElement.findVisible('.js-due-date').getText());
    polledExpect(() => dueDate).toEqual(mustBe);
    return this;
  }

  getGrade() {
    return new controls.DisplayGradePill.Control(this.rootElement.findVisible('bb-display-grade-pill'));
  }
}

class Small extends Control {
  assertGradeProgress() {
    polledExpect(() => this.rootElement.findElement('.grade-progress').isDisplayed()).toEqual(false);
    return this;
  }
}

class Medium extends Control {

}

class Large extends Control {

}