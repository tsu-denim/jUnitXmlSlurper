import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.student-submission-list');
    }
  }

  clearFTUE() {
    this.rootElement.findVisible('#guidance-moment-item-details').click();

    return this;
  }

  clearFTUEWithUngradedItem() {
    this.rootElement.findVisible('#guidance-moment-item-details').click();
    this.rootElement.findVisible('#grade-guidance-moment').click();

    return this;
  }

  enterGrade(args: { studentId: string; grade: string; }) {
    var input = this._getGradeInput(args.studentId);
    input.click().clear().sendKeys(args.grade);

    input.waitUntil('.ng-valid'); //The text box has an async validator, and if enter is pressed before it is valid, it won't get saved

    input.sendKeys(Key.TAB);

    return this;
  }

  enterGroupGrade(args: { groupId: string ; memberId? : string; grade: string; }) {
    var id = this._generateGroupGradeId(args.groupId, args.memberId);
    var input = this._getGroupGradeInput(id);
    input.scrollIntoView().click().clear().sendKeys(args.grade);

    input.waitUntil('.ng-valid'); //The text box has an async validator, and if enter is pressed before it is valid, it won't get saved

    input.sendKeys(Key.TAB);

    return this;
  }

  postGrade(studentId: string) {
    var row = this.getGradeRow(studentId);
    row.findVisible('.send-grade').click();

    new controls.ConfirmationNeeded.Control().ok();

    //We have to search for this element like this because the list gets remade asynchronously and can cause a stale element exception
    this.rootElement.findVisible('.row[data-student-id="' + studentId + '"] .js-grade-posted'); //Wait for the green check to appear

    return this;
  }

  getGrade(args: { groupId: string ; memberId? : string}) {
    var id = this._generateGroupGradeId(args.groupId, args.memberId);
    return this._getGroupGradeInput(id).getAttribute('value');
  }

  openSubmission(studentId: string) {
    var row = this.getGradeRow(studentId);
    row.click();

    return new controls.ContentSubmissionDetail.Control();
  }

  openGroupSubmission() {
    var row = this.rootElement.findVisible('.row.child-is-invokable');
    row.click();
    return new controls.ContentSubmissionDetail.Control();
  }

  toggleGroupDetails() {
    var toggleGroupDetails = this.rootElement.findVisible('.row.child-is-invokable .group-detail button');
    toggleGroupDetails.click();
    return this;
  }

  openTestMultipleAttemptsPanel(studentId: string) {
    var row = this.getGradeRow(studentId);
    row.click();

    return new controls.MultipleAttemptSubmissionsPanel.Control();
  }

  openTestSubmission(studentId: string) {
    var row = this.getGradeRow(studentId);
    return this.openRow(row);
  }

  openRow(row: ElementFinderSync) {
    row.click();
    return new controls.SubmissionGrading.Control();
  }

  assertGradePosted(studentId: string) {
    this.rootElement.findVisible('.row[data-student-id="' + studentId + '"] .js-grade-posted'); //Wait for the green check to appear
    return this;
  }

  assertSubmissionGrade(studentId: string, value: string) {
    polledExpect(() =>
      this._getGradeInput(studentId).getAttribute('value')
    ).toEqual(value);
    return this;
  }

  assertOverrideIndicator(studentId: string, visible: boolean) {
    var element = '.row[data-student-id="' + studentId + '"] .override-indicator';
    visible ? this.rootElement.findVisible(element) : this.rootElement.assertElementDoesNotExist(element);
    return this;
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
    return this;
  }

  assertSubmissisonLate(studentId: string, isLate: boolean) {
    var row = this.getGradeRow(studentId);
    polledExpect(() => row.findVisible('.element-card .avatar').hasClass('alert-outline')).toEqual(isLate);
    polledExpect(() => row.findVisible('.element-card .js-submission-activity-label').hasClass('text-alert-ax')).toEqual(isLate);
    return this;
  }

  assertGroups(groups: any[]) {
    groups.forEach(group => this.getGradeRow(group.id));
    return this;
  }

  assertNumberToGrade(number: number) {
    polledExpect(() => this.rootElement.findVisible('.js-to-grade').getText()).toContain(number);
    return this;
  }

  assertAttempted(id: string) {
    polledExpect(() => this.getGradeRow(id).findVisible('.js-activity-label').getText()).toContain('Attempted on');
    return this;
  }

  private _getGradeInput(studentId: string) {
    return this.rootElement.findVisible('bb-grade-input[for-user-id="' + studentId + '"] input');
  }

  private _getGroupGradeInput(id: string) {
    return this.rootElement.findVisible('#' + id + ' input');
  }

  public getGradeRow(studentId: string) {
    return this.rootElement.findVisible('.row[data-student-id="' + studentId + '"]');
  }

  private _generateGroupGradeId(groupId: string, memberId?: string) {
    return 'grade_' + groupId + (memberId ? ('member_id' + memberId) : '');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}