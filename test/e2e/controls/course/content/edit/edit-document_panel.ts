import controls = require('../../../index');
import enums = require('../../../enums/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface IDocument {
  title: string;
  visibility?: enums.Visibility;
}

export class Control {
  rootElement: ElementFinderSync;
  editPanelControls: controls.EditContentPanel.Control;
  bbmlEditor: controls.BbmlEditor.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      polledExpect(() => {
        // Occasionally the rootElement ends up being undefined, maybe b/c the bb-offcanvas-panel is not marked as active quickly enough?
        // Maybe due to a fluke on my local machine? Anyway, we can poll here to ensure that rootElement gets set
        this.rootElement = rootElement || elementSync.findVisible('ng-form[name=contentDocumentForm]').closest('.bb-offcanvas-panel.full.active');
        return this.rootElement;
      }).not.toBeUndefined();
      this.editPanelControls = new controls.EditContentPanel.Control();
      this.bbmlEditor = new controls.BbmlEditor.Control(this.rootElement.findVisible('.js-bbml-editor'));
    }
  }

  /**
   * Set the title of this document object
   */
  setTitle(newTitle: string) {
    this.editPanelControls.setTitle(newTitle);
    return this;
  }

  assertTitle(title: string) {
    this.editPanelControls.assertTitle(title);
    return this;
  }

  setOptions(document: IDocument) {
    if (document.title) {
      this.setTitle(document.title);
    }
    if (document.visibility) {
      switch (document.visibility) {
        case enums.Visibility.Hidden:
          this.editPanelControls.getVisibilitySelector().setHidden();
          break;
        case enums.Visibility.Restricted:
          this.editPanelControls.getVisibilitySelector().setRestricted();
          break;
        case enums.Visibility.Visible:
          this.editPanelControls.getVisibilitySelector().setVisible();
          break;
      }
    }
    return this;
  }

  //This method was created because when we are adding a document, the settings button starts as disabled.
  //It becomes enabled when you change something.  In this case, that something is tapping on the settings button (to enable it).
  //Therefore, here we verify
  //a) we initially see a disabled settings button
  //b) we tap on it again to enable it, and verify it was enabled.
  //c) we can then later on string the .openSettingsPanel() to actually open the settings panel
  enableSettingsButton() {
    var settingsLocator = 'bb-panel-header ul.header-actions-menu li.settings .button';
    polledExpect(() => this.rootElement.findVisible(settingsLocator).hasClass('disabled')).toBe(true);
    this.rootElement.findElement(settingsLocator).click();
    polledExpect(() => this.rootElement.findVisible(settingsLocator).hasClass('disabled')).toBe(false);
    return this;
  }

  // Open the assessment settings peek panel
  //Assumes that the Settings Button is enabled.  If it is not, you can call .enableSettingsButton() above beforehand
  openSettingsPanel() {
    polledExpect(() => this.rootElement.findVisible('.assessment-settings-button').isEnabled()).toBe(true);
    this.rootElement.findVisible('.assessment-settings-button').click();
    return this.getSettingsPanel();
  }

  private getSettingsPanel() {
    return new controls.EditDocumentSettingsPanel.Control();
  }

  getVisibilitySelector() {
    return this.editPanelControls.getVisibilitySelector();
  }

  setVisible() {
    this.getVisibilitySelector().setVisible();
    return this;
  }

  //Setting a Document item as restricted automatically puts the user in the Settings Panel, so we return that control
  setRestricted() {
    this.getVisibilitySelector().setRestricted();
    return new controls.EditDocumentSettingsPanel.Control();
  }

  assertNoConversationToggle() {
    this.rootElement.assertElementDoesNotExist('.allow-class-conversations');
    return this;
  }

  assertNoPropertiesIcon() {
    this.rootElement.assertElementDoesNotExist('[id=documentSettingsButton]');
    return this;
  }

  autoSave(args?: {noFocusOut?: boolean}) {
    var noFocusOut = args && args.noFocusOut;
    if (!noFocusOut) {
      this.rootElement.findVisible('.content-base').click();
    }
    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  getConversationButton() {
    return this.rootElement.findVisible('.button.open-conversation');
  }

  clickConversationButton() {
    this.getConversationButton().click();
    return new controls.ClassConversationPanel.Control();
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-wrapper .guidance-container').click();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
