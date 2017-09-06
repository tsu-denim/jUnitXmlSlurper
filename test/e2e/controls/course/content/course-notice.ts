/**
 * Created by boliu on 10/10/15.
 */

import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.notice.notification');
    }
  }

  dismiss() {
    this.rootElement.findVisible('.modal-footer .dismiss-message').click();
    this.rootElement.waitUntilRemoved();
    return this;
  }

  getNotificationItem(title: string) {
    this.rootElement.findVisible(By.partialLinkText(title));

    return this;
  }

  getNonLinkNotificationItemTitle() {
    return this.rootElement.findVisible('.element-details .name span[ng-switch-when="doNotLink"]').getText();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}