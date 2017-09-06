import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-submission-list');
    }
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-element-overlay').click();
    return this;
  }

  enterGrade(args: { studentId: string; grade: string; }) {
    var input = this._getGradeInput(args.studentId);
    input.click().clear().sendKeys(args.grade);

    input.waitUntil('.ng-valid'); //The text box has an async validator, and if enter is pressed before it is valid, it won't get saved

    input.sendKeys(Key.TAB);

    this.assertGradeScore(args.studentId, args.grade);

    return this;
  }

  postGrade(studentId: string) {
    var row = this._getGradeRow(studentId);
    row.findVisible('.send-grade').click();

    new controls.ConfirmationNeeded.Control().ok();

    //We have to search for this element like this because the list gets remade asynchronously and can cause a stale element exception
    this.rootElement.findVisible('.row[data-student-id="' + studentId + '"] .js-grade-posted'); //Wait for the green check to appear

    return this;
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
    return this;
  }

  private _cancelPostGrade(studentId: string) {
    var row = this._getGradeRow(studentId);
    row.findVisible('.send-grade').click();
    new controls.ConfirmationNeeded.Control().cancel();
    return this;
  }

  openSubmission(studentId: string) {
    var row = this._getGradeRow(studentId);
    row.click();
    this._closeRecommendedScoreWizard();
    return new controls.GradedDiscussionSubmissionDetail.Control();
  }

  private _closeRecommendedScoreWizard() {
    if (testUtil.features.discussionXray) {
      this.rootElement.closest('body').findVisible('.js-view-button').click();
    }
    return this;
  }

  private _getGradeInput(studentId: string) {
    return this.rootElement.findVisible('bb-grade-input[for-user-id="' + studentId + '"] input');
  }

  private _getGradeRow(studentId: string) {
    return this.rootElement.findVisible('.row[data-student-id="' + studentId + '"]');
  }

  private assertGradeScore(studentId: string, grade: string) {
    polledExpect(() =>
      this._getGradeInput(studentId).getAttribute('value')
    ).toEqual(grade);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}