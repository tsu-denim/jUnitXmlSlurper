import * as _ from 'lodash';
import {ElementFinderSync, browserSync, elementSync, polledExpect, waitFor} from 'protractor-sync';

export function getChromeMemoryUsage() {

  let cmd: any = require('child_process').spawnSync('./bin/chrome-memory-usage', [ process.pid ], {
    cwd: __dirname + '/../../../..',
  });

  let jsmem: any = browserSync.executeScript(() => (<any>window).performance.memory);
  for ( let key in jsmem ) {
    jsmem[key] = jsmem[key] / 1024;
  }

  return _.extend( jsmem, JSON.parse(cmd.stdout));
}

export function printChromeMemoryUsage( mark: string|number, activity: string ): string {

  let mem: any = getChromeMemoryUsage();

  let results: string[] = [mark + '', activity, new Date().toString()];
  _(mem).keys().sort().each(( k: string ) => {
    results.push( mem[k] );
  });

  return results.join(',');
}

export function printChromeMemoryInitialUsage( mark: string|number, activity: string ): string[] {

  let headers: string[] = ['ops', 'activity', 'time'];
  let results: string[] = [mark + '', activity, new Date().toString()];

  let mem: any = getChromeMemoryUsage();

  _(mem).keys().sort().each(( k: string ) => {
    headers.push( k );
    results.push( mem[k] );
  });

  return [headers.join(','), results.join(',')];
}
