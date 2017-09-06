import create = require('../create');
import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');
import createCalendar = require('../calendar/create_calendar-item');
import dataBuilder = require('../data_builder');
import dataApi = require('../data_api');

export class CreateUser<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  /** Disables the login FTUE for the last created user in the context */
  disabledLoginFTUE() {
    if (this._exists('ftue')) {
      this._resolve('ftue'); //Wait for the previous FTUE to get set if we are already setting it
    }

    var dataRecord = this._createDataRecord('ftue');
    dataApi.disableLoginFTUE(this._getData(), dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  /** Enables the login FTUE for the last created user in the context */
  enabledLoginFTUE() {
    if (this._exists('ftue')) {
      this._resolve('ftue'); //Wait for the previous FTUE to get set if we are already setting it
    }

    var dataRecord = this._createDataRecord('ftue');
    dataApi.enableLoginFTUE(this._getData(), dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  /** create a calendar item on the user's personal calendar */
  calendarItem(args?: {overrides?: any}) {
    var user = this._getData();

    var calendarInfo = args && args.overrides ? dataBuilder.generateCalendarItem('PERSONAL', args.overrides)
      : dataBuilder.generateCalendarItem('PERSONAL');

    var dataRecord = this._createDataRecord('calendarItem');

    // admin doesn't have access to the endpoint for personal calendar
    // so need to use the user credentials here
    dataApi.createPersonalCalendarItem({ userId: user.id, calendarItem: calendarInfo }, user, dataRecord.callback);

    return new createCalendar.CreateCalendarItem(this, dataRecord);
  }

  /** creates office hours on the user's personal calendar */
  officeHours(args?: {overrides?: any}) {
    let user = this._getData();
    let course = this.parent._getData();

    let calendarInfo = args && args.overrides ? dataBuilder.generateOfficeHours(course.id, args.overrides)
      : dataBuilder.generateOfficeHours(course.id);

    let dataRecord = this._createDataRecord('calendarItem');

    // admin doesn't have access to the endpoint for office hours
    // so need to use the user credentials here
    dataApi.createPersonalOfficeHours({ userId: user.id, courseId: course.id, calendarItem: calendarInfo }, user, dataRecord.callback);

    return new createCalendar.CreateCalendarItem(this, dataRecord);
  }

  onlyDiscussionItemsUserParticipatedInShownInStream() {
    var user = this._getData();
    var dataRecord = this._createDataRecord('partialDiscussionItemsInStream');

    var updatedPreference = dataBuilder.generateStreamSettingPreference({overrides: {value: {TCH: {DIS: 'PAR'}}}});
    dataApi.setPreference({
      preference: updatedPreference
    }, user, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

}