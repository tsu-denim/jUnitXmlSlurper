import controls = require('../../../controls/index');
import testUtil = require('../../../test_util');
import dataSet = require('../../data-set-generator');
import {IProfiler, TestWorkflow} from '../../test-profiler';

export class Workflow extends TestWorkflow {
  execute(basePage: controls.BasePage.Control, profile: IProfiler) {
    var title = testUtil.randomString() + 'An announcement to everyone';
    var message = testUtil.randomString() + 'Detail of the announcement';

    profile.start();

    let streamPage = basePage.openStream();
    profile.record('[Memory Leak Test] Opened Stream page');

    let targetedNotificationCreatePage = streamPage.openTargetedNotificationCreatePage();
    profile.record('Administrator opened Targeted Notification create Page');

    let step2Page = targetedNotificationCreatePage.enterTitle(title).enterMessage(message).goToNextPage();
    profile.record('Administrator finished entering data(ignore)');

    step2Page.showAllAudience();
    profile.record('Administrator went to next page and saw the show all link');

    step2Page.selectAudienceByNameInStep2Page('Everyone').scheduleNotification();
    profile.record('Administrator Selected Audience and submitted create Targeted Notification request');

    profile.end();
  }
}