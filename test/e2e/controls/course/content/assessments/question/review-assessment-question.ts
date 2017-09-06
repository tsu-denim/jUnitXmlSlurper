import _ = require('lodash');
import controls = require('../../../../index');
import testUtil = require('../../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

/**
 * Class representing an assessment question as displayed on the instructor submission grading panel and the
 * student submission review panel
 */
export class Control {
  /**
   * Zero-based index representing the question number as listed on an assessment panel and
   * NOT the displayed question title ("Question 1", "Question 2", etc.). Therefore, this
   * includes presentation-only questions, which do not have question titles displayed.
   */
  questionIndex: number;
  rootElement: ElementFinderSync;

  public static QUESTION_SELECTOR = '.js-assessment-question-';

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;

      // derive the question number from the helper css selector since that has the index value
      var selectors = rootElement.getAttribute('class');
      selectors.split(' ').forEach((singleClass) => {
        if (_.startsWith(singleClass, Control.QUESTION_SELECTOR)) {
          this.questionIndex = parseInt(_.trim(singleClass, Control.QUESTION_SELECTOR), 10);
        }
      });
    }
  }

  /**
   * Verify that the given answer matches what student entered for this essay question.
   */
  assertEssayQuestionAnswer(answer: string) {
    var question = this.rootElement.findVisible('.question-answer-container');
    var bbmlEditor = new controls.BbmlEditor.Control(question.findVisible('.panel .js-bbml-editor'));
    bbmlEditor.assertTextBlocksAccurateAndReadOnlyForStudent([answer]);
    return this;
  }

  /**
   * Verify that the given answers are the answers that are selected for this multiple choice question.
   * Pass in an empty array if no answer was chosen. Leave isCorrect unset to verify ungraded question.
   */
  assertChosenMultipleChoiceAnswers(answer: {isCorrect?: boolean, selectedAnswersIndex: number[]}) {
    // verify correctness if graded
    if (answer.isCorrect != null) {
      var correctAnswerElement = this.rootElement.findVisible('.multiple-answer-question-answer');
      polledExpect(() => correctAnswerElement.hasClass('multiple-answer-correct')).toEqual(answer.isCorrect);
    }

    // verify chosen answers
    var answerElements = this.getAnswerElements();
    if (answer.selectedAnswersIndex.length) {
      answer.selectedAnswersIndex.forEach((index) => {
        polledExpect(() => answerElements[index].hasClass('selected-answer')).toEqual(true);
      });
    } else {
      answerElements.forEach((answerElement) => {
        polledExpect(() => answerElement.hasClass('selected-answer')).toEqual(false);
      });
    }

    return this;
  }

  /**
   * Verify that the given answer is the answer selected for this true false question.
   * Leave answer unset if no answer was chosen. Leave isCorrect unset to verify ungraded question.
   */
  assertChosenTrueFalseAnswer(answer: {isCorrect?: boolean, answer: boolean}) {
    // verify correctness if graded
    if (answer.isCorrect != null) {
      var correctAnswerElement = this.rootElement.findVisible('.true-false-question-answer');
      polledExpect(() => correctAnswerElement.hasClass('true-false-correct')).toEqual(answer.isCorrect);
    }

    // verify chosen answer
    if (answer.answer != null) {
      var answerElements = this.rootElement.findElements('.true-false-answers > li');
      polledExpect(() => answerElements[answer ? 0 : 1].hasClass('selected-answer')).toEqual(true);
    }

    return this;
  }

  /**
   * Asserts the full grade string including possible points.
   * For example,
   *   -- / 100
   *    0 / 100
   *   10 / 100
   */
  assertGrade(grade: {score: string, pointsPossible: string}) {
    // verify score
    this._assertGradeScore(grade.score);

    // verify points possible
    polledExpect(() => this.getQuestionGrade().findVisible('.points-text bdi').getText()).toEqual(grade.pointsPossible);

    return this;
  }

  _assertGradeScore(expectedScore: string) {
    polledExpect(() => {
        var score = this.getQuestionGrade().findVisible('input').getAttribute('value');
        return score ? score : '--';
      }
    ).toEqual(expectedScore);
    return this;
  }

  /**
   * Asserts all Multiple Choice Answers are disabled. This should be true when
   * reviewing a submission.
   */
  assertMultipleChoiceAnswersReadOnly() {
    var answerElements = this.getAnswerElements();

    answerElements.forEach((answerElement) => {
      polledExpect(() => answerElement.findElement('input').isEnabled()).toEqual(false);
    });

    return this;
  }

  showAllMultipleChoiceAnswers() {
    this.rootElement.findVisible('.toggle-answer-options').click();
    return this;
  }

  private getQuestionGrade() {
    return this.rootElement.findVisible('bb-question-grade');
  }

  private getAnswerElements() {
    return this.rootElement.findElements('.multiple-answer-answers > li');
  }
}

class Small extends Control {
  assertGrade(grade: {score: string, pointsPossible: string}) {
    // verify score only as points possible is not displayed on the small breakpoint
    this._assertGradeScore(grade.score);
    return this;
  }
}

class Medium extends Control {

}

class Large extends Control {

}