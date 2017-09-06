import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');

describe('A rubric', function() {
  it('can be created in the grade center, found in the list, opened, edited, saved and closed PTID=286', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Small) {
      return; // Rubric isn't editable on the small breakpoint
    }

    var env = create.course().with.instructor().exec();
    var baseCourses = testUtil.loginBaseCourses(env.instructor);

    var gradebook = baseCourses.openCourse(env.course.id)
      .openGradesAsGrader();
    gradebook.openSettingsPanel()
      .getRubricList()
      .openCreateRubricPanel()
      .setTitle('Test Rubric')
      .setFirstColumnHeading('Column 1')
      .clickSaveAndClose();

    var gradebookSettingsPanel = new controls.CourseGradesSettingsPanel.Control();
    gradebookSettingsPanel
        .getRubricList()
        .openRubricAt(0)
        .assertTitle('Test Rubric')
        .assertFirstColumnHeading('Column 1')
        .setFirstColumnHeading('Column 1 Changed')
        .clickCancelWithUnsavedChanges()
        .cancelDiscardChanges()
        .clickCancelWithUnsavedChanges()
        .discardChanges();
  }));

  it('can be attached to an assignment that is graded PTID=297', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.assignment()
      .with.submission({from: 'student'})
      .with.grade({from: 'instructor', postGrade: true})
      .exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearInstructorFTUE()
      .getContentItem(env.assignment.title)
      .openAsAssignmentAsEditor()
      .openSettingsPanel()
      .getRubricSettings()
      .createNewRubricInPeek('New Rubric');
  }));

  it('can be removed from an assignment PTID=287', testUtil.createTest((create) => {
    var course = create.course();

    var env = course
      .with.instructor()
      .and.student()
      .and.rubric()
      .exec();

    env = course.with.assignment()
      .with.submission({from: 'student'})
      .and.rubricAssociation({rubric: env.rubric})
      .exec();

    testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .clearAssignmentFTUE()
      .getContentItem(env.assignment.title)
      .openAsAssignmentAsEditor()
      .openSettingsPanel()
      .getRubricSettings()
      .removeActiveRubric();
  }));

  it('makes an exact copy of the original rubric and opens the edit panel before save PTID=288', testUtil.createTest((create) => {
    var env = create.course()
      .with.instructor()
      .and.student()
      .and.rubric({overrides: {criteriaCount: 4, achievementCount: 4}})
      .exec();

    var rubricList = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .openSettingsPanel()
      .getRubricList();

    var newRubric = rubricList.copyRubric(env.rubric.id);

    if (testUtil.getCurrentBreakpoint() !== testUtil.Breakpoint.Small) {
      newRubric.assertTitleIsSuffixed(env.rubric.title)
        .assertRowHeadersAreTheSame(env.rubric.rows)
        .assertColumnHeadersAreTheSame(env.rubric.columnHeaders)
        .assertCellsAreTheSame('0', env.rubric.rows[0].cells)
        .assertCellsAreTheSame('1', env.rubric.rows[1].cells)
        .assertCellsAreTheSame('2', env.rubric.rows[2].cells)
        .assertCellsAreTheSame('3', env.rubric.rows[3].cells);
    }

    newRubric.setTitle('rubric_copy');
    newRubric.clickSaveAndClose();
    rubricList.assertRubricCopyPresent('rubric_copy');
  }));

  it('removes the rubric association from an assignment PTID=289', testUtil.createTest((create) => {
    let course = create.course();

    let env = course
      .with.instructor()
      .and.student()
      .and.rubric()
      .exec();

    env = course.with.assignment()
      .with.submission({ from: env.students[0] })
      .and.rubricAssociation({rubric: env.rubric})
      .exec();

    let settingsPanel = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .openGradesAsGrader()
      .openSettingsPanel();

    settingsPanel
      .getRubricList()
      .assertRubricPresent(env.rubric.title)
      .deleteRubric(env.rubric.id)
      .assertRubricListEmpty();

    settingsPanel.close();

    let coursePage = new controls.CoursePage.Control();
    coursePage
      .openOutline()
      .getContentItem(env.assignment.title)
      .openAsAssignmentAsEditor()
      .openSettingsPanel()
      .getRubricSettings()
      .assertNoRubricSelected();
  }));

  it('can be evaluated on an assignment submission by an instructor PTID=290', testUtil.createTest((create) => {

    var course = create.course();

    var env = course
      .with.instructor()
      .and.student({ overrides: { id: 'student_0' } })
      .and.student({ overrides: { id: 'student_1' } })
      .and.rubric({overrides: {criteriaCount: 4, achievementCount: 4}})
      .exec();

    env = course.with.assignment()
      .with.submission({ from: env.students[0] })
      .and.rubricAssociation({rubric: env.rubric})
      .exec();

    var submissionPanel = testUtil.loginBaseCourses(env.instructor)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.assignment.title)
      .openAsAssignmentAsEditor()
      .openSubmissionsPanel()
      .clearFTUEWithUngradedItem()
      .openSubmission(env.students[0].id);

    var rubricEvaluationPanel = submissionPanel.assertGradePillHasRubric()
      .openRubricEvaluationPanel();

    rubricEvaluationPanel
      .assertMaxPointsText()
      .assertMaxScore('100')
      .assertCriteriaOpen(0)
      .assertCriteriaClosed(1)
      .assertCriteriaClosed(2)
      .assertCriteriaClosed(3)
      .assertNoAchievementInCriteriaSelected(0);

    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Large) {
      rubricEvaluationPanel.assertPanelBelowInteractable();
    } else {
      rubricEvaluationPanel.assertPanelBelowNotInteractable();
    }

    submissionPanel.assertSubmissionNavigationDisabled();

    rubricEvaluationPanel
      .selectAchievementInCriteria(0, 1)
      .assertCriteriaClosed(0)
      .assertCriteriaOpen(1)
      .assertHeaderValue('18.8')
      .close();

    submissionPanel.assertSubmissionGrade('18.8');

    rubricEvaluationPanel = submissionPanel
      .openRubricEvaluationPanel()
      .openCriteria(0)
      .assertAchievementInCriteriaSelected(0, 1)
      .assertHeaderValue('18.8')
      .clearGrade();

    rubricEvaluationPanel.close();

    submissionPanel
      .openRubricEvaluationPanel()
      .selectAchievementInCriteria(0, 0)
      .assertHeaderValue('25')
      .selectAchievementInCriteria(1, 0)
      .assertHeaderValue('50')
      .selectAchievementInCriteria(2, 0)
      .assertHeaderValue('75')
      .selectAchievementInCriteria(3, 0);

    submissionPanel
      .assertRubricEvaluationPanelClosed()
      .assertSubmissionGrade('100');
  }));
});