import _ = require('lodash');
import assert = require('assert');
import controls = require('../../../index');
import enums = require('../../../enums/index');
import models = require('../../../../../../app/components/models');
import bbmlEditorService = require('../../../../../../app/components/services/bbml-editor/bbml-editor-service');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  viewQuestionsControl: controls.ViewerAssessmentQuestions.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.question-list').closest('.panel-content-full');
      this.viewQuestionsControl = new controls.ViewerAssessmentQuestions.Control();
    }
  }

  answerAllQuestions(questionCount: number) {
    // 0 base because we use index to find questions
    for (let i = 0; i < questionCount; i++) {
      let answer = `Answer to essay question ${i}`;
      var question = this.getQuestion(i);
      switch (question.getType()) {
        case 'eitherOr':
          this.answerTrueFalseQuestion({questionIndex: i, answer: true});
          break;
        case 'essay':
          this.answerEssayQuestion({questionIndex: i, text: answer});
          break;
        case 'multipleanswer':
          this.answerMultipleChoiceQuestion({questionIndex: i, answerIndex: 1});
          break;
      }
    }

    return this;
  }

  assertQuestionCount(count: number) {
    polledExpect(() => this.rootElement.findVisibles('bb-assessment-question').length).toEqual(count);
    return this;
  }

  assertQuestionOrder() {
    var questions = this.rootElement.findVisible('.question-list').findVisibles('.assessment-question');
    // assert that questions are displayed in the order added, e.g. question1, question2, etc
    // these assertions are dependent on the way questions are created in data_builder.ts
    questions.forEach(function(question, index) {
      polledExpect(() => question.findVisible('.question-label').getInnerHtml()).toEqual('Question ' + (index + 1));
      polledExpect(() => question.findVisible('.question-container > .vtbegenerated > p').getInnerHtml()).toEqual('question' + (index + 1));
    });
    return this;
  }

  assertIsRandomized(questions: models.question.IQuestion[]) {
    var uiQuestions = this.viewQuestionsControl.getViewerControls();
    var randomized = false;

    for (var i = 0; i < uiQuestions.length; i++) {
      var qControl = uiQuestions[i];
      var qModel = questions[i];

      var bbml = qModel.questionText.rawText;
      // parse text from bbml text block.
      // currently only checks first block as that is the default for question text
      var parsed = bbml.substring((bbml.indexOf('<p>') + 3), bbml.lastIndexOf('</p>'));

      try {
        qControl.assertQuestionText(parsed);
      } catch (err) {
        randomized = true;
        break;
      }
    }

    assert.equal(randomized, true);
  }

  answerEssayQuestion(args: {questionIndex: number; text: string}) {
    this.viewQuestionsControl.answerEssayQuestion(args);
    return this;
  }

  answerMultipleChoiceQuestion(args: {questionIndex: number; answerIndex: number}) {
    this.viewQuestionsControl.answerMultipleChoiceQuestion(args);
    return this;
  }

  answerTrueFalseQuestion(args: {questionIndex: number, answer: boolean}) {
    this.viewQuestionsControl.answerTrueFalseQuestion(args);
    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
    return;
  }

  clearFTUE() {
    // clear guidance moment that contains details on answering assessment questions
    this.rootElement.findVisible('.assessment-question .guidance-container').click();
    return this;
  }

  getQuestion(questionIndex: number = 0) {
    return this.viewQuestionsControl.getQuestionControl(questionIndex);
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}