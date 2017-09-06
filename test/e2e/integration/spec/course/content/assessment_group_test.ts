import controls = require('../../../../controls/index');
import create = require('../../../../test_data/create');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('A group assessment', function() {
  it('can be submitted by a student PTID=119', testUtil.createTest((create) => {
    let env = createGroupAssessment(create).exec();
    let group = env.group;
    let [student] = group.students;
    testUtil.loginBaseCourses(student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .assertGroupName(group.title)
      .openAssessmentAsViewer()
      .assertNumberOfGroupMembers(group.students.length)
      .assertGroupMembers(group.students)
      .startAttempt()
      .addText(testUtil.PREFIX + 'student_submission')
      .submit()
      .assertGroupMembers(group.students)
      .assertStartAttemptFooterDoesNotExist()
      .assertPendingIndicator();
  }));

  it('can be graded by an instructor in group attempt detail page PTID=120', testUtil.createTest((create) => {
    let assessment = createGroupAssessment(create);
    let env = assessment.exec();
    let group = env.group;
    let [student] = group.students;
    assessment.with.questions({questionCount: 2, questionTypes: [enums.QuestionType.Essay, enums.QuestionType.Essay]}).exec();
    env = assessment.with.submission({from: student, groupId: group.id}).exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .clearFTUE()
      .assertGroups(env.groups)
      .assertAttempted(group.id)
      .assertNumberToGrade(1)
      .openTestSubmission(group.id)
      .toggleGroupMembers()
      .assertGroupMembers(group.students)
      .assertSubmitted(student)
      .toggleGroupMembers()
      .enterQuestionGrade({index: 0, value: 10})
      .enterQuestionGrade({index: 1, value: 10})
      .assertSubmissionGrade({value: '20'})
      .toggleComments()
      .addComment('comment')
      .saveComment()
      .assertCommentIcon()
      .assertSavedComment('comment')
      .toggleComments()
      .postSubmissionGrade()
      .assertGradePosted();
  }));

  it('grade and comment can be viewed by students PTID=121', testUtil.createTest((create) => {
    let assessment = createGroupAssessment(create);
    let env = assessment.exec();
    let group = env.group;
    let [s1, s2] = group.students;
    assessment.with.question({questionType: enums.QuestionType.Essay}).exec();
    let score = 99;
    let comment = 'comment';
    env = assessment.with.submission({from: s1, groupId: group.id})
      .with.grade({from: 'instructor', isGroup: true, postGrade: true, overrides: {score: score, feedbackToUser: {rawText: comment}}}).exec();

    let assessmentOverview = testUtil.loginBaseCourses(s2)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer();

    assessmentOverview
      .assertCommentIcon()
      .getGradePill()
      .assertScore(score);
    assessmentOverview
      .openAttemptSubmission()
      .toggleComment()
      .assertComment(comment)
      .assertGrade({score: score.toString(), pointsPossible: env.question.points.toString()});
  }));

  it('can be manually graded by an instructor PTID=428', testUtil.createTest((create) => {
    let env = createGroupAssessment(create).exec();
    let group = env.group;
    let [student] = group.students;
    let score = 99;

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .clearFTUE()
      .enterGroupGrade({groupId: group.id, grade: score.toString()})
      .postGrade(group.id);

    testUtil.logout();

    testUtil.loginBaseCourses(student)
      .openCourse(env.course.id)
      .openGradesAsViewer()
      .getGradePill()
      .assertScore(score);
  }));

  function createGroupAssessment(create: create.Create, numOfGroups = 2, numOfGroupMembers = 2) {
    let course = create.course();
    for (let i = 0; i < numOfGroups; i++) {
      course.with.group().memberships(numOfGroupMembers);
    }
    return course.with.instructor().and.test({groups: course.exec().groups});
  }
});