import _ = require('lodash');
import controls = require('../../../../index');
import enums = require('../../../../../../../app/enums/index');
import testUtil = require('../../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

/**
 * Class representing an assessment question as displayed on the student attempt panel.
 */
export class Control {
  rootElement: ElementFinderSync;

  bbmlEditor: controls.BbmlEditor.Control;
  questionType: string;
  tinyEditor: controls.TinyEditor.Control;

  public static QUESTION_TYPE_SELECTOR = 'js-question-type-';

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
      this.bbmlEditor = new controls.BbmlEditor.Control(this.rootElement.findVisibles('.js-bbml-editor')[0]); // question-text editor
      // derive question type from css selector
      var questionSelectors = this.rootElement.findVisible('.assessment-question').getAttribute('class');
      questionSelectors.split(' ').forEach((singleClass) => {
        if (_.startsWith(singleClass, Control.QUESTION_TYPE_SELECTOR)) {
          var startIndex = Control.QUESTION_TYPE_SELECTOR.lastIndexOf('-');
          this.questionType = singleClass.substr(startIndex + 1, singleClass.length);
        }
      });

      if (enums.QuestionType.Essay.isEqualTo(this.questionType)) {
        //essay questions contain a text editor as answer field instead of bbml-editor
        this.tinyEditor = new controls.TinyEditor.Control(this.rootElement.findVisible('.text-editor'));
      }
    }
  }

  assertQuestionTitle(title: string) {
    polledExpect(() =>
      this.rootElement
        .findVisible('.question-label').getInnerHtml()
    ).toEqual(title);
    return this;
  }

  assertQuestionPoints(points: string) {
    polledExpect(() =>
      this.rootElement
        .findVisible('.point-value').getInnerHtml()
    ).toEqual(points + ' Points');
    return this;
  }

  assertQuestionText(text: string) {
    this.bbmlEditor.assertTextBlocksAccurateAndReadOnlyForStudent([text]);
    return this;
  }

  assertAnswerText(answerText: string) {
    this.tinyEditor.assertText(answerText);
    return this;
  }

  assertEssayQuestionText(text: string) {
    this.bbmlEditor.assertTextBlocksAccurateAndReadOnlyForStudent([text]);
    return this;
  }

  assertPresentationTextLinkOpensNewWindow() {
    polledExpect(() => this.rootElement.findVisible('bb-bbml-editor a').getAttribute('target')).toBe('_blank');
    return this;
  }

  setEssayText(answerText: string) {
    this.tinyEditor.setFocusAndText(answerText);
    return this;
  }

  setMultipleChoiceAnswer(answerIndex: number = 0) {
    var selector = `.multiple-answer-answers .js-multiple-answer-answer-${answerIndex}`;
    var answerElement = this.rootElement.findVisible(selector);
    answerElement.click();
    polledExpect(() =>
      answerElement.hasClass('selected-answer')
    ).toBe(true);
    return this;
  }

  setTrueFalseAnswer(answer: boolean) {
    var selector = `.js-true-false-answer-${(answer).toString()}`;
    var answerElement = this.rootElement.findVisible(selector);
    answerElement.click();
    polledExpect(() =>
      answerElement.hasClass('selected-answer')
    ).toBe(true);
    return this;
  }

  autoSave() {
    var origAutoSaveCount = Number(this.rootElement.getAttribute('autosaved'));
    this.rootElement.findVisible('.question-label').click(); // click something innocuous to blur the answer field
    waitFor(() => {
      // a successful autosave is indicated by an incremented count for the "autosaved" attribute
      return <any>this.rootElement.getAttribute('autosaved') === (origAutoSaveCount + 1).toString();
    });
    return this;
  }

  getType() {
    return this.questionType;
  }

  scrollInToView() {
    this.rootElement.scrollIntoView();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}