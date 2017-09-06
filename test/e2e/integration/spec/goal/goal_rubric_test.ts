//ToDO - erroring out so bring these e2es into goals_test.ts
/*
import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import enums = require('../../../controls/enums/index');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('A goal alignment on rubric', function () {
// ULTRA-18941 Goals are not always immediately ready for alignment after creation
  it('can be aligned by instructor (#defer) PTID=150', testUtil.createTest((create) => {
  let goalSet = create.goalSet();
  try {
    goalSet.goalCategory().goal().and.goal().exec();
    var course = create.course();

    var env = course
        .with.instructor()
        .and.student()
        .and.rubric()
        .exec();

    env = course.with.assignment()
        .with.submission({ from: 'student' })
        .and.rubricAssociation({ rubric: env.rubric })
        .exec();

    let rubricGridPanel = testUtil.loginBaseCourses(env.instructor)
        .openCourse(env.course.id)
        .getOutline()
        .clearInstructorFTUE()
        .getContentItem(env.assignment.title)
        .openAsAssignmentAsEditor()
        .openSettingsPanel().openRubricGridPanel();
    let goalPicker = rubricGridPanel.openGoalPickPageForRubricAt(0);
    env.goals.forEach(goal => goalPicker.selectGoal(goal.stdId));
    goalPicker.submit();
    let goalAlignment = rubricGridPanel.getGoalSetting();
    polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
    goalAlignment.getGoal(env.goal.stdId).checkContents(env);
  } finally {
      goalSet.delete().exec();
  }
  }));

  // ULTRA-18941 Goals are not always immediately ready for alignment after creation
  it('can be edited by instructor (#defer) PTID=152', testUtil.createTest((create) => {
  let goalSet = create.goalSet();
  try {
    let env = goalSet.goalCategory().goal().and.goal().exec();
    var course = create.course();

    env = course
        .with.instructor()
        .and.student()
        .and.rubric().alignGoals(env.goals)
        .exec();

    env = course.with.assignment()
        .with.submission({ from: 'student' })
        .and.rubricAssociation({ rubric: env.rubric })
        .exec();
    let rubricGridPanel = testUtil.loginBaseCourses(env.instructor)
        .openCourse(env.course.id)
        .getOutline()
        .clearInstructorFTUE()
        .getContentItem(env.assignment.title)
        .openAsAssignmentAsEditor()
        .openSettingsPanel().openRubricGridPanel();
    let goalAlignment = rubricGridPanel.openGoalSettingPanelForRubricAt(0);
    polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
    let goal = goalAlignment.getGoal(env.goal.stdId);
    goal.checkContents(env);
    goal.delete();
    polledExpect(() => goalAlignment.getNumOfGoals()).toBe(1);
    goalAlignment.addGoals().selectGoal(env.goal.stdId).submit();
    polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
  } finally {
      goalSet.delete().exec();
  }
  }));

  // ULTRA-18941 Goals are not always immediately ready for alignment after creation
  it('can be viewed by student (#defer) PTID=151', testUtil.createTest((create) => {
  let goalSet = create.goalSet();
  try {
    let env = goalSet.goalCategory().goal().and.goal().exec();
    var course = create.course();

    env = course
        .with.instructor()
        .and.student()
        .and.rubric().alignGoals(env.goals)
        .exec();

    env = course.with.assignment()
        .with.submission({ from: 'student' })
        .and.rubricAssociation({ rubric: env.rubric })
        .exec();
    let assignmentPanel = testUtil.loginBaseCourses(env.student)
        .openCourse(env.course.id)
        .getOutline()
        .clearStudentFTUE()
        .getContentItem(env.assignment.title)
        .openAsAssignmentAsViewer().startSubmission();
    let alignment = assignmentPanel.openGoalSettingPanel();
    polledExpect(() => alignment.getNumOfGoals()).toBe(2);
    alignment.getGoal(env.goal.stdId).checkContents(env);
  } finally {
      goalSet.delete().exec();
  }
  }));
});
  */
