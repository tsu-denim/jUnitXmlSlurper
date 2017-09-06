import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';
import controls = require('../../index');

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        waitFor(() => {
          return browserSync.executeScript<boolean>(() => {
            return $('[name=bb-base-admin-iframe]').height() > 0;
          });
        }, 30000);
        try {
          this._frameFocus();
        } finally {
          this._frameRelease();
        }
      }
    }
  }

  openManageGlobalProperties() {
    this._frameFocus();

    this.rootElement.findVisible('a[href="/webapps/blackboard/execute/blti/manageGlobalProperties"').click();

    this._frameRelease();
    return new controls.AdminManageLtiProperties.Control();
  }

  goBack() {
    elementSync.findVisible('a[component-key="admin.back"]').click();

    return new controls.BasePage.Control();
  }

  private _frameFocus() {
    browserSync.switchTo().frame(elementSync.findVisible('[name="bb-base-admin-iframe"]'));
    this.rootElement = elementSync.findVisible('#contentPanel').closest('body');
  }

  private _frameRelease() {
    browserSync.switchTo().defaultContent();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}