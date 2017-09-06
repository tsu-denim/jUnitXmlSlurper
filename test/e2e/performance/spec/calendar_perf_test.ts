import controls = require('../../controls/index');
import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler, IProfiler, TestWorkflow} from '../test-profiler';

import * as InstructorVisitCourseCalendar from '../workflow/instructor/calendar_course';
import * as InstructorVisitBaseCalendar from '../workflow/instructor/calendar_base';

export const COURSE_NUMBER = 5;
export const COURSE_SCHEDULE_NUMBER = 10;

// TODO: export the following class and move to "../workflow/instructor" as long as its relevant TODO is done
class InstructorVisitCourseSchedule extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    basePage.clickCalendarNav();
    let calendarPage = basePage.renderCalendarBasePage();
    profile.record('[Memory Leak Test] Opened Calendar page');

    let courseSchedulePage = calendarPage.openCourseSchedulePanelFromDropDown();
    profile.record('opened Course Schedule Panel');

    //scroll to last course schedule
    courseSchedulePage.scrollToLastCourseSchedule();
    profile.record('scrolled to last course schedule');

    courseSchedulePage.closePanel();
    profile.record('[Memory Leak Test] Returned to Calendar page');

    profile.end();
  }
}

describe('Calendar Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Instructor views calendar tab in course A', testUtil.createTest(() => {
    new InstructorVisitCourseCalendar.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Calendar Suite', 'Instructor views calendar tab in course A'));
  }));

  it('Instructor views all calendars', testUtil.createTest(() => {
    new InstructorVisitBaseCalendar.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Calendar Suite', 'Instructor views all calendars'));
  }));

  it('Instructor views course schedule', testUtil.createTest((create) => {
    // TODO: any data preparation should be included in data-set-generator so that all of specs can run based on the same env
    let envCS;
    let recurRules: any = {freq: 'DAILY', interval: 1, endsBy: null, count: 10, byWeekDay: [], timeZoneId: 'Asia/Shanghai', until: ''};
    var startDate: Date;
    var endDate: Date;
    var date = new Date();
    startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0);
    endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0);

    for (let i = 1; i <= COURSE_NUMBER; i++) {
      let course = create.course({ overrides: {name:  `COURSE_SCHEDULE_00${i}`}}).with.instructor({enrollee: dataSet.INSTRUCTOR});

      for (let j = 1; j <= COURSE_SCHEDULE_NUMBER; j++) {
        envCS = course.and.courseSchedule({overrides: {startDate: startDate, endDate: endDate, recurRules: recurRules}}).exec();
      }
    }

    new InstructorVisitCourseSchedule(envCS).execute(testUtil.loginBase(envCS.instructor), new TestProfiler('Calendar Suite', 'Instructor views course schedule'));
  }));
});