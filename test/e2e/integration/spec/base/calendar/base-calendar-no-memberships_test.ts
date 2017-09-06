import controls = require('../../../../controls/index');
import testUtil = require('../../../../test_util');
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

describe('The calendar page for a user who has no course memberships', () => {
  it('should create a new event (#defer) PTID=579', testUtil.createTest((create) => {
    var env = create.user().exec();

    var title = testUtil.PREFIX + 'calendar';

    var calendarPage = testUtil.loginBaseCalendar(env.user);
    calendarPage.addCalendarItemForUserOrStudent({title: title});

    calendarPage.assertCalendarItemExists(title);
  }));

  it('should create a new all-day event (#defer) PTID=1145', testUtil.createTest((create) => {
    var env = create.user().exec();
    var calendarPage = testUtil.loginBaseCalendar(env.user);

    var title = testUtil.PREFIX + 'calendar';
    calendarPage.addCalendarItemForUserOrStudent({title: title, allDay: true});

    calendarPage.assertAllDayEventExists(title);
  }));

  it('should create a repeating event (#defer) PTID=589', testUtil.createTest((create) => {
    var env = create.user().exec();
    var calendarPage = testUtil.loginBaseCalendar(env.user);

    var title = testUtil.PREFIX + 'calendar';
    calendarPage.addCalendarItemForUserOrStudent({title: title, repeat: true});
    calendarPage.assertCalendarItemExists(title);

    calendarPage.goToNextWeek();
    calendarPage.assertCalendarItemExists(title);
  }));

  it('should edit an existing event (#defer) PTID=580', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.user().with.calendarItem({overrides: {title: title}}).exec();
    var calendarPage = testUtil.loginBaseCalendar(env.user);
    var updatedTitle = title + '_updated';
    calendarPage.editCalendarItem(title, {title: updatedTitle});
    calendarPage.assertCalendarItemExists(updatedTitle);
  }));

  it('should display an existing event on the personal calendar (#defer) PTID=579', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.user().with.calendarItem({overrides: {title: title}}).exec();

    var calendarPage = testUtil.loginBaseCalendar(env.user);
    calendarPage.assertCalendarItemExists(title);
  }));

  it('should display calendar settings (#defer) PTID=1146', testUtil.createTest((create) => {
    var env = create.user().exec();
    var calendarSettingsPanel = testUtil.loginBaseCalendar(env.user).openCalendarSettingsPanel();

    polledExpect(() => calendarSettingsPanel.isPresent()).toBe(true);
  }));

  it('should delete an existing event (#defer) PTID=581', testUtil.createTest((create) => {
    var title = testUtil.PREFIX + 'calendar';
    var env = create.user().with.calendarItem({overrides: {title: title}}).exec();

    var calendarPage = testUtil.loginBaseCalendar(env.user);
    calendarPage.removeCalendarItem(title);
    calendarPage.assertCalendarItemDoesNotExist(title);
  }));
});