import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#profile-update-avatar');
    }
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();

    return new controls.BaseProfilePage.Control();
  }

  uploadAvatar() {
    var avatarPath = testUtil.pathFromUltraUIRoot('test/dev_resources/avatars/avatar.png');
    this.rootElement.assertElementDoesNotExist('.image-avatar');
    this.rootElement.findElement('.fileUploadInput').sendKeys(avatarPath);
    waitFor(() => this.rootElement.findElement('.image-avatar').isDisplayed());

    return this;
  }

  removeAvatar() {
    this.rootElement.findVisible('.js-remove-avatar').click();
    new controls.ConfirmationNeeded.Control().ok();

    this.rootElement.findVisible('.initials');
    polledExpect(() => this.rootElement.findElement('.js-remove-avatar').isDisplayed()).toBe(false);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}