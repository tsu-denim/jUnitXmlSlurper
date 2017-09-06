import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#roster-enroll').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  private _searchUser(familyName: string) {
    var input = this.rootElement.findVisible('input.enroll-search');
    input.click();
    input.clear().sendKeys(familyName);

    return this;
  }

  private _addFirstUser() {
    this.rootElement.findVisibles('ul.search-results-users li a')[0].click();
    return this;
  }

  enroll(familyName: string) {
    this._searchUser(familyName)._addFirstUser();
    return this;
  }

  closeByBackgroundClick() {
    var overlays = elementSync.findVisibles('.bb-offcanvas-overlay');
    overlays.pop().click(); //Click the topmost overlay
    this.rootElement.waitUntilRemoved();
  }

  save() {
    this.rootElement.findVisible('.js-save').click();
    this.rootElement.waitUntilRemoved();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}