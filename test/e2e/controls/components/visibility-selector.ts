import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('item-selector-container')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  /**
   * Opens the visibility menu and selects visible or hidden or restricted
   * @param selector The option to select
   * @returns {Control}
   */
  setOptionBySelector(selector: string) {
    this.rootElement.findVisible('button').click();

    this.rootElement.findVisible('.' + selector + '-option').click();

    return this;
  }

  /**
   * Opens the visibility menu and selects visible
   *
   * @returns {Control}
   */
  setVisible() {
    this.rootElement.findVisible('button').click();

    this.rootElement.findVisible('.visible-option').click();

    return this;
  }

  /**
   * Opens the visibility menu and selects hidden
   *
   * @returns {Control}
   */
  setHidden() {
    this.rootElement.findVisible('button').click();

    this.rootElement.findVisible('.hidden-option').click();

    return this;
  }

  /**
   * Opens the visibility menu and selects restricted
   *
   * @returns {Control}
   */
  setRestricted() {
    this.rootElement.findVisible('button').click();

    this.rootElement.findVisible('.restricted-option').click();

    return this;
  }

  /**
   * Asserts that the content is currently visible
   */
  assertVisible() {
    this.rootElement.findVisible('.js-visible-option');

    return this;
  }

  /**
   * Asserts that the content is currently hidden
   */
  assertHidden() {
    this.rootElement.findVisible('.js-hidden-option');

    return this;
  }

  /**
   * Asserts that the content is currently restricted
   */
  assertRestricted() {
    this.rootElement.findVisible('.js-restricted-option');

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}