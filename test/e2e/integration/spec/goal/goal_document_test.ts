//ToDO - Erroring out so bring these E2Es into goals_test.ts
/*
import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import enums = require('../../../controls/enums/index');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('A goal alignment on document', function () {

  // ULTRA-18941 Goals are not always immediately ready for alignment after creation
  it('can be aligned by instructor (#defer) PTID=134', testUtil.createTest((create) => {
    let goalSet = create.goalSet();
    try {
      let env = goalSet.goalCategory().goal().and.goal().exec();
      env = create.course()
        .with.instructor()
        .and.student()
        .and.document({ overrides: { visibility: enums.Visibility.Visible } })
        .exec();
      let settingsPanel = testUtil.loginBaseCourses(env.user).openCourse(env.course.id)
        .getOutline().clearInstructorFTUE().getContentItem(env.document.title).openAsDocument().openSettingsPanel();
      let goalPicker = settingsPanel.addGoals();
      env.goals.forEach(goal => goalPicker.selectGoal(goal.stdId));
      goalPicker.submit();
      polledExpect(() => settingsPanel.getNumOfGoals()).toBe(2);
      let goalAlignment = settingsPanel.viewGoals();
      polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
      goalAlignment.getGoal(env.goal.stdId).checkContents(env);
    } finally {
      goalSet.delete().exec();
    }
  }));

  //ULTRA-18941 Goals are not always immediately ready for alignment after creation
  it('can be edited by instructor (#defer) PTID=136', testUtil.createTest((create) => {
    let goalSet = create.goalSet();
    try {
      let env = goalSet.goalCategory().goal().and.goal().exec();
      env = create.course()
        .with.instructor()
        .and.student()
        .and.document({ overrides: { visibility: enums.Visibility.Visible } }).alignGoals(env.goals)
        .exec();
      let settingsPanel = testUtil.loginBaseCourses(env.user).openCourse(env.course.id)
        .getOutline().clearInstructorFTUE().getContentItem(env.document.title).openAsDocument().openSettingsPanel();

      polledExpect(() => settingsPanel.getNumOfGoals()).toBe(2);
      let goalAlignment = settingsPanel.viewGoals();
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
});
  */