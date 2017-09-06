import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, elementSync} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#profile-update-password').closest('.bb-offcanvas-panel-wrap');
    }
  }

  close() {
    this.rootElement.findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  save() {
    this.rootElement.findVisible('.js-done').click();
    this.rootElement.waitUntilRemoved();
  }

  setOldPasswordInputValue(oldPassword: string) {
    this.rootElement.findVisible('#old-password').clear().sendKeys(oldPassword);
    return this;
  }

  setNewPasswordInputValue(newPassword: string) {
    this.rootElement.findVisible('#new-password').clear().sendKeys(newPassword);
    return this;
  }

  setConfirmNewPasswordInputValue(confirmNewPassword: string) {
    this.rootElement.findVisible('#confirm-new-password').clear().sendKeys(confirmNewPassword);
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
