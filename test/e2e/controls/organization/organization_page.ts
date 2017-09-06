import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';

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
          browserSync.switchTo().frame(elementSync.findVisible('[name="legacy-organization-iframe"]'));
          this.rootElement = elementSync.findVisible('.locationPane').closest('body');
        } finally {
          browserSync.switchTo().defaultContent();
        }
      }
    }
  }

  close() {
    elementSync.findVisible('.bb-offcanvas-panel-wrap button.bb-close').click();
  }
}

class Small extends Control {
}

class Medium extends Control {
}

class Large extends Control {
}