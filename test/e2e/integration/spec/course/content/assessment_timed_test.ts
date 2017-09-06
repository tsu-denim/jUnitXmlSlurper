import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');

describe('Timed Assessment', function() {

  it('Instructor can create timed test PTID=557', testUtil.createTest((create) => {
    // Instructor creates a test and then enable the timed test.
    var env = create.course().with.instructor().and.student().and.test().exec();
    var time = 5;
    var assessmentEditorPage = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor();

    var timedAssessment = assessmentEditorPage
      .openSettingsPanel()
      .clearFTUE()
      .enableTimeLimit(time);

    timedAssessment.assertTimeLimit(time + ' minutes');
  }));

  it('Student can work on the timed assessment PTID=558', testUtil.createTest((create) => {
    // Student can see the timed info on the peek panle.
    var timeNumber = 10;
    var env = create.course().with.instructor().and.student().and.test()
      .with.timeLimit({from: 'instructor', time: timeNumber, timerCompletion: 'H'}).exec();
    var testViewPage = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .startAttempt(false, true);

    testViewPage.assertTimeLimitNumber(timeNumber + ' minutes');
    testViewPage.assertRemaingTime(timeNumber + ' minutes remaining');

    // Student can save & submit timed assessment and gets info.
    var testAttemptPage = testViewPage.saveTimedAssessment();

    testAttemptPage.continueAttempt()
      .submit()
      .assertStartAttemptFooterDoesNotExist()
      .assertSubmissionCard();
  }));

});