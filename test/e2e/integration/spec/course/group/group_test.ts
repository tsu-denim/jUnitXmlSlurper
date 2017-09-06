import controls = require('../../../../controls/index');
import enums = require('../../../../controls/enums/index');
import testUtil = require('../../../../test_util');
import create = require('../../../../test_data/create');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('Ultra groups', function() {
  it('can be assigned to and deleted from an assessment (#avalon) PTID=396', testUtil.createTest(create => {
    let env = createCourseAndStudents(create).test().exec();
    let settingsPanel = testUtil.loginBaseCourses(env.instructor).openCourse(env.course.id).getOutline().getContentItem(env.test.title)
      .openAssessmentAsEditor().openSettingsPanel();
    settingsPanel.makeGroupAssessment().assertNumberOfGroups(3).save();
    polledExpect(() => settingsPanel.getNumOfGroups()).toBe(3);

    settingsPanel.done();
    let assessmentPanel = new controls.EditAssessmentPanel.Control();
    polledExpect(() => assessmentPanel.getNumOfGroups()).toBe(3);
    polledExpect(() => assessmentPanel.getGradeCategory()).toBe('Test');

    assessmentPanel.openSettingsPanel().deleteGroups().assertNoGroups();
  }));

  it('can be edited by an instructor PTID=399', testUtil.createTest(create => {
    let env = createCourseAndStudents(create).test().exec();
    let settingsPanel = testUtil.loginBaseCourses(env.instructor).openCourse(env.course.id).getOutline().getContentItem(env.test.title)
      .openAssessmentAsEditor().openSettingsPanel();
    let groupPanel = settingsPanel.makeGroupAssessment().assertNumberOfGroups(3);
    groupPanel.getGroups()[0].addNewGroup();
    polledExpect(() => groupPanel.getGroups()[1].getTitle()).toBe('New Group 4');
    groupPanel.assertNumberOfGroups(4);
    groupPanel.getGroups()[3].setTitle('Last Group');
    groupPanel.getGroups()[0].delete();
    groupPanel.assertNumberOfGroups(3).save();

    groupPanel = new controls.EditAssessmentSettingsPanel.Control().openGroupAssessment();
    groupPanel.assertNumberOfGroups(3);
    polledExpect(() => groupPanel.getGroups()[0].getTitle()).toBe('New Group 4');
    polledExpect(() => groupPanel.getGroups()[2].getTitle()).toBe('Last Group');
  }));

  it('can move students between groups PTID=400', testUtil.createTest(create => {
    let env = createCourseAndStudents(create).discussion({from: 'instructor', overrides: {visibility: enums.Visibility.Visible}}).exec();
    let settingsPanel = testUtil.loginBaseCourses(env.instructor).openCourse(env.course.id).openDiscussions()
      .openEditFirstDiscussionPanel().openDiscussionSettings();

    let groupPanel = settingsPanel.clickMakeDiscussionGroups().assertNumberOfGroups(3);
    groupPanel.openAssignOptions().selectRandomlyAssign().chooseRandomNumber(5);
    groupPanel.assertNumberOfGroups(5);
    polledExpect(() => groupPanel.getGroups().every(group => group.getUsers().length === 2)).toBe(true);

    let group1 = groupPanel.getGroupByTitle('New Group 1');
    let group2 = groupPanel.getGroupByTitle('New Group 2');
    let group3 = groupPanel.getGroupByTitle('New Group 3');
    let group4 = groupPanel.getGroupByTitle('New Group 4');

    group1.getUsers().forEach((user, i, users) => {
      user.select();
      if (i === users.length - 1) {
        user.moveToGroup(group3);
      }
    });
    group1.assertNoUsers();
    polledExpect(() => group3.getUsers().length).toBe(4);

    group2.getUsers().forEach((user, i, users) => {
      user.select();
      if (i === users.length - 1) {
        user.unassign();
      }
    });
    group2.assertNoUsers();
    polledExpect(() => groupPanel.getUnassignedUsers().length).toBe(2);

    group4.getUsers()[0].addToNewGroup();
    groupPanel.assertNumberOfGroups(6);
    polledExpect(() => groupPanel.getGroupByTitle('New Group 6').getUsers().length).toBe(1);

    groupPanel.getUnassignedUsers()[0].moveToGroup(group1);
    polledExpect(() => group1.getUsers().length).toBe(1);

    groupPanel.save();
    groupPanel = new controls.DiscussionSettings.Control().openGroupDiscussion();
    groupPanel.assertNumberOfGroups(6);
    polledExpect(() => groupPanel.getUnassignedUsers().length).toBe(1);
  }));

  it('can be reused from other contents PTID=402', testUtil.createTest(create => {
    let env = createGroupContents(create).assignment({resultName: 'newAssignment'}).exec();
    let settingsPanel = testUtil.loginBaseCourses(env.instructor).openCourse(env.course.id).getOutline().getContentItem((<any>env).newAssignment.title)
      .openAssessmentAsEditor().openSettingsPanel();
    let groupPanel = settingsPanel.makeGroupAssessment();

    groupPanel.openAssignOptions();
    let reuseOptions = groupPanel.getReuseOptions();
    let counts = [0, 0, 0];
    let patterns = [/^Discussion:/, /^Assignment:/, /^Test:/];
    reuseOptions.forEach(text => {
      for (let i = 0; i < patterns.length; i++) {
        if (patterns[i].test(text)) {
          counts[i]++;
        }
      }
    });
    polledExpect(() => counts).toEqual([2, 2, 2]);

    groupPanel.reuseFromContent(env.discussion.title);
    groupPanel.assertNumberOfGroups(2);

    let groups = groupPanel.getGroups();
    groups[0].getUsers()[0].moveToGroup(groups[1]);
    groups[1].addNewGroup();
    polledExpect(() => groups[0].getUsers().length).toBe(4);
    polledExpect(() => groups[1].getUsers().length).toBe(6);
    groupPanel.assertNumberOfGroups(3).save();
    new controls.EditAssessmentSettingsPanel.Control().openGroupAssessment().assertNumberOfGroups(3);
  }));

  it('won\'t be affected if reused by other contents PTID=403', testUtil.createTest(create => {
    let env = createGroupContents(create).discussion({from: 'instructor', overrides: {visibility: enums.Visibility.Visible}, resultName: 'newDiscussion'}).exec();
    let settingsPanel = testUtil.loginBaseCourses(env.instructor).openCourse(env.course.id).openDiscussions()
      .openDiscussionPanel((<any>env).newDiscussion.title).openDiscussionSettings();
    let groupPanel = settingsPanel.clickMakeDiscussionGroups();

    groupPanel.openAssignOptions();
    let reuseOptions = groupPanel.getReuseOptions();
    let counts = [0, 0, 0];
    let patterns = [/^Discussion:/, /^Assignment:/, /^Test:/];
    reuseOptions.forEach(text => {
      for (let i = 0; i < patterns.length; i++) {
        if (patterns[i].test(text)) {
          counts[i]++;
        }
      }
    });
    polledExpect(() => counts).toEqual([2, 2, 2]);

    groupPanel.reuseFromContent(env.test.title);
    groupPanel.assertNumberOfGroups(2);

    let groups = groupPanel.getGroups();
    groups[0].getUsers()[0].moveToGroup(groups[1]);
    groups[1].addNewGroup();
    groupPanel.save();

    groupPanel = new controls.DiscussionSettings.Control().closePanel().closePanel().openOutline().getContentItem(env.test.title)
      .openAssessmentAsEditor().openSettingsPanel().openGroupAssessment();
    groupPanel.assertNumberOfGroups(2);
    polledExpect(() => groupPanel.getGroups().every(group => group.getUsers().length === 5)).toBe(true);
  }));

  function createCourseAndStudents(create: create.Create, numOfStudents = 10) {
    let course = create.course();
    course.with.instructor();
    for (let i = 0; i < numOfStudents; i++) {
      course.with.student();
    }
    return course;
  }

  function createGroupContents(create: create.Create, numOfStudents = 10, numOfEachContentType = 2, numOfGroups = 2) {
    let course = createCourseAndStudents(create, numOfStudents);
    let env = course.exec();
    let groupsOfStudents: any[] = [];
    for (let i = 0; i < numOfGroups; i++) {
      groupsOfStudents.push([]);
    }
    for (let i = 0; i < env.students.length; i++) {
      groupsOfStudents[i % numOfGroups].push(env.students[i]);
    }
    for (let i = 0; i < numOfGroups; i++) {
      course.group().memberships(groupsOfStudents[i]);
    }

    env = course.exec();

    for (let i = 0; i < numOfEachContentType; i++) {
      // add exec() to serialize content creations to avoid concurrent issues in the backend
      course.with.assignment({groups: env.groups}).exec();
      course.with.test({groups: env.groups}).exec();
      course.with.discussion({groups: env.groups, from: 'instructor', overrides: {visibility: enums.Visibility.Visible}}).exec();
    }

    return course;
  }

});
