import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let courseList = basePage.openCourses();
    profile.record('Opened course list');

    courseList.getCoursesIteach();
    profile.record('Filtered list to \'Courses I Teach\'');

    let lastCurrentCourseCard = courseList.scrollToLastCurrentCourse();
    profile.record('Scrolled to last current course');

    let lastCurrentCourse = courseList.openCourse(lastCurrentCourseCard.findVisible('.js-course-details').getAttribute('data-course-id'));
    profile.record('Opened last current course');

    lastCurrentCourse.close();
    profile.record('Closed last current course');

    let lastUpcomingCourseCard = courseList.scrollToLastUpcomingCourse();
    profile.record('Scrolled to last upcoming course');

    let lastUpcomingCourse = courseList.openCourse(lastUpcomingCourseCard.findVisible('.js-course-details').getAttribute('data-course-id'));
    profile.record('Opened last last upcoming course');

    lastUpcomingCourse.close();
    profile.record('Closed last upcoming course');

    let lastPastCourseCard = courseList.scrollToLastPastCourse();
    profile.record('Scrolled to last past course');

    let lastPastCourse = courseList.openCourse(lastPastCourseCard.findVisible('.js-course-details').getAttribute('data-course-id'));
    profile.record('Opened last past course');

    lastPastCourse.closeCompleteCourseModal();
    lastPastCourse.close();
    profile.record('Closed last past course');

    profile.end();
  }
}