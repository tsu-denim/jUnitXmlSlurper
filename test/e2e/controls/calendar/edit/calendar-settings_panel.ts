import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  /** Creates a control for the Calendar Settings panel */
  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#calendar-settings-container').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  isPresent() {
    return this.rootElement.isPresent();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}