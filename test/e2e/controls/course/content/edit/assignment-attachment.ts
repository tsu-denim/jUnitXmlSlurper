import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  dragHandle: ElementFinderSync;

  /**
   * Represents an Assignment attachment.
   *
   * Root element must have the 'file-name' css class which is used to identify the element as being a file attachment.
   */
  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('file-name')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
      this.dragHandle = this.rootElement.closest('.file-meta').findElement('.js-drag-handle');
    }
  }

  drop() {
    this.dragHandle.sendKeys(Key.ENTER);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
