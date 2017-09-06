import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

/**
 * This is a pretty basic control class for the display-grade directive. Due to the possibility of expansion in the future
 * it makes sense to break it out of its own control now.
 */
export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  assertGrade(args: {score: string; pointsPossible: number; }) {
    return this
      ._assertScore(args.score + ' / ' + args.pointsPossible.toString());
  }

  assertGradeColor(expectedColorClass: string) {
    polledExpect(() => this.rootElement.findVisible('.wrapping-input-style').hasClass(expectedColorClass)).toBeTruthy();
  }

  _assertScore(score: string) {
    polledExpect(() =>
      this.rootElement.findVisible('.wrapping-input-style').findElement('.grade-input-display').getInnerHtml()
    ).toEqual(score);
    return this;
  }

  _assertPointsPossible(pointsPossible: number) {
    polledExpect(() =>
      parseFloat(this.rootElement.findVisible('.points-text bdi').getInnerHtml())
    ).toEqual(pointsPossible);
    return this;
  }
}

class Small extends Control {
  _assertPointsPossible() {
    polledExpect(() => this.rootElement.findElement('.points-text bdi').isDisplayed()).toEqual(false);
    return this;
  }
}

class Medium extends Control {

}

class Large extends Control {

}