import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let baseMessages = basePage.openMessages();
    profile.record('Opened base message'); // opened base message and started to load recent conversations

    testUtil.waitForAngularOnly(); // wait for conversations to be loaded
    profile.record('Loaded recent messages'); // loaded recent (3) conversations

    let courseMessages = baseMessages.getCourseMessages(this.env[dataSet.COURSE_A].id);
    courseMessages.toggleView();
    testUtil.waitForAngularOnly();
    profile.record('Loaded all messages'); // It loads recent 3 conversations by default. Now, load all.

    courseMessages.scrollToMessage(dataSet.MESSAGES - 1);
    testUtil.waitForAngularOnly();
    profile.record('Scrolled to last message in Course A');

    let message = courseMessages.openMessage(dataSet.MESSAGES - 1);
    testUtil.waitForAngularOnly();
    profile.record('Viewed last message in Course A');

    message.close();
    profile.record('Closed message');

    profile.end();
  }
}