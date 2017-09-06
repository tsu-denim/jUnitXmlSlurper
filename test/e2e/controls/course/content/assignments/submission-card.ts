import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    polledExpect(() => rootElement.hasClass('submission-card')).toEqual(true);
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  private _assertSubmissionCard(id: string) {
    var infoEl = this.getInfoElement();
    polledExpect(() => infoEl.hasClass('completed')).toEqual(false);
    infoEl.findVisible('[analytics-id="components.directives.submission-card.title.' + id + '"]');
    return this;
  }

  private _assertCallout(id: string) {
    var gradeCallout = this.getGradeCallout();
    polledExpect(() => gradeCallout.hasClass('na')).toEqual(true);
    gradeCallout.findVisible('[analytics-id="components.directives.grade.display-grade.' + id + '"]');
    return this;
  }

  private _assertAttemptStatus(id: string) {
    var infoEl = this.getInfoElement();
    infoEl.findVisible('[analytics-id="components.directives.submission-card.attemptStatus.' + id + '"]');
    return this;
  }

  assertNotSubmitted() {
    return this._assertSubmissionCard('UNOPENED')._assertCallout('NA');
  }

  assertPending() {
    return this._assertSubmissionCard('SUBMISSION')._assertCallout('pending-grade');
  }

  assertSubmitted() {
    return this.assertPending()._assertAttemptStatus('NEEDS_GRADING');
  }

  assertSaved() {
    return this._assertSubmissionCard('SUBMISSION')._assertCallout('NA')._assertAttemptStatus('IN_PROGRESS');
  }

  getInfoElement() {
    return this.rootElement.findVisible('.panel .info');
  }

  getGradeCallout() {
    return this.rootElement.findVisible('.panel .grade-callout');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
