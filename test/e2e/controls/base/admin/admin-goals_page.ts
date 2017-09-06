import testUtil = require('../../../test_util');
import controls = require('../../index');
import {ElementFinderSync, browserSync, elementSync, waitFor, polledExpect} from 'protractor-sync';
import dataBuilder = require('../../../test_data/data_builder');
import dataApi = require('../../../test_data/data_api');

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        waitFor(() => {
          return browserSync.executeScript<boolean>(() => {
            return $('[name=bb-base-admin-iframe]').height() > 0;
          });
        }, 30000);
        try {
          this._frameFocus();
        } finally {
          this._frameRelease();
        }
      }
    }
  }
  /**
   * Opens the only goal set on the goals admin panel
   *  that should be there (assuming build server cleanup and goals setup e2e have been executed in the setup suite).
   */
  openGoalSet() {
    try {
      this._frameFocus();
      let goalSetElement = this.rootElement.findVisible('a[id*="link_lrn_std_doc:doc_"]').click();
    } finally {
      this._frameRelease();
    }
    return this;
  }

  /**
   * Opens the only goal category on the goals admin panel
   *  that should be there (assuming build server cleanup and goals setup e2e have been executed in the setup suite).
   */
  openGoalCategory() {
    try {
      this._frameFocus();
      let goalCategoryPosition = this.rootElement.findVisibles('a[id*="link_lrn_std_category:subDoc_').length - 1;
      this.rootElement.findVisibles('a[id*="link_lrn_std_category:subDoc_')[goalCategoryPosition].scrollIntoView().click();

    } finally {
      this._frameRelease();
    }
    return this;
  }

  /**
   *  Creates a goal environment based on what is shown in the UI Admin Panel.
   *  Currently the DOM can only show the goal title and text, so we cannot return anything else.
   */
  generateGoalEnvFromAdminPanel() {
      this._frameFocus();
      let goals: dataApi.IGoal[] = [];
      let goalIdElements = this.rootElement.findVisibles('li[id*="lrn_std:std_');

      this.rootElement.scrollTop();

      goalIdElements.forEach((goalElement: ElementFinderSync) => {
        let goalText = goalElement.getText().split(' – ');
        let overrides = {
          stdId: 'unknown',
          title: goalText[0],
          stdText: goalText[1]
        };
        let goal = dataBuilder.generateGoal(overrides);
        goals.push(goal);
      });
      this._frameRelease();
      return goals;
  }

  private _frameFocus() {
    browserSync.switchTo().frame(elementSync.findVisible('[name="bb-base-admin-iframe"]'));
    this.rootElement = elementSync.findVisible('#contentPanel').closest('body');
  }

  private _frameRelease() {
    browserSync.switchTo().defaultContent();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
