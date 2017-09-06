import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.student-submission-wrapper');
    }
  }

  clearFTUE() {
    this.rootElement.findVisible('#more-options-guidance-moment').click();

    return this;
  }

  clickAttachmentDownload(fileName: string) {
    this.rootElement.findVisibles('.file-container .progress-status');
    var fileNames = this.rootElement.findVisibles('.file-container .progress-status').map((el) => {
      return el.getText();
    });
    var fileContainer  = this.rootElement.findVisibles('.file-container')[fileNames.indexOf(fileName)];
    fileContainer.findVisible('.overflow-menu-button').click();
    fileContainer.findVisible('[analytics-id="components.directives.attempt-file-viewer.aria.downloadFile"]').click();
    return this;
  }

  enterGrade(args: { attemptId: string; value: string; }) {
    var input = this._findGradeInput(args.attemptId);

    input.click().clear().sendKeys(args.value);
    input.sendKeys(Key.TAB);

    return this;
  }

  postGrade(attemptId: string) {
    var submissionDetails = this._findSubmissionDetails(attemptId);

    submissionDetails.findVisible('.grading-submission-panel').findVisible('.overflow-menu-button').click();
    submissionDetails.findVisible('[analytics-id="components.directives.grade.grade-and-feedback.actions.post"]').click();

    new controls.OverflowMenuDeleteConfirmation.Control().post();

    return this;
  }

  enterFeedback(args: { attemptId: string; value: string; }) {
    var submissionDetails = this._findSubmissionDetails(args.attemptId);

    var commentControl = submissionDetails.findVisible('.comment-control');
    commentControl.findVisible('.js-comment-toggle').click();

    var commentInput = commentControl.findVisible('.js-comment-input');
    commentInput.click().clear().sendKeys(args.value);
    commentControl.findVisible('.save-button').click();

    return this;
  }

  getFeedback(attemptId: string) {
    var submissionDetails = this._findSubmissionDetails(attemptId);
    return submissionDetails.findVisible('.message').getText();
  }

  openRubricEvaluationPanel() {
    this.rootElement.findVisible('bb-grade-input a.has-rubric').click();
    return new controls.RubricEvaluationPanel.Control();
  }

  assertGradePillHasRubric() {
    this.rootElement.findVisible('bb-grade-input a.has-rubric');
    return this;
  }

  assertSubmissionNavigationDisabled() {
    this.rootElement.findVisibles('.slick-arrow').forEach((arrow: ElementFinderSync) => {
      polledExpect(() => {
        return arrow.hasClass('slick-disabled');
      }).toBe(true);
    });
  }

  assertSubmissionGrade(value: string) {
    polledExpect(() => this.rootElement.findVisible('.grade-point-value').getText().trim()).toBe(value);
    return this;
  }

  assertRubricEvaluationPanelClosed() {
    elementSync.assertElementDoesNotExist('.rubric-evaluation-panel');
    return this;
  }
  assertAttemptStatusCompleted(attemptId: string) {
    var submissionDetails = this._findSubmissionDetails(attemptId);

    var gradingPanel = submissionDetails.findVisible('.grading-submission-panel');
    gradingPanel.waitUntil('.grade-posted');
    gradingPanel.findVisible('.grade-sent-symbol');

    return this;
  }

  private _findSubmissionDetails(attemptId: string) {
    return this.rootElement.findVisible('.js-submission-details-' + attemptId);
  }

  private _findGradeInput(attemptId: string) {
    var submissionDetails = this._findSubmissionDetails(attemptId);
    return submissionDetails.findVisible('[name^="grade_"]');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}