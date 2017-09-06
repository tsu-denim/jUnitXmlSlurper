import testUtil = require('../../test_util');
import dataSet = require('../data-set-generator');
import { TestProfiler } from '../test-profiler';
import {IEnvironment} from '../../test_data/create_base';
import * as InstitutionPageBaseConfiguration from '../workflow/admin/institution_page_base_configuration';
import * as InstitutionPageHelpLinkModule from '../workflow/admin/institution_page_help_link_module';

if (testUtil.features.institutionPageLink) {
  describe('Institution Page Suite', function () {

    let env: IEnvironment;

    beforeAll(dataSet.build((globalEnv) => {
      env = globalEnv;
    }));

    it('Base configuration', testUtil.createTest((create) => {
      new InstitutionPageBaseConfiguration.Workflow(env).execute(testUtil.loginBase(env[dataSet.ADMINISTRATOR]), new TestProfiler('Institution Page Suite', 'Base configuration'));
    }));

    it('Help Link Module', testUtil.createTest((create) => {
      new InstitutionPageHelpLinkModule.Workflow(env).execute(testUtil.loginBase(env[dataSet.ADMINISTRATOR]), new TestProfiler('Institution Page Suite', 'Help Link Module'));
    }));

  });
}