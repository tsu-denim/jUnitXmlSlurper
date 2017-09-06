import controls = require('../../index');
import {ElementFinderSync, browserSync, elementSync, waitFor, waitForNewWindow} from 'protractor-sync';
import testUtil = require('../../../test_util');

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.page-content-market').closest('.bb-offcanvas-panel');
    }
  }

  addPlacementItem(id: string) {
    this.rootElement.findVisible('button.add-placement.clear.js-placement-' + id).scrollIntoView().click();
    return new controls.CourseOutlinePage.Control();
  }

  openToolInNewWindow(toolName: string) {
    var currentWindowHandle = browserSync.getWindowHandle();
    waitForNewWindow(() => {
      this.rootElement.findVisible('.tool-title[title="' + toolName + '"]').click();
    });
    return new controls.ExternalPage.Control().setParentWindow(currentWindowHandle);
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
