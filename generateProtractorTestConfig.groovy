#!/usr/bin/env groovy

def cli = new CliBuilder()
cli.with
        {
            p(longOpt: 'protractorTestDir', 'Protractor Test Directory', type: String, args: 1, required: true)
            j(longOpt: 'jUnitReportDir', 'jUnit Report Directory', type: String, args: 1, required: true)
            t(longOpt: 'testSummaryFileName', 'Desired Output Name of Test Summary', type: String, args: 1, required: true)
        }
def opt = cli.parse(args)
if (!opt) return
if (opt.h) cli.usage()
println "The args are ${opt.p}, ${opt.j}, ${opt.t}."

def protractorDir = new File(opt.p);
def jUnitDir = new File(opt.j);

if ((!protractorDir.exists()) || (!jUnitDir.exists())){
    println "Error Locating Input Files"
    if (!protractorDir.exists()){
        println "Error: Protractor directory " + protractorDir + " does not exist on the file system."

    }

    if (!jUnitDir.exists()){
        println "Error: jUnit test report directory " + jUnitDir + " does not exist on the file system."
    }

    println "Debug Info: Script was executed from directory " + System.getProperty("user.dir")
    println "Debug Info: Relative paths are evaluated with starting point " + System.getProperty("user.dir")
    println "Debug Info: Script is stored in directory " + getClass().protectionDomain.codeSource.location.path
    return
}

lib = new jUnitReportXmlSlurper()
reportPath = jUnitDir.absolutePath
tests = lib.getTestReportSummary(reportPath);

println "Total Test Count is: " + tests.testExecutionList.size()