import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control extends controls.CalendarPage.Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    super();
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    }
  }

  /**
   * Add a calendar office hours item for an instructor who has course enrollments.  There will be an Add Event dropdown with a link that
   * needs to be selected to open the course schedule peek panel.
   */
  addCalendarOfficeHoursForInstructor(item: controls.EditCourseSchedulePanel.ICalendarCourseSchedule) {
    this
      ._openCalendarOfficeHoursPanelFromDropDown()
      .enableTitleEdit()  //Office Hours have a title pre-poulated by default, so we edit the title.
      .setOfficeHoursOptions(item)
      .save();

    return this;
  }

  /**
   * Add a calendar course schedule item for an instructor who has course enrollments.  There will be an Add Event dropdown with a link that
   * needs to be selected to open the course schedule peek panel.
   */
  addCalendarCourseScheduleForInstructor(item: controls.EditCourseSchedulePanel.ICalendarCourseSchedule) {
    this
      ._openCalendarCourseSchedulePanelFromDropDown()
      .openAddPanel()
      .setOptions(item)
      .save();

    return this;
  }

  /**
   * Edit a calendar course schedule item for an instructor who has course enrollments.  There will be an Add Event dropdown with a link that
   * needs to be selected to open the course schedule peek panel.
   */
  editCalendarCourseScheduleForInstructor(item: controls.EditCourseSchedulePanel.ICalendarCourseSchedule) {
    this
      ._openCalendarCourseSchedulePanelFromDropDown()
      .openEditPanel()
      .enableTitleEdit()
      .setOptions(item)
      .save();

    return this;
  }

  /**
   * Delete a calendar course schedule item for an instructor who has course enrollments.
   * This method can work well when there is only one course schedule item
   */
  removeCalendarCourseScheduleForInstructor() {
    this
      ._openCalendarCourseSchedulePanelFromDropDown()
      .delete();

    return this;
  }

  /**
   * Get current page's calendar item's name
   * This method can work well when there is only one calendar item on page
   */
  getCourseScheduleName() {
    return this.rootElement.findVisible('a.fc-time-grid-event').closest('a').getText();
  }

  /** override */
  _getRootElement() {
    return elementSync.findVisible('#course-calendar-body-content').closest('.course .panel-content');
  }

  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
  }

  /**
   * Open the Add/Edit Course Calendar Item panel from the dropdown menu by clicking the Add button.
   * This only works in the case where the user has enrollments.
   */
  _openCalendarItemPanelFromDropdown() {
    this.rootElement.findVisible('#course-new-event-button').click();
    this.rootElement.findVisible('[analytics-id="course.calendar.addEvent"]').click();
    return new controls.EditCalendarItemPanel.Control();
  }

  /**
   * Open the Edit Course Schedule peek panel from the drop down menu by clicking the Add button.
   * This only works in the case where the user is instructor.
   */
  _openCalendarCourseSchedulePanelFromDropDown() {
    this.rootElement.findVisible('#course-new-event-button').click();
    this.rootElement.findVisible('[analytics-id="course.calendar.addCourseSchedule"]').click();
    return new controls.EditCourseSchedulePanel.Control();
  }

  /**
   * Open the Office Hours peek panel from the drop down menu by clicking the Add button.
   * This only works in the case where the user is instructor.
   */
  _openCalendarOfficeHoursPanelFromDropDown() {
    this.rootElement.findVisible('#course-new-event-button').click();
    this.rootElement.findVisible('[analytics-id="course.calendar.addOfficeHours"]').click();
    return new controls.EditCalendarItemPanel.Control();
  }
}

class Small extends controls.CalendarPage.Small {

}

class Medium extends controls.CalendarPage.Medium {

}

class Large extends controls.CalendarPage.Large {

}

function mixin(type: any, into: any) {
  Object.keys(type.prototype).forEach(key => {
    if (!into.hasOwnProperty(key)) {
      into.prototype[key] = type.prototype[key];
    }
  });
}

// Mixin Control into Small, Medium, Large
mixin(Control, Small);
mixin(Control, Medium);
mixin(Control, Large);