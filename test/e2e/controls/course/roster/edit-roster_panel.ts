import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#roster-settings').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  clickRemoveUserButton() {
    this.rootElement.findVisible('button.delete-account').click();
    return new controls.ConfirmationNeeded.Control();
  }

  allowAccess(allow: boolean) {
    var accessCheckbox = new controls.Checkbox.Control(this.rootElement.findElement('input[name="allowAccess"]').closest('div'));
    if (allow) {
      accessCheckbox.setToChecked();
    } else {
      accessCheckbox.setToUnchecked();
    }

    return this;
  }

  setRole(role: string) {
    var roleControl = new controls.Select.Control(this.rootElement.findVisible('select#role'));
    roleControl.selectOptionByLabel(role);
    return this;
  }

  save() {
    this.rootElement.findVisible('.js-save').click();
    this.rootElement.waitUntilRemoved();
  }

  close() {
    this.rootElement.findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  openAccountInformation() {
    this.rootElement.findVisible('.accordion > li#course-roster-edit-accountInformation').findVisible('a[role=tab]').click();
    return this;
  }

  assertUserInfoNotDisplayed() {
    this.rootElement.assertElementDoesNotExist('div#info-row-emailAddress');
    this.rootElement.assertElementDoesNotExist('div#info-row-phone');
    this.rootElement.assertElementDoesNotExist('div#info-row-street1');
    this.rootElement.assertElementDoesNotExist('div#info-row-company');
    return this;
  }

  assertEmailDisplayed(email: string) {
    polledExpect(() => this.rootElement.findVisible('div#info-row-emailAddress').findVisible('span.non-editable-label').getText()).toBe(email);
    return this;

  }

  assertCompanyDisplayed(company: string) {
    polledExpect(() => this.rootElement.findVisible('div#info-row-company').findVisible('span.non-editable-label').getText()).toBe(company);
    return this;

  }

  assertPhoneNumberDisplayed(phoneNumber: string) {
    polledExpect(() => this.rootElement.findVisible('span#non-editable-label-phone').getText()).toBe(phoneNumber);
    return this;

  }

  assertStreetAddressDisplayed(streetAddress: string) {
    polledExpect(() => this.rootElement.findVisible('div#info-row-street1').findVisible('span.non-editable-label').getText()).toBe(streetAddress);
    return this;

  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}