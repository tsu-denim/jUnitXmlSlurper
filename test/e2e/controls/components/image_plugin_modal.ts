import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      elementSync.findVisible('.mce-floatpanel .mce-dragh');
      this.rootElement = rootElement || elementSync.findVisible('.mce-floatpanel');
    }
  }

  save() {
    this.rootElement.findVisible('.mce-first.mce-btn').click();
  }

  cancel() {
    this.rootElement.findVisible('.mce-last.mce-btn').click();
  }

  clickFileButton() {
    this.rootElement.findVisible('.mce-i-browse').click();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
