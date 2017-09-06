import BaseEnum from 'bb-base-enum';
import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.course').closest('.bb-offcanvas-panel-wrap');
    }
  }

  /**
   * Clicks on 'Outline' course navigation menu item.
   * Returns Course Outline object.
   */
  openOutline() {
    this._clickCourseNavMenuItem(CourseNavItem.Outline);
    return this.getOutline();
  }

  /**
   * Return currently opened outline control. If course outline is not
   * open, fails.
   */
  getOutline() {
    return new controls.CourseOutlinePage.Control();
  }

  /**
   * Clicks on 'calendar' course navigation menu item.
   * @return CourseCalendarPage object
   */
  openCalendar() {
    this._clickCourseNavMenuItem(CourseNavItem.Calendar);
    return new controls.CourseCalendarPage.Control();
  }

  /**
   * Clicks on 'grades' course navigation menu item.
   * @return CourseGradesGraderPage object
   */
  openGradesAsGrader() {
    this._clickCourseNavMenuItem(CourseNavItem.Grades);
    return new controls.CourseGradesGraderPage.Control();
  }

  /**
   * Clicks on 'grades' course navigation menu item.
   * @return CourseGradesViewerPage object
   */
  openGradesAsViewer() {
    this._clickCourseNavMenuItem(CourseNavItem.Grades);
    return new controls.CourseGradesViewerPage.Control();
  }

  /**
   * Clicks on 'Discussions' course navigation menu item.
   * Returns Discussion Page object.
   */
  openDiscussions() {
    this._clickCourseNavMenuItem(CourseNavItem.Discussions);
    return new controls.CourseDiscussionsPage.Control();
  }

  /**
   * Opens the roster by clicking on the 'Roster' link
   * Returns course roster page object
   */
  openRoster() {
    this.rootElement.findVisible('a[bb-peek-sref="roster"]').click();
    return new controls.CourseRosterPage.Control();
  }

  /**
   * Clicks on 'Messages' course navigation menu item.
   * Returns the Course Messages page object
   */
  openMessages() {
    this._clickCourseNavMenuItem(CourseNavItem.Messages);
    return new controls.CourseMessagesPage.Control();
  }

  waitForGuidance() {
    this.rootElement.findVisible('.guidance-element-overlay[component-key="course.nav"]');
    return this;
  }

  openCourseStatusModal() {
    elementSync.findVisible('a.course-status').click();
    return new controls.CourseStatusModal.Control();
  }

  assertCourseOpen() {
    elementSync.findVisible('a.course-status.js-course-open');
    return this;
  }

  /**
   * Course Conversion
   */

  dismissPreviewAttentionNotification() {
    elementSync.findVisible('.notification .js-dismiss-modal').click();
    return this;
  }

  dismissUnsupportedContentGuidance() {
    elementSync.findVisible('.guidance-element-overlay.not-forward-guidance');
    elementSync.findVisible('.outline-actions .outline-header h3').click();
    return this;
  }

  dismissBackToClassicGuidance() {
    elementSync.findVisible('.guidance-element-overlay.back-to-classic-button');
    elementSync.findVisible('.outline-actions .outline-header h3').click();
    return this;
  }

  openUnsupportedContentPanel() {
    elementSync.findVisible('.not-carry-details').click();
    return new controls.UnsupportedContentPanel.Control();
  }

  clickKeepUltra() {
    elementSync.findVisible('.js-use-new-ux').click();
    elementSync.findVisible('.confirm-ok').click().waitUntilRemoved();
    return this;
  }

  clickBackToClassic() {
    elementSync.findVisible('.js-back-to-classic').click().waitUntilRemoved();
    return new controls.BaseCoursesPage.Control();
  }

  openCopyImportReportPanel() {
    this.rootElement.findVisible('.not-carry-details-warn').click();
    return new controls.CourseImportReportPanel.Control();
  }

  closeCopyImportNotification() {
    this.rootElement.findVisible('.import-status-bar .js-import-confirm').click().waitUntilRemoved();
    return this;
  }

  closeByBackgroundClick() {
    var overlays = elementSync.findVisibles('.bb-offcanvas-overlay');
    testUtil.clickPoint(overlays.pop(), { x: 1, y: 1 }); //Click the topmost overlay
    this.rootElement.waitUntilRemoved();
  }

  close() {
    this.rootElement.findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  closeCompleteCourseModal() {
    let modal = elementSync.findVisible('.notification.reveal-modal');
    modal.findVisible('.close-reveal-modal').click();
    modal.waitUntilRemoved();
  }

  private _clickCourseNavMenuItem(navItem: CourseNavItem) {
    this._getCourseNavMenu().findVisible('a[bb-peek-sref^="' + navItem.toString() + '"]').click();
  }

  private _getCourseNavMenu() {
    return this.rootElement.findVisible('.course-nav');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}

/**
 * Enum for calendar view
 */
export class CourseNavItem extends BaseEnum {
  static Outline = new CourseNavItem('course.outline');
  static Calendar = new CourseNavItem('course.calendar');
  static Discussions = new CourseNavItem('course.engagement');
  static Grades = new CourseNavItem('course.grades');
  static Messages = new CourseNavItem('course.messages');

  //Need to add a class member to give this class some structure to differentiate it from other enums
  private _calendar_view_enum: string;
}
