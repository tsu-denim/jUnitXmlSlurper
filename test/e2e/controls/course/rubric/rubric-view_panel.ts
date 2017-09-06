import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.rubric-view');
    }
  }

  openCriteriaAtIndex(index: number) {
    this.getCriteriaAtIndex(index).click();

    return this;
  }

  assertCriteriaOpen(index: number) {
    var criteriaAtIndex = this.getCriteriaAtIndex(index);

    polledExpect(() => criteriaAtIndex.hasClass('active')).toBe(true);

    return this;
  }

  assertCriteriaNotOpen(index: number) {
    var criteriaAtIndex = this.getCriteriaAtIndex(index);

    polledExpect(() => criteriaAtIndex.hasClass('active')).toBe(false);

    return this;
  }

  private getCriteriaAtIndex(index: number) {
    return this.rootElement.findElements('li.accordion-navigation')[index];
  }

  assertCriteriaAchievementsShown(index: number) {
    polledExpect(() =>
      this.getCriteriaAtIndex(index).findVisibles('.content.menu[aria-hidden="false"] .rubric-cell').length).toBeGreaterThan(0);

    return this;
  }

  assertAchievementPointsShown() {
    this.rootElement.findVisibles('.content.menu[aria-hidden="false"] .rubric-cell .grade-pill');

    return this;
  }

  assertMaximumPointsHeader(points: string) {
    polledExpect(() => this.rootElement.findVisible('.point-total-points').getText().trim().split(' ')[0]).toBe(points);

    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}