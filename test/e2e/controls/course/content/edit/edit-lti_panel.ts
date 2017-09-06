import controls = require('../../../index');
import enums = require('../../../enums/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface ILti {
  visibility?: enums.Visibility;
  allowConversation?: boolean;
  customParams?: string;
  description?: string;
  key?: string;
  openCustomParamsFirst?: boolean;
  secret?: string;
  title?: string;
  url: string;
  grading?: controls.EditLtiGradebookOptionsPanel.ILtiGradingOptions;
}

export class Control {
  rootElement: ElementFinderSync;
  editPanelControls: controls.EditContentPanel.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('form[name=contentLtiForm]').closest('.bb-offcanvas-panel.peek.active');
      this.editPanelControls = new controls.EditContentPanel.Control();
    }
  }

  setTitle(newTitle: string) {
    this.editPanelControls.setTitle(newTitle);
    return this;
  }

  setUrl(newUrl: string) {
    this.rootElement.findVisible('#panel-url-lti').clear().sendKeys(newUrl);
    return this;
  }

  getKey() {
    return this.rootElement.findVisible('#security-key').getAttribute('value');
  }

  setKey(key: string) {
    this.rootElement.findVisible('#security-key').clear().sendKeys(key);
    return this;
  }

  getSecret() {
    return this.rootElement.findVisible('#secret').getAttribute('value');
  }

  setSecret(secret: string) {
    this.rootElement.findVisible('#secret').clear().sendKeys(secret);
    return this;
  }

  openCustomParameters() {
    this.rootElement.findVisible('.show-custom-parameters').click();
    return this;
  }

  getCustomParams() {
    return this.rootElement.findVisible('[name=customParameters]').getAttribute('value');
  }

  setCustomParams(params: string) {
    this.rootElement.findVisible('[name=customParameters]').clear().sendKeys(params);
    return this;
  }

  setDescription(newDescription: string) {
    this.editPanelControls.setDescription(newDescription);
    return this;
  }

  getDescription() {
    return this.editPanelControls.getDescription();
  }

  setAllowConversation(checked: boolean) {
    this.editPanelControls.setAllowConversation(checked);
    return this;
  }

  setOptions(link: ILti) {
    if (link.title) {
      this.setTitle(link.title);
    }

    if (link.description) {
      this.setDescription(link.description);
    }

    //Setting the URL last works around an issue with auto-save
    //After entering the URL, an auto-save is kicked off, and if they enter something in the description before the server response
    //is received, it will get wiped out once the response to the auto-save call is received.
    if (link.url) {
      this.setUrl(link.url);
    }

    if (link.key) {
      this.setKey(link.key);
    }

    if (link.secret) {
      this.setSecret(link.secret);
    }

    if (link.customParams) {
      if (link.openCustomParamsFirst) {
        this.openCustomParameters();
      }
      this.setCustomParams(link.customParams);
    }

    if (typeof(link.allowConversation) === 'boolean') {
      this.setAllowConversation(link.allowConversation);
    }

    if (link.grading) {
      // Don't create the gradebook controls until we need them since grading might not be enabled
      var editGradebookControls = new controls.EditLtiGradebookOptionsPanel.Control();
      editGradebookControls.setOptions(link.grading);
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
    return this;
  }

  save() {
    // We need to wait for the save button to be enabled since we may still be waiting on an async call to report that the url is valid
    waitFor(() => {
      return this.rootElement.findVisible('.js-save').isEnabled();
    });
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