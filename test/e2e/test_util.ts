/* tslint:disable: no-var-requires */
/// <reference path="../../app/feature_config/features.d.ts" />

import _ = require('lodash');
import ab = require('asyncblock');
import assert = require('assert');
import Chance = require('chance');
import fs = require('fs');
import patchJasmineEnv = require('../utility/patch_jasmine_env');
import path = require('path');

var config = require('../../../../config/config.js');

export { default as BaseEnum } from 'bb-base-enum';
import BaseEnum from 'bb-base-enum';

export import create = require('./test_data/create');
export import createBase = require('./test_data/create_base');
import dataApi = require('./test_data/data_api');

import {ElementFinderSync, browserSync, elementSync, polledExpect, takeScreenshot, waitFor, configure} from 'protractor-sync';
import * as protractorSync from 'protractor-sync';

const DEFAULT_BREAKPOINT_WIDTH = 1366;
const DEFAULT_BREAKPOINT_HEIGHT = 1024;
const SMALL_BREAKPOINT_WIDTH = 550;
const MEDIUM_BREAKPOINT_WIDTH = 768;

if (fs.existsSync(path.join(__dirname, '../../../../config/config_override.js'))) {
  require('../../../../config/config_override.js');
}

patchJasmineEnv();

var chance = new Chance();

dataApi.setBaseUrl(browserSync.getBrowser().baseUrl);

import controls = require('./controls/index');

var window: any;
var width: any;

if (!browserSync.getBrowser().params.implicitWaitMS) {
  throw new Error('implicitWaitMS must be set!');
}

// Expose the feature switches to E2E tests
export let features: IFeatures;
import features_config = require('../../app/feature_config/features_config');
import features_override = require('../../app/feature_config/features_override');

features = Object.assign(features_config, features_override); // features_override will take precedence

var _expect = expect; //Grab a reference to expect before it is disabled (we need to use it in here)

export var IMPLICIT_WAIT_MS = browserSync.getBrowser().params.implicitWaitMS;
configure({implicitWaitMs: IMPLICIT_WAIT_MS});

export enum Breakpoint {
  Small,
  Medium,
  Large
}

export class BreakpointEnum extends BaseEnum {
  static Small = new BreakpointEnum('small');
  static Medium = new BreakpointEnum('medium');
  static Large = new BreakpointEnum('large');

  //Need to add a class member to give this class some structure to differentiate it from other enums
  private _breakpoint_enum: string;
}

export { PREFIX, pathFromUltraUIRoot } from '../utility/util';
import { PREFIX } from '../utility/util';
export var INPUT_FILE_DIR = 'test/dev_resources/files/';

export var ALPHA_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export var ALPHANUMERIC_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export var ASCII_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]';

//Track the browser object for any tests that error. This allows us to pause the browser at the end of the tests (afterAll)
//If more than one tests fail it doesn't matter, because calling pause on one browser will keep them all around.
var _errorOccurredInBrowser: any;

// Keep track of flaky failures
let flakyTests: string[] = [];

function setupBrowser() {

  browserSync.getBrowser().driver.manage().timeouts().pageLoadTimeout(180000);

  //NOTE: We don't setup an implicit wait for selenium because we want to be able to check for the existence of items without waiting
  //      This shouldn't matter practically because all of our element selection methods have their own built in polling.
  browserSync.getBrowser().waitForAngularEnabled(false);

  protractorSync.disallowExpect();

  // NOTE: To test with different breakpoints, add --breakpoint=[small,medium,large] to your grunt test:e2e command
  let breakpoint = browserSync.getBrowser().params.breakpoint ? <BreakpointEnum>BreakpointEnum.parse(browserSync.getBrowser().params.breakpoint) : null;
  let size = {
    width: DEFAULT_BREAKPOINT_WIDTH,
    height: DEFAULT_BREAKPOINT_HEIGHT
  };

  if (breakpoint) {
    switch (breakpoint) {
      case BreakpointEnum.Small:
        size.width = SMALL_BREAKPOINT_WIDTH;
        break;
      case BreakpointEnum.Medium:
        size.width = MEDIUM_BREAKPOINT_WIDTH;
        break;
    }
  }
  protractorSync.resizeViewport(size);
}

beforeAll(done => {
  ab(() => {
    setupBrowser();
  }, done);
});

