//import React from 'react';
//import ReactDOM from 'react-dom';

numeral.defaultFormat('0.00');

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      suites: {}, // This will hold the aggregated test data
      dataError: false,
      reportDataType: 'url',
      reportDataUrl: 'performance_data.json',
      reportDataFile: null
    };
  }

  componentWillMount() {
    this.refreshResultsData();
  }

  updateReportDataFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      this.setState({reportDataType: 'file', reportDataFile: e.target.files[0]});
    }
  }

  refreshResultsData = (e) => {
    if (e) {
      e.preventDefault();
    }

    this.setState({dataError: false, suites: {}});

    if (this.state.reportDataType === 'url' && this.state.reportDataUrl) {
      fetch(this.state.reportDataUrl).then(res => {
        res.json().then(data => {
          if (data.error) {
            this.setState({dataError: true});
          } else {
            this.processResultsData(data.results);
          }
        }, err => {
          this.setState({dataError: true});
        })
      })
    } else if (this.state.reportDataType === 'file' && this.state.reportDataFile) {
      let reader = new FileReader();
      reader.onload = (event) => {
        const data = JSON.parse(event.target.result);
        this.processResultsData(data.results);
      };
      reader.readAsText(this.state.reportDataFile);
    }
  }

  /**
   * Structure and results so they follow:
   * suites = {
   *  'suite name': {
   *    averageElapsedTime: number,
   *    averageApiRequests: number,
   *    averageApiTime: number,
   *    tests: {
   *      'test name': {
   *        averageElapsedTime: number,
   *        averageApiRequests: number,
   *        averageApiTime: number,
   *        results: {
   *          startTime: number,
   *          totalElapsedTime: number,
   *          totalApiRequests: number,
   *          totalApiTime: number,
   *          records: [ {
   *            key: string,
   *            elapsed: number,
   *            totalApiRequests: number,
   *            totalApiTime: number,
   *            memory: {
   *              totalJSHeapSize: number,
   *              usedJSHeapSize: number
   *            },
   *            apiLog: [ {
   *              url: string,
   *              method: string,
   *              params: obj,
   *              elapsedTime: number
   *            }, ... ],
   *          }, ... ]
   *        },
   *        apiStats: {
   *          // ...
   *        }
   *      }
   *    }
   *  }
   *
   *  It is much cleaner to do this in one place here rather than spread it across the component rendering
   **/
  processResultsData = (resultRows) => {
    const suites = {};

    // Structure the data
    resultRows.forEach(result => {
      if (suites[result.suite] == null) {
        suites[result.suite] = {
          averageElapsedTime: 0,
          averageApiRequests: 0,
          averageApiTime: 0,
          tests: {}
        }
      }

      if (suites[result.suite].tests[result.test] == null) {
        suites[result.suite].tests[result.test] = {
          averageElapsedTime: 0,
          averageApiRequests: 0,
          averageApiTime: 0,
          results: []
        }
      }

      // TODO: That's kinda ugly...
      suites[result.suite].tests[result.test].results.push({
        startTime: result.startTime,
        totalElapsedTime: result.totalElapsedTime,
        totalApiRequests: 0,
        totalApiTime: 0,
        records: result.records
      })
    });

    // Filter and aggregate the data (depth-first traversal)
    Object.entries(suites).map(([suiteName, suite]) => {
      Object.entries(suite.tests).map(([testName, test]) => {
        // Use the last result as the "golden" one to determine how many time-point records should be in a pass
        // Any pass that has a different number is discarded from the test results
        // Also validate that the time-point names match, discard any with mismatched names
        const lastResultRecords = test.results[test.results.length - 1].records;
        const expectedRecordCount = lastResultRecords.length;
        const expectedRecordNames = lastResultRecords.map(record => record.key);

        let filteredResults = test.results.filter((result) => {
          return result.records.length === expectedRecordCount &&
            result.records.filter((record, idx) => record.key === expectedRecordNames[idx]).length === expectedRecordCount
        });

        // Only render the last 5 passes
        test.results = filteredResults.slice(-5);

        // Aggregate API stats
        test.results.forEach(result => {
          result.totalApiRequests = 0;
          result.totalApiTime = 0;

          result.records.forEach(record => {
            record.totalApiRequests = 0;
            record.totalApiTime = 0;

            record.apiLog.forEach(apiLogEntry => {
              record.totalApiRequests++;
              record.totalApiTime += apiLogEntry.elapsedTime;
            });

            result.totalApiRequests += record.totalApiRequests;
            result.totalApiTime += record.totalApiTime;
          })
        });

        // Produce per-url counts for the entire test result and each time-point record
        test.results.forEach(result => {
          result.apiStats = [];

          result.records.forEach(record => {
            record.apiStats = [];

            record.apiLog.forEach(apiLogEntry => {
              const entries = result.apiStats.filter(row => row.method === apiLogEntry.method && row.url === apiLogEntry.url);

              if (entries.length > 0) {
                entries[0].calls.push({
                  params: apiLogEntry.params,
                  elapsedTime: apiLogEntry.elapsedTime
                });

                entries[0].averageElapsedTime = entries[0].calls.reduce((sum, call) => sum + call.elapsedTime, 0) / entries[0].calls.length;
              } else {
                result.apiStats.push({
                  method: apiLogEntry.method,
                  url: apiLogEntry.url,
                  averageElapsedTime: apiLogEntry.elapsedTime,
                  calls: [ {
                    params: apiLogEntry.params,
                    elapsedTime: apiLogEntry.elapsedTime
                  } ]
                })
              }
            });
          });

          // TODO: Sort apiStats by request count
          result.apiStats.sort((a, b) => b.calls.length - a.calls.length);
        });

        test.averageElapsedTime = test.results.reduce((sum, result) => sum + result.totalElapsedTime, 0) / test.results.length;
        test.averageApiRequests = test.results.reduce((sum, result) => sum + result.totalApiRequests, 0) / test.results.length;
        test.averageApiTime = test.results.reduce((sum, result) => sum + result.totalApiTime, 0) / test.results.length;
      });
    });

    this.setState({
      suites: suites
    })
  }

  render() {
    let mainContent = '';

    if (this.state.dataError) {
      mainContent = (
        <div className="alert alert-error">
          Error retrieving performance data
        </div>
      )
    } else {
      const suites = this.state.suites || {};

      mainContent = Object.entries(suites).map(([suiteName, suite]) => {
        return (
          <TestSuite key={suiteName} name={suiteName} suite={suite}></TestSuite>
        )
      });
    }

    return (
      <div>
        <nav className="navbar navbar-toggleable-md navbar-inverse bg-inverse">
          <a className="navbar-brand" href="#">Ultra Performance Report Viewer</a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto"></ul>
            <form className="form-inline text-white" onSubmit={this.refreshResultsData}>
              <label>Load Report JSON:</label>
              <input className="form-control" type="file" onChange={this.updateReportDataFile} />
              <button className="btn" type="submit">Load</button>
            </form>
          </div>
        </nav>
        <div className="main container-fluid">
          <div>
            {mainContent}
          </div>
        </div>
      </div>
    )
  }
}

