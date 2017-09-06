import _ = require('lodash');
import controls = require('../../../index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  public rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.create-group-panel');
    }
  }

  getGroups() {
    return this.rootElement.findVisibles('.single-group').map(groupElement => new Group(groupElement));
  }

  getGroupByTitle(title: string) {
    return _.find(this.getGroups(), group => group.getTitle() === title);
  }

  getUnassignedUsers() {
    return this.rootElement.findVisible('.unassigned-member-list').findVisibles('bb-group-user').map(e => new User(e));
  }

  /*
   * Verifies the number of new groups created for a discussion
   */
  assertNumberOfGroups(value: number) {
    polledExpect(() => this.rootElement.findVisibles('.single-group').length).toBe(value);
    return this;
  }

  /*
   * Verifies that no assigned student is listed on the page
   */
  assertNoUnassignedStudent() {
    this.rootElement.assertElementDoesNotExist('.unassigned-member-list .bb-group-user');
    return this;
  }

  save() {
    this.rootElement.findVisible('.panel-footer-right button.js-done').waitUntil(':enabled').click().waitUntilRemoved();
    //Note.  We do not know which screen you came from so we will not return anything (You can assign groups to assessments or discussions).
    //So please create a reference to your desired control in the calling method after this return.
  }

  openAssignOptions() {
    this.rootElement.findVisible('button[data-dropdown="assign-options"]').click();
    return this;
  }

  selectRandomlyAssign() {
    this.rootElement.findVisible('.js-random').click();
    return this;
  }

  chooseRandomNumber(n: number) {
    this.rootElement.findVisible('button[data-dropdown="random-options"]').click();
    this.rootElement.findVisible(`.js-random-${n}`).click();
    return this;
  }

  getReuseOptions() {
    return this.rootElement.findVisibles('.js-reuse-option').map(e => e.getText());
  }

  reuseFromContent(title: string) {
    _.find(this.rootElement.findVisibles('.js-reuse-option'), e => e.getText().indexOf(title) > -1).click();
    this.rootElement.findVisible('.panel-footer-right button.js-done').waitUntil(':enabled');
    return this;
  }

}

class Group {
  constructor(private element: ElementFinderSync) {}

  getUsers() {
    return this.element.findVisibles('bb-group-user').map(userElement => new User(userElement));
  }

  getTitle() {
    return this.element.findVisible('span.group-name').getText();
  }

  setTitle(title: string) {
    let editButton = this.element.findElement('.edit-title[ng-click]');
    editButton.scrollIntoView();
    browserSync.getBrowser().actions().mouseMove(editButton.getElementFinder().getWebElement()).perform();
    editButton.click();
    this.element.findVisible('input[ng-model="group.title"]').clear().sendKeys(title).sendEnterKey();
    return this;
  }

  assertNoUsers() {
    this.element.assertElementDoesNotExist('bb-group-user');
    return this;
  }

  assertGroupNotEditable() {
    browserSync.getBrowser().actions().mouseMove(this.element.findElements('.element-list-row')[0].getElementFinder().getWebElement()).perform();
    this.element.findVisible('.edit-title.disabled-clickable');
    this.element.findVisible('.right.disabled-clickable');
    return this;
  }

  delete() {
    browserSync.getBrowser().actions().mouseMove(this.element.findVisible('bb-overflow-menu').getElementFinder().getWebElement()).perform();
    this.element.findVisible('bb-overflow-menu').click();
    elementSync.findVisible('[analytics-id="global.delete"]').click();
    return new controls.OverflowMenuDeleteConfirmation.Control().ok();
  }

  addNewGroup() {
    let addButton = this.element.findElement('.js-show-add-options');
    browserSync.getBrowser().actions().mouseMove(addButton.getElementFinder().getWebElement()).perform();
    addButton.click();
    return this;
  }
}

class User {
  constructor(private element: ElementFinderSync) {}

  select() {
    this.element.click();
    return this;
  }

  openDropdown() {
    this.element.scrollIntoView().findVisible('button[data-dropdown]').click();
    return this.element;
  }

  addToNewGroup() {
    this.openDropdown().findVisible('.js-create-group').click();
    return this;
  }

  unassign() {
    this.openDropdown().findVisible('.js-unassign').click();
    return this;
  }
  moveToGroup(group: Group) {
    this.openDropdown().findVisible('a[title="' + group.getTitle() + '"]').click();
    return this;
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}