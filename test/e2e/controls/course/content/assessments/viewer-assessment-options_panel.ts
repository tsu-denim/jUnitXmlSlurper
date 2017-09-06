import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

// TODO: Special case panel that can be either separate or share root element with assessment panel

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('[analytics-id="course.content.assessment.overview.detailsHeader"]')
          .closest('.bb-offcanvas-panel');
    }
  }

  close() {
    // Do nothing
  }

  assertAttemptsCount(count: number) {
    polledExpect(() =>
        parseInt(this.rootElement
        .findVisible('[analytics-id="course.content.assessment.overview.attemptsRemaining.plural"] bdi').getInnerHtml(), 10)
    ).toEqual(count);
    return this;
  }

  assertHighestScore(score: number) {
    polledExpect(() =>
      this.rootElement
        .findVisible('[analytics-id="course.content.assessment.overview.gradingHeader"]')
        .closest('.row')
        .findVisible('.no-submission-value').getInnerHtml()
    ).toEqual(score  + ' points');
    return this;
 }

  assertDueDate(dueDate: Date) {
    if (dueDate) {
      polledExpect(() =>
        new Date(this.rootElement
          .findVisible('[analytics-id="course.content.assessment.overview.dueDate"]')
          .closest('div')
          .findVisible('bb-datetime').getInnerHtml())
      ).toEqual(dueDate);
    } else {
      polledExpect(() =>
        this.rootElement
          .findVisible('[analytics-id="course.content.assessment.overview.dueDate"]')
          .closest('div')
          .findVisible('span.settings-link').getInnerHtml()
      ).toBeTruthy();
    }

    return this;
  }
}

class Mobile extends Control {

  close() {
    this.rootElement.findVisible('.bb-close').click();
  }

}

class Small extends Mobile {

}

class Medium extends Mobile {

}

class Large extends Control {

}
