import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let courseList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let course = courseList.openCourse(this.env[dataSet.COURSE_A].id);
    profile.record('[Memory Leak Test] Opened course outline');

    let calendarPage = course.openCalendar();
    profile.record('Opened calendar tab');

    calendarPage.goToPreviousWeek();
    profile.record('Advanced view to previous week');

    let title = 'perf_test_course_calendar_item_title_1';
    calendarPage.openAddPage();
    profile.record('Open add event page');
    calendarPage.enterData({title: title});
    profile.record('Finished entering data(ignore)');
    calendarPage.saveData();
    calendarPage.assertCalendarItemExists(title);
    profile.record('Added event');

    calendarPage.goToMonthView();
    calendarPage.assertCalendarItemExistsInMonth(title);
    profile.record('Switched to Month view');

    calendarPage.goToDueDates();
    profile.record('Switched to Due Dates');

    calendarPage.scrollToLastDueEvent();
    profile.record('Scrolled to last Due Dates');

    calendarPage.closePanel();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }
}