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

  editURL(text: string) {
    //have to click input before changing text to prevent focus error
    this._getURLInput().click().clear().sendKeys(text);

    return this;
  }

  editTitle(text: string) {
    //have to click input before changing text to prevent focus error
    this._getTitleInput().click().clear().sendKeys(text);

    return this;
  }

  assertURLInputValue(text: string) {
    polledExpect(() => this._getURLInput().getAttribute('value')).toBe(text);

    return this;
  }

  assertTitleInputValue(text: string) {
    polledExpect(() => this._getTitleInput().getAttribute('value')).toBe(text);

    return this;
  }

  save() {
    this.rootElement.findVisible('.mce-first.mce-btn').click();
  }

  saveAndConfirmExternal() {
    this.save();

    this.rootElement.waitUntilRemoved();

    elementSync.findVisible('.mce-floatpanel').findVisible('.mce-btn.mce-first').click();
  }

  cancel() {
    this.rootElement.findVisible('.mce-last.mce-btn').click();
  }

  clickFileButton() {
    this.rootElement.findVisible('.mce-i-browse').click();
  }

  private _getURLInput() {
    return this.rootElement.findVisible('.mce-first.mce-formitem').findVisible('.mce-textbox');
  }

  private _getTitleInput() {
    return this.rootElement.findVisible('.mce-last.mce-formitem').findVisible('.mce-textbox');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
