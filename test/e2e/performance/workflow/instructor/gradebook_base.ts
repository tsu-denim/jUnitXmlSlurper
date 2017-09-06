import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let baseGradesPage = basePage.openGrades();
    profile.record('Opened Grades page');

    baseGradesPage.scrollToLastCourse();
    profile.record('Scrolled to last course');

    let courseCardA = baseGradesPage.scrollToCourse(dataSet.COURSE_A_NAME);
    profile.record('Scrolled to Course A');

    let lastContentItem = courseCardA.clickAllCourseworkToggle();
    profile.record('Clicked "View all Coursework" of Course A');

    let submissionPage = courseCardA.openCourseWork(lastContentItem);
    profile.record('Opened last content item in Course A');

    submissionPage.closePanel();
    profile.record('Returned to Grades page');

    profile.end();
  }
}