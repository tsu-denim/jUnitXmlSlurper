import controls = require('../../../index');
import enums = require('../../../enums/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface IFolder {
  title: string;
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
      this.rootElement = rootElement || elementSync.findVisible('form[name=contentFolderForm]').closest('.bb-offcanvas-panel.peek.active');
      this.editPanelControls = new controls.EditContentPanel.Control();
    }
  }

  /**
   * Set the title of this folder object
   */
  setTitle(newTitle: string) {
    this.editPanelControls.setTitle(newTitle);
    return this;
  }

  assertTitle(title: string) {
    this.editPanelControls.assertTitle(title);
    return this;
  }

  setOptions(folder: IFolder) {
    if (folder.title) {
      this.setTitle(folder.title);
    }

    if (folder.visibility) {
      switch (folder.visibility) {
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

    if (folder.description) {
      this.editPanelControls.setDescription(folder.description);
    }

    return this;
  }

  getVisibilitySelector() {
    return this.editPanelControls.getVisibilitySelector();
  }

  save() {
    this.editPanelControls.save();

    // NOTE: return statement is intentionally omitted here unless we determine it is needed
  }

  cancel() {
    this.editPanelControls.cancel();

    // NOTE: return statement is intentionally omitted here unless we determine it is needed
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
