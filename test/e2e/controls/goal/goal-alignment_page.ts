import controls = require('../index');
import createBase = require('../../test_data/create_base');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';
import dataApi = require('../../test_data/data_api');

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('bb-goal-alignment');
    }
  }

  getNumOfGoals() {
    return this.rootElement.findVisibles('li.goal-list').length;
  }

  getGoals() {
    return this.rootElement.findVisibles('li.goal-list');
  }

  addGoals() {
    this.rootElement.findVisible('.add-goal button').click();
    return new controls.goalPickerPage.Control();
  }

  /**
   * Deletes a given goal out of a group of 1+ goals based on the order in the UI.
   * @param: goalNumber - goal position in UI.  (1-based)
   */
  deleteGoal(goalNumber: number) {
    let goals = this.getGoals();
    let goalToDelete = goals[goalNumber - 1];
    goalToDelete.findVisible('[icon = "trash"]').click();
    this.rootElement.findVisible('[analytics-id="global.delete"]').click().waitUntilRemoved();
  }

  /**
   * Verifies the number of goals displayed match what is expected
   */
  assertNumberOfGoalsEquals(expectedNumberOfGoals: number) {
    polledExpect(() => this.getNumOfGoals()).toBe(expectedNumberOfGoals);
  }

  /**
   * Verifies goal information from UI matches goal data passed in.
   * @params:
   *   goals - array of goals data.
   */
  assertGoalContents(goals: dataApi.IGoal[]) {
    let uiGoals = this.getGoals();
    goals.forEach((goal: dataApi.IGoal, index: number) => {
      polledExpect(() => uiGoals[index].findVisible('.js-goal-title').getText()).toBe(goal.title);
      polledExpect(() => uiGoals[index].findVisible('.goal-content').getText()).toBe(goal.stdText);
    });
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
