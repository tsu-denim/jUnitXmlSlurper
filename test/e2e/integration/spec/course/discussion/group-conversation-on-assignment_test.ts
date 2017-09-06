import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');
import create = require('../../../../test_data/create');

describe('The group conversation on assignment', function() {

  it('instructor can add comments for any group PTID=27', testUtil.createTest((create) => {
    // create group assignment with instructor, group conversation and students.
    // group conversation has 2 groups, every group has 2 students by default.
    // student1 and student2 belong to group 1, while student3 and student4 belong to group 2.
    var env = createGroupAssignment(create).with.classConversation({from: 'instructor'}).exec();
    var assignmentViewPageWithConversations = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsEditor();

    var classConversationPanel = assignmentViewPageWithConversations
      .openClassConversationPanel()
      .selectConversationGroup(0);
    classConversationPanel.assertCanSendMessage();
    classConversationPanel.close();

  }));

  it('student can add comments in own group PTID=28', testUtil.createTest((create) => {
    // create group assignment with instructor, group conversation and students.
    // group conversation has 2 groups, every group has 2 students by default.
    // student1 and student2 belong to group 1, while student3 and student4 belong to group 2.
    var env = createGroupAssignment(create).with.classConversation({from: 'instructor'}).exec();
    var group1Comment = 'Group 1 comment';

    // for group 1 student can only add comment to group 1
    testUtil.loginBaseCourses(env.students[0])
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsViewer()
      .openClassConversationPanel()
      .selectConversationGroup(1)
      .assertCanSendMessage(group1Comment)
      .assertCommentsCount(1)     // only have 1 comment
      .assertComment(group1Comment);

    testUtil.logout();

    // instructor can see all the comments which added by students
    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsEditor()
      .openClassConversationPanel()
      .selectConversationGroup(1)
      .assertCommentsCount(1)    // only have 1 comment for group 1
      .assertComment(group1Comment)
      .selectConversationGroup(2)
      .assertConversationWithoutAnyComments();    // have no comment for group 2

  }));

  it('student can view own group comments PTID=29', testUtil.createTest((create) => {
    // create group assignment with instructor, group conversation and students.
    // group conversation has 2 groups, every group has 2 students by default.
    // student1 and student2 belong to group 1, while student3 and student4 belong to group 2.
    var course = create.course();
    course.exec();

    var env = course.with.group().memberships(2).and.group().memberships(2).exec();
    var conversation = course.with.instructor().and.student().and.assignment({groups: env.groups, overrides: {visibility: enums.Visibility.Visible}});

    var group1Comment = 'Group 1 comment';
    var group2Comment = 'Group 2 comment';
    env = conversation.with.classConversation({from: 'instructor'}).comment({from: 'instructor', groupId: env.groups[0].id, overrides: {content: group1Comment}})
      .comment({from: 'instructor', groupId: env.groups[1].id, overrides: {content: group2Comment}}).exec();

    // for group 1 student can only see group 1 comment
    testUtil.loginBaseCourses(env.students[0])
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsViewer()
      .openClassConversationPanel()
      .selectConversationGroup(1)
      .assertCommentsCount(1)    // only have 1 comment for group 1
      .assertComment(group1Comment);
  }));

  it('all students can see comments in common group named Class Conversation PTID=30', testUtil.createTest((create) => {
    // create group assignment with instructor, group conversation and students.
    // group conversation has 2 groups, every group has 2 students by default.
    // student1 and student2 belong to group 1, while student3 and student4 belong to group 2.
    var env = createGroupAssignment(create).with.classConversation({from: 'instructor'}).with.comment({from: 'student'}).exec();

    // group 1 student can see class conversation comments
    testUtil.loginBaseCourses(env.students[0])
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsViewer()
      .openClassConversationPanel()
      .assertCommentsCount(1);

    testUtil.logout();
    // group 2 student can see class conversation comments
    testUtil.loginBaseCourses(env.students[1])
      .openCourse(env.course.id)
      .getOutline()
      .clearStudentFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsViewer()
      .openClassConversationPanel()
      .assertCommentsCount(1);

  }));

  function createGroupAssignment (create: create.Create, numOfGroups = 2, numOfGroupMembers = 2) {
    var course = create.course();
    course.exec();
    for (var i = 0; i < numOfGroups; i++) {
      var groups = course.with.group().memberships(numOfGroupMembers);
    }
    var env = groups.exec();
    return course.with.instructor().and.student().and.assignment({groups: env.groups, overrides: {visibility: enums.Visibility.Visible}});
  }

});