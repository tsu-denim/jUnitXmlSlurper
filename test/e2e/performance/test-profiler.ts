/* tslint:disable: no-var-requires */
import fs = require('fs');
import path = require('path');
import moment = require('moment');
import * as memory from '../../utility/memory_util';
import testUtil = require('../test_util');
import controls = require('../controls/index');
import {IEnvironment} from '../test_data/create_base';
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

var config = require('../../../../../config/config.js');

interface IBrowserMemoryUsage {
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface IProfiler {
  start(): void;
  record(key: string): void;
  end(): void;
  startIgnore(): void;
  endIgnore(): void;
}

/**
 * Record elapsed time points during a test and write them out to a results file
 */
export class TestProfiler implements IProfiler {
  _records: any[] = [];
  _startTime: number;
  _lastRecordTime: number;
  _startRecordIgnoreTime: number;
  _lastRecordIgnoreTime: number;
  _totalElapsedTime: number;
  _totalApiRequests: number;
  _ignore_start_seq: number;
  _ignore_end_seq: number;

  constructor(private suiteName: string, private testName: string) {
    /* empty */
  }

  start() {
    this._startTime = new Date().getTime();
    this._lastRecordTime = new Date().getTime();
    this._totalApiRequests = 0;

    this._ignore_start_seq = 0;
    this._ignore_end_seq = 0;
    this._lastRecordIgnoreTime = 0;

    // Flush any API requests that were made out of the log so we're only tracking requests made between each record
    testUtil.clearApiRequestLog();

    // Get rid of FTUE guidance
    // Since the tests will reuse the same data environment we will not know when FTUEs needs to be dismissed
    try {
      testUtil.disableAllFtueGuidance();
    } catch (err) {
      // do nothing just bypass the failure in case the profiler is started before logging into Ultra
    }
  }

  startIgnore() {
    this._ignore_start_seq++;
    this._startRecordIgnoreTime = new Date().getTime();
  }

  endIgnore() {
    this._ignore_end_seq++;
    if (this._ignore_start_seq !== this._ignore_end_seq) {
      throw new Error('startIgnore and endIgnore should be paired ' + this._ignore_start_seq + ':' + this._ignore_end_seq);
    }
    this._lastRecordIgnoreTime += (new Date().getTime() - this._startRecordIgnoreTime);
  }

  record(key: string) {
    if (!this._lastRecordTime) {
      throw new Error('Must call start() before recording the first timepoint');
    }

    let apiRequestLog = testUtil.fetchApiRequestLog() || [];
    this._totalApiRequests += apiRequestLog.length;

    let elapsed = new Date().getTime() - this._lastRecordTime - this._lastRecordIgnoreTime;

    let memoryUsage = this.getMemoryUsage();

    this._records.push({
      key: key,
      elapsed: elapsed,
      memory: memoryUsage,
      apiLog: apiRequestLog
    });

    this._lastRecordTime = new Date().getTime();
    testUtil.clearApiRequestLog();
    this._lastRecordIgnoreTime = 0;
    this._ignore_start_seq = 0;
    this._ignore_end_seq = 0;
  }

  end() {
    this._totalElapsedTime = new Date().getTime() - this._startTime;

    this.writeToDisk({
      'suite': this.suiteName,
      'test': this.testName,
      'startTime': this._startTime,
      'totalElapsedTime': this._totalElapsedTime,
      'totalApiRequests': this._totalApiRequests,
      'records': this._records
    });
  }

  /**
   * Append the record to the performance data file
   */
  writeToDisk(record: any) {
    var reportFile = path.join(process.cwd(), config.test.e2e.performance.data);

    if (!(fs.existsSync( path.dirname(reportFile) ))) {
      fs.mkdirSync( path.dirname(reportFile) );
    }

    var data: any = {'results': []};
    if (fs.existsSync( reportFile )) {
      data = JSON.parse( fs.readFileSync(reportFile, 'utf8') );
    }

    data.results.push(record);

    fs.writeFileSync(reportFile, JSON.stringify(data, null, 2));
  }

  getMemoryUsage(): IBrowserMemoryUsage {
    return browserSync.executeScript<IBrowserMemoryUsage>(function() {
      return (<any>window).performance.memory;
    });
  }
}

export class ChromeMemoryProfiler implements IProfiler {
  _reportFilePath: string;
  _records: any[] = [];
  _count = 0;

  constructor(reportFilePath: string) {
    this._reportFilePath = path.join(process.cwd(), reportFilePath);
    if (!(fs.existsSync(path.dirname(this._reportFilePath)))) {
      fs.mkdirSync(path.dirname(this._reportFilePath));
    }

    if (fs.existsSync(this._reportFilePath)) {
      fs.unlinkSync(this._reportFilePath);
    }
  }

  initialize() {
    try {
      testUtil.disableAllFtueGuidance();
    } catch (err) {
      // do nothing just bypass the failure in case the profiler is started before logging into Ultra
    }

    this._records = memory.printChromeMemoryInitialUsage(this._count++, 'start');

    return this;
  }

  start() {
    /* empty */
  }

  record(key: string) {
    this._records.push(memory.printChromeMemoryUsage(this._count++, key));
  }

  end() {
    /* empty */
  }

  startIgnore() {
    /*empty*/
  }

  endIgnore() {
    /*empty*/
  }

  writeToDisk() {
    this.record('end');
    fs.writeFileSync(this._reportFilePath, this._records.join('\n'));
  }
}

export abstract class TestWorkflow {
  env: IEnvironment;

  constructor(env: IEnvironment) {
    this.env = env;
  }

  abstract execute(basePage: controls.BasePage.Control, profiler: IProfiler): void;

  executeAndVerifyReturnedToBasePage(basePage: controls.BasePage.Control, profiler: IProfiler) {
    this.execute(basePage, profiler);
    return new controls.BasePage.Control();
  }
}
