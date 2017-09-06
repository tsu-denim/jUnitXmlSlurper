import testUtil = require('../../../../test_util');
import enums = require('../../../../controls/enums/index');
import {browser} from 'protractor';
import {GradedDiscussionSubmissionDetail} from '../../../../controls/index';
import {EngagementSubmissionsController} from '../../../../../../app/features/course/engagement/grade/submissions/engagement-submissions-controller';
import {until} from 'selenium-webdriver';
import elementIsNotVisible = until.elementIsNotVisible;
import {elementSync, polledExpect} from 'protractor-sync';

describe('For the graded discussion', function() {

  it('instructor can post grade on student discussion grade page, then student view grade (#avalon) PTID=6', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'graded_discussion';
    var gradeScore = '80';
    var env = create.course().with.student().and.instructor()
      .and.discussion({
        from: 'instructor',
        overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}
      }).with.enableGradedDiscussion({from: 'instructor'})
      .exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .openParticipationAndGradePanel()
      .clearFTUE()
      .enterGrade({studentId: env.student.id, grade: gradeScore})
      .postGrade(env.student.id);

    //student view grade
    testUtil.logout();
    var discussionDetailPanel = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel();

    discussionDetailPanel.assertGraded();
  }));

  it('instructor can adds feedback while grading student PTID=8', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'graded_discussion';
    var comment = 'Great';

    //instructor can adds feedback while grading student 
    var env = create.course().with.student().and.instructor()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.enableGradedDiscussion({from: 'instructor'})
      .with.comment({from: 'student'})
      .with.gradeStudentInGradedDiscussion()
      .with.postGradeForStudentInGradedDiscussion()
      .exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .openParticipationAndGradePanel()
      .openSubmission(env.student.id)
      .feedback({studentId: env.student.id, value: comment});
  }));

  it('instructor can toggle the visibility of the score recommendation off (#new) PTID=963', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'graded_discussion';

    var env = create.course().with.student().and.instructor()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.enableGradedDiscussion({from: 'instructor'})
      .with.comment({from: 'student'})
      .with.gradeStudentInGradedDiscussion()
      .with.postGradeForStudentInGradedDiscussion()
      .exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .openParticipationAndGradePanel()
      .openSubmission(env.student.id)
      .toggleScoreRecomendation()
      .toggleScoreRecomendation();
  }));

  it('student can view the feedback PTID=32', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'graded_discussion';
    var feedbackText = 'good job';
    var discussionWithPostedGrade = create.course().with.student().and.instructor()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.enableGradedDiscussion({from: 'instructor'})
      .with.comment({from: 'student'})
      .with.gradeStudentInGradedDiscussion({
        feedbackToUser: {rawText: feedbackText}
      })
      .with.postGradeForStudentInGradedDiscussion();

    var env = discussionWithPostedGrade.exec();
    discussionWithPostedGrade.with.postFeedbackForStudentInGradedDiscussion(feedbackText).exec();

    //student view the feedback from instructor
    var discussionDetailPanel = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel();
    
    discussionDetailPanel.assertFeedBack();
  }));

  it('instructor can remove grade from grade discussion, then student view his/her grade is removed PTID=13', testUtil.createTest((create) => {
    var discussionTitle = testUtil.PREFIX + 'graded_discussion';
    var env = create.course().with.student().and.instructor()
      .and.discussion({from: 'instructor', overrides: {title: discussionTitle, visibility: enums.Visibility.Visible}})
      .with.enableGradedDiscussion({from: 'instructor'})
      .with.comment({from: 'student'})
      .with.gradeStudentInGradedDiscussion()
      .with.postGradeForStudentInGradedDiscussion()
      .exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel()
      .openParticipationAndGradePanel()
      .clearFTUE()
      .enterGrade({studentId: env.student.id, grade: ''});

    //student view grade
    testUtil.logout();
    var discussionDetailPanel = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .openDiscussions()
      .openEditFirstDiscussionPanel();

    discussionDetailPanel.assertNoGrade();
  }));

});