import controls = require('../../../../index');
import testUtil = require('../../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

/** The various states an assessment canvas can be in with respect to being populated with questions */
export enum CanvasQuestionPopulationStatus {
  Empty,
  HasQuestions
}

/** The types of questions that are listed on the Add Question panel */
export enum QuestionType {
  Essay,
  MultipleChoice,
  TrueFalse
}

export const QUESTION_WRAPPER_SELECTOR = '.questionItem .question-render-wrapper';
const ADD_CONTENT_BUTTON_SELECTOR = '.js-add-assessment-content-button';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('form[name=assessmentContentForm]').closest('.bb-offcanvas-panel.full.active');
    }
  }

  /** Click Add Question button > Add Question peek panel > select the specified question to add */
  addQuestionToCanvas(questionType: QuestionType, currentCanvasStatus?: CanvasQuestionPopulationStatus) {
    // open the Add Question peek panel
    var addQuestionPanel = this.getAddQuestionsPanel(currentCanvasStatus);

    switch (questionType) {
      case QuestionType.Essay:
        addQuestionPanel.addEssayQuestion();
        break;
      case QuestionType.MultipleChoice:
        addQuestionPanel.addMultipleChoiceQuestion();
        break;
      case QuestionType.TrueFalse:
        addQuestionPanel.addTrueFalseQuestion();
        break;
    }

    return this;
  }

  populateTextPresentationQuestion(questionText: string) {
    this._getNextQuestionEditorControl()
      .setQuestionText(questionText, testUtil.features.questionTextAttachmentUpload) // With this feature enabled, the block is already added
      .saveQuestion();

    return this;
  }

  /**
   * Populate the essay question that is currently in edit mode at the bottom of the assessment canvas with the specified information.
   * Most of the time <addQuestionToCanvas> is called first to add a question to the assessment canvas and be in edit mode.
   */
  populateEssayQuestion(args?: {
    questionText?: string,
    file?: string,
    points?: string
  }) {
    var questionText = args && args.questionText || testUtil.PREFIX + 'Essay Question';
    var points = args && args.points || '15';

    // fill in info
    var questionEditor = this._getNextQuestionEditorControl()
      .setPoints(points)
      .setQuestionText(questionText, testUtil.features.questionTextAttachmentUpload); // With this feature enabled, the block is already added

    if (args && args.file) {
      questionEditor = questionEditor.addImageFileToQuestionText(args.file, 1);
    }

    // save the question
    questionEditor.saveQuestion();

    return this;
  }

  /**
   * Populate the multiple choice question that is currently in edit mode at the bottom of the assessment canvas with the specified information.
   * Most of the time <addQuestionToCanvas> is called first to add a question to the assessment canvas and be in edit mode.
   */
  populateMultipleChoiceQuestion(args?: {
    questionText?: string,
    points?: string,
    answerChoices?: string[],
    correctAnswers?: number[]
  }) {
    var questionText = args && args.questionText || testUtil.PREFIX + 'Multiple Choice Question';
    var points = args && args.points || '15';
    var answerChoices = args && args.answerChoices || ['answer 1', 'answer 2', 'answer 3', 'answer4'];

    // fill in info
    var question = this._getNextQuestionEditorControl()
      .setPoints(points)
      .setQuestionText(questionText, testUtil.features.questionTextAttachmentUpload) // With this feature enabled, the block is already added
      .setMultipleChoiceAnswerChoices(answerChoices);

    if (args && args.correctAnswers) {
      question.setMultipleChoiceCorrectAnswers(args.correctAnswers);
    }

    // save the question
    question.saveQuestion();

    return this;
  }

  /**
   * Populate the true/false question that is currently in edit mode at the bottom of the assessment canvas with the specified information.
   * Most of the time <addQuestionToCanvas> is called first to add a question to the assessment canvas and be in edit mode.
   */
  populateTrueFalseQuestion(args?: {
    questionText?: string,
    points?: string
    correctAnswer?: boolean
  }) {
    var questionText = args && args.questionText || testUtil.PREFIX + 'True/False Question';
    var points = args && args.points || '15';

    // fill in info
    var questionEditor = this._getNextQuestionEditorControl()
      .setPoints(points)
      .setQuestionText(questionText, testUtil.features.questionTextAttachmentUpload); // With this feature enabled, the block is already added

    if (args && args.correctAnswer === false) {
      questionEditor.setTrueFalseCorrectAnswer(args.correctAnswer);
    }

    // save the question
    questionEditor.saveQuestion();

    return this;
  }

  assertCannotAddQuestion() {
    browserSync.getBrowser().actions().mouseMove(this.rootElement.findElements(ADD_CONTENT_BUTTON_SELECTOR)[0].getElementFinder().getWebElement()).perform();
    polledExpect(() => this.rootElement.findElements(ADD_CONTENT_BUTTON_SELECTOR)[0].isDisplayed()).toEqual(false);
  }

  /**
   * Open the add-assessment-content menu to select the assessment content (question, text, file) to add
   */
  public openAddMenu() {
    var addIcons = this.rootElement.findElements(ADD_CONTENT_BUTTON_SELECTOR);
    var bottomAddIcon = addIcons[addIcons.length - 1];

    // always click the bottom most add question icon so that the question index is predictable
    browserSync.getBrowser().actions().mouseMove(bottomAddIcon.getElementFinder().getWebElement()).perform();
    bottomAddIcon.click();

    polledExpect(() => this.rootElement.findVisibles('.element-list-add-menu').length).toEqual(1);
    this.rootElement.findVisible('.is-expanded');
  }

  /** Open the Add Question peek panel */
  getAddQuestionsPanel(currentCanvasStatus?: controls.EditAssessmentQuestions.CanvasQuestionPopulationStatus) {
    if (currentCanvasStatus && currentCanvasStatus === CanvasQuestionPopulationStatus.HasQuestions) {
      return this.openAddQuestionPanelFromNonEmptyCanvas();
    }
    return this._openAddQuestionPanelFromEmptyCanvas();
  }

  private _openAddQuestionPanelFromEmptyCanvas() {
    this.rootElement.findVisible('#add-question').click();
    return new controls.AddAssessmentQuestionPanel.Control();
  }

  private openAddQuestionPanelFromNonEmptyCanvas() {
    this.openAddMenu();
    this.rootElement.findVisible('[analytics-id="components.directives.add-content-button.addQuestion"]').click();
    return new controls.AddAssessmentQuestionPanel.Control();
  }

  private _getNextQuestionEditorControl() {
    var nextQuestionNumber = this.getNextQuestionNumber();
    var questionSelector = controls.EditAssessmentQuestion.Control.getQuestionSelector(nextQuestionNumber);
    return new controls.EditAssessmentQuestion.Control(this.rootElement.findVisible(questionSelector));
  }

  private getNextQuestionNumber(): number {
    try {
      return this.rootElement.findVisibles(QUESTION_WRAPPER_SELECTOR).length;
    } catch (err) {
      return 1; // if there are no questions on the page, it is an empty canvas, so the next question number is 1
    }
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}