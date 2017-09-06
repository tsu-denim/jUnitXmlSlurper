import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler} from '../test-profiler';

import * as InstructorVisitBaseCourses from '../workflow/instructor/course_list';

describe('Course List Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Instructor reviews course list, filters the list and views courses', testUtil.createTest(() => {
    new InstructorVisitBaseCourses.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), 
      new TestProfiler('Course List Suite', 'Instructor reviews course list, filters the list and views courses'));
  }));
});