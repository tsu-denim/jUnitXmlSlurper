import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler} from '../test-profiler';

describe('Login Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Instructor logs in', testUtil.createTest(() => {
    let profile = new TestProfiler('Login Suite', 'Instructor logs in');

    profile.start();

    // Measure login duration by logging into Tools page as it's a simple enough page
    testUtil.loginBaseTools(env[dataSet.INSTRUCTOR]);

    profile.record('User logged in');

    profile.end();
  }));
});