class TestSuite extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const tests = Object.entries(this.props.suite.tests).map(([testName, test]) => {
      return (
        <TestResults key={testName} name={testName} test={test}></TestResults>
      )
    });

    return (
      <div className="card">
        <div className="card-header"><h5>{this.props.name}</h5></div>
        <div className="card-block">{tests}</div>
      </div>
    )
  };
}

class TestResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'time'
    }
  }

  activateTab = (tabName) => {
    this.setState({activeTab: tabName});
  }

  render() {
    let selectedTableTpl = '';
    switch (this.state.activeTab) {
      case 'memory':
        selectedTableTpl = <ResultMemoryTable test={this.props.test} />;
        break;
      case 'api':
        selectedTableTpl = <ResultApiTable test={this.props.test} />;
        break;
      default:
        selectedTableTpl = <ResultTimeTable test={this.props.test} />;
    }

    return (
      <div className="test-card card">
        <div className="card-header d-flex justify-content-end">
          <div className="p-2 mr-auto"><strong>{this.props.name}</strong></div>
          <div className="p-2">Average Total Time: {numeral(this.props.test.averageElapsedTime / 1000).format()}</div>
          <div className="p-2">Average API Time: {numeral(this.props.test.averageApiTime / 1000).format()}</div>
          <div className="p-2">Average API Requests: {numeral(this.props.test.averageApiRequests).format()}</div>
        </div>
        <div className="card-block">
          <div className="row">
            <ul className="nav nav-tabs">
              <ResultTab name="time" label="Time" active={this.state.activeTab === 'time'} activate={this.activateTab} />
              <ResultTab name="memory" label="Memory" active={this.state.activeTab === 'memory'}  activate={this.activateTab} />
              <ResultTab name="api" label="API" active={this.state.activeTab === 'api'}  activate={this.activateTab} />
            </ul>
          </div>
          <div className="row">
            <div className="table-wrapper table-responsive">
              {selectedTableTpl}
            </div>
          </div>
        </div>
      </div>
    )
  };
}

function ResultTab(props) {
  const activate = (e) => {
    e.preventDefault();
    props.activate(props.name);
  };

  return (
    <li className="nav-item">
      <a className={"nav-link " + (props.active && 'active')} href="#" onClick={activate}>{props.label}</a>
    </li>
  )
}

class ResultTimeTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const results = this.props.test.results;

    // The last result is used to extract the time point names displayed in the first column
    const lastResult = results[results.length - 1];
    const timePointNames = lastResult.records.map(record => record.key);

    const timeRecordHeaders = results.map((result, idx) =>
      <th key={idx} className="pass-header">Pass {idx+1}</th>
    );

    const timeRecordRows = timePointNames.map((recordName, idx) => {
      const timeRecords = results.map((result, pass) => {
        const record = result.records[idx];
        return (
          <td key={pass} className="numeric">{numeral(record.elapsed / 1000).format()}</td>
        )
      });

      return (
        <tr key={idx}>
          <td key={recordName}>{recordName}</td>
          {timeRecords}
        </tr>
      )
    });

    const totalElapsedTime = results.map((result, pass) => {
      return [
        <td key={pass} className="numeric">{numeral(result.totalElapsedTime / 1000).format()}</td>
      ]
    });

    const totalApiTime = results.map((result, pass) => {
      return <td key={pass} className="numeric">{numeral(result.totalApiTime / 1000).format()}</td>
    });

    const totalApiRequests = results.map((result, pass) => {
      return <td key={pass} className="numeric">{result.totalApiRequests}</td>
    });

    return (
      <table className="activity-table card-block table table-sm">
        <thead className="thead-default">
        <tr>
          <th key="Activity" className="activity-header">Activity</th>
          {timeRecordHeaders}
        </tr>
        </thead>
        <tbody>
        {timeRecordRows}
        </tbody>
        <tfoot className="tfoot">
        <tr>
          <td>Total Elapsed Time</td>
          {totalElapsedTime}
        </tr>
        <tr>
          <td>Total API Time</td>
          {totalApiTime}
        </tr>
        <tr>
          <td>Total API Requests</td>
          {totalApiRequests}
        </tr>
        </tfoot>
      </table>
    )
  }
}

class ResultMemoryTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const results = this.props.test.results;

    // The last result is used to extract the time point names displayed in the first column
    const lastResult = results[results.length - 1];
    const recordNames = lastResult.records.map(record => record.key);

    const passHeaders = results.map((result, idx) =>
      <th key={idx} className="pass-header">Pass {idx+1}</th>
    );

    const rows = recordNames.map((recordName, idx) => {
      const timeRecords = results.map((result, pass) => {
        const record = result.records[idx];
        return <td key={pass} className="numeric">{numeral(record.memory.usedJSHeapSize).format('0.0 b')}</td>
      });

      return (
        <tr key={idx}>
          <td key={recordName}>{recordName}</td>
          {timeRecords}
        </tr>
      )
    });

    return (
      <table className="activity-table card-block table table-sm">
        <thead className="thead-default">
        <tr>
          <th key="Activity" className="activity-header">Activity</th>
          {passHeaders}
        </tr>
        </thead>
        <tbody>
        {rows}
        </tbody>
      </table>
    )
  }
}

class ResultApiTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      passIdxForApiStats: 0,
      apiStatsExpandedRows: []
    }
  }

  selectPassForApiStats = (passIdx) => {
    this.setState({passIdxForApiStats: passIdx});
  };

  // Expands a row in the request table to show each individual requests's parameters
  toggleRequestDetails = (rowIdx) => {
    const expandedRows = this.state.apiStatsExpandedRows;
    const entryIdx = expandedRows.indexOf(rowIdx);
    if (entryIdx > -1) {
      this.setState({apiStatsExpandedRows: [...expandedRows.slice(0, entryIdx), ...expandedRows.slice(entryIdx + 1)]})
    } else {
      this.setState({apiStatsExpandedRows: [...this.state.apiStatsExpandedRows, rowIdx]});
    }
  };

  render() {
    const results = this.props.test.results;
    const apiStats = results[this.state.passIdxForApiStats].apiStats;

    const rowDetails = (rowIdx) => {
      if (this.state.apiStatsExpandedRows.indexOf(rowIdx) === -1) {
        return '';
      }

      const details = apiStats[rowIdx].calls.map((call, idx) => {
        const paramsStr = (call.params) ? JSON.stringify(call.params) : 'N/A';

        return (<div key={idx}>{paramsStr}</div>);
      });

      return (
        <div>{details}</div>
      );
    };

    const apiRows = apiStats.map((row, idx) => {
      // TODO: This toggle is a good candidate for a separate component
      const icon = (this.state.apiStatsExpandedRows.indexOf(idx) === -1) ? '[+]' : '[-]';

      return (
        <tr key={idx}>
          <td onClick={() => this.toggleRequestDetails(idx) }><button type="button" className="btn btn-link btn-sm">{icon}</button></td>
          <td className="numeric">{row.calls.length}</td>
          <td className="numeric">{numeral(row.averageElapsedTime / 1000).format()}</td>
          <td className="numeric">{row.method}</td>
          <td>{row.url}{rowDetails(idx)}</td>
        </tr>
      );
    });

    return (
      <table className="api-table card-block table table-sm table-striped">
        <thead className="thead-default">
        <tr>
          <th></th>
          <th>Req #</th>
          <th>Avg Time</th>
          <th>Method</th>
          <th className="url-header">URL</th>
        </tr>
        </thead>
        <tbody>
        {apiRows}
        </tbody>
      </table>
    )
  }
}

ReactDOM.render( <App />, document.getElementById('react-app'));