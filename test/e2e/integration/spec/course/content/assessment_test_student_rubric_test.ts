import testUtil = require('../../../../test_util');

describe('The assessment and rubric integration for students', function() {
  it('allows students to view the rubric before taking the test PTID=294', testUtil.createTest((create) => {
    var course = create.course();

    var env = course.with.student()
      .and.rubric().exec();

    env = course.with.test()
      .with.rubricAssociation({rubric: env.rubric}).exec();

    var assessmentOverview = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .assertRubric()
      .openRubricView()
      .assertRubricViewShown();

    assessmentOverview.getRubricView()
      .assertCriteriaNotOpen(1)
      .openCriteriaAtIndex(1)
      .assertCriteriaOpen(1)
      .assertCriteriaAchievementsShown(1)
      .openCriteriaAtIndex(0)
      .assertCriteriaOpen(0)
      .assertCriteriaOpen(1)
      .assertAchievementPointsShown();

    assessmentOverview.closeRubricView();
  }));

  it('allows the student to view the rubric while taking the test PTID=295', testUtil.createTest((create) => {
    if (testUtil.getCurrentBreakpoint() !== testUtil.Breakpoint.Large) {
      return;
    }

    var course = create.course();

    var env = course.with.student()
      .and.rubric().exec();

    env = course.with.test({overrides: {possible: 10}})
      .with.rubricAssociation({rubric: env.rubric}).exec();

    var assessmentView = testUtil.loginBaseCourses(env.user)
      .openCourse(env.course.id)
      .getOutline()
      .getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .startAttempt();

    assessmentView.assertRubric()
      .openRubric()
      .openCriteriaAtIndex(1)
      .assertAchievementPointsShown()
      .assertMaximumPointsHeader('10');

    assessmentView.addText('answer');
  }));

  it('allows students to view the rubric after it has been graded PTID=296', testUtil.createTest((create) => {
    var course = create.course();

    var env = course.with.instructor()
      .and.student()
      .and.rubric({overrides: {criteriaCount: 4, achievementCount: 4}}).exec();

    var submission = course.with.test({overrides: {possible: 100}})
      .with.rubricAssociation({rubric: env.rubric})
      .and.submission({from: 'student'});

    env = submission.exec();

    env = submission.with.rubricEvaluation({from: 'instructor', rubric: env.rubric, rubricAssociationId: env.rubricAssociation.rubricAssociations[0].id, postGrade: true}).exec();

    env = submission.instructorFeedback({from: 'instructor'}).exec();

    var outline = testUtil.loginBaseCourses(env.student)
      .openCourse(env.course.id)
      .getOutline();

    var submissionPanel = outline.getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .openRubricSubmissionByLink();

    var rubricPanel = submissionPanel.getRubricEvaluationPanel()
      .assertAchievementPointsShown()
      .assertCriteriaPoints()
      .assertHeaderScore()
      .openAllCriteria()
      .assertCriteriaHaveSelections();

    if (testUtil.getCurrentBreakpoint() === testUtil.Breakpoint.Large) {
      submissionPanel.toggleComment()
        .assertGradePillHidden();
    }

    rubricPanel.close();
    submissionPanel.close();

    outline.getContentItem(env.test.title)
      .openAssessmentAsViewer()
      .openAttemptSubmissionWithRubric()
      .getRubricEvaluationPanel();
  }));
});