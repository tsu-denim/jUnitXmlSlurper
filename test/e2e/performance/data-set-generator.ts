/* tslint:disable:no-console no-var-requires*/
import ab = require('asyncblock');
import enums = require('../controls/enums/index');
import moment = require('moment');
import testUtil = require('../test_util');
import fs = require('fs');
import path = require('path');

import {Create} from '../test_data/create';
import {IEnvironment} from '../test_data/create_base';

export const PAST_COURSES = 15;
export const FUTURE_COURSES = 15;
export const CURRENT_COURSES = 15;
export const STUDENTS = 150;
export const CALENDARS = 15;
export const DISCUSSIONS = 15;
export const MESSAGES = 150;
export const ASSIGNMENT = 45;
export const TESTS = 15;
export const QUESTION_COUNT_PER_TYPE = 24;
export const RESPONSES = 50;
var config = require('../../../../../config/config.js');

export const REPLIES_PER_RESPONSE = 5;
export const SUB_REPLIES_PER_REPLY = 5;
export const QUESTION_TYPES = 3;

export const ADMINISTRATOR = 'administrator';
export const INSTRUCTOR = 'instructor';
export const COURSE_A = 'CourseA';
export const COURSE_A_NAME = `_${testUtil.PREFIX}course_CourseA`;
export const FINAL_TEST = 'Final';
export const EDITABLE_TEST = 'Editable';
export const STUDENT = 'student_1';
export const LAST_ASSIGNMENT = `assignment_${ASSIGNMENT}`;

let env: IEnvironment;
let perfConfigFile = path.join(process.cwd(), config.test.e2e.performance.perfConfig);
var dataSetFile = path.join(process.cwd(), config.test.e2e.performance.dataSet);
let perfConfig = JSON.parse(fs.readFileSync(perfConfigFile, 'utf-8'));
let perfDataSet: any = null;
if (fs.existsSync(dataSetFile)) {
  try {
    perfDataSet = JSON.parse(fs.readFileSync(dataSetFile, 'utf-8'));
  } catch (e) {
    perfDataSet = null;
  }
}

/**
 * This will produce and return an environment which contains:
 *
 * A total of 30 past courses, 15 current courses, 15 future courses. One instructor is enrolled in all courses.
 * One current, open course ("course A") has 150 enrolled students and contains 15 tests, 15 assignments, 15 discussions.
 *   All content is gradable and has progressive due dates spread across future weeks.
 *   Every student has submitted or posted once for each content item.
 *   Instructor has received a message from each student.
 * One test in course A - "Final" - contains 72 questions; 24 of each question type.
 * One test in course A - "Editable Test" - contains 72 questions; 24 of each question type and no student submissions.
 * One assignment - "Converse" - has class conversations enabled and contains a post from each student.
 *
 * TODO: This method is incomplete and fairly inefficient, it currently takes ~85 seconds
 * TODO: Course with a large number of groups
 */
