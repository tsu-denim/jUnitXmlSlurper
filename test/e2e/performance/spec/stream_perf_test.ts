import controls = require('../../controls/index');
import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler} from '../test-profiler';

import * as InstructorVisitStream from '../workflow/instructor/stream';

describe('Stream Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Instructor filters stream', testUtil.createTest(() => {
    testUtil.loginBaseTools(env[dataSet.INSTRUCTOR]);

    new InstructorVisitStream.Workflow(env).execute(new controls.BasePage.Control(), new TestProfiler('Stream Suite', 'Instructor filters stream'));
  }));
});