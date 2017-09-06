import controls = require('../index');
import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';
import testUtil = require('../../test_util');

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.bb-login');
    }
  }

  assertLoginErrorMessageShown() {
    return this.rootElement.findVisible('#loginErrorMessage');
  }

  clickCreateAccount() {
    this.rootElement.findVisible('.trial-registration a').click();
    return new controls.CreateAccountPage.Control();
  }

  clickForgetPassword() {
    this.rootElement.findVisible('.login-form-footer .text-right a').click();
    return new controls.ForgetPasswordPage.Control();
  }

  assertPasswordSuccessReceiptShown() {
    return this.rootElement.findVisible('#login-block .receipt.success');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}