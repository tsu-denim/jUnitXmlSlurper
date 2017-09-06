import controls = require('../../index');
import testUtil = require('../../../test_util');
import {By, ElementFinderSync, elementSync, browserSync} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.base-messages-container');
    }
  }

  getCourseMessages(courseId: string) {
    return new controls.CourseConversations.Control(this.rootElement.findVisible('.messages-list [data-course-id="' + courseId + '"]'));
  }

  /**
   * Scroll down and find the specify course.
   */
  scrollToFindCourse(courseName: string) {
    let courseCards = this.rootElement.findElements('.messages-header');
    let previousLength = 0;
    do {
      previousLength = courseCards.length;
      courseCards[courseCards.length - 1].scrollIntoView();
      testUtil.waitForAngular();
      courseCards = this.rootElement.findElements('.messages-header');
    } while (!this.findCourseId(courseName) && courseCards.length > previousLength);
    
    return this;
  }

  private findCourseId(courseName: string) {
    const {by} = browserSync.getBrowser();
    try {
      this.rootElement.findElement(By.linkText(courseName));
      return true;
    } catch (ex) {
      return false;
    }
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}