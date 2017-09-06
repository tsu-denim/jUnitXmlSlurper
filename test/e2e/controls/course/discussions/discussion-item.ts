import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  clickDelete() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    var index = this.rootElement.findVisibles('.js-menu-item-link').length - 1;
    this.rootElement.findVisibles('.js-menu-item-link')[index].click();
    this.rootElement.findVisible('.js-delete-confirm').click();
    return this;
  }

  getVisibilitySelector() {
    return new controls.VisibilitySelector.Control(this.rootElement.findVisible('.item-selector-container'));
  }

  openInsightsPanel() {
    this.rootElement.findVisible('.overflow-menu-button').click();
    this.rootElement.findVisible('a[id*=discussion-insights]').click();
    return new controls.DiscussionForumInsights.Control();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}