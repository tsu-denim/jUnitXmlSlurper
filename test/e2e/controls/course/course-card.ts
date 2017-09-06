import controls = require('../index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement;
    }
  }

  openUltraCourse() {
    this.rootElement.findVisible('.course-title').click();
    return new controls.CoursePage.Control();
  }

  completeCourse() {
    this.rootElement.findElement('.js-course-open').click();
    new controls.ConfirmationNeeded.Control().complete();
    return new controls.BaseCoursesPage.Control();
  }

  openClassicCourse() {
    this.rootElement.findVisible('.course-title').click();
    return new controls.ClassicCoursePage.Control();
  }

  clickCourseAndExpectCourseUnavailablePopup() {
    this.rootElement.findVisible('.course-title').click();
    this.rootElement.findVisible('.js-course-unavailable-popup');
    return this;
  }

  dismissCourseUnavailablePopup() {
    this.rootElement.findVisible('.js-confirm-course-unavailable').click();
  }

  assertPrivateForGuest() {
    polledExpect(() => this.rootElement.hasClass('not-available')).toEqual(true);
    polledExpect(() => this.rootElement.hasClass('inactive-link')).toEqual(true);
    return this;
  }

  assertPrivateForStudent() {
    return this.assertPrivateForGuest();
  }

  assertOpenForGuest() {
    polledExpect(() => this.rootElement.hasClass('available')).toEqual(true);
    polledExpect(() => this.rootElement.hasClass('inactive-link')).toEqual(false);
    return this;
  }

  assertOpenForStudent() {
    return this.assertOpenForGuest();
  }

  getTitle() {
    return this.rootElement.findVisible('.course-title').getText();
  }

  clickCourseCardAvatar() {
    this.rootElement.findVisible('.initials').click();
    return this;
  }

  assertCourseUserCardPopupContainsMessageIcon() {
    let popupCourseUserCard = this.rootElement.findVisible('div.element-card.usercard.usercard-not-clickable');
    popupCourseUserCard.findVisible('bb-svg-icon[icon="messages"]');
    return this;
  }

  clickCourseUserCardPopupMessageIcon() {
    let popupCourseUserCard = this.rootElement.findVisible('div.element-card.usercard.usercard-not-clickable');
    popupCourseUserCard.findVisible('bb-svg-icon[icon="messages"]').click();
    return new controls.CourseConversations.Control();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}
