import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#profile-update');
    }
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();

    return new controls.BaseProfilePage.Control();
  }

  save() {
    this.rootElement.findVisible('.js-done').click();
    this.rootElement.waitUntilRemoved();

    return new controls.BaseProfilePage.Control();
  }

  assertFamilyName(expectedName: string) {
    polledExpect(() => this.rootElement.findVisible('#update-familyName').getAttribute('value')).toBe(expectedName);

    return this;
  }

  setFamilyNameInputValue(familyName: string) {
    this.rootElement.findVisible('#update-familyName').clear().sendKeys(familyName);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}