import controls = require('../../../../index');
import testUtil = require('../../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  viewerControls: controls.ViewerAssessmentQuestion.Control[];

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.question-list');
      this.viewerControls = this.getViewerControls();
    }
  }

  answerEssayQuestion(args: {questionIndex: number, text: string}) {
    var control = this.getQuestionControl(args.questionIndex);

    control.scrollInToView()
      .setEssayText(args.text)
      .autoSave();

    return this;
  }

  answerMultipleChoiceQuestion(args: {questionIndex: number, answerIndex: number}) {
    var control = this.getQuestionControl(args.questionIndex);

    control.scrollInToView()
      .setMultipleChoiceAnswer(args.answerIndex)
      .autoSave();

    return this;
  }

  answerTrueFalseQuestion(args: {questionIndex: number, answer: boolean}) {
    var control = this.getQuestionControl(args.questionIndex);

    control.scrollInToView()
      .setTrueFalseAnswer(args.answer)
      .autoSave();

    return this;
  }

   getQuestionControl(questionIndex: number = 0) {
    return this.viewerControls[questionIndex];
  }

  getViewerControls() {
    if (!this.viewerControls) {
      var questions = this.rootElement.findVisibles('bb-assessment-question');
      var qControls: controls.ViewerAssessmentQuestion.Control[] = [];

      questions.forEach((question) => {
        var control = new controls.ViewerAssessmentQuestion.Control(question);
        qControls.push(control);
      });

      return qControls;
    } else {
      return this.viewerControls;
    }
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}