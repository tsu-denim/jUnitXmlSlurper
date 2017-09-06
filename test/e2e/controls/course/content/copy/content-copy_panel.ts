import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {By, ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.panel-copy-import').closest('.side-panel-content');
    }
  }

  assertContentItemIsVisible(itemName: string) {
    this.rootElement.findVisible('.content-list').findVisible('.content-name[title="' + itemName + '"]');

    return this;
  }

  beginCopy() {
    this.rootElement.findVisible('.panel-footer').findVisible('button').click().waitUntilRemoved();

    return new controls.CourseOutlinePage.Control();
  }

  checkContentItem(itemId: string) {
    // findElement used because the visible parts of the checkbox are in pseudo elements
    this.rootElement.findElement('input[type="checkbox"][id="' + itemId + '"]').click();

    return this;
  }

  openBreadcrumbMenu() {
    this.rootElement.findVisible('.dropdown-toggle-span').click();

    return this;
  }

  selectBreadcrumbMenuItem(itemName: string) {
    this.rootElement.findVisible('.dropdown__list').findVisible('.content-name[title="' + itemName + '"]').click();

    return this;
  }

  selectBreadcrumbMenuRootItem() {
    this.rootElement.findVisible('.dropdown__list').findVisibles('.content-name')[0].click();

    return this;
  }

  selectContentItem(itemName: string) {
    this.rootElement.findVisible('.content-list').findVisible('.content-name[title="' + itemName + '"]').click();

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}