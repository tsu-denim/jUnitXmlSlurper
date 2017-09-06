import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, elementSync} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.base-courses').closest('#main-content');
    }
  }

  assertCourseDoesNotExist(id: string) {
    this.rootElement.assertElementDoesNotExist('.element-card[data-course-id="' + id + '"]');
  }

  openCourse(courseId: string) {
    return this.getCourseCard(courseId).openUltraCourse();
  }

  completeCourse(courseId: string) {
    return this.getCourseCard(courseId).completeCourse();
  }

  openClassicCourse(courseId: string) {
    return this.getCourseCard(courseId).openClassicCourse();
  }

  getCourseCard(courseId: string, courseList?: string) {
    return new controls.CourseCard.Control(this._getCourseCardElement(courseId, courseList));
  }

  clickConfirmConversionInProgress() {
    elementSync.findVisible('.confirm-new-conversion').click();
    return this;
  }

  clickConfirmConvertedCourse() {
    elementSync.findVisible('.confirm-new-converted').click();
    return new controls.CoursePage.Control();
  }

  waitForUltraConversionToComplete(courseId: string) {
    this._waitForConversionToComplete(courseId);
    return this;
  }

  waitForClassicConversionToComplete(courseId: string) {
    this._waitForConversionToComplete(courseId);
    return new controls.BasePage.Control();
  }

  getCoursesIteach() {
    this._openFilterCoursesDropdown();
    var courseIteachColumn = elementSync.findVisible('[data-filter-id="filter-courses-i-teach"]');
    courseIteachColumn.click();
  }

  scrollToFirstCurrentCourse() {
    return elementSync.findVisibles('.course-list.current-term')[0].scrollIntoView();
  }

  scrollToLastCurrentCourse() {
    return elementSync.findVisible('.course-list.current-term .last-item').scrollIntoView();
  }

  scrollToLastPastCourse() {
    return elementSync.findVisibles('.course-list .last-item')[0].scrollIntoView();
  }

  scrollToLastUpcomingCourse() {
    return elementSync.findVisibles('.course-list.upcoming-term .last-item')[0].scrollIntoView();
  }

  /**
   * Waits for the Course Conversion to Complete.
   * @param course ID to wait on for the conversion to complete
   */
  private _waitForConversionToComplete(courseId: string) {
    //queues up the conversion task to the top of the line for more rapid processing.
    testUtil.startConversionTask(courseId);

    //We look to see that we started converting
    this._getCourseCardElement(courseId).click();
    this._getCourseCardElement(courseId).hasClass('js-conversion-in-progress');

    //It's too fast to verify the success toast, so verifying the conversion popup eventually disappears allows us to bypass any timing conditions
    this.rootElement.findVisible('.convert-course-container').waitUntilRemoved();

    //We look for the "hide" icon (it will be present, but not visible).  This will only appear if conversion was successful.
    this.rootElement.findElement('[analytics-id="base.courses.hideCourse"]');
  }

  private _getCourseCardElement(courseId: string, courseList?: string) {
    var parentElement = (courseList) ? this._getCourseListElement(courseList) : this.rootElement;
    return parentElement.findVisible('.element-card[data-course-id="' + courseId + '"]');
  }

  _getCourseListElement(term: string) {
    return this.rootElement.findVisible('.' + term).closest('.course-list');
  }

  private _openFilterCoursesDropdown() {
    elementSync.findVisible('#filter-courses-value').click();
    elementSync.findVisible('#courses-filter.f-open-dropdown'); // verify dropdown opened
  }
}

class Small extends Control {
  _getCourseListElement(term: string) {
    if (term !== controls.BaseCoursesPage.CourseTermList.CurrentTerm) {
      if (term === controls.BaseCoursesPage.CourseTermList.UpcomingTerm) {
        this.rootElement.findVisible('.next').click();
      } else {
        this.rootElement.findVisible('.prev').click();
      }
    }
    return this.rootElement.findVisible('.' + term).closest('.course-list');
  }
}

class Medium extends Control {
  _getCourseListElement(term: string) {
    if (term !== controls.BaseCoursesPage.CourseTermList.CurrentTerm
      && term !== controls.BaseCoursesPage.CourseTermList.UpcomingTerm) {

      this.rootElement.findVisible('.prev').click();
    }
    return this.rootElement.findVisible('.' + term).closest('.course-list');
  }
}

class Large extends Control {

}

export class CourseTermList extends testUtil.BaseEnum {
  static CurrentTerm = 'current-term';
  static UpcomingTerm = 'upcoming-term';

  private _course_filter_enum: string; //Need to add a class member to give this class some structure to differentiate it from other
}
