import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

/**
 * This control exists to handle checkboxes on legacy Learn pages.  Those checkboxes may not have properly associated labels, or the
 * label and input may not be grouped together.
 */
export class Control {
  rootElement: ElementFinderSync;

  // NOTE: unlike some other constructors, the rootElement is required here
  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  /**
   * Sets checkbox to checked state
   */
  setToChecked() {
    if (!this.rootElement.is(':checked')) {
      this.rootElement.click();
    }

    polledExpect(() => this.rootElement.is(':checked')).toEqual(true);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}