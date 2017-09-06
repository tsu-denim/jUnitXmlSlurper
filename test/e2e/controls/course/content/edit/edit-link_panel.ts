import controls = require('../../../index');
import enums = require('../../../enums/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface ILink {
  title: string;
  url: string;
  description?: string;
  visibility?: enums.Visibility;
}

export class Control {
  rootElement: ElementFinderSync;
  editPanelControls: controls.EditContentPanel.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('form[name=contentLinkForm]').closest('.bb-offcanvas-panel.peek.active');
      this.editPanelControls = new controls.EditContentPanel.Control();
    }
  }

  enterEditMode() {
    this.editPanelControls.enterEditMode();
    return this;
  }

  setTitle(newTitle: string) {
    this.editPanelControls.setTitle(newTitle);
    return this;
  }

  assertTitle(title: string) {
    this.editPanelControls.assertTitle(title);
    return this;
  }

  setUrl(newUrl: string) {
    this.rootElement.findVisible('#panel-url').clear().sendKeys(newUrl);
    return this;
  }

  setDescription(newDescription: string) {
    this.editPanelControls.setDescription(newDescription);
    return this;
  }

  setOptions(link: ILink) {
    if (link.title) {
      this.setTitle(link.title);
    }

    if (link.description) {
      this.setDescription(link.description);
    }

    if (link.visibility) {
      switch (link.visibility) {
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

    //Setting the URL last works around an issue with auto-save
    //After entering the URL, an auto-save is kicked off, and if they enter something in the description before the server response
    //is received, it will get wiped out once the response to the auto-save call is received.
    if (link.url) {
      this.setUrl(link.url);
    }

    return this;
  }

  save() {
    this.editPanelControls.save();
  }

  cancel() {
    this.editPanelControls.cancel();
  }

  getVisibilitySelector() {
    return this.editPanelControls.getVisibilitySelector();
  }

  assertSavedToBrowser(count?: number) {
    this.editPanelControls.assertSavedToBrowser(count);
  }

  addGoals() {
    this.rootElement.findVisible('.js-add-goals').click();
    return new controls.goalPickerPage.Control();
  }

  viewGoals() {
    this.rootElement.findVisible('.js-view-goals').click();
    return new controls.goalAlignmentPage.Control();
  }

  getNumOfGoals() {
    return parseInt(this.rootElement.findVisible('.js-view-goals').getText().match(/\d+/)[0], 10);
  }
  
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}