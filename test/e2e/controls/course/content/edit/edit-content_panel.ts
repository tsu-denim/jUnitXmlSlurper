import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  public rootElement: ElementFinderSync;
  private titleEditor: controls.PanelTitleTextEditor.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.content-base').closest('.bb-offcanvas-panel');
      this.titleEditor = new controls.PanelTitleTextEditor.Control(this.rootElement.findVisible('.panel-title-texteditor'));
    }
  }

  clickTitle() {
    this.titleEditor.click();
    return this;
  }

  enterEditMode() {
    this.titleEditor.enterEditMode();
    return this;
  }

  setTitle(newTitle: string) {
    this.titleEditor.setTitle(newTitle);
    return this;
  }

  editAndSetTitle(newTitle: string) {
    this.titleEditor.editAndSetTitle(newTitle);
    return this;
  }

  getPanelTitleInput() {
    return this.titleEditor.getPanelTitleInput();
  }

  assertTitle(title: string) {
    this.titleEditor.assertTitle(title);
    return this;
  }

  /**
   * Send a character, then delete it.  Used to make sure cursor is visible in screenshots.
   */
  vr_showCaretInTitle() {
    this.titleEditor.vr_showCaretInTitle();
    return this;
  }

  setDescription(newDescription: string) {
    this.rootElement.findVisible('#panel-description').clear().sendKeys(newDescription);
    return this;
  }

  getDescription() {
    return this.rootElement.findVisible('#panel-description').getAttribute('value');
  }
  
  setAllowConversation(checked: boolean) {
    var checkElement = new controls.Checkbox.Control(this.rootElement.findVisible('.allow-class-conversations'));
    checked ? checkElement.setToChecked() : checkElement.setToUnchecked();
    return this;
  }

  save() {
    this.rootElement.findVisible('.js-save').click();

    this.rootElement.waitUntilRemoved();
  }

  cancel() {
    this.rootElement.findVisible('.js-cancel').click();

    this.rootElement.waitUntilRemoved();
  }

  getVisibilitySelector() {
    return new controls.VisibilitySelector.Control(this.rootElement.findVisible('.item-selector-container'));
  }

  assertSavedToBrowser(count?: number) {
    if (count != null) {
      this.rootElement.findVisible('.save-buttons').waitUntil('[saved-to-browser=' + count + ']');
    } else {
      this.rootElement.findVisible('.save-buttons').waitUntil('[saved-to-browser]');
    }
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}