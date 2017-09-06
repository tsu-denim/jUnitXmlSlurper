import _ = require('lodash');
import assert = require('assert');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

/**
 * Used to accumulate information about option of select
 */
export class SelectOption {
  value: string;
  text: string;
  index: number;
}

export class Control {
  rootElement: ElementFinderSync;

  // NOTE: unlike some other constructors, the rootElement is required here
  constructor(rootElement: ElementFinderSync) {
    assert(rootElement.is('select'));

    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  selectOptionByLabel(label: string) {
    this.rootElement.click();
    this.rootElement.findVisible('option[label="' + label + '"]').click();
  }

  selectOptionByValue(value: string) {
    this.rootElement.click();
    this.rootElement.findVisible('option[value="' + value + '"]').click();
  }

  /**
   * Returns information about current state select.
   * It includes all options with values, names and indexes.
   * If also includes information about selected option
   *
   * @returns {{all, selected}|{all: SelectOption[], selected: SelectOption}}
   */
  getOptions(): {all: SelectOption[]; selected: SelectOption} {
    var optionElements = this.rootElement.findElements('option');
    var i = 0;
    var options: SelectOption[] = _.transform (optionElements, (res: SelectOption[], opt: ElementFinderSync) => {
      var option: SelectOption = new SelectOption();
      option.value = opt.getAttribute('value');
      option.text = this.rootElement.findElement('option[value="' + option.value + '"]').getText();
      option.index = i++;
      res.push(option);
    });
    var selectedValue = this.rootElement.getAttribute('value');
    var selectedOption = _.find(options, (option: SelectOption) => option.value === selectedValue);
    return {all: options, selected: selectedOption};
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}