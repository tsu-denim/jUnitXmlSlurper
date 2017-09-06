import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

/**
 * Basic control class for the display-grade-pill directive.
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

  assertPending() {
    polledExpect(() => this._getValue()).toEqual('Pending');
    return this;
  }

  /**
   * Asserts that the score of the grade is empty. Does not include possible points. Ex. --
   */
  assertEmpty() {
    polledExpect(() => this._getValueIgnoringPointsPossible()).toEqual('--');
  }

  /**
   * Asserts the full grade string including possible points. Ex. 10 / 10
   *
   * @param grade
   */
  assertGrade(args: { score: string; pointsPossible: string }) {
    var grade = args.score + ' / ' + args.pointsPossible;
    polledExpect(() => this._getValue()).toEqual(grade);
    return this;
  }

  assertGradeColor(expectedColorClass: string) {
    polledExpect(() => this.rootElement.findVisible('.wrapping-input-style').hasClass(expectedColorClass)).toBeTruthy();
  }

  /**
   * Asserts the score of the grade. Does not include possible points. Ex. 10
   *
   * @param score
   */
  assertScore(score: number) {
    polledExpect(() => parseInt(this._getValueIgnoringPointsPossible(), 10)).toEqual(score);
    return this;
  }

  /** Get the grade value as it is displayed, which includes the points possible */
  protected _getValue() {
    return this.rootElement.findVisible('.grade-input-display').getInnerHtml();
  }

  /** Get the grade value not including the points possible */
  private _getValueIgnoringPointsPossible() {
    return this._getValue().substring(0, (this._getValue().search('/') - 1));
  }
}

class Small extends Control {
  assertGrade(args: { score: string; pointsPossible: string }) {
    var score = parseInt(args.score, 10);
    this.assertScore(score);
    return this;
  }

  assertScore(score: number) {
    polledExpect(() => parseInt(this._getValue(), 10)).toEqual(score);
    return this;
  }
}

class Medium extends Control {

}

class Large extends Control {

}