## Create the large data at performance test server

* Run `grunt test:initGoldenData` to create the large data set at performance test server, in case you want to run performance test suite with large data set
* Note:
   * The url of performance test server is specified as property "test.e2e.baseUrl" in "<ultra_ui_root>/config/config.js"
   * The large data set is configurable from "<ultra_ui_root>/test/data-generator/config.ts"