import controls = require('../../../../index');
import enums = require('../../../../enums/index');
import testUtil = require('../../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

/**
 * Add Questions peek panel
 */
export class Control {
  rootElement: ElementFinderSync;

  private essayQuestionElement: ElementFinderSync;
  private multipleChoiceQuestionElement: ElementFinderSync;
  private trueFalseQuestionElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.tests.assessment-add-question');
    }

    // this will serve as a sanity check that all the possible questions are present in the peek
    this.essayQuestionElement = this.rootElement.findVisible('a[analytics-id="course.content.assessment.add-question.essay"]');
    this.multipleChoiceQuestionElement = this.rootElement.findVisible('a[analytics-id="course.content.assessment.add-question.multiple-choice"]');
    this.trueFalseQuestionElement = this.rootElement.findVisible('a[analytics-id="course.content.assessment.add-question.true-false"]');
  }

  addEssayQuestion() {
    this.essayQuestionElement.click();
    return new controls.EditAssessmentPanel.Control();
  }

  addMultipleChoiceQuestion() {
    this.multipleChoiceQuestionElement.click();
    return new controls.EditAssessmentPanel.Control();
  }

  addTrueFalseQuestion() {
    this.trueFalseQuestionElement.click();
    return new controls.EditAssessmentPanel.Control();
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').scrollIntoView().click().waitUntilRemoved();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}