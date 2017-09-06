import testUtil = require('../../../../test_util');
import config = require('../../../../../../app/config');

describe('The assessment and rubric integration', function() {
  // ULTRA-19434 flaky test
  it('allows the instructor to create a new rubric from the assessment panel PTID=291', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Cannot edit rubrics in the small breakpoint
    }
      var env = create.course()
        .with.instructor()
        .and.test().exec();

      var newRubricTitle = 'Cool Rubric';
      var anotherNewRubricTitle = 'Very Cool Rubric';

      var assessmentSettings = testUtil.loginBaseCourses(env.user)
        .openCourse(env.course.id)
        .getOutline()
        .clearInstructorFTUE()
        .getContentItem(env.test.title)
        .openAssessmentAsEditor()
        .openSettingsPanel();

    assessmentSettings.clearFTUE();
    var rubricSettings = assessmentSettings.getRubricSettings();

      rubricSettings.openRubricList()
        .openCreateRubricPanel()
        .setTitle(newRubricTitle)
        .clickSaveAndClose();

      rubricSettings.assertCurrentlySelectedRubric(newRubricTitle)
        .openActiveRubric()
        .editAndSetTitle(anotherNewRubricTitle)
        .clickSaveAndClose();

      rubricSettings.assertCurrentlySelectedRubric(anotherNewRubricTitle);
  }));

  it('prevents the instructor from editing a rubric that has been used for grading PTID=298', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; //Cannot edit rubrics in the small breakpoint
    }

    var course = create.course();

    var env = course.with.instructor()
      .and.student()
      .and.rubric({overrides: {criteriaCount: 4, achievementCount: 4}}).exec();

    var submission = course.with.test({overrides: {possible: 100}})
      .with.rubricAssociation({rubric: env.rubric})
      .and.submission({from: 'student'});

    env = submission.exec();

    env = submission.with.rubricEvaluation({from: 'instructor', rubric: env.rubric, rubricAssociationId: env.rubricAssociation.rubricAssociations[0].id, postGrade: true}).exec();

    var assessment = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor();

    var rubricSettings = assessment.openSettingsPanel()
      .getRubricSettings();

    rubricSettings.openActiveRubric()
      .assertCannotEdit()
      .closePanel();

    rubricSettings.removeActiveRubricUsedForGrading();
  }));

  it('allows the instructor to associate a rubric with a no question test that has been graded PTID=300', testUtil.createTest((create) => {
    var course = create.course();

    var env = course.with.instructor()
      .and.student()
      .and.rubric().exec();

    env = course.with.test({overrides: {possible: 100}})
      .with.submission({from: 'student'})
      .with.grade({from: 'instructor', overrides: {score: 90}}).exec();

    var assessment = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.test.title)
      .openAssessmentAsEditor();

    assessment.openSettingsPanel()
      .setRubric(env.rubric.id)
      .done();

    assessment.assertRubric(env.rubric.title);

    assessment.openSubmissionsPanel()
      .assertOverrideIndicator(env.student.id, true);
  }));

  it('allows the instructor to edit a rubric evaluation PTID=292', testUtil.createTest((create) => {
    var course = create.course();

    var env = course.with.instructor()
      .and.student()
      .and.rubric().exec();

    var submission = course.with.test({overrides: {possible: 100}})
      .with.rubricAssociation({rubric: env.rubric})
      .and.submission({from: 'student'});

    env = submission.exec();

    env = submission.with.rubricEvaluation({from: 'instructor', rubric: env.rubric, rubricAssociationId: env.rubricAssociation.rubricAssociations[0].id}).exec();

    testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .clearFTUE()
      .openSubmissionsByContentItemTitle(env.test.title)
      .openTestSubmission(env.student.id)
      .openRubricEvalPanel()
      .assertAllCriteriaClosed()
      .openAllCriteria()
      .assertAchievementInCriteriaSelected(0, 0)
      .assertHeaderValue('100')
      .selectAchievementInCriteria(0, 1)
      .assertAchievementInCriteriaSelected(0, 1)
      .assertAchievementInCriteriaNotSelected(0, 0)
      .selectAchievementInCriteria(1, 1)
      .assertHeaderValue('50');
  }));

  if (!config.features.contentCopy) {
    it('copies no question tests between courses PTID=293', testUtil.createTest((create) => {
      var course = create.course();

      var env = course.with.instructor()
        .and.student()
        .and.rubric({overrides: {criteriaCount: 4, achievementCount: 4}}).exec();

      env = course.with.test({overrides: {possible: 100}})
        .with.submission({from: 'student'}).and.rubricAssociation({rubric: env.rubric}).exec();

      env = create.course().with.instructor({enrollee: 'instructor'}).exec();

      var basePage = testUtil.loginBaseCourses(env.instructor);

      var coursePage = basePage.openCourse(env.courses[1].id);

      var outline = coursePage.getOutline()
        .openOverflowMenu()
        .openImportPanel()
        .copyAllContentsFromCourse(env.courses[0].courseId)
        .assertCopyOrImportCompleted();

      coursePage.closeCopyImportNotification();

      outline.assertContentItemExists(env.test.title);

      coursePage.openGradesAsGrader()
        .openSettingsPanel()
        .getRubricList()
        .assertRubricPresent(env.rubric.title);
    }));

    it('export then import no question tests between courses PTID=299', testUtil.createTest((create) => {
      var course = create.course();

      var env = course.with.instructor()
        .and.student()
        .and.rubric({overrides: {criteriaCount: 4, achievementCount: 4}}).exec();

      env = course.with.test({overrides: {possible: 100}})
        .with.submission({from: 'student'}).and.rubricAssociation({rubric: env.rubric}).exec();

      env = create.course().with.instructor({enrollee: 'instructor'}).exec();

      var basePage = testUtil.loginBaseCourses(env.instructor);

      basePage.openCourse(env.courses[0].id)
        .getOutline()
        .exportWithStudentData()
        .waitForExportToComplete()
        .assertCompletedExportsExist(1)
        .close()
        .closePanel();

      var newCoursePage = basePage.openCourse(env.courses[1].id);

      var outline = newCoursePage.getOutline()
        .openOverflowMenu()
        .openImportPanel()
        .uploadAndImportPackage(testUtil.pathFromUltraUIRoot(
          'node_modules/learn-import-packages/UltraWithStudentData/ArchiveFile__int_test_2453119461_20161006041906.zip'))
        .assertCopyOrImportCompleted();

      outline.assertContentItemExists('_int_test_test_5944392867');

      newCoursePage.closeCopyImportNotification();

      newCoursePage.openGradesAsGrader()
        .openSettingsPanel()
        .getRubricList()
        .assertRubricPresent('_int_test_rubric_4594187857'); // Hardcode this since we can't actually export then import.
    }));
  }
});