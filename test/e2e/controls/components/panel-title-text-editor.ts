import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  // NOTE: unlike some other constructors, the rootElement is required here
  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.is('.panel-title-texteditor')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  isEditMode() {
    return this.rootElement.findElement('h1.panel-title').closest('div').hasClass('ng-hide');
  }

  enterEditMode() {
    // first make sure we're not in edit mode
    this.assertEditMode(false);

    var headerButton = this.rootElement.findVisible('h1.panel-title');
    headerButton.click();
    headerButton.closest('div').waitUntil('.ng-hide');
    this.getPanelTitleInput().waitUntil(':visible');
    return this;
  }

  assertEditMode(mode = true) {
    polledExpect(() => this.isEditMode()).toEqual(mode);
    return this;
  }

  setTitle(newTitle: string) {
    this.assertEditMode();
    this.rootElement.findVisible('input.panel-title').clear().sendKeys(newTitle);
    return this;
  }

  editAndSetTitle(newTitle: string) {
    this.enterEditMode();
    this.rootElement.findVisible('input.panel-title').clear().sendKeys(newTitle);
    return this;
  }

  getPanelTitleInput() {
    return this.rootElement.findElement('input.panel-title');
  }

  assertTitle(title: string) {
    // Element might not be visible if in edit mode, but it will still have the current value of the input.
    // You can't get the value of the input directly either, so use getInnerHtml
    polledExpect(() => this.rootElement.findElement('h1.panel-title').getInnerHtml().trim()).toEqual(title);
    return this;
  }

  /**
   * Send a character, then delete it.  Used to make sure cursor is visible in screenshots.
   */
  vr_showCaretInTitle() {
    this.assertEditMode();
    this.rootElement.findVisible('input.panel-title').sendKeys(' ').sendKeys(Key.BACK_SPACE);
    return this;
  }

  click() {
    this.rootElement.click();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}