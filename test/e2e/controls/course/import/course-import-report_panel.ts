import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#course-content-not-copy-panel').closest('.bb-offcanvas-panel-wrap');
    }
  }

  close() {
    this.rootElement.findVisible('.bb-close').click().waitUntilRemoved();
    return new controls.CoursePage.Control();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}