import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('body');
    }
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}