import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  input: ElementFinderSync;
  label: ElementFinderSync;

  // NOTE: unlike some other constructors, the rootElement is required here
  constructor(rootElement: ElementFinderSync) {
    // a Checkbox should contain both an input and its referencing label
    polledExpect(
      () => rootElement.findElement('input[type="checkbox"]').getAttribute('id') === rootElement.findVisibles('label')[0].getAttribute('for')
    ).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
      this.input = rootElement.findElement('input[type="checkbox"]'); // should be only 1; it won't necessarily be visible
      this.label = rootElement.findVisibles('label')[0];
    }
  }

  /**
   * Sets checkbox to checked state
   */
  setToChecked() {
    if (!this.input.is(':checked')) {
      this.label.click();
    }

    polledExpect(() => this.input.is(':checked')).toEqual(true);

    return this;
  }

  /**
   * Sets checkbox to unchecked state
   */
  setToUnchecked() {
    if (this.input.is(':checked')) {
      this.label.click();
    }

    polledExpect(() => this.input.is(':checked') ).toEqual(false);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}