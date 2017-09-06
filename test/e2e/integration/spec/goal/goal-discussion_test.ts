//ToDO - erroring out so bring these e2es into goals_test.ts
/*
import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import enums = require('../../../controls/enums/index');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('Goal alignment with discussion', function() {

  // ULTRA-18941 Goals are not always immediately ready for alignment after creation
  it('Instructor can align goals for Discussion (#defer) PTID=115', testUtil.createTest((create) => {
    let goalSet = create.goalSet();
    try {
      let env = goalSet.goalCategory().goal().and.goal().exec();
      env = create.course().with.instructor().and.
        discussion({from: 'instructor', overrides: {visibility: enums.Visibility.Visible}}).exec();
      let discussionSettingsPanel = testUtil.loginBaseCourses(env.user).openCourse(env.course.id).openDiscussions()
        .openEditFirstDiscussionPanel().openDiscussionSettings();

      let goalPicker = discussionSettingsPanel.addGoals();
      env.goals.forEach(goal => goalPicker.selectGoal(goal.stdId));
      goalPicker.submit();
      polledExpect(() => discussionSettingsPanel.getNumOfGoals()).toBe(2);
      let goalAlignment = discussionSettingsPanel.viewGoals();
      polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
      goalAlignment.getGoal(env.goal.stdId).checkContents(env);
    } finally  {
      goalSet.delete().exec();
    }
  }));

  // ULTRA-18941. Goals are not always immediately ready for alignment after creation
  it('Instructor can edit aligned goals for Discussion (#defer) PTID=117', testUtil.createTest((create) => {
    let goalSet = create.goalSet();
    try {
      let env = goalSet.goalCategory().goal().and.goal().exec();
      env = create.course().with.instructor().and.
        discussion({from: 'instructor', overrides: {visibility: enums.Visibility.Visible}}).alignGoals(env.goals).exec();
      let discussionSettingsPanel = testUtil.loginBaseCourses(env.user).openCourse(env.course.id).openDiscussions()
        .openEditFirstDiscussionPanel().openDiscussionSettings();

      polledExpect(() => discussionSettingsPanel.getNumOfGoals()).toBe(2);
      let goalAlignment = discussionSettingsPanel.viewGoals();
      polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
      let goal = goalAlignment.getGoal(env.goal.stdId);
      goal.checkContents(env);
      goal.delete();
      polledExpect(() => goalAlignment.getNumOfGoals()).toBe(1);
      goalAlignment.addGoals().selectGoal(env.goal.stdId).submit();
      polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
    } finally  {
      goalSet.delete().exec();
    }
  }));

  // ULTRA-18941 Goals are not always immediately ready for alignment after creation
  it('Student can see align goals for Discussion (#defer) PTID=116', testUtil.createTest((create) => {
    let goalSet = create.goalSet();
    try {
      let env = goalSet.goalCategory().goal().and.goal().exec();
      env = create.course().with.instructor().and.student()
        .and.discussion({from: 'instructor', overrides: {visibility: enums.Visibility.Visible}}).alignGoals(env.goals).exec();
      let discussionSettingsPanel = testUtil.loginBaseCourses(env.student).openCourse(env.course.id).openDiscussions()
        .openEditFirstDiscussionPanel();

      let goalAlignment = discussionSettingsPanel.viewGoals();
      polledExpect(() => goalAlignment.getNumOfGoals()).toBe(2);
      goalAlignment.getGoal(env.goal.stdId).checkContents(env);
    } finally  {
      goalSet.delete().exec();
    }
  }));

});
*/
