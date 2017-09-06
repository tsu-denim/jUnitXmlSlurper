import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');

export class CreateTargetedNotification<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

}