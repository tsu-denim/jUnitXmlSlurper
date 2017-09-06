import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('A multiple attempts assessment (student)', () => {
  it('can be saved as a draft by a student PTID=434', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.test({attemptCount: 3}).exec();

    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .startAttempt(true)
      .saveDraft()
      .assertContinueAttemptNumber(1)
      .continueAttempt(true)
      .openOptions()
      .assertAttemptsCount(3);
  }));

  it('can be submitted by a student for x number of attempts PTID=437', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.test({attemptCount: 3}).exec();

    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .startAttempt(true)
      .submit()
      .assertStartAttemptButton(true)
      .startAttempt(true)
      .submit()
      .assertAttemptLeft(1);
  }));

  it('only allows a student to submit up to x (max) number of attempts PTID=438', testUtil.createTest((create) => {
    var env = create.course().with.instructor().and.student().and.test({attemptCount: 2})
      .with.submissions({count: 1, from: 'student'}).exec();

    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .assertAttemptLeft(1)
      .startAttempt(true)
      .submit()
      .assertAttemptLeft(0)
      .assertStartAttemptFooterDoesNotExist();
  }));

  it('can allow an attempt to reviewed by a student PTID=439', testUtil.createTest((create) => {
    var testWithSubmissions = create.course().with.instructor().and.student().and.test({attemptCount: 2}).with.submissions({count: 1, from: 'student'});
    var env = testWithSubmissions.exec();
    testWithSubmissions.with.grade({from: 'instructor', postGrade: true, submissionIndex: 0, overrides: {score: 89}}).exec();

    testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .openSubmissions()
      .openAttemptAsViewer(1);
  }));

  it('can allow the posted final grade to be reviewed by a student PTID=440', testUtil.createTest((create) => {
    var testWithSubmissions = create.course().with.instructor().and.student().and.test({attemptCount: 2}).with.submissions({count: 1, from: 'student'});
    var env = testWithSubmissions.exec();
    testWithSubmissions.with.grade({from: 'instructor', postGrade: true, submissionIndex: 0, overrides: {score: 89}}).exec();

    var overview = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer();

    overview.getGradePill()
      .assertScore(89);

    overview.openSubmissions()
      .getReadOnlyFinalGradeGradePill()
      .assertScore(89);
  }));

  it('can allow the posted attempt grade to be reviewed by a student PTID=441', testUtil.createTest((create) => {
    var testWithSubmissions = create.course().with.instructor().and.student().and.test({attemptCount: 2}).with.submissions({count: 1, from: 'student'});
    var env = testWithSubmissions.exec();
    testWithSubmissions.with.grade({from: 'instructor', postGrade: true, submissionIndex: 0, overrides: {score: 89}}).exec();

    var overview = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer();

    overview.getGradePill()
      .assertScore(89);

    overview.openSubmissions()
      .getAttemptGradeBar(1)
      .assertGradeNonPrivileged({score: '89', pointsPossible: '100'});
  }));
});