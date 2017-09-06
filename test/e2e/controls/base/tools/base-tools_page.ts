import controls = require('../../index');
import enums = require('../../enums/index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.base-tools');
    }
  }

  openEnterpriseSurveys() {
    this._clickToolItem(enums.LegacyTool.LegacyToolEnum.EnterpriseSurveys);
    return new controls.Tools.enterpriseSurveys.Control();
  }

  openGoals() {
    this._clickToolItem(enums.LegacyTool.LegacyToolEnum.Goals);
    return new controls.Tools.goals.Control();
  }

  private _clickToolItem(tool: enums.LegacyTool.LegacyToolEnum) {
    return this.rootElement.findVisible('[analytics-id="' + tool.getTitle() + '"]').click();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
