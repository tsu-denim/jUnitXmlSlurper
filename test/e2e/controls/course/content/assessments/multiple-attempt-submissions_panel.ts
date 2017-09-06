import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.multiple-attempt-grading').closest('.bb-offcanvas-panel.peek.active');
    }
  }

  getAttemptGradeBar(attemptIndex: number) {
    return new controls.GradingBar.Control(this.rootElement.findVisible('.multiple-attempts-list bb-grading-bar[attempt-index="' + attemptIndex + '"]'));
  }

  getFinalGradeGradePill() {
    var finalGradeBar = this.rootElement.findVisible('.aggregate-grading-bar');
    return new controls.GradeInputPill.Control(finalGradeBar);
  }

  getReadOnlyFinalGradeGradePill() {
    var finalGradeBar = this.rootElement.findVisible('.aggregate-grading-bar');
    return new controls.DisplayGradePill.Control(finalGradeBar);
  }

  /**
   * Open a specific attempt submission from the multiple attempt submissions panel
   *
   * @param attemptIndex 1-based attempt index referring to the attempt to open
   */
  openAttempt(attemptIndex: number) {
    var attemptGradeBar = this.getAttemptGradeRow(attemptIndex);
    attemptGradeBar.click();
    return new controls.SubmissionGrading.Control();
  }

  openAttemptAsViewer(attemptIndex: number) {
    this.getAttemptGradeRow(attemptIndex).click();
    return new controls.ViewerAssessmentAttemptReviewPanel.Control();
  }

  /**
   * Close the multiple attempt submissions panel
   *
   * We cannot return a control here because this panel can be opened from multiple places.
   */
  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  /**
   * Verify that there are as many attempts listed in the multiple attempts peek panel as there are specified in numAttempts.
   * If 0 is passed, this method verifies that no attempts are shown on the multiple attempt submissions panel.
   */
  assertAttemptsShown(numAttempts: number) {
    const ATTEMPT_GRADING_BAR_SELECTOR = '.multiple-attempts-list bb-grading-bar';

    if (numAttempts) {
      var gradingBarItems = this.rootElement.findVisibles(ATTEMPT_GRADING_BAR_SELECTOR);
      polledExpect(() => gradingBarItems.length).toEqual(numAttempts);
    } else {
      this.rootElement.assertElementDoesNotExist(ATTEMPT_GRADING_BAR_SELECTOR);
    }
    return this;
  }

  private getAttemptGradeRow(attemptIndex: number) {
    return this.rootElement.findVisible('.multiple-attempts-list bb-grading-bar[attempt-index="' + attemptIndex + '"]');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}