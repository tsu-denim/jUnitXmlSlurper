import testUtil = require('../../../test_util');
import controls = require('../../index');

import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        waitFor(() => {
          return browserSync.executeScript<boolean>(() => {
            return $('[name=bb-base-admin-iframe]').height() > 0;
          });
        }, 30000);
        try {
          browserSync.switchTo().frame(elementSync.findVisible('[name="bb-base-admin-iframe"]'));
          this.rootElement = elementSync.findVisible('.locationPane').closest('body');
        } finally {
          browserSync.switchTo().defaultContent();
        }
      }
    }
  }

  createCourse(args: { name: string; id: string; enabled: boolean; }) {
    this._frameFocus();

    // NOTE: One theory Trevor had was that the scrolling failed (see submitClassicForm comments) because
    // the VTBE wasn't fully loaded when we try to submit (initializing the VTBE happens asynchronously)
    // But waiting for it to load doesn't seem to work all the time either.  Leaving this hack here _for_now_
    // TODO: Ideally I would like a generic testUtil.waitForClassicVTBE('courseDesc') but this works on this page
    // and isn't the correct work-everywhere check.  TODO - make this better
    this.rootElement.findVisible('#courseDesctext_toolbargroup'); // VTBE
    this.rootElement.findVisible('#courseDesctext_ifr'); // VTBE
    this.rootElement.findVisible('#courseDesctext_charCounter'); //  VTBE
    this.rootElement.findVisible('#courseDesctext_tbl'); //  VTBE
    // NOTE: We're waiting because the initialization of the VTBE changes the height of the screen.  If we
    // hit the submitClassicForm step before the initialization is complete then it might scroll
    // and then the editor initializes, and then we click, and it doesn't work.  Even this hack doesn't work 'well enough' though.
    // because sometimes it still doesn't scroll the button into view.  It appears to work more frequently with this but
    // I may be imagining that.  Remove the above lines if the iframe fix is done.. Granted, it would still be a good idea
    // to have a wait-for-vtbe function so that we could write tests that interact with it.
    // When it does fail, the browser has double-vertical-scrollbars: One for the whole page, one for the create-course iframe.
    // I wonder if maybe that is the real root cause - some timing issue with our iframe code (I believe we resize it dynamically?)
    // END VTBE TODO

    this.rootElement.findVisible('#courseName').sendKeys(args.name);
    this.rootElement.findVisible('#courseId').sendKeys(args.id);

    if (args.enabled) {
      this.rootElement.findVisible('#available_yes').click();
    } else {
      this.rootElement.findVisible('#available_no').click();
    }

    testUtil.submitClassicForm(this.rootElement);

    this._frameRelease();

    return new controls.AdminCoursesPage.Control();
  }

  private _frameFocus() {
    browserSync.switchTo().frame(elementSync.findVisible('[name="bb-base-admin-iframe"]'));
    this.rootElement = elementSync.findVisible('.locationPane').closest('body');
  }

  private _frameRelease() {
    browserSync.switchTo().defaultContent();
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}