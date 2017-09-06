import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;
  bbmlEditor: controls.BbmlEditor.Control;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.assessment-attempt').closest('.bb-offcanvas-panel');
      this.bbmlEditor = new controls.BbmlEditor.Control(this.rootElement.findVisible('.freeform-response .js-bbml-editor'));
    }
  }

  openOptions() {
    return new controls.ViewerAssessmentOptionsPanel.Control(this.rootElement);
  }

  getAnswers() {
    return new controls.ViewerAssessmentAnswers.Control();
  }

  saveDraft() {
    this.rootElement.findVisible('button.js-save-draft-button').click().waitUntilRemoved();
    return new controls.ViewerAssessmentOverviewPanel.Control();
  }
  
  saveTimedAssessment() {
    var button = this.rootElement.findVisible('button.js-save-draft-button').click();
    new controls.ConfirmationNeeded.Control()
      .assertTimeLimitInfo('Timer is still active')
      .ok();
    button.waitUntilRemoved();

    return new controls.ViewerAssessmentOverviewPanel.Control();
  }

  submit() {
    var button = this.rootElement.findVisible('button.js-send-draft-button').click();
    new controls.ConfirmationNeeded.Control().ok();
    button.waitUntilRemoved();
    return new controls.ViewerAssessmentOverviewPanel.Control();
  }

  openRubric() {
    this.rootElement.findVisible('.js-rubric-view button').click();

    return new controls.RubricViewPanel.Control();
  }

  addText(text: string) {
    this.bbmlEditor.addTextBlockToEmptyEditor(text).clickSave();
    this.bbmlEditor.waitUntilNotEditing().assertTextBlocks([text]);

    return this;
  }

  addFile(filename: string) {
    this.bbmlEditor.uploadFileToEmptyEditor(filename);

    return this;
  }

   getGoalsForQuestion(index: number) {
     this.rootElement.findVisibles('bb-assessment-question')[index].findVisible('a.question-goal').click();
     return new controls.goalAlignmentPage.Control();
  }

  assertTitle(title: string) {
    polledExpect(() =>
      this.rootElement.findVisible('h1.panel-title.student').getInnerHtml()
    ).toEqual(title);
    return this;
  }

  assertLateIndicator() {
    this.rootElement.findVisible('.submit-footer .late-notice .due-date-span');
    return this;
  }

  assertNoLateIndicator() {
    this.rootElement.assertElementDoesNotExist('.submit-footer .late-notice .due-date-span');
    return this;
  }

  assertRubric() {
    this.rootElement.findVisible('.js-rubric-view');
    return this;
  }

  assertTimeLimitNumber(timeLimitInfo: string) {
    polledExpect(() =>
      this.rootElement.findVisible('.js-time-limit-info').getText()
    ).toEqual(timeLimitInfo);
   
    return this;
  }

  assertRemaingTime(remaingTime: string) {
    polledExpect(() =>
      this.rootElement.findVisible('.js-remaing-time').getText()
    ).toEqual(remaingTime);

    return this;
  }

  /** Clear the FTUE that appears on the assessment canvas for any questions rendered with the text editor */
  clearQuestionFTUE() {
    this.rootElement.findVisible('.guidance-element-overlay.guidance-container').click();
    return this;
  }
}

class Compact extends Control {

  openOptions() {
    this.rootElement.findVisible('button#details-info-button').click();
    return new controls.ViewerAssessmentOptionsPanel.Control();
  }

}

class Small extends Compact {
  assertTitle(title: string) {
    // this is the title to the panel
    polledExpect(() =>
      this.rootElement.findVisible('h1.panel-title.student').getInnerHtml()
    ).toEqual(title);

    // black header bar in small and medium breakpoints will always say "Test"
    polledExpect(() =>
      this.rootElement.findVisible('h1.panel-title[analytics-id="course.content.assessment.type.Test.name"]').getInnerHtml()
    ).toEqual('Test');

    return this;
  }
}

class Medium extends Compact {

}

class Large extends Control {

}