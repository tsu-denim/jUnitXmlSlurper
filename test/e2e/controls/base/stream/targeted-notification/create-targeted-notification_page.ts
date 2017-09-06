import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.notification-wizard').closest('.bb-offcanvas-panel.full.active');
    }
  }

  enterTitle(title: string) {
    var input = this.rootElement.findVisible('#notification-title');
    input.clear().sendKeys(title);
    return this;
  }

  enterMessage(message: string) {
    var input = this.rootElement.findVisible('#notification-description');
    input.clear().sendKeys(message);
    return this;
  }

  goToNextPage() {
    this.rootElement.findVisible('.wizard-footer .next-button').click();
    return this;
  }

  selectAudienceByName(name: string) {
    var audience = this.rootElement.findVisibles('.js-audience-select-button');
    for (var index = 0; index < audience.length; index++) {
      if (audience[index].getText() === name) {
        audience[index].scrollIntoView().click();
        return this;
      }
    }
    return this;
  }

  scheduleNotification() {
    this.rootElement.findVisible('.wizard-footer .done-button').click();
    return this;
  }

  showAllAudience() {
    this.rootElement.findVisible('.show-all').click();
    return this;
  }

  selectAudienceByNameInStep2Page(name: string) {
    var audience = this.rootElement.findVisibles('.button--dashed');
    for (var index = 0; index < audience.length; index++) {
      if (audience[index].getText() === name) {
        audience[index].scrollIntoView().click();
        return this;
      }
    }
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}