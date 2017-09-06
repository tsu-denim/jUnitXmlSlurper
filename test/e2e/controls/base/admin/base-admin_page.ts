import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';
import controls = require('../../index');
import testUtil = require('../../../test_util');

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
          browserSync.switchTo().frame(elementSync.findVisible('[name="bb-base-admin-iframe"]'));
          this.rootElement = elementSync.findVisible('#nav_admin_term_list').closest('body');
        } finally {
          browserSync.switchTo().defaultContent();
        }
      }
    }
  }

  openAdminBuildingBlocks() {
    this._frameFocus();

    this.rootElement.findVisible('#nav_pa_ext').click();

    this._frameRelease();
    return new controls.AdminBuildingBlocksPage.Control();
  }

  openGatewayOptions() {
    this._frameFocus();

    this.rootElement.findVisible('#nav_gateway_options').click();

    this._frameRelease();
    return new controls.AdminGatewayOptionsPage.Control();
  }

  openGoals() {
    this._frameFocus();

    this.rootElement.findVisible('#nav_goal_management_entry').click();

    this._frameRelease();
    return new controls.AdminGoalsPage.Control();
  }

  private _frameFocus() {
    browserSync.switchTo().frame(elementSync.findVisible('[name="bb-base-admin-iframe"]'));
    this.rootElement = elementSync.findVisible('#nav_admin_term_list').closest('body');
  }

  private _frameRelease() {
    browserSync.switchTo().defaultContent();
  }

  closeWithCloseLink() {
    elementSync.findVisible('.admin-back-button').click();
    elementSync.findVisible('.site-logo'); //Make sure we are back to Ultra
  }

}

class Small extends Control {
}

class Medium extends Control {
}

class Large extends Control {
}
