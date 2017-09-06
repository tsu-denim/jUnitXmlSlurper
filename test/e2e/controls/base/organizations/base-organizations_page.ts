import testUtil = require('../../../test_util');
import _ = require('lodash');
import {By, ElementFinderSync, elementSync, browserSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.base-organizations');
    }
  }

  openOrganization(organizationName: string, organizationId: string) {
    this.rootElement
      .findVisible('.element-card[data-organization-id="' + organizationId + '"]')
      .findVisible(By.linkText(organizationName))
      .click();

    // check url
    polledExpect(() => browserSync.getCurrentUrl()).toMatch(/\/ultra\/organization/);
  }
}

class Small extends Control {
}

class Medium extends Control {
}

class Large extends Control {
}