afterAll((done) => {
  ab(() => {
    // Print names of any flaky tests for further investigation
    if (flakyTests.length > 0) {
      console.error('The specs which passed on retry were:');
      console.error(flakyTests);
    }
    if (_errorOccurredInBrowser && browserSync.getBrowser().params.keepBrowserOpenOnError) {
      if (browserSync.getBrowser() !== _errorOccurredInBrowser) {
        browserSync.quit(); //If the last test passed, we need to manually close the browser for it
      }

      if (browserSync.getBrowser().params.isParallelRun) {
        _errorOccurredInBrowser.pause(); //Pausing causes all browser instances currently open to stay open
        process.exit(1); //If you don't exit the process it will hang parallel runs
      } else {
        //Just leave the process hanging. The nice thing about this is if the test started the UI server, this will keep it running
        console.error('One or more errors occurred during test execution. Leaving process running for further inspection...');
      }
    } else {
      done();
    }
  });
});

beforeEach((done) => {
  ab(() => {
    globalBeforeEach();
  }, done);
});

function globalBeforeEach() {
  // Should be run before instead of after each spec, to preserve the state of the browser
  // when errors occur for further investigation
  logout(true);
}

export function createTest(test: (env: create.Create) => void) {
  // if we want to retry, take that into account when we limit the number of attempts
  let attemptLimit = browserSync.getBrowser().params.shouldRetryFailures ? config.test.e2e.retryLimit + 1 : 1; // we will always run the spec at least 1 time

  return (done: Function) => {
    ab(() => {
      for (let attempt = 1; attempt <= attemptLimit ; attempt++) {
        try {
          test(new create.Create());

          checkForBrowserErrors();

          // If we made it here, there were no expect() failure exceptions and the spec passed
          // Record flaky spec if necessary and then break
          if (attempt > 1) {
            let flakySpec = (<any> jasmine).getCurrentSpec();
            flakyTests.push(flakySpec.fullName);
          }
          break;
        } catch (err) {
          if (attempt === attemptLimit) {
            // we've finished all the retries but the spec is still failing; time to throw the error
            throw err;
          }

          const spec = (<any> jasmine).getCurrentSpec();
          console.error(sanitizeErrorMessage(err.stack));
          console.error(`Spec "${spec.fullName}" failed, retrying (attempt #${attempt + 1})`); // +1 b/c we need to account for the 1st run

          globalBeforeEach();
        }
      }
    }, function(err: any) {
      if (err) {
        //Using expect here so that we get nice output showing the name of the test that failed
        //We have to take a substring of the stack, because if it is too long it causes Jasmine to have some kind of error and not run
        //the next spec. We want to send the stack into the expect call because that will cause the report on the build server to include
        //the stack trace in the test results.
        _expect(sanitizeErrorMessage(err.stack)).toEqual('');

        if (err.state === 'unexpected alert open') {
          //We have to get rid of the alert, otherwise future actions such as taking the screen shot will error.
          //We need to dismiss the alert instead of accept it, as accepting it may cause the browser to go to a different page (and then
          //the screenshot would not be useful)
          browserSync.getBrowser().switchTo().alert().dismiss();
        }

        if (browserSync.getBrowser().params.takeScreenshotOnError) {
          var screenshotName = chance.string({length: 8, pool: ALPHA_POOL});
          console.error('Taking screenshot: ' + screenshotName);
          takeScreenshot('test_error_screenshots/' + screenshotName);
        }

        if (browserSync.getBrowser().params.breakpoint) {
          console.error('Failed at breakpoint: ' + browserSync.getBrowser().params.breakpoint );
        }

        // Dump any console errors to the log
        checkForBrowserErrors();

        //Under protractor 3.x, we have to execute something in the browser's control flow after the last expect. Otherwise it gets lost.
        browserSync.executeScript(() => { /* empty */ });

        if (browserSync.getBrowser().params.keepBrowserOpenOnError) {
          _errorOccurredInBrowser = browserSync;

          browserSync.forkAndSwitchToNewDriverInstance();

          setupBrowser();
        }
      }

      done.apply(this, arguments);
    });
  };
}

