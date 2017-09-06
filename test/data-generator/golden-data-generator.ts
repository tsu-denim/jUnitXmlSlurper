/* tslint:disable: no-console */
import ab = require('asyncblock');
import enums = require('../e2e/controls/enums/index');
import {Create} from '../e2e/test_data/create';
import {IEnvironment} from '../e2e/test_data/create_base';
import config from './config';

// users configurations
const usersGoldenData = config.users || <any>{};
const coursesGoldenData = config.courses || <any>{};

const INSTRUCTORS_NUM = usersGoldenData.instructorsNum || 1;
const STUDENTS_NUM = usersGoldenData.studentsNum || 30;

// courses & course memberships configurations
const regularCourses = coursesGoldenData.regular || <any>{};
const maxSizeOfRegularCourse = regularCourses.max || <any>{};
const averageSizeOfRegularCourse = regularCourses.average || <any>{};
const workshopCourses = coursesGoldenData.workshop || <any>{};
const maxSizeOfWorkshopCourse = workshopCourses.max || <any>{};
const averageSizeOfWorkshopCourse = workshopCourses.average || <any>{};

const COURSES_NUM = coursesGoldenData.total || 20;
const REGULAR_COURSES_NUM = Math.ceil(COURSES_NUM * (regularCourses.percentage || 0.5));
const MAX_SIZE_REGULAR_COURSES_NUM = Math.ceil(REGULAR_COURSES_NUM * (maxSizeOfRegularCourse.percentage || 0.1));
const MAX_SIZE_REGULAR_COURSES_MEMBERSHIPS_NUM = maxSizeOfRegularCourse.membershipsNum || 50;
const AVERAGE_SIZE_REGULAR_COURSES_NUM = Math.floor(REGULAR_COURSES_NUM * (averageSizeOfRegularCourse.percentage || 0.9));
const AVERAGE_SIZE_REGULAR_COURSES_MEMBERSHIPS_NUM = averageSizeOfRegularCourse.membershipsNum || 18;
const WORKSHOP_COURSES_NUM = Math.floor(COURSES_NUM * (workshopCourses.percentage || 0.5));
const MAX_SIZE_WORKSHOP_COURSES_NUM = Math.ceil(WORKSHOP_COURSES_NUM * (maxSizeOfWorkshopCourse.percentage || 0.1));
const MAX_SIZE_WORKSHOP_COURSES_MEMBERSHIPS_NUM = maxSizeOfWorkshopCourse.membershipsNum || 70;
const AVERAGE_SIZE_WORKSHOP_COURSES_NUM = Math.floor(WORKSHOP_COURSES_NUM * (averageSizeOfWorkshopCourse.percentage || 0.9));
const AVERAGE_SIZE_WORKSHOP_COURSES_MEMBERSHIPS_NUM = averageSizeOfWorkshopCourse.membershipsNum || 25;

// course enrollments configurations
const courseEnrollmentsGoldenData = config.courseEnrollments || <any>{};
const studentsEnrollments = courseEnrollmentsGoldenData.student || <any>{};
const instructorsEnrollments = courseEnrollmentsGoldenData.instructor || <any>{};

const NUM_OF_REGULAR_COURSES_STUDENT_ENROLLED_TO = studentsEnrollments.numOfRegularCoursesEnrolledTo || 10;
const NUM_OF_WORKSHOP_COURSES_STUDENT_ENROLLED_TO = studentsEnrollments.numOfWorkshopCoursesEnrolledTo || 5;
const NUM_OF_REGULAR_COURSES_INSTRUCTOR_ENROLLED_TO = instructorsEnrollments.numOfRegularCoursesEnrolledTo || 10;
const NUM_OF_WORKSHOP_COURSES_INSTRUCTOR_ENROLLED_TO = instructorsEnrollments.numOfWorkshopCoursesEnrolledTo || 5;

// course contents configurations
const courseContentsGoldenData = config.courseContents || <any>{};
const test = courseContentsGoldenData.test || <any>{};
const discussion = courseContentsGoldenData.discussion || <any>{};

const TESTS_NUM = test.number || 10;
const ESSAY_QUESTIONS_NUM = test.essayQuestionsNum || 10;
const ASSIGNMENTS_NUM = courseContentsGoldenData.assignmentsNum || 10;
const DISCUSSIONS_NUM = discussion.number || 10;
const COMMENTS_NUM = discussion.commentsNum || 10;
const DOCUMENTS_NUM = courseContentsGoldenData.documentsNum || 10;

// other constants
const PREFIX = '_golden_data_';
const COURSE_DESCRIPTION = PREFIX + 'course_description';
const DISCUSSION_TITLE = PREFIX + 'discussion';
const DISCUSSION_COMMENT = PREFIX + 'comment';

let env: IEnvironment = null;

