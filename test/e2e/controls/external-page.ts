import testUtil = require('../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  private parentWindowHandle: string;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('body');
    }
  }

  setParentWindow(parentWindowHandle: string) {
    this.parentWindowHandle = parentWindowHandle;
    return this;
  }

  assertUrlContains(url: string) {
    polledExpect(() => browserSync.getCurrentUrl()).toContain(url);
    return this;
  }

  close() {
    browserSync.getBrowser().driver.close();
    if (this.parentWindowHandle) {
      browserSync.switchTo().window(this.parentWindowHandle);
    }
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}