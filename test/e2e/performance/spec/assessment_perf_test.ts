import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import {IEnvironment} from '../../test_data/create_base';
import {TestProfiler} from '../test-profiler';

import * as InstructorReviewAssessmentSubmissions from '../workflow/instructor/assessment_grading';
import * as InstructorEditTest from '../workflow/instructor/assessment_edit';
import * as StudentTakeAssessment from '../workflow/student/assessment_take';

describe('Assessment Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Instructor views assessment and submissions', testUtil.createTest(() => {
    new InstructorReviewAssessmentSubmissions.Workflow(env).executeWithoutMemoryLeakTests(testUtil.loginBaseCourses(env[dataSet.INSTRUCTOR]),
      new TestProfiler('Assessment Suite', 'Instructor views assessment and submissions'));
  }));

  it('Instructor edits a test', testUtil.createTest(() => {
    new InstructorEditTest.Workflow(env).executeWithoutMemoryLeakTests(testUtil.loginBaseCourses(env[dataSet.INSTRUCTOR]),
      new TestProfiler('Assessment Suite', 'Instructor edits a test'));
  }));

  it('Student takes an assessment', testUtil.createTest(() => {
    new StudentTakeAssessment.Workflow(env).executeWithoutMemoryLeakTests(testUtil.loginBaseCourses(env[dataSet.STUDENT]),
      new TestProfiler('Assessment Suite', 'Student takes an assessment'));
  }));
});