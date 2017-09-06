import controls = require('../index');
import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';
import testUtil = require('../../test_util');

export interface IUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  userName: string;
  password: string;
}

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      this.rootElement = rootElement || elementSync.findVisible('body.educator-preview');
    }
  }

  // set first name
  _setFirstName(firstName: string) {
    this.rootElement.findVisible('#firstName').clear().sendKeys(firstName);
    return this;
  }

  // set last name
  _setLastName(lastName: string) {
    this.rootElement.findVisible('#lastName').clear().sendKeys(lastName);
    return this;
  }

  // set email address
  _setEmailAddress(emailAddress: string) {
    this.rootElement.findVisible('#emailId').clear().sendKeys(emailAddress);
    this.rootElement.findVisible('#confirmEmail').clear().sendKeys(emailAddress);
    return this;
  }

  // set user name
  _setUserName(userName: string) {
    this.rootElement.findVisible('#userNameId').clear().sendKeys(userName);
    return this;
  }

  // set password
  _setPassword(password: string) {
    this.rootElement.findVisible('#passwordId').clear().sendKeys(password);
    this.rootElement.findVisible('#confPassword').clear().sendKeys(password);
    return this;
  }

  _setOptions(user: IUser) {
    if (user.firstName) {
      this._setFirstName(user.firstName);
    }

    if (user.lastName) {
      this._setLastName(user.lastName);
    }

    if (user.emailAddress) {
      this._setEmailAddress(user.emailAddress);
    }

    if (user.userName) {
      this._setUserName(user.userName);
    }

    if (user.password) {
      this._setPassword(user.password);
    }

    return this;
  }

  _submit() {
    this.rootElement.findVisible('#registerSubmitId').click();
  }

  register(user: IUser) {
    this._setOptions(user);
    this._submit();
  }

  /**
   * waits for the registration to finish.
   * 1. We wait for the preloader spinner to appear
   * 2. The we wait for the preloader spinner to disappear.
   *      We use browser.waitFor (30 second timeout) as findVisible will time out too early
   * 3. Finally, we check for a successful registration and a button to 'Get Started' > go to Ultra
   */
  waitForRegistration() {
    this.rootElement.findVisible('.preloader-container .preloader');
    waitFor(() => {
      return (!this.rootElement.findElement('.preloader').isDisplayed());
    }, 30000);
    this.rootElement.findVisible('.registration-success');
    this.rootElement.findVisible('#goToUltraButtonId');
    return this;
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}