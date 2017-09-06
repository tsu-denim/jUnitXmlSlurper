import controls = require('../../../../controls/index');
import createSubmission = require('../../../../test_data/assessment/create-submission');
import testUtil = require('../../../../test_util');

describe('A multiple attempts assessment (instructor)', () => {
  it('can open multiple attempt peek panel from submission list page PTID=442', testUtil.createTest((create) => {
    var createTest = create.course().with.instructor().and.student().and.test({attemptCount: 3});
    createTest.exec();
    var env = createTest.with.submissions({from: 'student', count: 2}).with.grade({from: 'instructor', submissionIndex: 0, overrides: {score: 10, feedbackToUser: {rawText: 'comment'}}}).exec();
    var multipleAttemptsPanel = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .openTestMultipleAttemptsPanel(env.student.id)
      .assertAttemptsShown(2);

    multipleAttemptsPanel.getFinalGradeGradePill().assertScore('10');
    multipleAttemptsPanel.getAttemptGradeBar(1).assertGradePrivileged({value: '10'});
    multipleAttemptsPanel.getAttemptGradeBar(2).assertNoCommentToggle();
    multipleAttemptsPanel.getAttemptGradeBar(1).assertNoOverflowMenu();

    multipleAttemptsPanel.getAttemptGradeBar(2).assertGradePrivileged({value: ''});
    multipleAttemptsPanel.getAttemptGradeBar(2).assertNoCommentToggle();
    multipleAttemptsPanel.getAttemptGradeBar(2).assertNoOverflowMenu();
  }));

  it('can enter the final grade from the multiple attempt peek panel PTID=443', testUtil.createTest((create) => {
    var createTest = create.course().with.instructor().and.student().and.test({attemptCount: 3});
    createTest.exec();
    var env = createTest.with.submissions({from: 'student', count: 2}).with.grade({from: 'instructor', submissionIndex: 0, overrides: {score: 10}}).exec();

    var submissionListPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel();
    var multipleAttemptsPanel = submissionListPage.openTestMultipleAttemptsPanel(env.student.id);

    // enter the final grade on the multiple attempts panel
    multipleAttemptsPanel.getFinalGradeGradePill().enterGrade('99');
    multipleAttemptsPanel.close();

    // confirm the final grade changes are reflected on the submissions list page
    submissionListPage.assertSubmissionGrade(env.student.id, '99');
    submissionListPage.assertOverrideIndicator(env.student.id, true);
  }));

  it('can enter the attempt grade when viewing details PTID=444', testUtil.createTest((create) => {
    var createTest = create.course().with.instructor().and.student().and.test({attemptCount: 3});
    createTest.exec();
    var env = createTest.with.submissions({from: 'student', count: 2}).with.grade({from: 'instructor', submissionIndex: 0, overrides: {score: 10}}).exec();

    var multipleAttemptsPanel = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .openTestMultipleAttemptsPanel(env.student.id);

    multipleAttemptsPanel.openAttempt(2)
      .enterSubmissionGrade('100')
      .close();

    multipleAttemptsPanel.getAttemptGradeBar(2)
      .assertGradePrivileged({value: '100'});
  }));

  it('can delete a specific attempt when viewing details PTID=445', testUtil.createTest((create) => {
    var createTest = create.course().with.instructor().and.student().and.test({attemptCount: 3});
    createTest.exec();

    // have the student make two attempts on the test and the instructor grades both attempts
    var firstAttemptScore = 10;
    var secondAttemptScore = 20;
    var thirdAttemptScore = 30;
    var env = createTest.with.submissions({from: 'student', count: 3})
      .with.grade({from: 'instructor', submissionIndex: 0, overrides: {score: firstAttemptScore}})
      .and.grade({from: 'instructor', submissionIndex: 1, overrides: {score: secondAttemptScore}})
      .and.grade({from: 'instructor', submissionIndex: 2, overrides: {score: thirdAttemptScore}})
      .exec();

    var multipleAttemptsPanel = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor()
      .openSubmissionsPanel()
      .openTestMultipleAttemptsPanel(env.student.id)
      .assertAttemptsShown(3); // sanity check

    // 1) delete the first attempt and make sure the third attempt (latest) is shown

    var submissionGradingPanel = multipleAttemptsPanel.openAttempt(1); // open first attempt
    submissionGradingPanel.assertSubmissionGrade({value: firstAttemptScore.toString()});
    submissionGradingPanel.clickDelete().getModal().ok(); // delete first attempt
    submissionGradingPanel.assertSubmissionGrade({value: thirdAttemptScore.toString()}); // third attempt should be shown
    submissionGradingPanel.close();

    multipleAttemptsPanel.assertAttemptsShown(2); // second and third attempt should be shown
    multipleAttemptsPanel.getAttemptGradeBar(1).assertGradePrivileged({value: secondAttemptScore.toString()});
    multipleAttemptsPanel.getAttemptGradeBar(2).assertGradePrivileged({value: thirdAttemptScore.toString()});

    // 2) delete the third attempt and make sure the second attempt (now latest) is shown

    submissionGradingPanel = multipleAttemptsPanel.openAttempt(2); // open third attempt
    submissionGradingPanel.assertSubmissionGrade({value: thirdAttemptScore.toString()});
    submissionGradingPanel.clickDelete().getModal().ok(); // delete third attempt
    submissionGradingPanel.assertSubmissionGrade({value: secondAttemptScore.toString()}); // second attempt should be shown
    submissionGradingPanel.close();

    multipleAttemptsPanel.assertAttemptsShown(1); // second attempt should be shown
    multipleAttemptsPanel.getAttemptGradeBar(1).assertGradePrivileged({value: secondAttemptScore.toString()});

    // 3) delete the second (and final) attempt and make sure you don't see any more attempts

    submissionGradingPanel = multipleAttemptsPanel.openAttempt(1); // open second attempt
    submissionGradingPanel.assertSubmissionGrade({value: secondAttemptScore.toString()});
    submissionGradingPanel.clickDelete().getModal().ok(); // delete second attempt
    submissionGradingPanel.assertAttemptDeleted();
    submissionGradingPanel.close();

    multipleAttemptsPanel.assertAttemptsShown(0);
  }));
});