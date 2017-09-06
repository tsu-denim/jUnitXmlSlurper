export default {
  users: {
    instructorsNum: 1350,
    studentsNum: 13000
  },
  courses: {
    total: 1000,
    regular: {
      percentage: 0.5,
      max: {
        percentage: 0.1,
        membershipsNum: 50
      },
      average: {
        percentage: 0.9,
        membershipsNum: 18
      }
    },
    workshop: {
      percentage: 0.5,
      max: {
        percentage: 0.1,
        membershipsNum: 70
      },
      average: {
        percentage: 0.9,
        membershipsNum: 25
      }
    }
  },
  courseEnrollments: {
    student: {
      numOfRegularCoursesEnrolledTo: 10,
      numOfWorkshopCoursesEnrolledTo: 5
    },
    instructor: {
      numOfRegularCoursesEnrolledTo: 10,
      numOfWorkshopCoursesEnrolledTo: 5
    }
  },
  courseContents: {
    test: {
      number: 10,
      essayQuestionsNum: 10,
    },
    assignmentsNum: 10,
    discussion: {
      number: 10,
      commentsNum: 10,
    },
    documentsNum: 10
  }
};