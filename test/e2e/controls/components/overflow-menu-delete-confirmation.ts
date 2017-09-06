import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.menu-icon-confirmation');
    }
  }

  cancel() {
    this.rootElement.findVisible('[analytics-id="global.cancel"]').click();
    this.rootElement.waitUntil(':hidden');
  }

  post() {
    this.rootElement.findVisible('[analytics-id="components.directives.grade.grade-and-feedback.actions.post"]').click();
    this.rootElement.waitUntil(':hidden');
  }

  ok() {
    this.rootElement.findVisible('.js-delete-confirm').click();
    this.rootElement.waitUntilRemoved();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}