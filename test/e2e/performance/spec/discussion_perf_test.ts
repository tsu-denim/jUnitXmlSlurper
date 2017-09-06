import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler} from '../test-profiler';

import * as InstructorVisitDiscussions from '../workflow/instructor/discussion_response_reply';
import * as InstructorAddNewDiscussion from '../workflow/instructor/discussion_create';

describe('Discussion Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Instructor views discussion and responses', testUtil.createTest(() => {
    new InstructorVisitDiscussions.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Discussion Suite', 'Instructor views discussion and responses'));
  }));

  it('instructor add a new discussion', testUtil.createTest(() => {
    new InstructorAddNewDiscussion.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Discussion Suite', 'Instructor add a new discussion'));
  }));
});
