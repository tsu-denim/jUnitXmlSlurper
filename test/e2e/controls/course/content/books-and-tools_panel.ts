import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.books-and-tools').closest('.bb-offcanvas-panel');
    }
  }

  openAllTools() {
    this.rootElement.findVisible('button[analytics-id*="booksAndTools"]').click();
    return new controls.ContentMarketPage.Control();
  }

  /**
   * Closes the panel
   */
  close() {
    this.rootElement.findVisible('button.bb-close').click();
    this.rootElement.waitUntilRemoved();
    return new controls.CourseOutlinePage.Control();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}