import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.assessment-review-attempt-submission').closest('.bb-offcanvas-panel');
    }
  }

  close() {
    this.rootElement.findElement('.bb-close').scrollIntoView().click().waitUntilRemoved();
  }

  assertSubmitDateExists() {
    this._getGradingBar().assertSubmitDateExists();

    return this;
  }

  assertGradePillExists() {
    this._getGradingBar().assertGradePillExists();

    return this;
  }

  assertGradePillHidden() {
    this._getGradingBar().assertGradePillHidden();

    return this;
  }

  assertGrade(args: {score: string; pointsPossible: string}) {
    this._getGradingBar().assertGradeNonPrivileged(args);

    return this;
  }

  assertPendingGrade() {
    this._getGradingBar().assertPendingGrade();

    return this;
  }

  toggleComment() {
    this._getGradingBar().toggleComments();

    return this;
  }

  assertNoCommentToggle() {
    this._getGradingBar().assertNoCommentToggle();

    return this;
  }

  assertComment(comment: string) {
    this._getGradingBar().assertCommentNonPrivileged(comment);
    return this;
  }

  assertOverrideNotification(visible: boolean) {
    this._getGradingBar().assertOverrideNotification(visible);

    return this;
  }

  assertFreeformResponseTexts(texts: string[]) {
    this._getFreeformResponseBbmlEditor().assertTextBlocksAccurateAndReadOnlyForStudent(texts);

    return this;
  }

  assertFreeformReponseFiles(filenames: string[]) {
    this._getFreeformResponseBbmlEditor().assertFileTitles(filenames);

    return this;
  }

  private _getGradingBar() {
    return new controls.GradingBar.Control(this.rootElement);
  }

  private _getFreeformResponseBbmlEditor() {
    return new controls.BbmlEditor.Control(this.rootElement.findVisible('.freeform-response .js-bbml-editor'));
  }

  getRubricEvaluationPanel() {
    return new controls.RubricEvaluationPanel.Control();
  }

  /**
   * Get the control to the specified question
   * @param questionIndex zero-based index to questions on the assessment
   */
  getQuestion(questionIndex: number) {
    return new controls.ReviewAssessmentQuestion.Control(this.rootElement.findVisible(controls.ReviewAssessmentQuestion.Control.QUESTION_SELECTOR + questionIndex));
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}