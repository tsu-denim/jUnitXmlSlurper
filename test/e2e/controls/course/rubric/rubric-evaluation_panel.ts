import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.rubric-evaluation-panel');
    }
  }

  selectAchievementInCriteria(criteriaIndex: number, achievementIndex: number) {
    this.getAchievementInCriteria(criteriaIndex, achievementIndex).scrollIntoView().click();

    return this;
  }

  assertAchievementInCriteriaSelected(criteriaIndex: number, achievementIndex: number) {
    this.assertAchievementInCriteriaState(criteriaIndex, achievementIndex, true);

    return this;
  }

  assertAchievementInCriteriaNotSelected(criteriaIndex: number, achievementIndex: number) {
    this.assertAchievementInCriteriaState(criteriaIndex, achievementIndex, false);

    return this;
  }

  private assertAchievementInCriteriaState(criteriaIndex: number, achievementIndex: number, selected: boolean) {
    polledExpect(() => this.getAchievementInCriteria(criteriaIndex, achievementIndex).hasClass('achievement-selected')).toBe(selected);
  }

  assertNoAchievementInCriteriaSelected(criteriaIndex: number) {
    this.rootElement.findElements('.accordion-navigation')[criteriaIndex].findVisible('.criterion-link');

    return this;
  }

  getAchievementInCriteria(criteriaIndex: number, achievementIndex: number) {
    return this.rootElement.findElements('.accordion-navigation')[criteriaIndex].findVisibles('.achievement-level')[achievementIndex];
  }

  setOverride(value: string) {
    this.rootElement.findElement('.wrapping-input-style input').clear().sendKeys(value).sendEnterKey();

    return this;
  }

  clearGrade() {
    return this.setOverride('');
  }

  assertHeaderValue(value: string) {
    polledExpect(() => this.rootElement.findElement('.wrapping-input-style input').getAttribute('value')).toEqual(value);

    return this;
  }

  assertMaxScore(value: string) {
    polledExpect(() => this.rootElement.findElement('.wrapping-input-style .max-score').getText()).toEqual('/ ' + value);

    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').scrollIntoView().click().waitUntilRemoved();
  }

  assertPanelBelowNotInteractable() {
    var totalPanels = elementSync.findElements('.bb-offcanvas-panel').length;
    var totalOverlays = elementSync.findElements('.bb-offcanvas-overlay').length;

    polledExpect(() => totalPanels).toEqual(totalOverlays);

    return this;
  }

  assertPanelBelowInteractable() {
    var totalPanels = elementSync.findElements('.bb-offcanvas-panel').length;
    var totalOverlays = elementSync.findElements('.bb-offcanvas-overlay').length;

    polledExpect(() => totalPanels - totalOverlays).toEqual(1);

    return this;
  }

  openCriteria(criteriaIndex: number) {
    var criteria = this.rootElement.findVisibles('.accordion-navigation')[criteriaIndex];
    if (!criteria.hasClass('.active')) {
      criteria.click();
    }
    return this;
  }

  openAllCriteria() {
    this.rootElement.findVisibles('.accordion-navigation').forEach((criteria: ElementFinderSync) => {
      if (!criteria.hasClass('.active')) {
        criteria.click();
      }
    });

    return this;
  }

  assertAllCriteriaClosed() {
    this.rootElement.assertElementDoesNotExist('.accordion-navigation .active');

    return this;
  }

  assertCriteriaHaveSelections() {
    this.rootElement.findVisibles('.accordion-navigation').forEach((criteria: ElementFinderSync) => {
      criteria.findVisible('.achievement-selected');
    });

    return this;
  }

  assertAchievementPointsShown() {
    this.rootElement.findVisibles('.accordion-navigation .achievement-level .grade-pill');

    return this;
  }

  assertCriteriaPoints() {
    this.rootElement.findVisibles('.accordion-navigation .rubric-criteria .grade-pill');

    return this;
  }

  assertHeaderScore() {
    this.rootElement.findVisible('.read-only-score');

    return this;
  }

  assertMaxPointsText() {
    this.rootElement.findVisible('.point-total-points');
    return this;
  }

  assertCriteriaOpen(index: number) {
    polledExpect(() => {
      return this.rootElement.findVisibles('.accordion-navigation')[index].hasClass('active');
    }).toBe(true);
    return this;
  }

  assertCriteriaClosed(index: number) {
    polledExpect(() => {
      return this.rootElement.findVisibles('.accordion-navigation')[index].hasClass('active');
    }).toBe(false);
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}