import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler} from '../test-profiler';

import * as InstructorVisitBaseMessages from '../workflow/instructor/messages_base';
import * as InstructorSendAndDeleteCourseMessages from '../workflow/instructor/messages_course';

describe('Messages Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Instructor views messages for all courses', testUtil.createTest(() => {
    new InstructorVisitBaseMessages.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), 
      new TestProfiler('Messages Suite', `Instructor views (${dataSet.MESSAGES}) messages for all courses`));
  }));

  // this doesn't fail when run locally but did 3 times on jenkins - see the results of run 48
  // excluded out of abundance of caution so we can get at least one set of new results
  it('Instructor views, sends and deletes messages', testUtil.createTest(() => {
    new InstructorSendAndDeleteCourseMessages.Workflow(env).execute(
      testUtil.loginBase(env[dataSet.INSTRUCTOR]),
      new TestProfiler('Messages Suite', `Instructor views, sends and deletes (${dataSet.MESSAGES}) messages`)
    );
  }));
});