function checkForBrowserErrors() {
  var flow = ab.getCurrentFlow();
  var cb = flow.add();
  var browserLog = flow.sync(browserSync.getBrowser().manage().logs().get('browser').then(result => {
    cb(null, result);
  }, err => {
    cb(err);
  }));
  //This probably needs to be tweaked for running on browsers other than chrome
  var jsErrors = browserLog.filter((err: any) => {
    if (err.level.value < 1000) {
      return false; // Only report errors, ignore log/warning messages
    }

    if (err.message.indexOf('Failed to load resource: the server responded with a status of 404') >= 0) {
      if (err.message.indexOf('/api/') >= 0 ||
          err.message.indexOf('favicon.ico') >= 0 ||
          err.message.indexOf('open-sans-regular.woff') >= 0 ||
          err.message.indexOf('/js/cookieConsent.js') >= 0) {
        return false; //Some APIs return 404s when behaving normally, so we need to ignore those
      }

      if (config.server.mode === 'development' && (err.message.indexOf('en_US') >= 0 || err.message.indexOf('en-us') >= 0)) {
        return false; // Some locale files are not present in dev builds
      }
    }

    // Ignore the error for forget password page, this is a classic page
    if (err.message.indexOf('CookieConsent is not defined') >= 0) {
      return false;
    }

    if (err.message.indexOf('Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects') >= 0) {
      // Ignore the error for create account page (didn't reach this page in ultra, it maybe a classic page)
      // In our ultra page, the jquery path is "/ultra/vendor/jquery/jquery.js"
      if (err.message.indexOf('/ui-ultra/bower_components/jquery/dist/jquery.js') >= 0) {
        return false;
      }
    }

    // Temporarily silence features that haven't been implemented yet
    if (err.message.indexOf('Failed to load resource: the server responded with a status of 501') >= 0) {
      if (err.message.indexOf('/lti/placements') >= 0) { // todo: remove this error whitelist once the placements API is implemented
        return false;
      }
    }

    // silence select errors from the partner cloud (the test server may be linked to multiple partner sims, and we don't want
    // a crashed simulator to fail the test unless it is the one we are using)
    if (err.message.indexOf('/webapps/bbgs-partners-sim-BBLEARN/') >= 0) {
      if (err.message.indexOf('/images') >= 0) {
        return false;
      }
    }
    if (err.message.indexOf('partner-cloud/app/v1/status') >= 0) {
      return false;
    }

    ///webapps/bbgs-partners-sim-BBLEARN/images/
    // Silence telemetry-related random failures
    if (err.message.indexOf('/telemetry/api/v1/browser/interactions') >= 0) {
      return false;
    }

    if (err.message.indexOf('webkitClearResourceTimings') >= 0) {
      return false;
    }

    // Ignore errors caused by the cookie-disclosure B2, when enabled
    if (err.message.indexOf('https://dwr_open/') >= 0) {
      return false;
    }

    // ignore errors caused by loading tiny_mce_wiris editor
    if (err.message.indexOf('target-densitydpi') >= 0) {
      return false;
    }

    if (err.message.indexOf('http://xhr.spec.whatwg.org/') >= 0) {
      return false;
    }

    if (err.message.indexOf('Response to preflight request doesn\'t pass access control check') >= 0) {
      return false;
    }

    // Ignore OneDrive integration errors
    if (err.message.indexOf('login.live.com') >= 0) {
      return false;
    }

    // Ignore Collab integration errors
    if (err.message.indexOf('Error in getCourseCollab()') >= 0) {
      return false;
    }

    // Ignore this weird error on the Learn login page, it's part of the ultra b2
    if (err.message.indexOf('hide-focus-outline.js') >= 0 && err.message.indexOf('$(...).addClass is not a function') >= 0) {
      return false;
    }

    return true;
  });

  jsErrors.forEach((jsError: any) => {
    var errorMessage = '================== Captured error from browser ==================\n' + sanitizeErrorMessage(jsError.message);

    if (browserSync.getBrowser().params.failTestOnBrowserError) {
      throw Error(errorMessage);
    } else {
      console.error((<any>errorMessage).red || errorMessage); //".red" causes this to show up in red in the console
    }
  });
}

function sanitizeErrorMessage(message: string) {
  //jasminewd looks for errors containing the text "Timeout" and will reset the control flow if found.
  //Sometimes "Timeout" will appear in stack traces that we send to expect, and it can lock up the tests if the control flow is reset.
  //So, we need to replace it with something else to work around that.
  return message.replace(/Timeout/g, 'T_imeout');
}

export function loginBase(user: { userName: string; password: string; }) {
  login(user);
  return new controls.BasePage.Control();
}

export function loginBaseActivityStream(user: { userName: string; password: string; }) {
  login(user, '/ultra/stream');
  return new controls.BaseActivityStreamPage.Control();
}

export function loginBaseAdmin(user: { userName: string; password: string; }) {
  login(user, '/ultra/admin');
  return new controls.BaseAdminPage.Control();
}

