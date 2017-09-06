import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, polledExpect, browserSync} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('element-card')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  getColumn(title: string) {
    return new controls.StudentColumn.Control(this.rootElement.findVisible(By.linkText(title)).closest('.element-list-row'));
  }

  assertNoGradeColumn(title: string) {
    this.rootElement.assertElementDoesNotExist(By.linkText(title));
    return this;
  }

  clearFTUE() {
    this.rootElement.findVisible('#guidance-moment-grade-detail').click();
    return this;
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
