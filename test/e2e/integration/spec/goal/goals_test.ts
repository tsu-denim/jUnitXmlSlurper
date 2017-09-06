import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import enums = require('../../../controls/enums/index');
import ab = require('asyncblock');
import dataApi = require('../../../test_data/data_api');

import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

/**
 * NOTE: These E2E tests will work on our Ultra-UI pipeline because
 *  - each run has a fresh learn instance
 *  - *EXACTLY* 1 goal set; 1 category and 2 fresh goals are created
 *  If you are looking to run these locally, you can go log into your learn as an administrator, and ensure
 *    -1 goal set that contains
 *    -1 goal category that contains
 *    -2 goals
 *  If the environment under test is not set up in the above manner, these E2Es will not work.
 *  ULTRA-24135 has been created to allow the ability to check for goal alignment readiness,
 *    making this all easier in the future
 */
let defaultSystemGoals: dataApi.IGoal[];
describe('Goal alignment', function () {
  beforeAll((done) => {
    ab(() => {
     defaultSystemGoals = generateGoalsFromAdminUI();
    }, function(err: any) {
      done();
    });
  });

  it('on question can be aligned by instructor and viewed by a student (#quarantine) PTID=147', testUtil.createTest((create) => {
    let env = create.course()
      .with.instructor()
      .and.student()
      .and.test({overrides: {visibility: enums.Visibility.Visible}}).with.question({questionType: enums.QuestionType.Essay})
      .exec();

    //Verify Goals as an Instructor
    let test = testUtil.loginBaseCourses(env.user).openCourse(env.course.id)
      .getOutline().clearInstructorFTUE().getContentItem(env.test.title).openAssessmentAsEditor();
    test.getQuestion(1)
      .goalPicker()
      .selectGoals()
      .submit();

    let goalAlignment = test.getGoalAlignment();

    goalAlignment.assertNumberOfGoalsEquals(2);
    goalAlignment.assertGoalContents(defaultSystemGoals);
    goalAlignment.deleteGoal(1);
    goalAlignment.assertNumberOfGoalsEquals(1);
    goalAlignment
      .addGoals()
      .selectGoals()
      .submit();
    goalAlignment.assertNumberOfGoalsEquals(2);
    goalAlignment.assertGoalContents(defaultSystemGoals);

    testUtil.logout();

    //Verify Goals as a Student
    let testStudentView = testUtil.loginBaseCourses(env.student).openCourse(env.course.id)
      .getOutline().clearStudentFTUE().getContentItem(env.test.title).openAssessmentAsViewer().startAttempt();

    goalAlignment = testStudentView.getGoalsForQuestion(0);
    goalAlignment.assertNumberOfGoalsEquals(2);
    goalAlignment.assertGoalContents(defaultSystemGoals);

  }));

  it('with assessment can be aligned by instructor and viewed by a student (#quarantine) PTID=144', testUtil.createTest((create) => {
    let env = create.course().with.instructor().and.student().and.test().exec();

    //Verify Goals as an Instructor
    let settingsPanel = testUtil.loginBaseCourses(env.instructor).openCourse(env.course.id)
      .getOutline().getContentItem(env.test.title).openAssessmentAsEditor().openSettingsPanel()
      .clearFTUE();

    settingsPanel.addGoals()
      .selectGoals()
      .submit();

    let goalAlignment = settingsPanel.viewGoals();

    goalAlignment.assertNumberOfGoalsEquals(2);
    goalAlignment.assertGoalContents(defaultSystemGoals);
    goalAlignment.deleteGoal(1);
    goalAlignment.assertNumberOfGoalsEquals(1);
    goalAlignment.addGoals()
      .selectGoals()
      .submit();
    goalAlignment.assertNumberOfGoalsEquals(2);
    goalAlignment.assertGoalContents(defaultSystemGoals);

    testUtil.logout();

    //Verify Goals as a Student
    let assessmentPanel = testUtil.loginBaseCourses(env.student).openCourse(env.course.id)
      .getOutline().getContentItem(env.test.title).openAssessmentAsViewer();

    goalAlignment = assessmentPanel.viewGoals();
    goalAlignment.assertNumberOfGoalsEquals(2);
    goalAlignment.assertGoalContents(defaultSystemGoals);
  }));
});

function generateGoalsFromAdminUI() {
  //sign in as an administrator to obtain goals array
  let adminUser = new testUtil.create.Create().systemAdmin().exec().user;
  let defaultSystemGoals = testUtil
    .loginBaseAdmin(adminUser)
    .openGoals()
    .openGoalSet()
    .openGoalCategory()
    .generateGoalEnvFromAdminPanel();
  testUtil.logout();
  return defaultSystemGoals;
}