export function loginBaseCalendar(user: { userName: string; password: string; }) {
  login(user, '/ultra/calendar');
  return new controls.BaseCalendarPage.Control();
}

export function loginBaseCourses(user: { userName: string; password: string; }) {
  login(user, '/ultra/course');
  return new controls.BaseCoursesPage.Control();
}

export function loginBaseGrades(user: { userName: string; password: string; }) {
  login(user, '/ultra/grades');
  return new controls.BaseGradesPage.Control();
}

export function loginBaseMessages(user: { userName: string; password: string; }) {
  login(user, '/ultra/messages');
  return new controls.BaseMessagesPage.Control();
}

export function loginBaseOrganizations(user: { userName: string; password: string; }) {
  login(user, '/ultra/organizations');
  return new controls.BaseOrganizationsPage.Control();
}

export function loginBaseProfile(user: { userName: string; password: string; }) {
  login(user, '/ultra/profile');
  return new controls.BaseProfilePage.Control();
}

export function loginBaseTools(user: { userName: string; password: string; }) {
  login(user, '/ultra/tools');
  return new controls.BaseToolsPage.Control();
}

export function loginBaseInstitution (user: { userName: string; password: string; }) {
  login(user, '/ultra/institution-page');
  return new controls.BaseInstitutionPage.Control();
}

export function classicLogin(user: { userName: string; password: string; }, startPage?: string) {
  // split this out for reuse
  function enterCredentialsOnLoginPage() {
    if (startPage) {
      browserSync.get('/?new_loc=' + encodeURIComponent(startPage));
    } else {
      browserSync.get('/');
    }

    elementSync.findVisible('[name=user_id]').clear().sendKeys(user.userName);
    elementSync.findVisible('[name=password]').sendKeys(user.password);
  }

  enterCredentialsOnLoginPage();
  // On systems with the Cookie Disclosure B2 enabled, a popup will load asynchronously and block the login button.
  // We have no way to detect that case other than a try/catch. If we get an 'element not clickable at point' error,
  // we'll assume it was caused by the cookie-disclosure B2 and try clicking 'agree' in order to move forward with the test.
  try {
    browserSync.getBrowser().autoRetryClick = false; // temporarily disable this so we can throw an error immediately
    elementSync.findVisible('#entry-login').click();
  } catch (err) {
    if (err.message.indexOf('Element is not clickable at point') >= 0) {
      elementSync.findVisible('#agree_button').click();
      enterCredentialsOnLoginPage(); // Clicking "agree" (re)loads the base login page, so we need to redo this step now.
      elementSync.findVisible('#entry-login').click();
    } else {
      throw err;
    }
  } finally {
    configure({autoRetryClick: true});
  }
}

export function submitClassicForm(rootElement: ElementFinderSync) : void {
  // TODO: WHen we float the button at the bottom, remove scrollIntoView
  // TODO: SOMETIMES the iframe-max-height logic appears to fail us during the e2e tests.  This
  // results in double-scrollbars because the learn-iframe-body isn't tied to the ultra-iframe-size
  // and that results in this scrollInto not fully working so the test will fail.
  rootElement.findVisible('input[name="bottom_Submit"]').scrollIntoView().click();
}

export function browserLoad(): void {
  //Wait for ultra to bootstrap and be ready
  waitFor(() => {
    return !!browserSync.executeScript(function() {
      return !!(window.angular && window.angular.element('body').injector());
    });
  }, IMPLICIT_WAIT_MS * 3); //Wait longer than normal for the initial load

  browserSync.executeScript(function() {
    $.fx.off = true; //Disable jquery animations

    window.Modernizr.csstransitions = false; //Let the app know transitions have been "disabled"

    //Inject styles to disable css animations
    var styleTag = document.createElement('style');
    styleTag.setAttribute('type', 'text/css');

    styleTag.innerHTML =
      '* { ' +
      '  -webkit-transition: none !important;' +
      '  -moz-transition: none !important;' +
      '  -o-transition: none !important;' +
      '  -ms-transition: none !important;' +
      '  transition: none !important;' +
      '  -webkit-animation: none !important;' +
      '  animation: none !important;' +
      '}\n' +
      '*::after { ' +
      '  -webkit-animation: none !important;' +
      '  animation: none !important;' +
      '}\n' +
      '#digest-hud-element { ' +
      '  display: none;' +
      '}\n' +

      //Prevent the build info from blocking clicks during the tests
      '.build-info { ' +
      '  pointer-events: none;' +
      '}\n';

    document.head.appendChild(styleTag);
  });

  // Occasionally a test will try to interact before the initial load overlay fades out. Make sure it's gone before continuing.
  elementSync.assertElementDoesNotExist('#initial-load-area');

}

