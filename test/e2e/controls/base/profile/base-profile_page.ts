import controls = require('../../index');
import testUtil = require('../../../test_util');
import {browserSync, ElementFinderSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.base-profile');
    }
  }

  openChangeAvatarPanel() {
    let avatarContainer = this.rootElement.findVisible('.avatar-container');
    browserSync.getBrowser().actions().mouseMove(avatarContainer.getElementFinder().getWebElement()).perform();

    this.rootElement.findVisible('.avatar-change').click();
    return new controls.ChangeAvatarPanel.Control();
  }

  openChangePasswordPanel() {
    this.rootElement.findVisible('[analytics-id="base.profile.password.change"]').click();
    return new controls.ChangePasswordPanel.Control();
  }

  openChangeLanguagePanel() {
    this.rootElement.findVisible('[analytics-id="base.profile.language.title"').closest('li').click();
    return new controls.ChangeLanguagePanel.Control();
  }

  openChangePrivacyPanel() {
    this.rootElement.findVisible('[analytics-id="base.profile.privacySettings.title"]').closest('li').click();
    return new controls.ChangePrivacyPanel.Control();
  }

  openEditContactInfoPanel() {
    this.rootElement.findElement('.js-edit-full-name').click();
    return new controls.EditContactInfoPanel.Control();
  }

  assertNameInHeader(givenName: string, familyName: string) {
    var fullName = givenName + ' ' + familyName;
    polledExpect(() => this.rootElement.findVisible('.account-snapshot .username').getText()).toBe(fullName);

    return this;
  }

  assertDefaultInitialsAvatar(givenName: string, familyName: string) {
    var initials = givenName[0].toUpperCase() + familyName[0].toLowerCase();
    polledExpect(() => this.rootElement.findVisible('.avatar-container .initials').getText()).toBe(initials);

    return this;
  }

  assertNoCustomAvatarImage() {
    this.rootElement.assertElementDoesNotExist('.avatar-container .image-avatar');

    return this;
  }

  assertCustomAvatarImage() {
    this.rootElement.findElement('.avatar-container .image-avatar');

    return this;
  }

  assertCustomAvatarImageFilename(fileName: string) {
    polledExpect(() => {
      return this.rootElement.findElement('.avatar-container .image-avatar img').getAttribute('src').indexOf(fileName) >= 0;
    }).toBe(true);

    return this;
  }

  assertNonDefaultLanguageSelected() {
    this.rootElement.assertElementDoesNotExist('.system-default-language');
    return this;
  }

  assertDefaultLanguageSelected() {
    this.rootElement.findVisible('.system-default-language');
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}