import controls = require('../../../index');
import enums = require('../../../enums/index');
import testUtil = require('../../../../test_util');
import {CanvasQuestionPopulationStatus} from '../assessments/question/edit-assessment-questions';
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface IAssessment {
  title: string;
  visible?: enums.Visibility;
}

export class Control {
  rootElement: ElementFinderSync;
  editPanelControls: controls.EditContentPanel.Control;
  editQuestionsControl: controls.EditAssessmentQuestions.Control;

  static RANDOMIZATION_NOTIFICATION_SELECTOR = '.js-randomization-notification';

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('form[name=assessmentContentForm]').closest('.bb-offcanvas-panel.full.active');
      this.editPanelControls = new controls.EditContentPanel.Control();
      this.editQuestionsControl = new controls.EditAssessmentQuestions.Control(this.rootElement);
    }
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-element-overlay').click();
    return this;
  }

  setTitle(newTitle: string) {
    this.editPanelControls.setTitle(newTitle);
    return this;
  }

  editAndSetTitle(newTitle: string) {
    this.editPanelControls.editAndSetTitle(newTitle);
    return this;
  }

  setOptions(assessment: IAssessment) {
    if (assessment.title) {
      this.setTitle(assessment.title);
    }

    if (assessment.visible) {
      this.setVisibility(assessment.visible);
    }

    return this;
  }

  /** Add a text to the assessment canvas (presentation-only question of text) */
  addTextToCanvas(args: {
    currentCanvasStatus?: CanvasQuestionPopulationStatus,
    hasAlert?: boolean,
    text: string
  }) {
    switch (args.currentCanvasStatus) {
      case CanvasQuestionPopulationStatus.HasQuestions:
        this.openTextEditorOnNonEmptyCanvas(args.hasAlert);
        break;
      default:
        this.openTextEditorOnEmptyCanvas(args.hasAlert);
    }

    this.editQuestionsControl.populateTextPresentationQuestion(args.text);
    return this;
  }

  /** Add a file to the assessment canvas (presentation-only question of file) */
  addFileToCanvas(args: {
    currentCanvasStatus?: CanvasQuestionPopulationStatus,
    file: string,
    expectedQuestionNumber: number
  }) {
    if (args.currentCanvasStatus === CanvasQuestionPopulationStatus.HasQuestions) {
      this.editQuestionsControl.openAddMenu();
    }
    this.rootElement.findVisible('.js-add-file').click().waitUntil(':hidden');

    this.scrollToEndOfCanvas();

    // it looks like there can be tiny delay until question template is inserted in case of add file case but getQuestion has no wait
    // do polledExpect to add small amount of delay and make sure question template is added
    polledExpect(() => this.editQuestionsControl.rootElement.findElement('.question-list').getAttribute('data-question-count')).toBe((args.expectedQuestionNumber).toString());

    this.getQuestion(args.expectedQuestionNumber)
      .bbmlEditor
      .setDoesNotHaveFileDropBlock()
      .uploadFileToEmptyEditor(args.file);
    return this;
  }

  addEssayQuestionToCanvas(args?: {
    currentCanvasStatus?: CanvasQuestionPopulationStatus,
    questionText?: string,
    file?: string,
    points?: string
  }) {
    this.editQuestionsControl.addQuestionToCanvas(controls.EditAssessmentQuestions.QuestionType.Essay, args.currentCanvasStatus);
    // scroll in case the question is at the bottom and not in view (since after add-question, canvas is scrolled to the top) and thus not loaded
    this.scrollToEndOfCanvas();
    this.editQuestionsControl.populateEssayQuestion(args);
    return this;
  }

  addMultipleChoiceQuestionToCanvas(args?: {
    currentCanvasStatus?: CanvasQuestionPopulationStatus,
    questionText?: string;
    points?: string;
    answerChoices?: string[],
    correctAnswers?: number[]
  }) {
    this.editQuestionsControl.addQuestionToCanvas(controls.EditAssessmentQuestions.QuestionType.MultipleChoice, args.currentCanvasStatus);
    // scroll in case the question is at the bottom and not in view (since after add-question, canvas is scrolled to the top) and thus not loaded
    this.scrollToEndOfCanvas();
    this.editQuestionsControl.populateMultipleChoiceQuestion(args);
    return this;
  }

  addTrueFalseQuestionToCanvas(args?: {
    currentCanvasStatus?: CanvasQuestionPopulationStatus,
    questionText?: string,
    points?: string,
    correctAnswer?: boolean
  }) {
    this.editQuestionsControl.addQuestionToCanvas(controls.EditAssessmentQuestions.QuestionType.TrueFalse, args.currentCanvasStatus);
    // scroll in case the question is at the bottom and not in view (since after add-question, canvas is scrolled to the top) and thus not loaded
    this.scrollToEndOfCanvas();
    this.editQuestionsControl.populateTrueFalseQuestion(args);
    return this;
  }

  openTextEditorOnEmptyCanvas(hasAlert?: boolean) {
    this.rootElement.findVisible('.js-add-text').click();

    if (hasAlert) {
      // click ok in the alert modal
      this._confirmAlert();
    }

    return new controls.TinyEditor.Control(this.rootElement.findVisible('.text-editor'));
  }

  openTextEditorOnNonEmptyCanvas(hasAlert?: boolean) {
    this.editQuestionsControl.openAddMenu();
    return this.openTextEditorOnEmptyCanvas(hasAlert);
  }

  private _confirmAlert() {
    var modal = elementSync.findVisible('#assessment-alert-modal');
    modal.findVisible('.confirm-ok').click();
  }

  saveTextEditor() {
    polledExpect(() => this.rootElement.findVisible('button[analytics-id="components.directives.assessment-question.save"]').isEnabled()).toBe(true);
    this.rootElement.findVisible('button[analytics-id="components.directives.assessment-question.save"]').click().waitUntil(':hidden');

    return this;
  }

  deleteQuestion(index: number) {
    this.rootElement.findVisibles('.overflow-menu-button')[index].click();
    let list = this.rootElement.findVisibles('.js-menu-item-link').length - 1;
    this.rootElement.findVisibles('.js-menu-item-link')[list].click();
    this.rootElement.findVisible('.js-delete-confirm').click();
    return this;
  }

  assertCannotAddQuestion() {
    this.editQuestionsControl.assertCannotAddQuestion();
    return this;
  }

  assertRandomizationEnabled() {
    this.rootElement.findVisible(Control.RANDOMIZATION_NOTIFICATION_SELECTOR);
    return this;
  }

  assertRandomizationDisabled() {
    this.rootElement.assertElementDoesNotExist(Control.RANDOMIZATION_NOTIFICATION_SELECTOR);
    return this;
  }

  getQuestion(index: number) {
    var questionSelector = controls.EditAssessmentQuestion.Control.getQuestionSelector(index);
    return new controls.EditAssessmentQuestion.Control(this.rootElement.findVisible(questionSelector));
  }

  /**
   * Verify that there are numQuestions in the assessment canvas. This counts only the questions
   * that have a "Question x" label. For example, if a text has instruction text, "Question 1",
   * "Question 2", then pass 2 to numQuestions.
   */
  verifyNumberOfQuestions(numQuestions: number) {
    polledExpect(() => this.rootElement.findVisibles('.question-label').length).toBe(numQuestions);
    return this;
  }

  /**
   * Verify that the text (presentation-only question text) matches in the specified spot
   *
   * @param args.questionNumber: 1-based index of the question wrt to all questions on the canvas (including presentation-only questions)
   */
  verifyTextExists(args: { questionNumber: number; expectedText: string }) {
    this.verifyQuestionTextAndPoints({questionNumber: args.questionNumber, questionText: args.expectedText});
    return this;
  }

  /**
   * Verify that the file (from presentation-only question) is displayed inline in the specified spot
   *
   * @param args.questionNumber: 1-based index of the question wrt to all questions on the canvas (including presentation-only questions)
   */
  verifyFileDisplayedInline(args: { questionNumber: number }) {
    this.getQuestion(args.questionNumber)
      .waitForQuestionToBeReady()
      .bbmlEditor
      .setDoesNotHaveFileDropBlock()
      .assertUploadedImageFileIsDisplayedInline(0); // this index number is with respect to the BbML editor, not assessment questions
    return this;
  }

  /**
   * Verify that an essay question matching the given params exists in the specified spot
   * @param args.questionNumber: 1-based index of the question wrt to all questions on the canvas (including presentation-only questions)
   * @param args.questionText: The text of the essay question
   * @param args.points: Optional; the point value of the question
   */
  verifyEssayQuestionExists(args: { questionNumber: number; questionText: string; points?: string }) {
    this.verifyQuestionTextAndPoints({questionNumber: args.questionNumber, questionText: args.questionText, points: args.points});
    return this;
  }

  /**
   * Verify that a multiple choice question matching the given params exists in the specified spot
   * @param args.questionNumber: 1-based index of the question wrt to all questions on the canvas (including presentation-only questions)
   * @param args.questText: The text of the MC question
   * @param args.points: Optional; the point value of the question
   * @param args.answerChoices: The answer choices of the MC question
   */
  verifyMultipleChoiceQuestionExists(args: {
    questionNumber: number;
    questionText: string;
    points?: string;
    answerChoices: string[],
    correctAnswers: number[]
  }) {
    let question = this.verifyQuestionTextAndPoints({questionNumber: args.questionNumber, questionText: args.questionText, points: args.points});
    question.verifyMultipleChoiceAnswerChoices(args.answerChoices);
    question.verifyMultipleChoiceCorrectAnswers(args.correctAnswers);
    return this;
  }

  /**
   * Verify that a true/false question matching the given params exists in the specified spot
   * @param args.questionNumber: 1-based index of the question wrt to all questions on the canvas (including presentation-only questions)
   * @param args.questionText: The text of the question
   * @param args.points: Optional; the point value of the question
   * @param args.correctAnswer: Optional, default is true
   */
  verifyTrueFalseQuestionExists(args: { questionNumber: number; questionText: string; points?: string; correctAnswer?: boolean }) {
    let question = this.verifyQuestionTextAndPoints({questionNumber: args.questionNumber, questionText: args.questionText, points: args.points});
    question.verifyTrueFalseCorrectAnswer(args.correctAnswer);
    return this;
  }

  /**
   * Verify the question text and points for the question at the given question number. No-op on points verification if points not given.
   */
  private verifyQuestionTextAndPoints(args: { questionNumber: number; questionText: string; points?: string }): controls.EditAssessmentQuestion.Control {
    let question = this.getQuestion(args.questionNumber).waitForQuestionToBeReady();
    question.bbmlEditor.assertTextBlocksAccurateAndReadOnlyForStudent([args.questionText]);

    if (args.points) {
      question.verifyPoints(args.points);
    }

    return question;
  }

  assertDueDate(expectedDueDate: Date) {
    // no-op: the due date does not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  assertGradeCategory(expectedCategory: string) {
    // no-op: the grade category does not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  assertVisibilityStartEndDates(expectedStartDate: Date, expectedEndDate: Date) {
    // no-op: the start/end dates do not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  assertDescription(expectedDescription: string) {
    // no-op: the description does not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  assertGradeSchema(expectedGradeSchemaName: string) {
    // no-op: the grade schema does not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  assertGradeAttemptModel(expectedGradeAttemptModelName: string) {
    // no-op: the grade attempt model does not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  assertTimeLimit(expectedTimeLimitName: string) {
    // no-op: the grade schema does not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  assertRubric(rubricTitle: string) {
    // no-op: the rubric  does not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  assertAttemptsAllowed(numberOfAttempts: string) {
    // no-op: the attempts allowed does not show in the small and medium breakpoints. This is overridden for the large breakpoint.
    return this;
  }

  autoSave(noFocusOut?: boolean) {
    if (!noFocusOut) {
      this.rootElement.findVisible('.submission-slider-container').click();
    }
    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
    return;
  }

  setVisibility(selector: enums.Visibility) {
    this.getVisibilitySelector().setOptionBySelector(selector.toString().toLowerCase());
    return this;
  }

  getVisibilitySelector() {
    return this.editPanelControls.getVisibilitySelector();
  }

  /** Open the assessment settings peek panel */
  openSettingsPanel() {
    this.rootElement.findVisible('a.assessment-settings-button').click();
    return this.getSettingsPanel();
  }

  private getSettingsPanel() {
    return new controls.EditAssessmentSettingsPanel.Control();
  }

  /** Open the submissions list page */
  openSubmissionsPanel() {
    this.rootElement.findElement('.submission-slider-trigger-next a').click();
    return new controls.ContentSubmissions.Control();
  }

  scrollToEndOfCanvas() {
    this.rootElement.findVisible('.divider-text-container').scrollIntoView();

    return this;
  }

  assertClassConversationEnabled() {
    this.rootElement.findVisible('.open-conversation');
  }

  assertClassConversationDisabled() {
    this.rootElement.assertElementDoesNotExist('.open-conversation');
  }

  openClassConversationPanel() {
    this.rootElement.findVisible('.open-conversation').click();
    return new controls.ClassConversationPanel.Control();
  }

  viewGoals() {
    this.rootElement.findVisible('[bb-peek-sref="content-goal-alignment"]').click();
    return new controls.goalAlignmentPage.Control();
  }

  getNumOfGoals() {
    return parseInt(this.rootElement.findVisible('[bb-peek-sref="content-goal-alignment"]').getText().match(/\d+/)[0], 10);
  }

  getGoalAlignment() {
    return new controls.goalAlignmentPage.Control();
  }

  getNumOfGroups() {
    return parseInt(this.rootElement.findVisible('.js-groups-link').getText().match(/\d+/)[0], 10);
  }

  getGradeCategory() {
    return this.rootElement.findVisible('.js-assessment-grade-category').getText();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {
  /**
   * Verify the displayed due date
   *
   * @param expectedDueDate The expected due date. If null, verify 'No due date' is displayed.
   */
  assertDueDate(expectedDueDate: Date) {
    var dateText = '';
    if (expectedDueDate) {
      dateText = this.rootElement.findVisible('[analytics-id="course.content.assessment.test.settings.dueDate.formattedDate"]').getText();
      polledExpect(() => new Date(dateText)).toEqual(expectedDueDate);
    } else {
      dateText = this.rootElement.findVisible('[analytics-id="course.content.assessment.test.settings.dueDate.noDueDate"]').getText();
      polledExpect(() => dateText).toEqual('No due date');
    }
    return this;
  }

  /**
   * Verify the displayed grade category.
   *
   * @param expectedCategory
   */
  assertGradeCategory(expectedCategory: string) {
    var gradeCategorySelector = '.panel-content-info .js-assessment-grade-category';
    polledExpect(() => this.rootElement.findVisible(gradeCategorySelector).getInnerHtml().trim()).toEqual(expectedCategory);
    return this;
  }

  /**
   * Verify the displayed visibility start and end dates. If both dates are null, verify that the entire visibility section does not show.
   *
   * @param expectedStartDate The expected start date
   * @param expectedEndDate The expected end date
   */
  assertVisibilityStartEndDates(expectedStartDate: Date, expectedEndDate: Date) {
    var VISIBILITY_CONTAINER_SELECTOR = '.js-assessment-visibility';
    if (expectedStartDate || expectedEndDate) {
      var visibilityContainer = this.rootElement.findVisible(VISIBILITY_CONTAINER_SELECTOR);
      var STARTDATE_SELECTOR = '[analytics-id="course.content.assessment.test.settings.showHide.showOn.formatted"] bdi';
      var ENDDATE_SELECTOR = '[analytics-id="course.content.assessment.test.settings.showHide.hideAfter.formatted"] bdi';

      if (expectedStartDate) {
        const dateText = visibilityContainer.findVisible(STARTDATE_SELECTOR).getText();
        polledExpect(() => new Date(dateText)).toEqual(expectedStartDate);
      } else {
        visibilityContainer.assertElementDoesNotExist(STARTDATE_SELECTOR);
      }

      if (expectedEndDate) {
        const dateText = visibilityContainer.findVisible(ENDDATE_SELECTOR).getText();
        polledExpect(() => new Date(dateText)).toEqual(expectedEndDate);
      } else {
        visibilityContainer.assertElementDoesNotExist(ENDDATE_SELECTOR);
      }
    } else {
      this.rootElement.assertElementDoesNotExist(VISIBILITY_CONTAINER_SELECTOR);
    }
    return this;
  }

  /**
   * Verify the displayed description
   *
   * @param expectedDescription The expected description. If null, verify that the description element is not displayed.
   */
  assertDescription(expectedDescription: string) {
    var descriptionSelector = '.panel-content-info .js-assessment-description .vtbegenerated';
    if (expectedDescription) {
      polledExpect(() => this.rootElement.findVisible(descriptionSelector).getInnerHtml().trim()).toEqual(expectedDescription);
    } else {
      this.rootElement.assertElementDoesNotExist(descriptionSelector);
    }
    return this;
  }

  /**
   * Verify the displayed grade schema
   *
   * @param expectedGradeSchema The expected grade schema.
   */
  assertGradeSchema(expectedGradeSchema: string) {
    var gradeSchemaSelector = '.panel-content-info .js-assessment-grading-options .js-assessment-schema';
    polledExpect(() => this.rootElement.findVisible(gradeSchemaSelector).getInnerHtml().trim()).toEqual(expectedGradeSchema);
    return this;
  }

  /**
   * Verify the displayed grade attempt model
   *
   * @param expectedGradeAttemptModelName The expected grade attempt model name
   */
  assertGradeAttemptModel(expectedGradeAttemptModelName: string) {
    var gradeAttemptModelSelector = '.panel-content-info .js-assessment-grading-options .js-attempt-model';
    polledExpect(() => this.rootElement.findVisible(gradeAttemptModelSelector).getInnerHtml().trim()).toEqual(expectedGradeAttemptModelName);
    return this;
  }

  /**
   * Verify the displayed timed limit.
   *
   * @param expectedTimeLimit The expected time limit.
   * @returns {Large}
   */
  assertTimeLimit(expectedTimeLimit: string) {
    var timeLimitElement = '.js-timed-limit';
    polledExpect(() => this.rootElement.findVisible(timeLimitElement).getText().trim()).toEqual(expectedTimeLimit);
    return this;
  }

  /**
   * Verify the displayed rubric
   *
   * @param expectedRubricTitle Expected title of the rubric
   */
  assertRubric(expectedRubricTitle: string) {
    polledExpect(() => this.rootElement.findVisible('.rubric-li .rubric-title').getInnerHtml().trim()).toEqual(expectedRubricTitle);

    return this;
  }

  assertAttemptsAllowed(numberOfAttempts: string) {
    var attemptsAllowed = this.rootElement.findVisible('.js-attempts-allowed').getInnerHtml().trim();
    // no other way to verify this except by verifying the English string
    polledExpect(() => attemptsAllowed).toBe(numberOfAttempts + (numberOfAttempts === '1' ? 'attempt' : ' attempts'));
    return this;
  }
}