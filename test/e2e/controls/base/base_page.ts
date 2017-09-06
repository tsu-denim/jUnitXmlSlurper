import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, elementSync, Key, polledExpect, BrowserSync} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('.base');
    }
  }

  openAdmin() {
    this._clickNavMenuItem(NavItem.Admin);
    return new controls.BaseAdminPage.Control();
  }

  openCourses() {
    this._clickNavMenuItem(NavItem.Courses);
    return new controls.BaseCoursesPage.Control();
  }

  openMessages() {
    this._clickNavMenuItem(NavItem.Messages);
    return new controls.BaseMessagesPage.Control();
  }

  openCalendar() {
    this._clickNavMenuItem(NavItem.Calendar);
    return new controls.BaseCalendarPage.Control();
  }

  clickCalendarNav() {
    this._clickNavMenuItem(NavItem.Calendar);
  }

  renderCalendarBasePage() {
    return new controls.BaseCalendarPage.Control();
  }

  openOrganization() {
    this._clickNavMenuItem(NavItem.Organizations);
    return new controls.BaseOrganizationsPage.Control();
  }

  openProfile() {
    this._clickNavMenuItem(NavItem.Profile);
    return new controls.BaseProfilePage.Control();
  }

  openGrades() {
    this._clickNavMenuItem(NavItem.Grades);
    return new controls.BaseGradesPage.Control();
  }

  openInstitutionPage() {
    this._clickNavMenuItem(NavItem.Institution);
    return new controls.BaseInstitutionPage.Control();
  }

  openStream() {
    this._clickNavMenuItem(NavItem.Activity);
    return new controls.BaseActivityStreamPage.Control();
  }

  openTools() {
    this._clickNavMenuItem(NavItem.Tools);
    return new controls.BaseToolsPage.Control();
  }

  isStreamOpen() {
    return this.rootElement.findVisible('[bb-first-time-container]').hasClass('js-base-stream-container');
  }

  isAdminOpen() {
    return this.rootElement.findVisible('[bb-first-time-container]').hasClass('page-admin');
  }

  // This is for Small/Medium view, because there is no back arrow in these views.
  backFromAdmin(navItem: NavItem) {
    this._clickNavMenuItem(navItem);
    return this;
  }

  signOut() {
    this._clickNavMenuItem(NavItem.SignOut);

    elementSync.findVisible('[name=user_id]'); //Wait for the login page to load
  }

  fanOutLayers() {
    //By default clicking hits the center of the element, which doesn't work in this case because it is covered. Have to click the
    //top left corner.
    testUtil.clickPoint(this.rootElement.findVisibles('.bb-offcanvas-overlay').pop(), { x: 1, y: 1 });
    this.assertLayersShifted();

    return this;
  }

  assertLayersCount(expectedCount: number) {
    polledExpect(() => this._getLayers().length).toBe(expectedCount);

    return this;
  }

  selectLayer(layerPosition: number) {
    var layer = this._getLayers()[layerPosition - 1];
    testUtil.clickPoint(layer, { x: 1, y: 1 });

    this.assertLayersNotShifted();

    return this;
  }

  assertLayersShifted() {
    //Verify the shift-panels class was added (hard to verify panels actually shifted)
    this.rootElement.findVisible('main.shift-panels');

    return this;
  }

  assertLayersNotShifted() {
    this.rootElement.findVisible('main:not(.shift-panels)');

    return this;
  }

  assertOnlyBaseLayerVisible() {
    this.rootElement.assertElementDoesNotExist('.bb-offcanvas-panel');

    return this;
  }

  assertTopLayerStillVisible() {
    this.rootElement.findVisible('.bb-offcanvas-panel');

    return this;
  }

  pressEscWhileInTopPanel() {
    this.rootElement.findVisibles('.bb-offcanvas-panel').pop().sendKeys(Key.ESCAPE);

    return this;
  }

  closeTopPanel() {
    this.rootElement.findVisibles('.bb-close').pop().click();

    return this;
  }

  _getLayers() {
    return [this.rootElement].concat(this.rootElement.findElements('.bb-offcanvas-panel'));
  }

  _clickNavMenuItem(navItem: NavItem) {
    this._getBaseNavMenu().findVisible('a[ui-sref="' + navItem + '"]').click();
  }

  _getBaseNavMenu() {
    this.rootElement.findVisible('#slide-menu-toggle').click();
    return this.rootElement.findVisible('#side-menu');
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {
  _getBaseNavMenu() {
    return this.rootElement.findVisible('#side-menu');
  }

  backFromAdmin() {
    // Click back arrow
    this.rootElement.findVisible('.admin-back-button').click();
    return this;
  }
}

export class NavItem extends testUtil.BaseEnum {
  static Activity = new NavItem('base.recentActivity');
  static Admin = new NavItem('base.admin');
  static Calendar = new NavItem('base.calendar');
  static Courses = new NavItem('base.courses');
  static Grades = new NavItem('base.grades');
  static Institution = new NavItem('base.institution-page');
  static Profile = new NavItem('base.profile');
  static Messages = new NavItem('base.messages');
  static Organizations = new NavItem('base.organizations');
  static SignOut = new NavItem('logout');
  static Tools = new NavItem('base.tools');

  private _nav_item_enum: string; //Need to add a class member to give this class some structure to differentiate it from other
}