function setupData() {
  let create = new Create();

  // Create Administrator
  create.systemAdmin({resultName: ADMINISTRATOR});

  // Create main "instructor" user
  create.user({resultName: INSTRUCTOR});

  console.log('Generating courses');

  // Create past courses
  for (let i = 0; i < PAST_COURSES; i++) {
    create.course({ overrides: {
        durationType: 'DATE_RANGE',
        startDate: moment().subtract(60, 'day').toDate(),
        endDate: moment().subtract(30, 'day').toDate()
      }})
      .with.instructor({enrollee: INSTRUCTOR});
  }

  // Create future courses
  for (let i = 0; i < FUTURE_COURSES; i++) {
    create.course({ overrides: {
        durationType: 'DATE_RANGE',
        startDate: moment().add(30, 'day').toDate(),
        endDate: moment().add(60, 'day').toDate()
      }})
      .with.instructor({enrollee: INSTRUCTOR});
  }

  // Create current courses
  for (let i = 0; i < CURRENT_COURSES - 1; i++) {
    create.course().with.instructor({enrollee: INSTRUCTOR});
  }

  // Create "Course A"
  let course = create.course({resultName: COURSE_A, overrides: {name: COURSE_A_NAME}});
  course.instructor({enrollee: INSTRUCTOR}).and.students(STUDENTS).exec();

  console.log('Generating messages');
  for (let i = 1; i <= MESSAGES; i++) {
    course.conversation({ from: INSTRUCTOR, to: ['student_' + i] }).exec();
  }

  // Create Final test
  console.log('Generating Final test');
  let finalTest = course.test({resultName: FINAL_TEST});
  for (let i = 1; i <= QUESTION_COUNT_PER_TYPE; i++) {
    finalTest.question({questionType: enums.QuestionType.Essay}).exec();
    finalTest.question({questionType: enums.QuestionType.Multiple}).exec();
    finalTest.question({questionType: enums.QuestionType.Either}).exec();
  }

  console.log('Generating Final test student submissions');
  for (let i = 1; i <= STUDENTS; i++) {
    finalTest.submission({from: 'student_' + i}).exec();
  }

  // Create Editable test - no submission
  console.log('Generating Editable test');
  let editableTest = course.test({resultName: EDITABLE_TEST});
  for (let i = 1; i <= QUESTION_COUNT_PER_TYPE; i++) {
    editableTest.question({questionType: enums.QuestionType.Essay}).exec();
    editableTest.question({questionType: enums.QuestionType.Multiple}).exec();
    editableTest.question({questionType: enums.QuestionType.Either}).exec();
  }

  // Create tests other than Final & Editable
  console.log('Generating tests');
  for (let i = 1; i <= TESTS - 2; i++) {
    course.test().exec();
  }

  // Create calendars
  console.log('Generating calendars');
  for (let i = 1; i <= CALENDARS; i++) {
    course.calendarItem().exec();
  }

  // Create discussions
  console.log('Generating discussions');
  for (let i = 1; i <= DISCUSSIONS; i++) {
    let discussion = course.discussion({from: INSTRUCTOR, overrides: {visibility: enums.Visibility.Visible}});
    for (let j = 1; j <= RESPONSES; j++) {
      let commentName = 'comment_' + j;
      discussion.comment({from: INSTRUCTOR, resultName: commentName}).exec();
      for (let k = 1; k <= REPLIES_PER_RESPONSE; k++) {
        let replyName = 'reply_' + k;
        discussion.reply({from: INSTRUCTOR, parentMessage: commentName, resultName: replyName}).exec();
        for (let l = 1; l <= SUB_REPLIES_PER_REPLY; l++) {
          discussion.reply({from: INSTRUCTOR, parentMessage: replyName}).exec();
        }
      }
    }
  }

  // Create assignments
  console.log('Generating assignments');
  for (let i = 1; i <= ASSIGNMENT; i++) {
    course.assignment({resultName: `assignment_${i}`}).exec();
  }

  console.log('Resolving all remaining data entities');
  env = create.exec();
}

function writeToDisk(dataSet: any) {

  if (!(fs.existsSync( path.dirname(dataSetFile) ))) {
    fs.mkdirSync( path.dirname(dataSetFile) );
  }

  if (fs.existsSync( dataSetFile )) {
    fs.unlinkSync(dataSetFile);
  }

  fs.writeFileSync(dataSetFile, JSON.stringify(dataSet, null, 2));
}

// Warning: This method is not written to handle any parallel execution of performance test suites, do not run performance suites in parallel
export function build(cb: (env: IEnvironment) => void) {
  return (done: Function) => {
    // If the data set is already generated, just set it and return
    if (env != null) {
      cb(env);
      done();
      return;
    }

    if (perfConfig.reuseDataSet) {
      if (perfDataSet) {
        env = perfDataSet;
        cb(env);
        done();
        return;
      } else {
        console.log('\x1b[31m', 'Failed to load the performance test data set last ran. Regenerate a new data set');
      }
    }

    ab(() => {
      var dataSetupStart = new Date().getTime();

      setupData();

      writeToDisk(env);
      console.log('Data setup completed in ' + (new Date().getTime() - dataSetupStart) + 'ms');
    }, (err: any) => {
      if (err) {
        console.log('Failed to create data set for performance tests: ' + err);
        fail();
      }

      cb(env);

      done();
    });
  };
}