import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, browserSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('element-card')).toEqual(true);

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  getColumn(title: string) {
    return new controls.GraderColumn.Control(this.rootElement.findVisible(By.linkText(title)).closest('.js-row'));
  }

  openSubmissionsByGradeColumnTitle(title: string) {
    this.rootElement.findVisible(By.linkText(title)).click();
    return new controls.ContentSubmissions.Control();
  }

  assertNoCourseworkToGrade() {
    this.rootElement.findVisible('.base-grades-empty-state');
    return this;
  }

  clickAllCourseworkToggle() {
    var toggle = this.rootElement.findVisible('.grades-toggle');
    toggle.click();
    return this.rootElement.findVisible('#grades-all .last-tabular-row-container');
  }

  openCourseWork(courseWork: ElementFinderSync) {
    courseWork.scrollIntoView().click();
    return new controls.ContentSubmissions.Control();
  }

  openCourse(courseName: string) {
    this.rootElement.findVisible('.grades-header').findVisible(By.linkText(courseName)).click();
    return new controls.CourseGradesGraderPage.Control();
  }

  clearFTUE() {
    this.rootElement.findVisible('#guidance-moment-grade-click').click();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
