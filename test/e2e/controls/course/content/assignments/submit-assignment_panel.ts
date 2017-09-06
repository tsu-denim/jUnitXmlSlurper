import fs = require('fs');
import path = require('path');

import controls = require('../../../index');
import testUtil = require('../../../../test_util');

import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('#assignment-panel').closest('.side-panel-content');
    }
  }

  submitTextWithConfirmation(text: string) {
    this.addText(text)
      .clickSubmit();

    return new controls.ConfirmationNeeded.Control();
  }

  addText(text: string) {
    this.clickAddText();
    var editorElement = this.rootElement.findVisible('form[name="answerForm"] .text-editor');
    var editor = new controls.TinyEditor.Control(editorElement);
    editor.setFocusAndText(text);
    return this;
  }

  clickAddText() {
    this.rootElement.findVisible('[analytics-id="course.content.buildContentAreaStudents.addText"]')
      .scrollIntoView()
      .click();
    return this;
  }

  clickSaveDraft() {
    this.rootElement.findVisible('.js-save-draft-button').click().waitUntilRemoved();
    return this;
  }

  clickSubmit() {
    this.rootElement.findVisible('.js-send-draft-button').click();
    return new controls.ConfirmationNeeded.Control();
  }

  attachFile() {
    var input = this.rootElement.findElements('input.fileUploadInput')[2];
    input.sendKeys(__filename);
    return this;
  }

  assertAttachedFile() {
    this.rootElement.findVisible('.complete');
    return this;
  }

  getComments() {
    return new controls.Comments.Control(this.rootElement.findVisible('.comments'));
  }

  toggleAddFileMenu() {
    this.rootElement.findElement('.js-show-add-options').click();
    return this;
  }

  uploadFile(filePath: string) {
    var fileUploads = elementSync.findElements('input[type="file"]');
    fileUploads[0].sendKeys(filePath);
    this.rootElement.findVisible('.element-image');

    return this;
  }

  openGoalSettingPanel() {
    this.rootElement.findVisible('a[bb-peek-sref="content-goal-alignment-for-student"]').click();
    return new controls.goalAlignmentPage.Control();
  }

  openConversation() {
    this.rootElement.findVisible('button.open-conversation').click();
    return new controls.ContentConversation.Control();
  }

  hoverDiscussionAssignment() {
    var assignment = this.rootElement.findVisible('.discussion-assignment');
    browserSync.getBrowser().actions().mouseMove(assignment.getElementFinder().getWebElement()).perform();
    return this;
  }

  suppressAutoSave() {
    testUtil.suppressAutoSave();
    return this;
  }

  getGroupMemberNames() {
    return this.rootElement.findVisibles('.group-assignment-members .member-name').map((el) => {
      return el.getText();
    });
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
