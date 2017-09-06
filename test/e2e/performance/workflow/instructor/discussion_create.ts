import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');

import {IProfiler, TestWorkflow} from '../../test-profiler';
import Chance = require('chance');

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    profile.start();
    let chance = new Chance();

    let discussionComment = testUtil.PREFIX + 'comment';
    let discussionDefaultTitlePartText = 'New Discussion' + chance.natural({ max: 99999999999 });

    let courseList = basePage.openCourses();
    profile.record('[Memory Leak Test] Opened Courses page');

    let courseOutline = courseList.openCourse(this.env[dataSet.COURSE_A].id);
    profile.record('[Memory Leak Test] Opened course outline');

    let engagementPanel = courseOutline.openDiscussions();
    profile.record('[Memory Leak Test] Opened discussion list tab');

    var initialDiscussionPanel = engagementPanel.addNewDiscussion();
    profile.record('Open create discussion panel');
    profile.startIgnore();
    initialDiscussionPanel.setOptions({
      comment: discussionComment,
      title: discussionDefaultTitlePartText
    }).save();
    profile.endIgnore();
    initialDiscussionPanel.closePanel();

    engagementPanel.assertDiscussionItemExists(discussionDefaultTitlePartText);
    profile.record('Add a new discussion');

    courseOutline.close();
    profile.record('[Memory Leak Test] Returned to Courses page');

    profile.end();
  }
}
