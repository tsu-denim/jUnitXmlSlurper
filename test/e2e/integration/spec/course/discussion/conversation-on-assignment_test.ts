import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('For the assignment', function() {
  it('instructor can enable conversation for an assessment PTID=21', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.assignment().exec();

    //enable conversation.
    var assignmentViewPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsEditor();
    var assignmentViewPageWithConversations = assignmentViewPage
      .openSettingsPanel()
      .clearFTUE()
      .enableClassConversation();
    assignmentViewPageWithConversations.assertClassConversationEnabled();
  }));

  it('instructor can add a comment in conversation PTID=22', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.assignment()
      .with.classConversation({from: 'instructor'}).exec();

    //instructor send a message in this conversation on assignment.
    var assignmentViewPageAsStudent = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.assignment.title)
      .openAssessmentAsEditor();
    var classConversationPanel = assignmentViewPageAsStudent.openClassConversationPanel();
    classConversationPanel.assertCanSendMessage();
    classConversationPanel.close();
  }));

  it('instructor can disable conversation for an assessment PTID=23', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.assignment()
      .with.classConversation({from: 'instructor'}).exec();

    //instructor create a assignment and disable conversation.
    var assignmentViewPageWithConversations = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsEditor();
    var assignmentViewPageWithoutConversations = assignmentViewPageWithConversations
      .openSettingsPanel()
      .disableClassConversation();
    assignmentViewPageWithoutConversations.assertClassConversationDisabled();
  }));

  it('student can add a comment in conversation PTID=24', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.assignment()
      .with.classConversation({from: 'instructor'}).exec();
    //student send a message in this conversation on assignment.
    var assignmentViewPageAsStudent = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.assignment.title)
      .openAssessmentAsViewer();
    var classConversationPanel = assignmentViewPageAsStudent.openClassConversationPanel();
    classConversationPanel.assertCanSendMessage();
    classConversationPanel.close();
  }));

  it('student can delete own comment in conversation PTID=25', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.assignment()
      .with.classConversation({from: 'instructor'}).with.comment({from: 'student'}).exec();
    //student send a message in this conversation on assignment, then delete it.
    var assignmentViewPageAsStudent = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.assignment.title)
      .openAssessmentAsViewer();
    var classConversationPanel = assignmentViewPageAsStudent.openClassConversationPanel();
    classConversationPanel.assertCanDeleteOnlyMessage();
    classConversationPanel.close();
  }));

  it('instructor can delete a comment from student in conversation PTID=26', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.assignment()
      .with.classConversation({from: 'instructor'}).with.comment({from: 'student'}).exec();
    //instructor delete the message from student
    var assignmentViewPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.assignment.title)
      .openAssessmentAsEditor();
    var classConversationPanel = assignmentViewPage.openClassConversationPanel();
    classConversationPanel.assertCanDeleteOnlyMessage();
    classConversationPanel.close();
  }));

});