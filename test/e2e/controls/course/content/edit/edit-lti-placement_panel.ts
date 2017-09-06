import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface ILtiPlacement {
  title?: string;
  description?: string;
  grading?: controls.EditLtiGradebookOptionsPanel.ILtiGradingOptions;
  allowConversation?: boolean;
}

export class Control {
  rootElement: ElementFinderSync;
  createGradebookEntry: controls.Checkbox.Control;

  editPanelControls: controls.EditContentPanel.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('form[name=contentPlacementForm]').closest('.bb-offcanvas-panel.peek.active');
      this.createGradebookEntry = new controls.Checkbox.Control(
        this.rootElement.findElement('input[name="create-gradebook-entry"]').closest('div'));

      this.editPanelControls = new controls.EditContentPanel.Control();
    }
  }

  setTitle(newTitle: string) {
    this.editPanelControls.enterEditMode();
    this.editPanelControls.setTitle(newTitle);
    return this;
  }

  setDescription(newDescription: string) {
    this.editPanelControls.setDescription(newDescription);
    return this;
  }

  setAllowConversations(allow: boolean) {
    this.editPanelControls.setAllowConversation(allow);
  }

  setOptions(placementOptions: ILtiPlacement) {
    if (placementOptions.title) {
      this.setTitle(placementOptions.title);
    }

    if (placementOptions.description) {
      this.setDescription(placementOptions.description);
    }

    if (placementOptions.allowConversation) {
      this.setAllowConversations(placementOptions.allowConversation);
    }

    if (placementOptions.grading) {
      // Don't create the gradebook controls until we need them since grading might not be enabled
      var editGradebookControls = new controls.EditLtiGradebookOptionsPanel.Control();
      editGradebookControls.setOptions(placementOptions.grading);
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
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}