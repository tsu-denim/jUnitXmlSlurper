import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.offline-item');
    }
  }

  clearFTUE() {
    this.rootElement.findVisible('#guidance-moment-grade-gradebook-item').click();
    return this;
  }

  enterGrade(args: { studentId: string; grade: string; }) {
    var input = this._getGradeInput(args.studentId);
    input.click().clear().sendKeys(args.grade);

    input.waitUntil('.ng-valid'); //The text box has an async validator, and if enter is pressed before it is valid, it won't get saved

    input.sendKeys(Key.TAB);

    return this;
  }

  addFeedback(args: { studentId: string; feedback: string; }) {
    var row = this.getGradeRow(args.studentId);
    row.findVisible('[analytics-id="course.grades.gradebook-item.non-attempt-grades.addFeedback"]').click();
    row.findVisible('.comment-input .item-text').click().sendKeys(args.feedback);
    row.findVisible('button.save-info').click().waitUntilRemoved();
    polledExpect(() => this.rootElement.findVisible('.student-comment').getInnerHtml().trim()).toEqual(args.feedback);
    return this;
  }

  postGrade(studentId: string) {
    var row = this.getGradeRow(studentId);
    row.findVisible('.send-grade').click();

    new controls.ConfirmationNeeded.Control().ok();

    //We have to search for this element like this because the list gets remade asynchronously and can cause a stale element exception
    row.findVisible('.sent'); //Wait for the green check to appear

    return this;
  }

  getGradeRow(studentId: string) {
    return this.rootElement.findVisible('.row.js-user-id' + studentId);
  }

  private _getGradeInput(studentId: string) {
    var row = this.getGradeRow(studentId);
    return row.findVisible('bb-grade-input input');
  }
}

class Small extends Control {
  clearFTUE() {
    //Do nothing. No FTUE exists on small BP
    return this;
  }

  postGrade(studentId: string) {
    var row = this.getGradeRow(studentId);
    row.findVisible('.send-grade').click();

    new controls.ConfirmationNeeded.Control().ok();

    //Currently there is no posted indicator on small BP so there is nothing to assert.
    return this;
  }
}

class Medium extends Control {

}

class Large extends Control {

}