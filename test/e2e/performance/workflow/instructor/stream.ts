import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    testUtil.waitForAngular();

    profile.start();

    let streamPage = basePage.openStream();
    testUtil.waitForAngular();
    profile.record('Instructor opened Stream page');

    streamPage.scrollToLastStreamEntry(streamPage.streamEntriesLoaded());
    profile.record('Scrolled to last entry');

    streamPage.filterEntriesByGradesAndFeedback();
    profile.record('Filtered stream to Grades and Feedback');

    basePage.openCourses();
    profile.record('Opened Course List page');

    basePage.openStream();
    profile.record('Returned to Stream page');

    profile.end();
  }
}