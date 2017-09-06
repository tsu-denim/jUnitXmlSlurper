import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

import { IEnvironment } from '../../test_data/create_base';
import { TestProfiler } from '../test-profiler';

import * as InstructorVisitCourseGradebook from '../workflow/instructor/gradebook_course';
import * as InstructorVisitBaseGrades from '../workflow/instructor/gradebook_base';

describe('Gradebook Suite', () => {
    let env: IEnvironment;

    beforeAll(dataSet.build((globalEnv) => {
        env = globalEnv;
    }));

    it('Instructor views gradebook tab', testUtil.createTest(() => {
        new InstructorVisitCourseGradebook.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Gradebook Suite', 'Instructor views gradebook tab'));
    }));

    it('Instructor views grades for all courses', testUtil.createTest(() => {
        new InstructorVisitBaseGrades.Workflow(env).execute(testUtil.loginBase(env[dataSet.INSTRUCTOR]), new TestProfiler('Gradebook Suite', 'Instructor view grades for all courses'));
    }));
});