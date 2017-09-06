import _ = require('lodash');
import controls = require('../index');
import enums = require('../../../../app/enums/index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, Key, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  currentElementCount = -1;

  calculationElementMap: {[elementId: string]: ElementFinderSync} = Object.create(null);

  static function_element_id_prefix = 'function';
  static variable_element_id_prefix = 'variable';
  static value_element_id_prefix = 'value';

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.add-calculation-panel');
    }
  }

  /**
   * Inserts the average button into the formula editor and selects the items that are passed in the array.
   *
   * @param itemsToSelect ids of the items to be selected. i.e category or grade item ids.
   */
  addAverage(itemsToSelect: string[]) {
    this._insertAverage();

    var elementId = this._incrementCountAndAddToMap(Control.function_element_id_prefix);

    this._selectFunctionDropdownItems({ elementId: elementId, itemsToSelect: itemsToSelect });

    return this;
  }

  /**
   * Inserts the total button into the formula editor and selects the items that are passed in the array.
   *
   * @param itemsToSelect ids of the items to be selected. i.e category or grade item ids.
   */
  addTotal(itemsToSelect: string[]) {
    this._insertTotal();

    var elementId = this._incrementCountAndAddToMap(Control.function_element_id_prefix);

    this._selectFunctionDropdownItems({ elementId: elementId, itemsToSelect: itemsToSelect });

    return this;
  }

  /**
   * Inserts the maximum button into the formula editor and selects the items that are passed in the array.
   *
   * @param itemsToSelect ids of the items to be selected. i.e category or grade item ids.
   */
  addMaximum(itemsToSelect: string[]) {
    this._insertMaximum();

    var elementId = this._incrementCountAndAddToMap(Control.function_element_id_prefix);

    this._selectFunctionDropdownItems({ elementId: elementId, itemsToSelect: itemsToSelect });

    return this;
  }

  /**
   * Inserts the minimum button into the formula editor and selects the items that are passed in the array.
   *
   * @param itemsToSelect ids of the items to be selected. i.e category or grade item ids.
   */
  addMinimum(itemsToSelect: string[]) {
    this._insertMinimum();

    var elementId = this._incrementCountAndAddToMap(Control.function_element_id_prefix);

    this._selectFunctionDropdownItems({ elementId: elementId, itemsToSelect: itemsToSelect });

    return this;
  }

  /**
   * Performs a click on the average button.
   *
   * @private
   */
   _insertAverage() {
    this._clickButton('.js-average');
  }

  /**
   * Performs a click on the total button.
   *
   * @private
   */
  _insertTotal() {
    this._clickButton('.js-total');
  }

  /**
   * Performs a click on the maximum button.
   *
   * @private
   */
  _insertMaximum() {
    this._clickButton('.js-maximum');
  }

  /**
   * Performs a click on the minimum button.
   *
   * @private
   */
  _insertMinimum() {
    this._clickButton('.js-minimum');
  }

  /**
   * Performs a click on the visible button identified by buttonClass.
   *
   * @param buttonClass
   * @private
   */
  _clickButton(buttonClass: string) {
    this.rootElement.findVisible(buttonClass).scrollIntoView().click();
  }

  /**
   * Inserts the variable button into the formula editor and selects the items that are passed in the array.
   *
   * @param itemsToSelect ids of the items to be selected. i.e category or grade item ids.
   */
  addVariable(itemsToSelect: string[]) {
    this._insertVariable();

    var elementId = this._incrementCountAndAddToMap(Control.variable_element_id_prefix);

    this._selectVariableDropdownItems({ elementId: elementId, itemsToSelect: itemsToSelect });

    return this;
  }

  /**
   * Performs a click on the variable button.
   *
   * @private
   */
  _insertVariable() {
    //Click variable button
    this.rootElement.findVisible('.js-variable').scrollIntoView().click();
  }

  /**
   * Inserts one of the following available operators:
   *  Add, Subtract, Multiply, Divide, Open Parenthesis, Close Parenthesis, and Value.
   *
   * @param type operator to insert into formula editor
   * @returns {Control}
   */
  addOperator(type: enums.CalculationOperator) {
    switch (type) {
      case enums.CalculationOperator.Add:
        this.rootElement.findVisible('.js-add').scrollIntoView().click();
        break;

      case enums.CalculationOperator.Value:
        this.rootElement.findVisible('.js-value').scrollIntoView().click();

        var elementId = this._incrementCountAndAddToMap(Control.value_element_id_prefix);

        this._inputValue({ elementId: elementId, value: '100' });
        break;
    }

    return this;
  }

  /**
   * Adds a title to the calculated column
   *
   * @returns {Control}
   */
  setTitle(calculationTitle: string) {
    var titleInput = this.rootElement.findVisible('input.panel-title');
    titleInput.click().clear().sendKeys(calculationTitle);
    titleInput.sendKeys(Key.ENTER);

    return this;
  }

  /**
   * Clicks the validate link and then save button.
   *
   * @returns {Control}
   */
  validateAndSave() {
    this.rootElement.findVisible('.validate').scrollIntoView().click();
    polledExpect(() => this.rootElement.findElement('span[id="validate-status"]').isDisplayed()).toEqual(true);
    elementSync.findVisible('.js-gradebook-item-save').scrollIntoView().click().waitUntilRemoved();

    return this;
  }

  save() {
    elementSync.findVisible('.js-gradebook-item-save').scrollIntoView().click().waitUntilRemoved();

    return this;
  }

  /**
   * Adds a value to the value operator.
   *
   * @param args { elementId: id the value button; value: value to insert }
   * @private
   */
  _inputValue(args: { elementId: string; value: string }) {
    var value = this.calculationElementMap[args.elementId];

    browserSync.getBrowser().actions().mouseMove(value.getElementFinder().getWebElement()).perform();

    value.findVisible('div.grades-calculation-input-event-catch').scrollIntoView().click();

    var input = value.findVisible('input').clear().sendKeys(args.value);
    input.sendKeys(Key.TAB);
  }

  /**
   * Increments the currentElementCount and adds the element to calculationElementMap.
   *
   * @param args { elementId: elementId of the element; element: the element }
   * @private
   */
  _incrementCountAndAddToMap(elementIdPrefix: string) {
    this.currentElementCount++;

    var elementId = elementIdPrefix + this.currentElementCount;

    this.calculationElementMap[elementId] = this.rootElement.findVisible('[element-id="' + elementId + '"]');

    return elementId;
  }

  /**
   * Selects the provided items from the function dropdown content select menu for the given element.
   *
   * @param args
   * @private
   */
  private _selectFunctionDropdownItems(args: { elementId: string; itemsToSelect: string[] }) {
    var element = this.calculationElementMap[args.elementId];
    //Hover over average button
    browserSync.getBrowser().actions().mouseMove(element.getElementFinder().getWebElement()).perform();

    element.click();
    var elementContent = this.rootElement.findVisible('#' + args.elementId);

    args.itemsToSelect.forEach((id) => {
      var itemId = args.elementId + '-coursework-' + id;

      elementContent.findVisible('label[for="' + itemId + '"]')
      .scrollIntoView()
      .click();
    });
  }

  /**
   * Selects the provided items from the variable dropdown content select menu for the given element.
   *
   * @param args
   * @private
   */
  private _selectVariableDropdownItems(args: { elementId: string; itemsToSelect: string[] }) {
    var element = this.calculationElementMap[args.elementId];
    //Hover over average button
    browserSync.getBrowser().actions().mouseMove(element.getElementFinder().getWebElement()).perform();

    element.click();
    var elementContent = this.rootElement.findVisible('#' + args.elementId);

    args.itemsToSelect.forEach((id) => {
      elementContent.findVisible('#' +  args.elementId + '-coursework-' + id)
      .scrollIntoView()
      .click();
    });
  }

  // Assert the average icon is loaded or not.
  assertPageIsLoad() {
    this.rootElement.findVisible('.calculation-list button.js-average');
    return this;
  }

  // Add average from first category
  addAverageFromCategory() {
    this._insertAverage();
    let functionDropDown = elementSync.findElements('ul.formula-editor li')[0];
    functionDropDown.click();
    functionDropDown.findElements('.dropdown-select li.category')[0].click();
    return this;
  }

  close() {
    this.rootElement.closest('.bb-offcanvas-panel.active').findElement('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }
}

class Small extends Control {
  _insertAFunction(value: string) {
    var select = new controls.Select.Control(this.rootElement.findVisible('[name="functions"]'));
    select.selectOptionByValue(value);
    this.rootElement.findVisible('.js-add-func-small').scrollIntoView().click();
  }
  _insertAverage() {
    this._insertAFunction('avg');
  }

  _insertTotal() {
    this._insertAFunction('sum');
  }

  _insertMinimum() {
    this._insertAFunction('min');
  }

  _insertMaximum() {
    this._insertAFunction('max');
  }

  _insertVariable() {
    var select = new controls.Select.Control(this.rootElement.findVisible('[name="functions"]'));
    select.selectOptionByValue('col');
    this.rootElement.findVisible('.js-add-func-small').scrollIntoView().click();
  }

  addOperator(type: enums.CalculationOperator) {
    var select = new controls.Select.Control(this.rootElement.findVisible('[name="operators"]'));

    switch (type) {
      case enums.CalculationOperator.Add:
        select.selectOptionByValue(type.getOptionValue());
        this.rootElement.findVisible('.js-add-operator-small').scrollIntoView().click();
        break;

      case enums.CalculationOperator.Value:
        select.selectOptionByValue(type.getOptionValue());
        this.rootElement.findVisible('.js-add-operator-small').scrollIntoView().click();

        var elementId = this._incrementCountAndAddToMap(Control.value_element_id_prefix);

        this._inputValue({ elementId: elementId, value: '100' });
        break;
    }

    return this;
  }

}

class Medium extends Control {

}

class Large extends Control {

}