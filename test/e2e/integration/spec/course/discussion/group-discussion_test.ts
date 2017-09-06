import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');
import create = require('../../../../test_data/create');

describe('The group discussion', function() {
  it('instructor can create 3 groups by default when a course have 10+ students in discussion PTID=17', testUtil.createTest((create) => {
    // create course with instructor, discussion and 13 students
    // verify instructor can create 3 groups (by default) in discussion
    var discussionTitle = testUtil.PREFIX + 'visible_discussion';

    var course = create.course();
    course.with.instructor().and.discussion({from: 'instructor', overrides: {title: discussionTitle}});
    for (var i = 0; i < 13; i++) {
      course.with.student();
    }
    var env = course.exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .openDiscussionSettings()
      .clickMakeDiscussionGroups()
      .assertNumberOfGroups(3)
      .assertNoUnassignedStudent()
      .save();

    var discussionSettings = new controls.DiscussionSettings.Control();
    discussionSettings.assertGroupsText('3').deleteGroups().assertNoGroups();
  }));

  it('instructor can add comments for a group PTID=18', testUtil.createTest((create) => {
    // create course with instructor, group discussion and students.
    // group discussion has 2 groups, every group has 2 students by default.
    // student1 and student2 belong to group 1, while student3 and student4 belong to group 2.
    var env = createGroupDiscussion(create).exec();
    var group1Comment = 'Group 1 Discussion';

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .selectDiscussionGroup(0)
      .addComment(group1Comment)
      .saveCommentOrReply()
      .assertTheNewestComment(group1Comment);
  }));

  it('student can add comments for his/her own group PTID=19', testUtil.createTest((create) => {
    // create course with instructor, group discussion and students.
    // group discussion has 2 groups, every group has 2 students by default.
    // student1 and student2 belong to group 1, while student3 and student4 belong to group 2.
    var env = createGroupDiscussion(create).exec();
    var group1Comment = 'Group 1 Discussion';

    // for group 1 student can only add comment to group 1
    testUtil.loginBaseCourses(env.students[0])
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .addComment(group1Comment)
      .saveCommentOrReply()
      .assertCommentsCount(1)    // only have 1 comment
      .assertTheNewestComment(group1Comment);
    testUtil.logout();

    // instructor can see all the comments which added by students
    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .selectDiscussionGroup(0)
      .assertCommentsCount(1)    // only have 1 comment for group 1
      .assertTheNewestComment(group1Comment)
      .selectDiscussionGroup(1)
      .assertDiscussionWithoutAnyComment();    // have no comment for group 2
  }));

  it('student can view his/her own group comments PTID=20', testUtil.createTest((create) => {
    // create course with instructor, group discussion and students.
    // group discussion has 2 groups, every group has 2 students by default.
    // student1 and student2 belong to group 1, while student3 and student4 belong to group 2.
    var course = create.course();
    course.exec();
    var env = course.with.group().memberships(2).and.group().memberships(2).exec();
    var discussion = course.with.instructor().and.discussion({groups: env.groups, from: 'instructor', overrides: {visibility: enums.Visibility.Visible}});

    var group1Comment = 'Group 1 Discussion';
    var group2Comment = 'Group 2 Discussion';
    env = discussion.comment({from: 'instructor', groupId: env.groups[0].id, overrides: {content: group1Comment}})
                        .comment({from: 'instructor', groupId: env.groups[1].id, overrides: {content: group2Comment}}).exec();

    // for group 1 student can only see group 1 comment
    testUtil.loginBaseCourses(env.students[0])
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .assertCommentsCount(1)    // only have 1 comment for group 1
      .assertTheNewestComment(group1Comment);
  }));

  it('student should see/not see comments correctly with post first enabled in a group discussion PTID=1061', testUtil.createTest((create) => {
    let discussionTitle = testUtil.PREFIX + 'discussiontitle';
    let discussionComment = testUtil.PREFIX + 'instructorcomment';
    let discussionStudentComment = testUtil.PREFIX + 'studentcomment';

    let env = create.course().with.instructor().and.students(2)
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible, postFirst: true}}).exec();

    let discussionPanel = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel();

    //add groups to the discussion
    let settingsPanel = discussionPanel.openDiscussionSettings();
    let groupsPanel = settingsPanel.clickMakeDiscussionGroups();
    let unassigned = groupsPanel.getUnassignedUsers();
    unassigned[0].addToNewGroup();
    unassigned[1].addToNewGroup();
    groupsPanel.save();
    settingsPanel.clickSave();

    //add an instructor comment and logout
    discussionPanel.addComment(discussionComment)
      .saveCommentOrReply()
      .assertTheNewestComment(discussionComment);
    testUtil.logout();

    //login as student
    let courseDiscussionsPage = testUtil.loginBaseCourses(env.student_1)
      .openCourse(env.course.id)
      .openDiscussions();

    let editPanel = courseDiscussionsPage.openEditFirstDiscussionPanel();

    //with post first enabled, student should not see existing comments prior to posting
    editPanel
      .clearFTUEFilterParticipants()
      .clearFTUESearchParticipants()
      .assertDiscussionWithoutAnyComment();

    // add new comment by student
    editPanel
      .addComment(discussionStudentComment)
      .saveCommentOrReply();

    //A student should see discussion responses if the post first discussion setting is enabled and they have made a post.
    editPanel.assertCommentsCount(2);
    editPanel.assertTheNewestComment(discussionStudentComment);

  }));

  function createGroupDiscussion(create: create.Create, numOfGroups = 2, numOfGroupMembers = 2) {
    var course = create.course();
    course.exec();
    for (var i = 0; i < numOfGroups; i++) {
      var groups = course.with.group().memberships(numOfGroupMembers);
    }
    var env = groups.exec();

    return course.with.instructor().and.discussion({groups: env.groups, from: 'instructor', overrides: {visibility: enums.Visibility.Visible}});
  }

});