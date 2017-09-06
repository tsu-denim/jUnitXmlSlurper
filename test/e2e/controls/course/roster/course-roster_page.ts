import controls = require('../../index');
import testUtil = require('../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.page-roster').closest('.bb-offcanvas-panel');
    }
  }

  assertRole(fullName: string, role: string) {
    var match = false;
    polledExpect(() => {
      this.getEnrollmentInfo().forEach(enrollment => {
        if (enrollment.name === fullName) {
          match = enrollment.role === role;
        }
      });
      return match;
    }).toEqual(true);
  }

  assertEnrollmentCount(length: number) {
    polledExpect(() => {
      return this.rootElement.findVisibles('#rosterView-list .js-roster-members-list-item').length;
    }).toEqual(length);
    return this;
  }

  assertUserAllowed(fullName: string) {
    this._assertUserAllowed(fullName, true);
  }

  assertUserNotAllowed(fullName: string) {
    this._assertUserAllowed(fullName, false);
  }

  _assertUserAllowed(fullName: string, allowed: boolean) {
    var inactive = this.rootElement.findVisible('ul.roster .element-card .username[title="' + fullName + '"]')
      .closest('.js-roster-members-list-item').hasClass('inactive');

    polledExpect(() =>  !inactive).toEqual(allowed);
  }

  assertDueDateAccommodationLink(fullName: string) {
    polledExpect(() => this.getDueDateAccommodationLink(fullName).getAttribute('analytics-id')).toBe('course.roster.listView.dueDateException');
    return this;
  }

  clearFUTE() {
    this.rootElement.findVisible('.page-roster .guidance-element-overlay').click();
    return this;
  }

  openEditRosterPanel(fullName: string) {
    // TODO Opening the user by id instead of name to avoid issues with running the tests in other locales,
    // TODO but it's a big time investment, we will do it in the future
    this.rootElement.findVisible('ul.roster li bb-username.name-title[title="' + fullName + '"]').click();
    return new controls.EditRosterPanel.Control();
  }

  openEnrollRosterPanel() {
    this.rootElement.findVisible('.js-roster-enroll-users').click();
    return new controls.EnrollRosterPanel.Control();
  }

  openInviteRosterPanel() {
    this.rootElement
      .findVisible('[data-dropdown="enroll-invite-button"]').click();
    this.rootElement
      .findVisible('a[bb-peek-sref="invite"]').click();
    return new controls.InviteRosterPanel.Control();
  }

  openAccommodationPanel(fullName: string) {
    var userRow = this.rootElement.findElement('ul.roster.list li bb-username.name-title[title="' + fullName + '"]').closest('.row');
    browserSync.getBrowser().actions().mouseMove(userRow.getElementFinder().getWebElement()).perform();

    userRow.findVisible('.overflow-menu-button').click();
    userRow.findVisible('[analytics-id="course.roster.listView.exceptions"]').click();
    return new controls.StudentAccommodationsPanel.Control();
  }

  getDueDateAccommodationLink(fullName: string) {
    return this.rootElement.findElement('ul.roster.list li bb-username.name-title[title="' + fullName + '"]').closest('.row.collapse').findVisible('div.exception a');
  }

  getEnrollmentInfo() {
    return this.rootElement.findVisibles('ul.roster li:not(.ftue-enroll)').map(li => {
      return {
        name: li.findVisible('bb-username.name-title').getText(),
        role: li.findVisible('.user-role').getText().toLowerCase()
      };
    });
  }

  switchToListView() {
    this.rootElement.findVisible('.js-label-toggle-table').click();
    return this;
  }

  removeUser(fullName: string) {
    var editRosterPanel = this.openEditRosterPanel(fullName);
    editRosterPanel.clickRemoveUserButton().ok();
    editRosterPanel.rootElement.waitUntilRemoved();
    return this;
  }

  enrollUser(familyName: string) {
    this.openEnrollRosterPanel().enroll(familyName).save();
    return this;
  }

  allowUserAccess(fullName: string, allow: boolean) {
    this.openEditRosterPanel(fullName).allowAccess(allow).save();
    return this;
  }

  setUserRole(fullName: string, role: string) {
    this.openEditRosterPanel(fullName).setRole(role).save();
    return this;
  }

  search() {
    this.rootElement.findVisible('#search-button').click();
    return this;
  }

  enterSearchText(familyName: string) {
    var input = this.rootElement.findVisible('#search-roster-field');
    input.clear().sendKeys(familyName);
    return this;
  }

  close() {
    this.rootElement.findVisible('.bb-close').click();
    this.rootElement.waitUntilRemoved();
  }

  scrollToLastGridItem() {
    var gridItems = elementSync.findVisibles('#rosterView-grid>ul>li');
    return gridItems[gridItems.length - 1].scrollIntoView();
  }

  scrollToFirstGridItem() {
    var gridItems = elementSync.findVisibles('#rosterView-grid>ul>li');
    return gridItems[0].scrollIntoView();
  }

  scrollToLastListItem() {
    var listItems = elementSync.findVisibles('#rosterView-list .js-roster-members-list-item');
    return listItems[listItems.length - 1].scrollIntoView();
  }

  scrollToFirstListItem() {
    var listItems = elementSync.findVisibles('#rosterView-list .js-roster-members-list-item');
    return listItems[0].scrollIntoView();
  }

  openRosterFilterMenu() {
    this.rootElement.findVisible('button[data-dropdown="rosters-filter"]').click();
    return this;
  }

  filterToInstructors() {
    this.openRosterFilterMenu();
    this.rootElement.findVisible('[filter-key="TEACHING"]').click();
    return this;
  }

  filterToStudents() {
    this.openRosterFilterMenu();
    this.rootElement.findVisible('[filter-key="TAKING"]').click();
    return this;
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
