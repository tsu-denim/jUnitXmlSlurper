import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  private gradingBarControl: controls.GradingBar.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.uit-submission-grading-wrapper');
      this.rootElement.findElement('.student-submission-content-wrapper').waitUntil('[ready=true]');
      this.gradingBarControl = new controls.GradingBar.Control(this.rootElement.findVisible('.grading-bar-wrapper'));
    }
  }

  clearFTUE() {
    this.rootElement.findVisible('#more-options-guidance-moment').click();

    return this;
  }

  getAttemptCanvas() {
    return this.rootElement.findVisible('bb-attempt-canvas');
  }

  clickDelete() {
    this.openMenu();
    this.rootElement.findVisibles('.js-menu-item-link')[1].click();
    return this;
  }

  getModal() {
    return new controls.OverflowMenuDeleteConfirmation.Control();
  }

  toggleComments() {
    this.gradingBarControl.toggleComments();

    return this;
  }

  enterEditMode() {
    this.gradingBarControl.enableEditing();
    return this;
  }

  addComment(comment: string) {
    this.gradingBarControl.addComment(comment);

    return this;
  }

  saveComment() {
    this.gradingBarControl.saveComment();

    return this;
  }

  cancelComment() {
    this.gradingBarControl.cancelComment();

    return this;
  }

  assertSavedComment(comment: string) {
    this.gradingBarControl.assertCommentPrivileged(comment);

    return this;
  }

  assertSavedInEditComment(comment: string) {
    this.gradingBarControl.assertCommentEditMode(comment);
    return this;
  }

  assertCommentIcon() {
    this.gradingBarControl.assertCommentIcon();
    return this;
  }

  assertSubmitDateExists() {
    this.gradingBarControl.assertSubmitDateExists();

    return this;
  }

  assertSubmissionGrade(arg: {value: string, color?: string}) {
    this.gradingBarControl.assertGradePrivileged(arg);

    return this;
  }

  assertQuestionTitleExists() {
    polledExpect(() =>
      this.getAttemptCanvas().findVisible('.question-label').getInnerHtml()
    ).toEqual('Question 1');

    return this;
  }

  assertQuestionTextExists() {
    polledExpect(() =>
      this.getAttemptCanvas().findVisible('.question-content')
    ).toBeTruthy();

    return this;
  }

  assertQuestionAnswerExists() {
    polledExpect(() =>
      this.getAttemptCanvas().findVisible('.answer-panel-heading')
    ).toBeTruthy();

    return this;
  }

  assertAttemptDeleted() {
    polledExpect(() =>
      this.rootElement.findVisible('.js-grading-attempt-deleted')
    ).toBeTruthy();

  }

  enterQuestionGrade(args: {input?: ElementFinderSync, index: number, value: number, skipPolledExpect?: boolean}) {
    let input = args.input ? args.input : this.getQuestionGradeInput(args.index);
    let wrapper = input.closest('.wrapping-input-style');

    input.click();
    wrapper.waitUntil('.wrapping-input-style-focus');

    input.clear().sendKeys(args.value.toString());

    // click on something innocuous (the question label) to remove focus from the grade pill and save the grade
    this.rootElement.findVisibles('.question-label')[args.index].click();

    if (!args.skipPolledExpect) {
      // make sure focus has left the grade pill and the value is what we expect
      polledExpect(() => wrapper.hasClass('wrapping-input-style-focus')).toBeFalsy();
      polledExpect(() => input.getAttribute('value')).toBe(args.value.toString());
    }

    return this;
  }

  clearQuestionGrade(index: number) {
    var input = this.getQuestionGradeInput(index);
    input.click().clear();
    this.rootElement.click();  //clicks off the grade pill to save the grade

    return this;
  }

  assertQuestionGrade(args: { index: number; color: string; }) {
    polledExpect(() =>
        this.getQuestionGradeInput(args.index).closest('.wrapping-input-style').hasClass(args.color)
    ).toBeTruthy();

    return this;
  }

  assertQuestionUngraded(index: number) {
    polledExpect(() =>
      this.getQuestionGradeInput(index).getAttribute('placeholder')).toBe('--');
    return this;
  }

  assertGradePillColorRemoved(args: { index: number; color: string; }) {
    polledExpect(() =>
        this.getQuestionGradeInput(args.index).closest('.wrapping-input-style').hasClass(args.color)
    ).toBeFalsy();

    return this;
  }

  getQuestionGradeInput(index: number) {
    var inputElements = this.getAttemptCanvas().findVisibles('.uit-question-grade-input');
    return (inputElements.length < index ) ? inputElements[0] : inputElements[index];
  }

  postSubmissionGrade() {
    this.openMenu();
    this.rootElement.findVisibles('.js-menu-item-link')[0].click();
    this.rootElement.findVisible('.js-delete-confirm').click();

    return this;
  }

  assertGradePosted() {
    polledExpect(() =>
      this.rootElement.findVisible('.js-posted-indicator')
    ).toBeTruthy();

    return this;
  }

  openMenu() {
    this.rootElement.findVisible('.attempt-grading-bar .overflow-menu-button').click();

    return this;
  }

  closeMenu() {
    return this.openMenu();
  }

  enterSubmissionGrade(value: string) {
    this.gradingBarControl.enterGrade(value);
    return this;
  }

  undoOverride() {
    this.gradingBarControl.undoOverride();
    return this;
  }

  assertUndoOverrideLink(arg: {visible: boolean}) {
    this.gradingBarControl.assertUndoOverrideLink(arg);
    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
    return new controls.ContentSubmissions.Control();
  }

  openRubricEvalPanel() {
    this.rootElement.findElement('a.has-rubric').click();
    return new controls.RubricEvaluationPanel.Control();
  }

  openNextSubmission() {
    this.rootElement.findElement('.names-slide .last').click();
    return new controls.SubmissionGrading.Control();
  }

  /**
   * Get the control to the specified question
   * @param questionIndex zero-based index to questions on the assessment
   */
  getQuestion(questionIndex: number) {
    return new controls.ReviewAssessmentQuestion.Control(this.rootElement.findVisible(controls.ReviewAssessmentQuestion.Control.QUESTION_SELECTOR + questionIndex));
  }

  toggleGroupMembers() {
    this.rootElement.findVisible('.group-member-dropdown').click();
    return this;
  }

  assertGroupMembers(users: any[]) {
    users.forEach(user => this.rootElement.findVisible(`.js-user-${user.id}`));
    return this;
  }

  assertSubmitted(user: any) {
    polledExpect(() => this.rootElement.findVisible(`.js-user-${user.id} .sub-text`).getText()).toContain('Submitted');
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}