import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, elementSync} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#language-update').closest('.bb-offcanvas-panel-wrap');
    }
  }

  save() {
    this.rootElement.findVisible('.js-save').click();
    this.rootElement.waitUntilRemoved();
  }

  selectDefaultLanguage() {
    this.rootElement.findVisibles('select#update-language option')[0].click();
    return this;
  }
  selectNonDefaultLanguage() {
    this.rootElement.findVisibles('select#update-language option')[1].click();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