function createUser(create: any, users: string[], num: number, isInstructor: boolean) {
  let prefix = isInstructor ? 'instructor' : 'student';
  for (let i = users.length; i < num; ++i) {
    let user = 0 === i ? prefix : `${prefix}_${i}`;
    env = create.user({resultName: user}).exec();

    users.push(user);
  }
}

function createCourseEnrollments(course: any, instructors: string[], students: string[]) {
  instructors.forEach((instructor) => {
    course.instructor({ enrollee: instructor });
  });
  students.forEach((student) => {
    course.student({ enrollee: student });
  });
  env = course.exec();
}

function createCourseContents(course: any, instructors: string[], students: string[], isWorkshop?: boolean) {
  let instructor: string = instructors[0];

  if (!isWorkshop) {
    // create tests with questions
    let test: any = null;
    for (let i = 0; i < TESTS_NUM; ++i) {
      test = course.test();
      env = test.question({questionCount: ESSAY_QUESTIONS_NUM, questionType: enums.QuestionType.Essay}).exec();
    }
    students.forEach((student) => {
      env = test.submission({from: student}).with.grade({from: instructor, postGrade: true}).exec();
    });

    // create assignments
    let assignment: any = null;
    for (let i = 0; i < ASSIGNMENTS_NUM; ++i) {
      assignment = course.assignment();
      env = assignment.exec();
    }
    students.forEach((student) => {
      env = assignment.submission({from: student}).with.grade({from: instructor, postGrade: true}).exec();
    });
  }

  for (let i = 0; i < DISCUSSIONS_NUM; ++i) {
    let discussion = course.discussion({
      from: instructor,
      overrides: {
        title: DISCUSSION_TITLE,
        visibility: enums.Visibility.Visible
      }
    });
    env = discussion.exec();
    for (let i = 0; i < COMMENTS_NUM; ++i) {
      env = discussion.comment({from: instructor, overrides: {content: DISCUSSION_COMMENT}}).exec();
    }
  }

  for (let i = 0; i < DOCUMENTS_NUM; ++i) {
    env = course.document().exec();
  }
}

function selectUsersToEnroll(membershipsNum: number, users: string[], enrolledInUsersMap: any, isWorkshopCourse: boolean, isInstructor: boolean, usersToEnroll: string[]) {
  let maxNumCoursesToEnroll: number = 0, type: string = null;
  if (isWorkshopCourse ) {
    if (isInstructor) {
      maxNumCoursesToEnroll = NUM_OF_WORKSHOP_COURSES_INSTRUCTOR_ENROLLED_TO;
    } else {
      maxNumCoursesToEnroll = NUM_OF_WORKSHOP_COURSES_STUDENT_ENROLLED_TO;
    }
    type = 'workshop';
  } else {
    if (isInstructor) {
      maxNumCoursesToEnroll = NUM_OF_REGULAR_COURSES_INSTRUCTOR_ENROLLED_TO;
    } else {
      maxNumCoursesToEnroll = NUM_OF_REGULAR_COURSES_STUDENT_ENROLLED_TO;
    }
    type = 'regular';
  }

  for (let j = 0, len = users.length; j < len && usersToEnroll.length < membershipsNum; ++j) {
    let user = users[j];
    let enrolled = enrolledInUsersMap[user];
    if (enrolled === undefined) {
      // the user not enrolled in any course
      enrolledInUsersMap[user] = {};
      enrolledInUsersMap[user][type] = 1;
      usersToEnroll.push(user);
    } else {
      let enrolledCnt = enrolledInUsersMap[user][type];
      // the user not enrolled in any course with current type
      if (enrolledCnt === undefined) {
        enrolledInUsersMap[user][type] = 1;
        usersToEnroll.push(user);
      } else {
        if (enrolledCnt < maxNumCoursesToEnroll) {
          // the user enrolled in with current course type but not reach maximum number of allowed enrollments
          enrolledInUsersMap[user][type] = enrolledCnt + 1;
          usersToEnroll.push(user);
        } else {
          // the user has reached the maximum number of allowed enrollments for current course type, try next one
          continue;
        }
      }
    }
  }
}

