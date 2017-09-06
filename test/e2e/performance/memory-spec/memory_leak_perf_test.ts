/* tslint:disable: no-var-requires */
import fs = require('fs');
import path = require('path');
import controls = require('../../controls/index');
import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');

var config = require('../../../../../../config/config.js');

import {IEnvironment} from '../../test_data/create_base';
import {ChromeMemoryProfiler, TestWorkflow} from '../test-profiler';

function executeWorkflow(workflowPath: string, reportFilePath: string, env: IEnvironment) {
  let basePage = new controls.BasePage.Control();
  let memoryProfiler = new ChromeMemoryProfiler(reportFilePath).initialize();

  let workflowList = fs.readdirSync(path.join(__dirname, workflowPath)).filter(name => {
    return /.js$/.test(name);
  }).map(name => {
    var useCase = require(path.join(__dirname, workflowPath, name));
    return new useCase.Workflow(env);
  });

  try {
    workflowList.forEach((workflow: TestWorkflow) => {
      workflow.executeAndVerifyReturnedToBasePage(basePage, memoryProfiler);
    });

    basePage.openTools();
  } catch (err) {
    memoryProfiler.record(`"${err.stack}"`);
  } finally {
    memoryProfiler.writeToDisk();
  }
}

describe('Memory Leak Test Suite', function() {
  let env: IEnvironment;

  beforeAll(dataSet.build((globalEnv) => {
    env = globalEnv;
  }));

  it('Administrator visits ultra', testUtil.createTest(() => {
    testUtil.loginBaseTools(env[dataSet.ADMINISTRATOR]);

    executeWorkflow('../workflow/admin', config.test.e2e.performance.memoryDataForAdmin, env);
  }));

  it('Instructor visits ultra', testUtil.createTest(() => {
    testUtil.loginBaseTools(env[dataSet.INSTRUCTOR]);

    executeWorkflow('../workflow/instructor', config.test.e2e.performance.memoryDataForInstructor, env);
  }));

  it('Student visits ultra', testUtil.createTest(() => {
    testUtil.loginBaseTools(env[dataSet.STUDENT]);

    executeWorkflow('../workflow/student', config.test.e2e.performance.memoryDataForStudent, env);
  }));
});