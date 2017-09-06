import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.panel-wrap.not-carried');
    }
  }

  close() {
    elementSync.findVisible('.peek .bb-close').click().waitUntilRemoved();
    return new controls.CoursePage.Control();
  }

  openUnsupportedItemGroup() {
    this._getFirstLegacyItem().click();
    return this;
  }

  assertUnsupportedItemExists() {
    this.rootElement.findVisible('.detailed-item');
    return this;
  }

  closeUnsupportedItemGroup() {
    this.rootElement.findVisible('.detail-not-carry .close-detail').click();
    return this;
  }

  private _getFirstLegacyItem() {
    var legacyItems = this.rootElement.findVisibles('.legacy-item');
    return legacyItems[0];
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}