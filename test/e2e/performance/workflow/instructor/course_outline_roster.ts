import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let courseList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id).getOutline();
    profile.record('[Memory Leak Test] Opened course outline');

    let roster = courseOutline.openRoster();
    testUtil.waitForAngular();
    profile.record('Opened roster');

    roster.scrollToLastGridItem();
    testUtil.waitForAngular();
    profile.record('Scrolled to last student');

    // load another 50 memberships (150 student + 1 instructor in test data)
    roster.scrollToLastGridItem();
    testUtil.waitForAngular();
    profile.record('Scrolled to last student II');

    // load all memberships (should be just 1 this time)
    roster.scrollToLastGridItem();
    testUtil.waitForAngular();
    profile.record('Scrolled to last student III');

    roster.scrollToFirstGridItem();
    testUtil.waitForAngular();
    profile.record('Scrolled to first student in grid view');

    roster.switchToListView();
    testUtil.waitForAngular();
    profile.record('Switched to list view');

    roster.scrollToLastListItem();
    profile.record('Scrolled to last student');

    roster.scrollToFirstListItem();
    profile.record('Scrolled to first student in list view');

    roster.filterToStudents();
    profile.record('Filtered list to students only');

    roster.close();
    profile.record('Closed roster');

    courseOutline.closePanel();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }
}