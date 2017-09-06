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

  setGradingEnabled(gradingEnabled: boolean) {
    this._frameFocus();

    if (gradingEnabled) {
      this.rootElement.findVisible('#allowGradingYes').click();
    } else {
      this.rootElement.findVisible('#allowGradingNo').click();
    }

    this._frameRelease();
    return this;
  }

  setAllowNonExcludedLinks() {
    this._frameFocus();

    this.rootElement.findVisible('#statusAllow').click();

    this._frameRelease();
    return this;
  }

  save() {
    this._frameFocus();
    //We have to scroll into view the bottom submit button to work around possible regression ULTRA-13035
    this.rootElement.findVisible('.submit').scrollIntoView().click();
    this._frameRelease();
    return new controls.AdminLtiToolProvidersPage.Control();
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