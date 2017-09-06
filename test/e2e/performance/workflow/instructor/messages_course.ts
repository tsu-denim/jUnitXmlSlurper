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

    let courseMessage = course.openMessages();
    profile.record('Opened course messages'); // opened panel, and started to load conversations

    testUtil.waitForAngular(); // wait to load all conversations
    profile.record('Loaded all messages');

    courseMessage.scrollToMessage(dataSet.MESSAGES - 1);
    profile.record('Scrolled to last message');

    let message = courseMessage.openMessage(dataSet.MESSAGES - 1);
    profile.record('Opened last message');

    let replyMessage = testUtil.PREFIX + ' Reply Message!';
    message.setMessage(replyMessage);
    profile.record('Set replay message body (ignore)');
    message.sendAsReply();
    profile.record('Replied message');
    message.close();
    profile.record('Closed message');

    let sendMessage = testUtil.PREFIX + ' Message!';
    let createMessage = courseMessage.createMessage()
      .addRecipient(this.env[dataSet.STUDENT].familyName, this.env[dataSet.STUDENT].id)
      .setMessage(sendMessage);
    profile.record('Added recipient and input message body (ignore)'); // ignore the step to add recipient and input message content
    createMessage.send();
    profile.record('Created new message');

    // TODO: add it back when backend migrated to db
    // Test fails because this is extremely slow, DELETE REST may costs 4.4 mins on perf-ultra.bbpd.io
    // That's why it timeout (30000 ms).
    // // In backend, it deletes the conversation, and all its messages, and need to maintain
    // read/unread count. It need to read/delete a number of files, That should be the reason why it is slow.
    //courseMessage.deleteFirstMessage();
    //profile.record('Deleted message');

    course.close();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }
}