import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('The login page for user', function () {
  it('should log in and log out PTID=308', testUtil.createTest((create) => {
    var env = create.user().with.enabledLoginFTUE().exec();
    testUtil.login(env.user);

    // Click through FTUE page
    var ftuePage = new controls.FtuePage.Control();
    ftuePage.clickThrough();

    // Land on Activity Stream page
    var basePage = new controls.BasePage.Control();
    polledExpect(() => basePage.isStreamOpen()).toBeTruthy();

    // Sign out
    basePage.signOut();

    // Verify back to login page
    let loginPage = new controls.LoginPage.Control();
  }));

  it('should create an account PTID=309', testUtil.createTest((create) => {
    //We now need to go to System Admin > Gateway Options > Link to Account Creation > Enable to insure test success
    var env = create.systemAdmin().exec();
    var baseAdminPage = testUtil.loginBaseAdmin(env.user);
    baseAdminPage
      .openGatewayOptions()
      .enableLinkToAccountCreation()
      .save();
    testUtil.logout();

    // Prepare data
    var firstName: string = testUtil.PREFIX + 'firstName';
    var lastName: string = testUtil.PREFIX + 'lastName';
    var emailAddress: string = testUtil.PREFIX + 'test@blackboard.com';
    var userName: string = testUtil.PREFIX + 'userName' + new Date().getTime().toString();
    var password: string = testUtil.PREFIX + 'password';

    browserSync.get('/');
    var loginPage = new controls.LoginPage.Control();
    var createAccountPage = loginPage.clickCreateAccount();
    createAccountPage.register({
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      userName: userName,
      password: password
    });
    createAccountPage.waitForRegistration();
    testUtil.logout();
    testUtil.login({userName: userName, password: password});
    // Click through FTUE page
    var ftuePage = new controls.FtuePage.Control();
    ftuePage.clickThrough();

    // Land on Activity Stream page
    var basePage = new controls.BasePage.Control();
    polledExpect(() => basePage.isStreamOpen()).toBeTruthy();
    testUtil.logout();
  }));

  it('should not log in successfully with wrong account information PTID=307', testUtil.createTest((create) => {
    var env = create.user().exec();
    // Change password to be invalid
    env.user.password += 'invalid_suffix';

    testUtil.login(env.user);
    var loginPage = new controls.LoginPage.Control();
    loginPage.assertLoginErrorMessageShown();
  }));

  it('should get back password PTID=310', testUtil.createTest((create) => {
    var email = testUtil.PREFIX + 'test@blackboard.com';
    var env = create.user({overrides: {emailAddress: email}}).exec();

    browserSync.get('/');
    var loginPage = new controls.LoginPage.Control();
    var forgetPasswordPage = loginPage.clickForgetPassword();
    forgetPasswordPage.getBackPassword({firstName: env.user.givenName, lastName: env.user.familyName, userName: env.user.userName});

    // It will return to login page with success info after getting back password successfully
    loginPage = new controls.LoginPage.Control();
    loginPage.assertPasswordSuccessReceiptShown();
  }));
});