import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  /**
   * Creates a CalendarItem.
   * Note that this constructor REQUIRES a rootElement to be passed and it MUST have fc-time-grid-event class
   */
  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('fc-time-grid-event')).toBe(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  /**
   * Returns the title associated with this CalendarItem
   */
  getTitle() {
    this.rootElement.findVisible('.content-title').getText();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}