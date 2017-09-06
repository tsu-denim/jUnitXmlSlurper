import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, waitFor, By, Key, polledExpect} from 'protractor-sync';
import controls = require('../index');
import dataApi = require('../../test_data/data_api');

export class Control {
  rootElement: ElementFinderSync;
  goalCheckbox: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        browserSync.switchTo().frame(elementSync.findVisible('iframe[name="goal"]'));
        this.rootElement = elementSync.findVisible('#contentPanel');
      }
     }
  }

  /**
   * Given a goal id, select the goal checkbox.
   * @param:  goal - ElementFinderSync
   */
  selectGoal(goal: ElementFinderSync) {
    let goalCheckbox = new controls.LegacyCheckbox.Control(goal);
    goalCheckbox.setToChecked();
    return this;
  }

  /**
   * Given an array of goal ids, select all of the goal checkboxes (calling selectGoal above)
   * @param:  goalString
   */
  selectGoals() {
    let uiGoals = elementSync.findVisibles('[id*="listContainer_checkbox"]');
    uiGoals.forEach((goal: ElementFinderSync) =>
      this.selectGoal(goal)
    );
    return this;
  }

  submit() {
    this.rootElement.findVisible('input.submit.button-1').click();
    browserSync.switchTo().defaultContent();
    //Note.  We do not know which screen you came from so we will not return anything (You can align goals from any content type)
    //So please create a reference to your desired control in the calling method after this return.
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}