export function fetchApiRequestLog() {
  return browserSync.executeScript<any[]>(function() {
    return (<any>window).httpRequestLog;
  });
}

export function clearApiRequestLog() {
  browserSync.executeScript(function() {
    return (<any>window).clearHttpRequestLog && (<any>window).clearHttpRequestLog();
  });
}

export function disableAllFtueGuidance() {
  return browserSync.executeScript(function() {
    window.disableFtueGuidance();
  });
}

export function refreshBrowser(handleModal?: boolean): void {
  browserSync.getBrowser().navigate().refresh();
  if (handleModal) {
    var dialog = browserSync.getBrowser().switchTo().alert();
    dialog.accept();
  }
  browserLoad();
}

export function login(user: { userName: string; password: string; }, startPage?: string): void {
  classicLogin(user, startPage);

  // This is for login fail. If login failed, browser will go back to login page with error message,
  // no need to execute below code, or else will cause error
  if (browserSync.getCurrentUrl().indexOf('/login') >= 0) {
    return;
  }

  browserLoad();
}

export function logout(clearAlerts = true, callback?: (err?: any) => any): void {
  //Here is what I have observed:
  // * Test goes to blank.html
  // * Test deletes all cookies (and I have verified they actually get deleted)
  // * Before the test browses to the login page, some of the cookies come back (< 1% of the time)
  // * This causes the test to redirect to /ultra instead of hitting the login page, and the test fails
  //I suspect that the issue deals with ultra-router updating the cookie on every response. When hitting the blank.html,
  //the browser will request the favicon.ico at some later point, and that may cause the cookie to get reset, which
  //could occur after the test deleted cookies. We browse to the blank.html file before clearing the cookies to prevent
  //a similar issue with a background AJAX request setting a cookie after they have been deleted.
  //After getting rid of the favicon.ico request, I haven't been able to reproduce the failed logout issue.
  browserSync.get('ultra/fixed/blank.html');

  try {
    elementSync.findElement('.blank-page'); //.get() should wait for onLoad, but just to be sure the page has loaded
  } catch (err) {
    //Prevent a navigation alert from preventing the next test from executing properly
    if (clearAlerts && err.name === 'UnexpectedAlertOpenError') {
      // As this alert is as expected, so we don't need to log it to output.
      // Hence expect will not be used here.

      //We need to accept the alert to get it to not come up again
      browserSync.getBrowser().switchTo().alert().accept().then(
        () => {
          ab(() => {
            //Pass false to break potential infinite recursion
            logout(false, callback);
          });
        },
        () => {
          // Hide the error. This is because this error is harmless.
          if (callback) { callback(); }
        });
    } else if (callback) {
      callback(err);
    } else {
      throw err;
    }
  }

  browserSync.manage().deleteAllCookies();
  if (callback) { callback(); }
}

export function waitForAngular() {
  browserSync.getBrowser().waitForAngularEnabled(true);
  browserSync.getBrowser().waitForAngular();
  browserSync.getBrowser().waitForAngularEnabled(false);
}

export function waitForAngularOnly() {
  browserSync.getBrowser().waitForAngular();
}

export function instantiateBreakpointClass(breakpointClasses: any[], rootElement?: ElementFinderSync) {
  switch (getCurrentBreakpoint()) {
    case Breakpoint.Small:
      return new breakpointClasses[0](rootElement);
    case Breakpoint.Medium:
      return new breakpointClasses[1](rootElement);
    case Breakpoint.Large:
      return new breakpointClasses[2](rootElement);
  }
}

export function getCurrentBreakpoint() {
  if (width == null) {
    width = browserSync.executeScript(function() {
      return window.innerWidth;
    });
  }

  if (width <= 640) {
    return Breakpoint.Small;
  } else if (width > 640 && width < 1024) {
    return Breakpoint.Medium;
  } else {
    return Breakpoint.Large;
  }
}

export function clickPoint(element: ElementFinderSync, point: { x: number; y: number; }) {
  browserSync
    .getBrowser()
    .actions()
    .mouseMove(element.getElementFinder().getWebElement(), point)
    .click()
    .perform();
}

