import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('The login page for administrator', function () {
  it('should log in correctly PTID=306', testUtil.createTest((create) => {
    var env = create.systemAdmin().exec();
    var basePage = testUtil.loginBase(env.user);
    // Land on Activity Stream page
    polledExpect(() => basePage.isStreamOpen()).toBeTruthy();

    // Go to Administrator Tools page
    basePage.openAdmin();
    polledExpect(() => basePage.isAdminOpen()).toBeTruthy();

    // Back to Activity Stream page
    basePage.backFromAdmin(controls.BasePage.NavItem.Activity);
    polledExpect(() => basePage.isAdminOpen()).toBeFalsy();
    polledExpect(() => basePage.isStreamOpen()).toBeTruthy();
  }));
});