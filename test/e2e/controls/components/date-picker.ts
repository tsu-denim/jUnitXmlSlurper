import assert = require('assert');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  // NOTE: unlike some other constructors, the rootElement is required here
  constructor(rootElement: ElementFinderSync) {
    assert(rootElement.is('input'));

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  setDate(date: Date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear().toString().substr(2, 2);

    var dateString = month + '/' + day + '/' + year;

    this.rootElement.clear().waitUntil('.ng-empty');
    this.rootElement.sendKeys(dateString);
    this.rootElement.sendKeys(Key.TAB);

    polledExpect(() => this.rootElement.getAttribute('value')).toBe(dateString);
  }

  clearDate() {
    this.rootElement.clear();
    polledExpect(() => this.rootElement.getAttribute('value').length).toBe(0);
  }
}

class Small extends Control {
}

class Medium extends Control {
}

class Large extends Control {
}
