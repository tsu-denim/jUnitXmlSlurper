import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.assessment-overview').closest('.bb-offcanvas-panel');
    }
  }

  close() {
    this.rootElement.findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  startAttempt(isMultipleAttempts?: boolean, isTimeLimit?: boolean) {
    var id = 'course.content.assessment.overview.startAttempt';
    id += (isMultipleAttempts) ? '.multiple' : '';
    var attemptButton =  this.rootElement.findVisible('.button-attempt');
    attemptButton.findVisible('[analytics-id="' + id + '"]').click();

    if (isTimeLimit) {
      new controls.ConfirmationNeeded.Control()
        .assertTimeLimitInfo('Start the Timer?')
        .ok();
      attemptButton.waitUntilRemoved();
    }

    return new controls.ViewerAssessmentAttemptPanel.Control();
  }

  continueAttempt(isMultipleAttempts?: boolean) {
    var id = 'course.content.assessment.overview.continueAttempt';
    id += (isMultipleAttempts) ? '.multiple' : '';
    var attemptButton =  this.rootElement.findVisible('.button-attempt');
    attemptButton.findVisible('[analytics-id="' + id + '"]').click();

    return new controls.ViewerAssessmentAttemptPanel.Control();
  }
  
  getGradePill() {
    return new controls.DisplayGradePill.Control(this._getSubmissionCard());
  }

  openAttemptSubmission() {
    this._getSubmissionCard().click();

    return new controls.ViewerAssessmentAttemptReviewPanel.Control();
  }

  openAttemptSubmissionWithRubric() {
    this._getSubmissionCard().findVisible('bb-display-grade-pill a').click();

    return new controls.ViewerAssessmentAttemptReviewPanel.Control();
  }

  openSubmissions() {
    this._getSubmissionCard().click();

    return new controls.MultipleAttemptSubmissionsPanel.Control();
  }

  openRubricView() {
    this.rootElement.findVisible('.js-rubric-view button').click();

    return this;
  }

  getRubricView() {
    return new controls.RubricViewPanel.Control();
  }

  closeRubricView() {
    this.rootElement.findVisible('.rubric-evaluation-subpanel').findVisible('.panel-section-header button').click();

    return this;
  }

  openRubricSubmissionByLink() {
    this.rootElement.findVisible('.js-rubric-evaluation a').click();

    return new controls.ViewerAssessmentAttemptReviewPanel.Control();
  }

  assertTitle(title: string) {
    polledExpect(() =>
      this.rootElement.findVisible('h1.panel-title.student').getInnerHtml().trim()
    ).toEqual(title);
    return this;
  }

  assertNoLateIndicator() {
    this.rootElement.assertElementDoesNotExist('#start-attempt-footer .late-button-super-text');
    return this;
  }

  assertLateIndicator() {
    this.rootElement.findVisible('p[analytics-id="course.content.assessment.overview.markedLateNotice"]');
    return this;
  }

  assertStartAttemptButton(isMultipleAttempts?: boolean) {
    var id = 'course.content.assessment.overview.startAttempt';
    id += (isMultipleAttempts) ? '.multiple' : '';
    var attemptButton =  this.rootElement.findVisible('.button-attempt');
    attemptButton.findVisible('[analytics-id="' + id + '"]');
    
    return this;
  }

  assertStartAttemptFooterDoesNotExist() {
    this.rootElement.assertElementDoesNotExist('#start-attempt-footer');
    return this;
  }

  assertSubmissionCard() {
    this._getSubmissionCard();
    return this;
  }

  assertContinueAttemptNumber(attemptNumber: number) {
    var buttonText = this.rootElement.findVisible('[analytics-id="course.content.assessment.overview.continueAttempt.multiple"]').getInnerHtml();
    var parsedAttemptNum = parseInt(buttonText.substring(buttonText.search('[0-9]'), buttonText.length), 10);
    polledExpect(() => parsedAttemptNum).toEqual(attemptNumber);
    return this;
  }

  assertAttemptLeft(count: number) {
    polledExpect(() =>
      parseInt(this.rootElement
        .findVisible('[analytics-id="course.content.assessment.overview.attemptsRemaining.plural"] bdi').getInnerHtml(), 10)
    ).toEqual(count);
    return this;
  }

  assertCommentIcon() {
    this._getSubmissionCard().findVisible('.comment-posted-img');
    return this;
  }

  private _getSubmissionCard() {
    return this.rootElement.findVisible('.submission-card');
  }

  assertDetailsAndInformation() {
    this.rootElement.findVisible('h2[analytics-id="course.content.assessment.overview.detailsHeader"]');
    return this;
  }

  assertDueDate() {
    this.rootElement.findVisible('span[analytics-id="course.content.assessment.overview.dueDate"]');
    return this;
  }

  assertHighestPossibleScore() {
    this.rootElement.findVisible('span[analytics-id="course.content.assessment.overview.highestPossible"]');
    return this;
  }

  assertStartedDateTime() {
    this.rootElement.findVisible('span[analytics-id="course.content.assessment.overview.startedAt"]');
    return this;
  }

  assertSubmittedScoreCard() {
    this.rootElement.findVisible('.js-attempt-submitted');
    return this;
  }

  assertPostedScoreCard() {
    this.rootElement.findVisible('.js-attempt-posted');
    return this;
  }

  assertRubric() {
    this.rootElement.findVisible('.js-rubric-view');
    return this;
  }

  assertRubricViewShown() {
    this.rootElement.findVisible('.rubric-evaluation-subpanel');
    return this;
  }

  assertGradeNoLateIndicator() {
    this.rootElement.assertElementDoesNotExist('.submission-card .card-text .late-submission');
    this.rootElement.assertElementDoesNotExist('.submission-card .img-icon-test .img-icon-test-a');
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-element-overlay').click();
    return this;
  }

  openClassConversationPanel() {
    this.rootElement.findVisible('.open-conversation').click();
    return new controls.ClassConversationPanel.Control();
  }

  viewGoals() {
    this.rootElement.findVisible('.js-view-goals').click();
    return new controls.goalAlignmentPage.Control();
  }

  getNumOfGoals() {
    return parseInt(this.rootElement.findVisible('.js-view-goals').getText().match(/\d+/)[0], 10);
  }

  assertNumberOfGroupMembers(number: number) {
    polledExpect(() => this.rootElement.findVisible('.group-assessment-members .peek-title-h2').getText()).toContain(number);
    polledExpect(() => this.rootElement.findVisibles('.group-assessment-members .member[ng-repeat]').length).toBe(number);
    return this;
  }

  assertGroupMembers(members: any[]) {
    members.forEach(member => this.rootElement.findVisible(`.js-member-${member.id}`));
    return this;
  }

  assertPendingIndicator() {
    this.rootElement.findVisible('.card-grade .na.pending');
  }
}

class Small extends Control {
  closeRubricView() {
    this.rootElement.findVisible('.js-rubric-small-header button').click();

    return this;
  }
}

class Medium extends Control {

}

class Large extends Control {

}