/**
 * Generates a random string which includes the test data prefix
 * @param length Number of random characters in addition to the prefix
 * @param pool A string containing the set of characters to select from. Defaults to alpha characters only.
 *             TestUtil provides ALPHA_POOL, ALPHANUMERIC_POOL and ASCII_POOL for convenience.
 */
export function randomString(length = 8, pool = ALPHA_POOL) {
  return PREFIX + chance.string({length: length, pool: pool});
}

/**
 * Get system info
 *
 * @returns {model.systemInfo.ISystemInfo} ISystemInfo object
 */
export function getSystemInfo() {
  var flow = ab.getCurrentFlow();
  var result = flow.sync(dataApi.getSystemInfo(config.test.e2e.learnAdminAuth, flow.add()));
  return result;
}

/**
 * Get custom page
 * @param type The type of custom page
 * @returns proper custom page
 */
export function getCustomPage(type: string) {
  var flow = ab.getCurrentFlow();
  var result = flow.sync(dataApi.getCustomPage(config.test.e2e.learnAdminAuth, type, flow.add()));
  return result;
}

/**
 * Get custom page modules
 * @param id The id of custom page
 * @returns all the modules of this specific custom page
 */
export function getCustomPageModules(id: string) {
  var flow = ab.getCurrentFlow();
  var result = flow.sync(dataApi.getCustomPageModules(config.test.e2e.learnAdminAuth, id, flow.add()));
  return result;
}

/**
 * Get custom page module resources by id
 * @param moduleId The id of module
 * @returns all the resources of this specific module
 */
export function getCustomPageModuleResources(moduleId: string) {
  var flow = ab.getCurrentFlow();
  var result = flow.sync(dataApi.getCustomPageModuleResources(config.test.e2e.learnAdminAuth, moduleId, flow.add()));
  return result;
}

/**
 * Delete custom page module
 * @param id The id of custom page
 */
export function deleteCustomPageModule(moduleId: string) {
  var flow = ab.getCurrentFlow();
  var result = flow.sync(dataApi.deleteIpModule({ moduleId: moduleId }, config.test.e2e.learnAdminAuth, flow.add()));
  return result;
}

/**
 * Gets the test partner id.  To override the partner used for E2E tests, change config.test.e2e.testPartnerId in your
 * config_override.js
 */
export function getTestPartnerId() {
  return <string>(config.test.e2e.testPartnerId) || 'SIM1';
}

export function suppressAutoSave() {
  browserSync.executeScript(() => {
    var $rootScope = angular.element(document).injector().get('$rootScope');
    // cancel any currently queued autosave
    $rootScope.$broadcast('bb-autosave-interrupt-timer');

    // listen for future autosaves and cancel them
    $rootScope.$on('bb-autosave-form', () => {
      setTimeout(() => { $rootScope.$broadcast('bb-autosave-interrupt-timer'); });
    });
  });
}

/**
 * trigger a task to run immediately
 * @returns {*}
 */
export function runSystemTaskNow(taskId: string) {
  var flow = ab.getCurrentFlow();
  var result = flow.sync(dataApi.runSystemTaskNow({taskId: taskId}, config.test.e2e.learnAdminAuth, flow.add()));
  return result;
}

/**
 * get a tasks current status
 * @returns {*}
 */
export function getSystemTask(taskId: string) {
  var flow = ab.getCurrentFlow();
  var result = flow.sync(dataApi.getSystemTask({taskId: taskId}, config.test.e2e.learnAdminAuth, flow.add()));
  return result;
}

export function startConversionTask(courseId: string, callback?: Function) {
  dataApi.startConversionTask(courseId, config.test.e2e.learnAdminAuth, callback);
}

/**
 * Set Messages persistence mode to relational
 */
// TODO Delete this method once flatfile mode is removed and relational becomes the only message persistence mode
export function setMessagesModeRelational() {
  dataApi.setMessagesModeRelational();
}

/**
 * Set Messages persistence mode to flat file
 */
// TODO Delete this method once flatfile mode is removed and relational becomes the only message persistence mode
export function setMessagesModeFlatFile() {
  dataApi.setMessageModeFlatFile();
}

// TODO Delete this method once flatfile mode is removed and relational becomes the only message persistence mode
export function getMessagesMode(user: { userName: string; password: string; }) {
  classicLogin(user, '/?new_loc=' + encodeURIComponent('/webapps/blackboard/execute/composeMessage?method=persistenceType'));
  let text = elementSync.findElement('body').getText();
  return text.split('**** Current persistence is ')[1]; // I know this is ugly, but this is meant to be throwaway code
}