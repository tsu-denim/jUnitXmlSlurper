import testUtil = require('../../../test_util');
import controls = require('../../index');
import {ElementFinderSync, browserSync, elementSync, waitFor, polledExpect} from 'protractor-sync';

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

  enableLinkToAccountCreation() {
    this._frameFocus();

    let enableAccountCreationElement = this.rootElement.findVisible('#allowAccountCreation_Enable');
    this.rootElement.findVisible('#step3').scrollIntoView();  // Scrolls far down enough so that enable account creation radio is seen
    enableAccountCreationElement.click();
    polledExpect(() => enableAccountCreationElement.getAttribute('value')).toBe('Y');  //Verify radio button is enabled

    this._frameRelease();
    return this;
  }

  save() {
    this._frameFocus();

    this.rootElement.findVisible('.submit').scrollIntoView().click();
    this._frameRelease();

    return new controls.BaseAdminPage.Control();
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