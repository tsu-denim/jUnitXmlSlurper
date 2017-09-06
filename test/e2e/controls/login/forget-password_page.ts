import controls = require('../index');
import {ElementFinderSync, browserSync, elementSync, waitFor} from 'protractor-sync';
import testUtil = require('../../test_util');

export interface IUser {
  firstName: string;
  lastName: string;
  userName: string;
}

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        this._switchInPasswordWindow();
        this.rootElement = elementSync.findVisible('.locationPane');
        this._switchOutPasswordWindow();
      }
    }
  }

  _switchInPasswordWindow() {
    var handles: any = browserSync.getAllWindowHandles();
    browserSync.switchTo().window(handles[1]);
  }

  _switchOutPasswordWindow() {
    var handles: any = browserSync.getAllWindowHandles();
    browserSync.switchTo().window(handles[0]);
  }

  // set first name
  _setFirstName(firstName: string) {
    this._switchInPasswordWindow();
    this.rootElement.findVisible('#search_firstname').clear().sendKeys(firstName);
    this._switchOutPasswordWindow();
    return this;
  }

  // set last name
  _setLastName(lastName: string) {
    this._switchInPasswordWindow();
    this.rootElement.findVisible('#search_lastname').clear().sendKeys(lastName);
    this._switchOutPasswordWindow();
    return this;
  }

  // set user name
  _setUserName(userName: string) {
    this._switchInPasswordWindow();
    this.rootElement.findVisible('#search_userid').clear().sendKeys(userName);
    this._switchOutPasswordWindow();
    return this;
  }

  _setOptions(user: IUser) {
    if (user.firstName) {
      this._setFirstName(user.firstName);
    }

    if (user.lastName) {
      this._setLastName(user.lastName);
    }

    if (user.userName) {
      this._setUserName(user.userName);
    }

    return this;
  }

  _submit() {
    this._switchInPasswordWindow();
    this.rootElement.findVisible('#bottom_submitButtonRow .submit').scrollIntoView().click();
    this._switchOutPasswordWindow();
  }

  getBackPassword(user: IUser) {
    this._setOptions(user);
    this._submit();
  }

}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}