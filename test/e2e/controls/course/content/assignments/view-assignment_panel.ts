import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

var SUBMISSIONS_SELECTOR = 'span[analytics-id="course.grades.gradebook-item.menu.submissions.plural"]';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.assignment-details').closest('.side-panel-content');
    }
  }

  startSubmission() {
    this.rootElement.findVisible('#start-first-attempt').click();
    return new controls.SubmitAssignment.Control();
  }

  viewGradedSubmission() {
    this.rootElement.findVisible('#start-first-attempt[analytics-id="course.content.assignmentViewGradedSubmission"]').click();
    this.rootElement.findVisible('#assignment-panel');
    return this;
  }

  getSubmissionCards() {
    return this.rootElement.findVisibles('.submissions .submission-card').map((el) => {
      return new controls.SubmissionCard.Control(el);
    });
  }

  getGrade() {
    return new controls.DisplayGrade.Control(this.rootElement.findVisible('.submissions .submission-card'));
  }

  getGroupMemberNames() {
    return this.rootElement.findVisibles('.member-container .member-name').map((el) => {
      return el.getText();
    });
  }

  assertAssignmentIsReadonly() {
    this.rootElement.assertElementDoesNotExist('button.js-edit-attempt');
  }

  openSubmissions() {
    this.rootElement.findVisible(SUBMISSIONS_SELECTOR).closest('a').click();
    return this;
  }

  clearSubmissionsFTUE() {
    this.rootElement.findVisible(SUBMISSIONS_SELECTOR).closest('div.panel-content-slide-toggle').click();
    return this;
  }

  openSubmission(name: string) {
    this.rootElement.findVisible(By.partialLinkText(name)).click();
  }

  openSettingsPanel() {
    this.rootElement.findVisible('.assessment-settings-button').click();
    return new controls.EditAssessmentSettingsPanel.Control();
  }

  openOverflowMenu(index: number) {
    this.rootElement.findVisibles('.file-container')[index].findVisible('.overflow-menu-button').click();
    return this;
  }

  getFilePositionFromAttachmentList(fileName: string): number {
    var attachments = this.rootElement.findElements('.file-name');
    return attachments.map((attachment) => attachment.getText()).indexOf(fileName);
  }

  openAttachmentFileMenu() {
    browserSync.getBrowser().actions().mouseMove(this.rootElement.findVisible('.right-off-canvas-overlay-toggle').getElementFinder().getWebElement()).perform();
    this.rootElement.findVisible('.right-off-canvas-overlay-toggle').click();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