function createCourse(create: any, courses: any[], isWorkshopCourse: boolean, isMaxSize: boolean, instructors: string[], students: string[], enrolledInstructorsMap: any, enrolledStudentsMap: any) {
  let num: number = 0, membershipsNum: number = 0;
  if (isWorkshopCourse ) {
    if (isMaxSize) {
      num = MAX_SIZE_WORKSHOP_COURSES_NUM;
      membershipsNum = MAX_SIZE_WORKSHOP_COURSES_MEMBERSHIPS_NUM;
    } else {
      num = AVERAGE_SIZE_WORKSHOP_COURSES_NUM;
      membershipsNum = AVERAGE_SIZE_WORKSHOP_COURSES_MEMBERSHIPS_NUM;
    }
  } else {
    if (isMaxSize) {
      num = MAX_SIZE_REGULAR_COURSES_NUM;
      membershipsNum = MAX_SIZE_REGULAR_COURSES_MEMBERSHIPS_NUM;
    } else {
      num = AVERAGE_SIZE_REGULAR_COURSES_NUM;
      membershipsNum = AVERAGE_SIZE_REGULAR_COURSES_MEMBERSHIPS_NUM;
    }
  }

  for (let i = courses.length; i < num; ++i) {
    let course = create.course({ overrides: { description: COURSE_DESCRIPTION }});
    env = course.exec();

    let instructorsToEnroll: string[] = [];
    selectUsersToEnroll(1, instructors, enrolledInstructorsMap, isWorkshopCourse, true, instructorsToEnroll);
    let studentsToEnroll: string[] = [];
    selectUsersToEnroll(membershipsNum, students, enrolledStudentsMap, isWorkshopCourse, false, studentsToEnroll);

    createCourseEnrollments(course, instructorsToEnroll, studentsToEnroll);
    createCourseContents(course, instructorsToEnroll, studentsToEnroll, isWorkshopCourse);

    courses.push(course);
  }
}

let create = new Create();
let instructors: string[] = [];
let students: string[] = [];
let maxSizeRegularCourses: any[] = [];
let averageSizeRegularCourses: any[] = [];
let maxSizeWorkshopCourses: any[] = [];
let averageSizeWorkshopCourses: any[] = [];
let enrolledInstructorsMap = {};
let enrolledStudentsMap = {};

function setupData() {
  // create instructors
  createUser(create, instructors, INSTRUCTORS_NUM, true);

  // create students
  createUser(create, students, STUDENTS_NUM, false);

  // create a series of courses/course enrollments/course contents
  createCourse(create, maxSizeRegularCourses, false, true, instructors, students, enrolledInstructorsMap, enrolledStudentsMap);
  createCourse(create, averageSizeRegularCourses, false, false, instructors, students, enrolledInstructorsMap, enrolledStudentsMap);
  createCourse(create, maxSizeWorkshopCourses, true, true, instructors, students, enrolledInstructorsMap, enrolledStudentsMap);
  createCourse(create, averageSizeWorkshopCourses, true, false, instructors, students, enrolledInstructorsMap, enrolledStudentsMap);
}

function createdCoursesNum() {
  return maxSizeRegularCourses.length + averageSizeRegularCourses.length + maxSizeWorkshopCourses.length + averageSizeWorkshopCourses.length;
}

function createdUsersNum() {
  return instructors.length + students.length;
}

function coursesAndUsersToBeCreated() {
  let coursesToBeCreatedNum = COURSES_NUM - createdCoursesNum();
  let usersToBeCreatedNum = INSTRUCTORS_NUM + STUDENTS_NUM - createdUsersNum();
  return `${coursesToBeCreatedNum} course(s), ${usersToBeCreatedNum} user(s)`;
}

let preCreatedCoursesNum = 0, preCreatedUsersNum = 0;
function newCreatedCoursesAndUsers() {
  let totalCreatedCoursesNum = createdCoursesNum(), totalCreatedUsersNum = createdUsersNum();
  let dataSpec = `${totalCreatedCoursesNum - preCreatedCoursesNum} course(s), ${totalCreatedUsersNum - preCreatedUsersNum} user(s)`;
  preCreatedCoursesNum = totalCreatedCoursesNum;
  preCreatedUsersNum = totalCreatedUsersNum;
  return dataSpec;
}

function promptMsg(retriedTimes: number, statement: string) {
  let retriedTimesStatement = '';
  if (retriedTimes > 0) {
    retriedTimesStatement = `Retried for ${retriedTimes} time(s). `;
  }
  return `${retriedTimesStatement}${statement}`;
}

const totalRetryTimes = 10;
let retriedTimes = 0;
export function build(done: Function) {
  // if the data set is already generated, just set it and return
  if (env != null) {
    done(true);
    return;
  }

  let startTime = new Date();
  ab(() => {
    console.log(`Start to create${0 === retriedTimes ? ' ' : ' remaining ' }golden data \"${coursesAndUsersToBeCreated()}\" at ${startTime.toLocaleString()}......`);

    setupData();
  }, (err: any, data: any) => {
    let endTime = new Date();
    console.log(`Created \"${newCreatedCoursesAndUsers()}\" at ${endTime.toLocaleString()}, in ${endTime.getTime() - startTime.getTime()} ms.`);

    if (err) {
      console.log(`Failed with error: ${err}`);

      // Re-try to workaround possible issues (e.g., network connection, etc.)
      if (retriedTimes === totalRetryTimes) {
        console.log(promptMsg(retriedTimes, 'Quit.'));
        done(false);
      } else {
        console.log(promptMsg(retriedTimes, 'Retrying after 60 seconds......'));
        setTimeout(() => {
          ++retriedTimes;
          env = null;
          build(done);
        }, 60000);
      }
    } else {
      console.log(promptMsg(retriedTimes, 'Successfully completed!'));
      done(true);
    }
  });
}