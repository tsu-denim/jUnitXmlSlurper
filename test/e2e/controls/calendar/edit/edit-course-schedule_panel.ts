/**
 * Created by dwang on 3/16/17.
 */
import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export interface ICalendarCourseSchedule {
  title: string;
  allDay?: boolean;
  location?: string;
  startDate?: Date;
  endDate?: Date;
}

export class Control {
  rootElement: ElementFinderSync;
  /** Creates a control for the Add/Edit Calendar Course Schedule panel */
  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.panel-wrap.calendar-schedule-panel');
    }
  }

  /** Enable the title to be ready for text edit */
  enableTitleEdit() {
    this.rootElement.findVisible('[analytics-id="base.calendar.schedule.courseNickname"]').next().click();
    return this;
  }

  /** Sets the course schedule title in the text edit */
  setTitle(newTitle: string) {
    this.rootElement.findVisible('[analytics-id="base.calendar.schedule.courseNickname"]').next().clear().sendKeys(newTitle);
    return this;
  }

  /** Sets whether this course schedule is an all day event */
  setAllDay(allDay: boolean) {
    var allDayCheckbox: controls.Checkbox.Control = new controls.Checkbox.Control(this.rootElement
      .findElement('input[name="all-day"]').closest('div'));
    if (allDay) {
      allDayCheckbox.setToChecked();
    } else {
      allDayCheckbox.setToUnchecked();
    }

    return this;
  }

  setStartDate(startDate: Date) {
    let startDateControl = new controls.DatePicker.Control(this.rootElement.findVisible('input[name="start-date"]'));
    startDateControl.setDate(startDate);
    this.rootElement.findVisible('[analytics-id="components.directives.calendar.startEndAllDay.start"]').click(); // clicks off date area so we can continue cleanly.
    return this;
  }

  setStartTime(startDate: Date) {
    let startTimeControl = new controls.TimePicker.Control(this.rootElement.findVisible('input[name="start-time"]'));
    startTimeControl.setTimeViaWidget(startDate.getHours().toString());
    this.rootElement.findVisible('[analytics-id="components.directives.calendar.startEndAllDay.start"]').click(); // clicks off time widget so we can continue cleanly.
    return this;
  }

  setEndDate(endDate: Date) {
    let endDateControl = new controls.DatePicker.Control(this.rootElement.findVisible('input[name="end-date"]'));
    endDateControl.setDate(endDate);
    this.rootElement.findVisible('[analytics-id="components.directives.calendar.startEndAllDay.start"]').click(); // clicks off date area so we can continue cleanly.
    return this;
  }

  setEndTime(endDate: Date) {
    let startTimeControl = new controls.TimePicker.Control(this.rootElement.findVisible('input[name="end-time"]'));
    startTimeControl.setTimeViaWidget(endDate.getHours().toString());
    this.rootElement.findVisible('[analytics-id="components.directives.calendar.startEndAllDay.start"]').click(); // clicks off time widget so we can continue cleanly.
    return this;
  }

  /** Sets whether this course schedule needs a location */
  setLocation(location: string) {
    this.rootElement.findVisible('[analytics-id="base.calendar.create.location"]').next().sendKeys(location);
  }
  
  /** Sets options for add/edit course schedule panel */
  setOptions(calendarCourseSchedule: ICalendarCourseSchedule) {
    if (calendarCourseSchedule.title) {
      this.setTitle(calendarCourseSchedule.title);
    }

    // Currently there is no end date, just end time option...
    if (calendarCourseSchedule.allDay != null) {
      this.setAllDay(calendarCourseSchedule.allDay);
    } else {
      this.setStartDate(calendarCourseSchedule.startDate);
      this.setStartTime(calendarCourseSchedule.startDate);
      this.setEndTime(calendarCourseSchedule.endDate);
    }

    if (calendarCourseSchedule.location != null) {
      this.setLocation(calendarCourseSchedule.location);
    }
    return this;
  }

  /** Saves the calendar course schedule and the panel closes */
  save() {
    this.rootElement.findVisible('[analytics-id="base.calendar.schedule.save"]').click();
    this.rootElement.findVisible('.scheduled-time'); //wait for item to be saved.
    // Close course schedule peek panel
    new controls.BasePage.Control().closeTopPanel();
    this.rootElement.waitUntilRemoved();
  }

  /** Open edit the calendar course schedule panel by clicking the Edit option in overflow menu */
  openEditPanel() {
    this.clearFTUE();
    // We will edit the first one course schedule item display on the panel by default
    this.rootElement.findVisible('.overflow-menu-button').click();
    this.rootElement.findVisible('[analytics-id="global.edit"]').closest('a.js-menu-item-link').click();
    return this;
  }

  /** Open add the calendar course schedule panel by clicking the Add button */
  openAddPanel() {
    this.rootElement.findVisible('.add-meeting-link').click();
    return this;
  }

  /** Delete the calendar course schedule and click ok in confirming dialog */
  delete() {
    this.clearFTUE();
    // We will delete the first one course schedule item display on the panel by default
    this.rootElement.findVisible('.overflow-menu-button').click();
    this.rootElement.findVisible('[analytics-id="global.delete"]').closest('a.js-menu-item-link').click();
    // Confirm the delete dialog
    new controls.OverflowMenuDeleteConfirmation.Control().ok();
    // Close course schedule peek panel
    new controls.BasePage.Control().closeTopPanel();
    this.rootElement.waitUntilRemoved();
  }

  /** clear FTUE, because it blocks to click Add Course Schedule button */
  clearFTUE() {
    this.rootElement.findVisible('.guidance-element-add-meeting').click();
    return this;
  }

  /** Assert the course name exists on the course schedule peek panel */
  assertCourseNameExists(name: string) {
    polledExpect(() => this.rootElement.getOuterHtml()).toContain(name);

    return this;
  }

  /**
   * Scroll to last event in "Due Dates" view
   */
  scrollToLastCourseSchedule() {
    let event = this.rootElement.findElement('.schedule-class-item-last .scheduled-time-last');
    event.scrollIntoView();
    this.rootElement.findVisible('.schedule-class-item-last .scheduled-time-last');
    return this;
  }

  /**
   * Close the peek panel
   */
  closePanel() {
    this.rootElement.closest('.bb-offcanvas-panel-wrap').findVisible('.bb-close').click().waitUntilRemoved();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}