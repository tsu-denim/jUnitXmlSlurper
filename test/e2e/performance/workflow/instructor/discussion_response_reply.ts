import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();

    let courseList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id);
    profile.record('[Memory Leak Test] Opened course outline');

    let discussionResponse = testUtil.PREFIX + 'response';
    let discussionReply = testUtil.PREFIX + 'reply';
    let discussionSubreply = testUtil.PREFIX + 'sub-reply';

    let engagementPanel = courseOutline.openDiscussions();
    profile.record('Opened discussion list tab');

    let lastDiscussion = engagementPanel.openLastDiscussion();
    lastDiscussion.assertDiscussionReady();
    profile.record('Opened last discussion');

    profile.startIgnore();
    var discussionPanel = lastDiscussion.addComment(discussionResponse);
    profile.endIgnore();
    discussionPanel.saveCommentOrReply();
    lastDiscussion.assertTheNewestComment(discussionResponse);
    profile.record('Added a response');

    profile.startIgnore();
    discussionPanel = lastDiscussion.addReplyUnderTheNewestComment(discussionReply);
    profile.endIgnore();
    discussionPanel.saveCommentOrReply();
    lastDiscussion.assertReply(discussionReply);
    profile.record('Added a reply to one response');

    profile.startIgnore();
    discussionPanel = lastDiscussion.addThirdLevelReply(discussionSubreply);
    profile.endIgnore();
    discussionPanel.saveCommentOrReply();
    lastDiscussion.assertThirdLevelReply(discussionSubreply);
    profile.record('Added a sub-reply to one response');

    lastDiscussion.close();
    profile.record('Closed discussion panel');

    courseOutline.close();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }
}
