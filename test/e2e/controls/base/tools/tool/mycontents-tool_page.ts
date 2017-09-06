import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';
import controls = require('../../../index');
import testUtil = require('../../../../test_util');

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        try {
          browserSync.switchTo().frame(elementSync.findVisible('[name="legacy-tool-iframe"]'));
          this.rootElement = elementSync.findVisible('body.content-system-page');
        } finally {
          browserSync.switchTo().defaultContent();
        }
      }
    }
  }

  close() {
    elementSync.findVisible('.bb-offcanvas-panel-wrap .bb-close').click();
    this.rootElement.waitUntilRemoved();

    return new controls.BaseToolsPage.Control();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}