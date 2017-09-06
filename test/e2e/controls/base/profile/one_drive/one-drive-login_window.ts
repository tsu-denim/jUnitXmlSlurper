import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect} from 'protractor-sync';

export class Control {
  rootElement: ElementFinderSync;

  constructor(rootElement?: ElementFinderSync) {
    if (this.constructor === Control) {
      return testUtil.instantiateBreakpointClass([Small, Medium, Large], rootElement);
    } else {
      if (rootElement) {
        this.rootElement = rootElement;
      } else {
        var handles: any = browserSync.getAllWindowHandles();
        browserSync.switchTo().window(handles[1]);
        this.rootElement = elementSync.findVisible('body');
      }
    }
  }

  login(username: string, password: string) {
    var usernameInput = this.rootElement.findVisible('[name=loginfmt]');
    var passwordInput = this.rootElement.findVisible('[name=passwd]');

    polledExpect(() => {
      usernameInput.clear().sendKeys(username);
      passwordInput.clear().sendKeys(password);

      return {
        username: usernameInput.getAttribute('value'),
        password: passwordInput.getAttribute('value')
      };
    }).toEqual({
      username: username,
      password: password
    });

    this.rootElement.findVisible('[name=SI]').click();
    
    var handles: any = browserSync.getAllWindowHandles();
    browserSync.switchTo().window(handles[0]);
  }
}

class Small extends Control {

}

class Medium extends Control {

}

class Large extends Control {

}