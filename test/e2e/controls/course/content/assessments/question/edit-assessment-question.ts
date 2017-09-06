import _ = require('lodash');
import controls = require('../../../../index');
import enums = require('../../../../enums/index');
import testUtil = require('../../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export interface IQuestion {
  questionText?: string;
  questionType: enums.QuestionType;
  points?: string;
  removeFileBlock?: number;
}

// TODO: For now, we use this single object to represent any question type, since the only question types are Essay and Multiple Choice,
// and they have a lot of things in common. Eventually, as more question types are added, we should consider making a separate control
// for each type, perhaps inheriting from a parent control.
export class Control {
  questionIndex: number;
  rootElement: ElementFinderSync;
  bbmlEditor: controls.BbmlEditor.Control;

  private static QUESTION_SELECTOR = '.js-assessment-question-';

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
      this.bbmlEditor = new controls.BbmlEditor.Control(this.rootElement.findVisible('.js-bbml-editor[id*="question_text_"]'));

      // derive the question number from the helper css selector since that has the index value
      var selectors = rootElement.getAttribute('class');
      selectors.split(' ').forEach((singleClass) => {
        if (_.startsWith(singleClass, Control.QUESTION_SELECTOR)) {
          this.questionIndex = parseInt(_.trim(singleClass, Control.QUESTION_SELECTOR), 10);
        }
      });
    }
  }

  /** Get the string selector to select a specific question */
  static getQuestionSelector(questionIndex: number) {
    return Control.QUESTION_SELECTOR + questionIndex;
  }

  // for small and medium breakpoints only-- large breakpoint version overridden below
  editQuestion(question: IQuestion) {
    this._openOverflowMenu();
    this._selectEditQuestionFromOverflowMenu();
    this.setOptions(question);
    this.saveQuestion();

    return this;
  }

  goalPicker() {
    this._openOverflowMenu();
    this._selectEditGoalFromOverflowMenu();
    return new controls.goalPickerPage.Control();
  }

  goalSetting() {
    return new controls.goalAlignmentPage.Control();
  }

  openGoalSettingPanel() {
    this._openOverflowMenu();
    this._selectEditGoalFromOverflowMenu();
    return new controls.goalAlignmentPage.Control();
  }

  /**
   *  Confirms that a question can not be deleted
   */
  assertCanNotDeleteQuestion() {
    this._openOverflowMenu();
    polledExpect(() => this.rootElement.findElement('[id^="assessment"][id$="delete"]').isDisplayed()).toEqual(false);
    return this;
  }

  /**
   *  Confirms that a question's point value cannot be changed
   */
  assertCanNotModifyQuestionPoints() {
    this._openOverflowMenu();
    this._selectEditQuestionFromOverflowMenu();
    polledExpect(() => this.rootElement.findElement('.point-value-input').isDisplayed()).toEqual(false);
    this.rootElement.findVisible('button[analytics-id="components.directives.assessment-question.cancel"]').click();  //We do this to get back to the state we started at when we entered this method
    return this;
  }

  //Delete the current question and wait until it is removed
  deleteQuestion() {
    this._openOverflowMenu();
    this._selectDeleteQuestionFromOverflowMenu().ok();
    return this;
  }

  setMultipleChoiceAnswerChoices(answerChoices: string[]) {
    // wait until the answer choices portion is visible, now that it is hidden until text is entered to the question text body
    this.rootElement.findElement('.multiple-answer-answers-container').waitUntil(':visible');
    var answerBlanks = this.rootElement.findVisibles('.multiple-answer-answer .text-editor');

    var answerTextEditors = answerBlanks.map((answer) => {
      return new controls.TinyEditor.Control(answer);
    });

    for (var i = 0; i < answerChoices.length; i++) {
      if (i < answerTextEditors.length) {
        answerTextEditors[i].setText(answerChoices[i]);
      }
    }

    // TODO if at some point we want to include more than 4 answers, update this method to conditionally add answer choices

    return this;
  }

  /**
   * Verify that the multiple choice question's answer choice text are set as expected
   */
  verifyMultipleChoiceAnswerChoices(expectedAnswerChoices: string[]) {
    var actualAnswers = this.rootElement.findVisibles('.multiple-answer-answer');

    expectedAnswerChoices.forEach((expectedAnswerChoice, index) => {
      new controls.BbmlEditor.Control(actualAnswers[index]).assertTextBlocksAccurateAndReadOnlyForStudent([expectedAnswerChoice]);
    });

    return this;
  }

  /**
   * Set the correct answers for a MC question.
   * @param correctAnswers 0-based indexes of the correct answers
   */
  setMultipleChoiceCorrectAnswers(correctAnswers: number[]) {
    var answerCheckboxes = this.rootElement.findVisibles('.multiple-answer-answer').map((element) => {
      return new controls.Checkbox.Control(element);
    });

    correctAnswers.forEach((answerIndex) => {
      answerCheckboxes[answerIndex].setToChecked();
    });

    return this;
  }

  /**
   * Verify that the multiple choice question's answers are set as the correct answer as expected.
   * Give a list of the expected 0-based indices to the correct answers.
   *
   * For example:
   *
   * Multiple choice question text: What are the colors of the sky?
   * Answer choices: [blue, green, white, purple, magenta]
   *
   * To verify that 'blue' and 'white' have been marked as the correct answer, call:
   *
   * verifyMultipleChoiceCorrectAnswers([0, 2])
   */
  verifyMultipleChoiceCorrectAnswers(expectedCorrectAnswers: number[]) {
    var actualAnswers = this.rootElement.findVisibles('.multiple-answer-answer');

    expectedCorrectAnswers.forEach((expectedCorrectAnswer) => {
      actualAnswers[expectedCorrectAnswer].findVisible('.correct-answer-text');
    });

    return this;
  }

  /**
   * Set the correct answer for a true/false question.
   * @param correctAnswer boolean representing what the correct answer should be
   */
  setTrueFalseCorrectAnswer(correctAnswer: boolean) {
    // wait until the answer choices portion is visible, now that it is hidden until text is entered to the question text body
    // click on this container to get out of active edit mode of the true false question text editor
    var container = this.rootElement.findElement('.true-false-answers-container').waitUntil(':visible').click();
    this.bbmlEditor.waitUntilNotEditing();

    // wait until the true/false radio inputs are visible, enabled, and at least one of the options is selected
    // this is so that model has a chance to be reflected in the UI before we go changing the selected input
    var trueAnswerInput = container.findElement('input[id$="true-false-answer-true"]');
    var falseAnswerInput = container.findElement('input[id$="true-false-answer-false"]');
    polledExpect(() => trueAnswerInput.waitUntil(':visible').isEnabled()).toBe(true);
    polledExpect(() => falseAnswerInput.waitUntil(':visible').isEnabled()).toBe(true);
    polledExpect(() => trueAnswerInput.isSelected() || falseAnswerInput.isSelected()).toBe(true);

    // select the desired answer to be the correct answer
    // wait until the option is displayed (it's displayed when the question is in edit state) because sometimes it's not yet in edit mode here, then click
    container.findElement(`[id$="true-false-answer-${correctAnswer}-label"]`).waitUntil(':visible').click();

    // sanity check to make sure we have selected the desired answer
    polledExpect(() => correctAnswer ? trueAnswerInput.isSelected() : falseAnswerInput.isSelected()).toBe(true);
    return this;
  }

  /**
   * Verify that the expected answer has been set as the correct answer to a true/false question. Expected correct answer defaults to true if not given.
   * @param expectedCorrectAnswer boolean representing what the correct answer should be
   */
  verifyTrueFalseCorrectAnswer(expectedCorrectAnswer?: boolean) {
    var trueFalseOptionContainer = this.rootElement.findVisible(`.js-true-false-answer-${expectedCorrectAnswer == null ? true : expectedCorrectAnswer}`);

    // wait until the option label is displayed first (it's displayed when the question is out of edit state) because sometimes it's not yet out of edit mode here
    trueFalseOptionContainer.findElement('.true-false-answer-option').waitUntil(':visible');

    // now verify that the expected option is set as the correct answer
    polledExpect(() => trueFalseOptionContainer.findElement('.correct-answer-text').isDisplayed()).toBe(true);
    return this;
  }

  setOptions(question: IQuestion) {
    if (question.questionText) {
      this.editQuestionText(question.questionText);
    }
    if (question.points) {
      this.setPoints(question.points);
    }
    if (question.removeFileBlock) {
      this.deleteFileFromQuestionText(question.removeFileBlock);
    }
    return this;
  }

  saveQuestion() {
    polledExpect(() => this.rootElement.findVisible('button[analytics-id="components.directives.assessment-question.save"]').isEnabled()).toBe(true);
    this.rootElement.findVisible('button[analytics-id="components.directives.assessment-question.save"]').click().waitUntil(':hidden');
  }

  _openOverflowMenu() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    return this;
  }

  _selectDeleteQuestionFromOverflowMenu() {
    this.rootElement.findVisible('[id^="assessment"][id$="delete"]').click();
    return new controls.OverflowMenuDeleteConfirmation.Control();
  }

  _selectEditQuestionFromOverflowMenu() {
    this.rootElement.findVisible('[id^="assessment"][id$="edit"]').click();
  }

  _selectEditGoalFromOverflowMenu() {
    this.rootElement.findVisible('[id^="assessment"][id$="goal"]').click();
  }

  editQuestionText(text: string) {
    this.setQuestionText(text, true);
    return this;
  }

  // TODO - delete the edit parameter and remove the if-block once the questionTextAttachmentUpload feature toggle is removed
  setQuestionText(text: string, edit: boolean = false) {
    if (!edit) {
      this.bbmlEditor.addTextBlockToEmptyEditor(text);
    } else {
      var editor = new controls.TinyEditor.Control(this.getActiveEditorElement());
      editor.setFocusAndText(text);
    }
    return this;
  }

  addImageFileToQuestionText(file: string, index?: number) {
    if (!index) { // both no index or 0
      this.bbmlEditor.uploadFileToEmptyEditor(file).assertUploadedImageFileIsDisplayedInline(0);
    } else {
      this.bbmlEditor.uploadFile(file, index).assertUploadedImageFileIsDisplayedInline(index);
    }

    return this;
  }

  deleteFileFromQuestionText(index?: number) {
    let numberOfBlocks = this.bbmlEditor.getNumberOfBlocks();
    this.bbmlEditor.deleteFileBlock(index).assertNumberOfBlocks(numberOfBlocks - 1);
  }

  setPoints(points: string) {
    this.rootElement.findVisible('.point-value-input').clear().sendKeys(points);
    return this;
  }

  /**
   * Confirm that the question (regardless of edit mode) has the expected number of points set
   */
  verifyPoints(expectedPoints: string) {
    // have to use findElement since the input isn't actually visible when not in edit mode
    polledExpect(() => this.rootElement.findElement('.point-value-input').getAttribute('value')).toBe(expectedPoints);
    return this;
  }

  private getActiveEditorElement() {
    return this.rootElement.findElement('.question-content.active').findVisibles('.text-editor')[0];
  }

  clickOutside() {
    this.rootElement.findElement('.question-label').click();
    return this;
  }

  waitForQuestionToBeReady() {
    // potentially wait longer than the default time out for the question to be ready since we have seen random timeouts at this point in code happening on remote runs only
    // this is a stop gap solution to potential remote server latency issues
    // the wait time is what bbml-editor is using, so reusing here
    waitFor(() => {
      try {
        this.rootElement.waitUntil('[is-question-saved="true"]');
        return true;
      } catch (err) {
        // Ignore that the default implicit wait timed out
      }
      return false;
    }, 60000);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}