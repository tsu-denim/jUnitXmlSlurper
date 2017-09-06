import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, elementSync, browserSync} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.base-grades');
    }
  }

  /**
   * Returns course card for student view.
   *
   * @param title
   */
  getStudentCourseCard(title: string) {
    return new controls.BaseGradesCourseAsStudent.Control(this.getCourseCard(title));
  }

  /**
   * Returns course card for instructor view.
   *
   * @param title
   */
  getInstructorCourseCard(title: string) {
    return new controls.BaseGradesCourseAsGrader.Control(this.getCourseCard(title));
  }

  /**
   * Returns the course card for the given title.
   *
   * @param title
   */
  private getCourseCard(title: string) {
    return this.rootElement.findVisible(By.linkText(title)).closest('.element-card');
  }

  /**
   * Clicks on "View all coursework" for course card with specified title
   *
   * @param title
   *
   * @returns {controls.CourseGradesViewerPage.Control}
   */
  viewAllCoursework(title: string) {
    this.getCourseCard(title).findVisible('.grades-toggle').click();
    return new controls.CourseGradesViewerPage.Control();
  }

  /**
   *  Makes FTUE disappear
   * @returns {Control}
   */
  clearFTUE() {
    this.rootElement.findVisible('.guidance-element-overlay').click();
    return this;
  }

  /**
   * Scroll to the specified course.
   */
  scrollToCourse(name: string) {
    let card = this.getCourseCard(name);
    card.scrollIntoView();
    this.rootElement.findVisible('.grades-toggle.button-anchor.right');
    return new controls.BaseGradesCourseAsGrader.Control(card);
  }

  /**
   * Scroll down to the last course.
   */
  scrollToLastCourse() {
    let courseCards;
    let courseNumber = 0;
    do {
      courseCards = this.rootElement.findElements('.current-term .element-card.base-grades-course-tile');
      courseNumber = courseCards.length;
      courseCards[courseNumber - 1].scrollIntoView();
    } while (this.rootElement.findElements('.current-term .element-card.base-grades-course-tile').length > courseNumber);
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}