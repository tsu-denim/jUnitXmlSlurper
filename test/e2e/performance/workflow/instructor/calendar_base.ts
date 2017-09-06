import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    basePage.clickCalendarNav();
    let calendarPage = basePage.renderCalendarBasePage();
    profile.record('Opened calendar page');

    calendarPage.goToPreviousWeek();
    profile.record('Advanced view to previous week');

    let title = 'perf_test_course_calendar_item_title_2';
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

    calendarPage.scrollToLastDueEventOnBaseCalendar();
    profile.record('Scrolled to last Due Dates');

    profile.end();
  }
}