import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('form[name=inviteForm]').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  setStudentEmail(email: string) {
    var emailInput = this.rootElement.findVisible('#invite-email-address');
    emailInput.click();
    emailInput.clear().sendKeys(email);
    return this;
  }

  setOptions(email: string) {
    this.setStudentEmail(email);
    this.rootElement.findElement('.email-preview-label').click(); // 'blur' away from the input field
    return this;
  }

  send() {
    this.rootElement.findVisible('button.js-button-success').click();
    this.rootElement.waitUntilRemoved();
  }

  assertSendButtonEnabled() {
    polledExpect(() =>
      this.rootElement.findVisible('button.js-button-success').isEnabled()
    ).toBeTruthy();

    return this;
  }

  assertSendButtonDisabled() {
    polledExpect(() =>
      this.rootElement.findVisible('button.js-button-success').isEnabled()
    ).toBeFalsy();

    return this;
  }

  assertEmptyEmailAddress() {
    this.rootElement.findVisible('.form-element-errors.sr-only');
    this.rootElement.findVisible('span[analytics-id="course.roster.invite.emptyStudent"]');
  }

  assertInvalidEmailMessage() {
    this.rootElement.findVisible('.form-element-errors.sr-only');
    this.rootElement.findVisible('span[analytics-id="components.directives.validation.messages.errors.email"]');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}