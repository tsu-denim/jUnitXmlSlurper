import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.notification.reveal-modal');
    }
  }

  cancel() {
    this.rootElement.findVisible('.confirm-cancel').click();
    this.rootElement.waitUntilRemoved();
  }

  complete() {
    this.rootElement.findVisible('[analytics-id="course.outline.openCourse.makeComplete"]').click();
  }

  ok() {
    this.rootElement.findVisible('.confirm-ok').click();
    this.rootElement.waitUntilRemoved();
  }

  assertTimeLimitInfo(verifyText?: string) {
    polledExpect(() => 
      this.rootElement.findVisible('.modal-title span').getText()
    ).toEqual(verifyText);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}