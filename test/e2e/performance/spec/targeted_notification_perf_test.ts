import controls = require('../../controls/index');
import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');
import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler, IProfiler, TestWorkflow} from '../test-profiler';
import * as TargetedNotification from '../workflow/admin/targeted_notification';

describe('Targeted notification Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Administrator create a targeted notification', testUtil.createTest(() => {
    testUtil.loginBaseTools(env[dataSet.ADMINISTRATOR]);

    new TargetedNotification.Workflow(env).execute(new controls.BasePage.Control(), new TestProfiler('Targeted notification Suite', 'Administrator create a targeted notification'));
  }));
});