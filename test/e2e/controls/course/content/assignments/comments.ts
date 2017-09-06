import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.comments');
    }
  }

  includeComment() {
    this.rootElement.findVisible('.add-comment-control a').click();
    return this;
  }

  setComment(text: string) {
    this.rootElement.findVisible('#comment-field')
      .clear()
      .sendKeys(text);
    return this;
  }

  save() {
    this.rootElement.findVisible('.save-button').click();
    return this;
  }

  cancel() {
    this.rootElement.findVisible('.cancel-comment').click();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
