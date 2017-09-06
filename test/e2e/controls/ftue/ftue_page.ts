import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#ftue-new');
    }
  }

  clickFirstButton() {
    this.rootElement.findVisible('.ftue-1-button.ftue-advance').click();
    return this;
  }

  clickSecondButton() {
    this.rootElement.findVisible('.ftue-2-button.ftue-advance').click();
    return this;
  }

  clickGetStartedButton() {
    this.rootElement.findVisible('.ftue-3-button.ftue-end').click();
    return new controls.BasePage.Control();
  }

  clickThrough() {
    this.clickFirstButton();
    this.clickSecondButton();
    this.clickGetStartedButton();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
