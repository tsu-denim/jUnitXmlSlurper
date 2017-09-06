import controls = require('../../controls/index');
import testUtil = require('../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('Goals', () => {
  it('can be created for E2E test consumption PTID=122', testUtil.createTest((create) => {
    create.goalSet().goalCategory()
      .goal().and.goal()
      .exec();
  }));
});

describe('The ultra experience', () => {
  it('can be enabled PTID=137', testUtil.createTest((create) => {
    var env = create.systemAdmin().exec();

    testUtil.classicLogin(env.user);

    //we go directly to the enable Ultra Page as we cannot rely on the Base Admin Panel Showing it
    browserSync.get('webapps/ultraui/config');

    var enableUltraPage = new controls.classic.EnableUltraPage.Control();
    
    enableUltraPage.turnOnUltraExperience();
  }));
});
