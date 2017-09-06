import create = require('../create');
import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');
import createUser = require('../user/create_user');
import dataBuilder = require('../data_builder');
import dataApi = require('../data_api');
import models = require('../../../../app/components/models');

export class CreateCalendarItem<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

}