import controls = require('../index');
import enums = require('../enums/index');
import testUtil = require('../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('js-row')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  postGrades() {
    this.rootElement.findVisible('.send-grade').click();

    new controls.ConfirmationNeeded.Control().ok();
    return this;
  }

  assertGradeProgress(status: enums.ColumnSummaryStatus) {
    switch (status) {
      case enums.ColumnSummaryStatus.AllPosted:
        this.rootElement.findVisible(
          '.grade-progress [analytics-id="components.directives.grade.grader-column.statuses.allPosted"]');
        break;
      case enums.ColumnSummaryStatus.NeedsGrading:
        this.rootElement.findVisible(
          '.grade-progress [analytics-id="components.directives.grade.grader-column.statuses.numToGrade.plural"]');
        break;
      case enums.ColumnSummaryStatus.NothingToGrade:
        this.rootElement.findVisible(
          '.grade-progress [analytics-id="components.directives.grade.grader-column.statuses.nothingToGrade"]');
        break;
      case enums.ColumnSummaryStatus.NeedsPosting:
        this.rootElement.findVisible(
          '.grade-progress [analytics-id="components.directives.grade.grader-column.statuses.numToPost.plural"]');
        break;
      case enums.ColumnSummaryStatus.AllGraded:
        this.rootElement.findVisible(
          '.grade-progress [analytics-id="components.directives.grade.grader-column.statuses.allGraded"]');
        break;
      default:
        throw new Error('Status check not implemented: ' + status.toString());
    }
    return this;
  }

  openSubmissionsByGradeColumnTitle(title: string) {
    this.rootElement.findVisible(By.linkText(title)).click();
    return new controls.ContentSubmissions.Control();
  }

  deleteColumn() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    this.rootElement.findVisible('[icon="trash"]').click();
    new controls.OverflowMenuDeleteConfirmation.Control().ok();
    return this;
  }

}

class Small extends Control {
  assertGradeProgress() {
    polledExpect(() => this.rootElement.findElement('.grade-progress').isDisplayed()).toEqual(false);
    return this;
  }
}

class Medium extends Control {

}

class Large extends Control {

}