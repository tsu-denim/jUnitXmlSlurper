var ab = require('asyncblock');
var config = require('../../config/config.js');

function buildSuitePath(name) {
  return '../../build/test/test/e2e/integration/spec/**/*' + name + '*_test.js'
}

// protractor configuration file (see options doc at https://github.com/angular/protractor/blob/master/docs/referenceConf.js)
exports.config = {
  //baseUrl: 'http://localhost:9900',  //Overriden by config/config.js

  // ----- How to setup Selenium -----

  // Do not start a Selenium Standalone sever - only run this using chrome.
  directConnect: true,
  chromeDriver: '../../node_modules/webdriver-manager/selenium/chromedriver_'+config.test.e2e.chromedriverVersion,

  // Comment out directConnect and chromeDriver and uncomment this to run on separate Selenium server
  //seleniumAddress: 'http://someServer:4444/wd/hub',

  // ----- Capabilities to be passed to the webdriver instance ----

  //capabilities: {
    //browserName: 'chrome', // Overriden by config/config.js
  //},

  // ----- What tests to run -----

  // Spec patterns are relative to the current working directory when protractor is called.
  specs: ['../../build/test/test/e2e/integration/spec/**/*_test.js'],

  suites: {
    admin: buildSuitePath('admin'),
    assessment: buildSuitePath('assessment'),
    assignment: buildSuitePath('assignment'),
    calendar: buildSuitePath('calendar'),
    content: buildSuitePath('content'),
    course: buildSuitePath('courses'),
    discussion: buildSuitePath('discussion'),
    integration: '../../build/test/test/e2e/integration/spec/**/*_test.js',
    ftue: buildSuitePath('ftue'),
    gradebook: '../../build/test/test/e2e/integration/spec/course/grades/*_test.js',
    message: buildSuitePath('messages'),
    organization: buildSuitePath('organization'),
    profile: buildSuitePath('profile'),
    setup: '../../build/test/test/e2e/setup/spec/**/*_test.js',
    tool: buildSuitePath('tools'),
    media_widget: buildSuitePath('media-widget'),
    telemetry: buildSuitePath('telemetry'),
    rubric: buildSuitePath('rubric'),
    goal: buildSuitePath('goal'),
    group: buildSuitePath('group'),
    performance: '../../build/test/test/e2e/performance/spec/**/*_test.js',
    memoryLeak: '../../build/test/test/e2e/performance/memory-spec/**/*_test.js'
  },

  // ----- More information for your tests ----

  onPrepare: function (){
    ab.enableTransform();

    //Override learn auth info based on what is provided on the command line
    if (browser.params.learnAdminUsername) {
      config.test.e2e.learnAdminAuth.userName = browser.params.learnAdminUsername;
    }

    if (browser.params.learnAdminPassword) {
      config.test.e2e.learnAdminAuth.password = browser.params.learnAdminPassword;
    }

    // The require statement must be down here, since jasmine-reporters
    // needs jasmine to be in the global and protractor does not guarantee
    // this until inside the onPrepare function.
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      // junit reporter for build server
      new jasmineReporters.JUnitXmlReporter({
        savePath: 'build/test/test/e2e/results',
        filePrefix: 'junitresults-' + Math.floor(Math.random() * 999999999999), //When there are multiple shards, each needs to write to a unique file
        consolidate: true,
        modifySuiteName: function(generatedSuiteName, suite) {
          return 'E2E.' + generatedSuiteName;
        },
        useDotNotation: true
      })
    );

    var jasmineSpecReporter = require('jasmine-spec-reporter');
    jasmine.getEnv().addReporter(
      // console reporter for running tests locally
      new jasmineSpecReporter({ displayStacktrace: 'all' })
    );
  },

  // ----- The test framework -----

  framework: 'jasmine2',

  // Options to be passed to minijasminenode.
  jasmineNodeOpts: {
    // If true, print colors to the terminal.
    showColors: true,
    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 9000000,
    // remove protractor dot reporter; we are using a custom reporter instead
    print: function() {}
  },

  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      'args': ['enable-precise-memory-info','disable-infobars'],
      prefs: {
        'credentials_enable_service': false,
        'profile': {
          'password_manager_enabled': false
        }
      }
    }
  },
};
