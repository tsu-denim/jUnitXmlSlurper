import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-course-grades-student');
    }
  }

  /**
   * Clicks on assessment name from course gradebook. Only use this with tests for now. This will not work for assignments.
   */
  openAssessmentPanelByContentItemTitle(title: string) {
    this.rootElement.findVisible(By.linkText(title)).click();
    return new controls.ViewerAssessmentOverviewPanel.Control();
  }

  getColumn(title: string) {
    return new controls.ViewerColumn.Control(this.rootElement.findVisible(By.linkText(title)).closest('.js-row'));
  }

  getPostedGrade() {
    return this.rootElement.findVisible('.show-total .grade-input-display').getText();
  }

  getGradePill(index = 0) {
    return new controls.DisplayGradePill.Control(this.rootElement.findVisibles('bb-display-grade-pill')[index]);
  }

  assertDueDate(mustBe: Date) {
    var dueDate = new Date(this.rootElement.findVisible('.js-bb-student-assessment-duedate').getText());
    polledExpect(() => dueDate).toEqual(mustBe);
  }

  assertColumnDoesNotExist(title: string) {
    this.rootElement.assertElementDoesNotExist(By.linkText(title));
    return this;
  }

  private _getOverallElement() {
    return this.rootElement.findVisible('.overall-grade-running-total-wrapper .final-grade');
  }

  /**
   * Click overall grade pill to open Overall Grade peek panel
   */
  openOverallGradePanel() {
    this.rootElement.findVisible('.final-grade').click();
    return new controls.OverallGradePanel.Control();
  }

  /**
   * Gets value displayed as overall grade.
   * Implicitly asserts it's location by looking for
   * it inside the element where it suppose to be
   *
   * @returns {webdriver.promise.Promise|string}
   */
  getOverallGrade() {
    return this._getOverallElement().findVisible('.grade-input-display').getText();
  }

  /**
   * Checks that overall grade bulb has expected color class
   * @param expectedColorClass
   */
  assertOverallGradeColor(expectedColorClass: string) {
    polledExpect(() => this._getOverallElement().findVisible('.wrapping-input-style').hasClass(expectedColorClass)).toBeTruthy();

    return this;
  }

  assertOverallGrade(expectedGrade: string) {
    polledExpect(() => this.getOverallGrade()).toEqual(expectedGrade);
    return this;
  }

  clearFTUE() {
    this.rootElement.findVisible('.guidance-element-overlay').click();

    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('button.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }
}

class Small extends Control {

  assertDueDate(mustBe: Date) {
    // No assertion is needed because "small" breakpoint doesn't show due date
  }
}

class Medium extends Control {

}

class Large extends Control {

}