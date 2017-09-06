// Extend jasmine with a fake reporter so we can fetch the suite/spec name inside a test
class JasmineFakeReporter {
  private currentSuite: any;
  private currentSpec: {
    description: string;
    fullName: string;
  };

  constructor(parent: any, options?: any) {
    parent.call(this, options);
  }

  suiteStarted(suite: any) {
    this.currentSuite = suite;
  }

  suiteDone() {
    this.currentSuite = null;
  }

  specStarted(spec: any) {
    this.currentSpec = spec;
  }

  specDone(spec: any) {
    this.currentSpec = null;
  }

  getCurrentSuite() {
    return this.currentSuite;
  }

  getCurrentSpec() {
    return this.currentSpec;
  }
}

export = () => {
  let baseReporter = (<any> jasmine).JsApiReporter;
  let reporter = new JasmineFakeReporter(baseReporter, {timer: new (<any> jasmine).Timer()});

  jasmine.getEnv().addReporter(reporter as any);

  (<any> jasmine).getCurrentSpec = () => {
    return reporter.getCurrentSpec();
  };
};