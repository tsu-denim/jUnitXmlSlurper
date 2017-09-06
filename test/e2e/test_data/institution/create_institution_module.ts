import createBase = require('../create_base');
import createGeneric = require('../generic/create_generic');
import createIpModuleResources = require('./create_institution_resources');
import dataApi = require('../data_api');
import dataBuilder = require('../data_builder');

export class CreateIpModule<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  // Create resources for institution module
  resources(args?: {type: string, overrides?: any}[]) {
    var ipModule = this._getData();
    var ipModuleId = ipModule && ipModule.return_body && ipModule.return_body[0] && ipModule.return_body[0].id || '';
    var ipModuleResourcesInfo: any = [];
    if (args) {
      args.forEach((arg: any) => {
        ipModuleResourcesInfo.push(arg && arg.overrides ? dataBuilder.generateIpModuleResource(ipModuleId, arg.type, arg.overrides) : dataBuilder.generateIpModuleResource(ipModuleId, arg.type));
      });
    }

    var dataRecord = this._createDataRecord('ipModuleResources');
    dataApi.createIpModuleResources({moduleId: ipModuleId, resources: ipModuleResourcesInfo}, this._adminAuth, dataRecord.callback);

    return new createIpModuleResources.CreateIpModuleResources(this, dataRecord);
  }
}