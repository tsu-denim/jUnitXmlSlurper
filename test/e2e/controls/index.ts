
//admin
export import AdminAddCoursePage = require('./base/admin/admin-add-course_page');
export import AdminBuildingBlocksPage = require('./base/admin/admin-building-blocks_page');
export import AdminGatewayOptionsPage = require('./base/admin/admin-gateway-options_page');
export import AdminCoursesPage = require('./base/admin/admin-courses_page');
export import AdminGoalsPage = require('./base/admin/admin-goals_page');
export import AdminLtiToolProvidersPage = require('./base/admin/admin-lti-tool-providers_page');
export import AdminManageLtiProperties = require('./base/admin/admin-manage_lti_properties_page');
export import AdminManagePlacementsPage = require('./base/admin/admin-manage-placements_page');
export import AdminRegisterLtiProvidersPage = require('./base/admin/admin-register-lti-provider_page');

// To be inherited (should be above of the inherited page)
export import CalendarPage = require('./calendar/calendar_page');  // will be inherited by BaseCalendarPage and CourseCalendarPage

//login related
export import CreateAccountPage = require('./login/create-account_page');
export import ForgetPasswordPage = require('./login/forget-password_page');
export import LoginPage = require('./login/login_page');

//base
export import BaseActivityStreamPage = require('./base/stream/base-stream_page');
export import BaseAdminPage = require('./base/admin/base-admin_page');
export import BasePage = require('./base/base_page');
export import BaseCalendarPage = require('./base/calendar/base-calendar_page');
export import BaseCoursesPage = require('./base/courses/base-courses_page');
export import BaseGradesPage = require('./base/grades/base-grades_page');
export import BaseMessagesPage = require('./base/messages/base-messages_page');
export import BaseOrganizationsPage = require('./base/organizations/base-organizations_page');
export import BaseToolsPage = require('./base/tools/base-tools_page');
export import BaseInstitutionPage = require('./base/institution/institution-landing-page');
export import BaseInstitutionHelpModulePage = require('./base/institution/help-link-module-edit-page');
export import BaseInstitutionShowAllLinkPage = require('./base/institution/institution-peek-panel');
export import BaseInstitutionEditLogoPage = require('./base/institution/institution-peek-panel');
export import BaseInstitutionEditBannerPage = require('./base/institution/institution-peek-panel');
export import BaseInstitutionEditFeaturePage = require('./base/institution/institution-peek-panel');

// New window/tab
export import ExternalPage = require('./external-page');

//calendar
export import CalendarEvent = require('./calendar/calendar-event_panel');
export import CalendarItem = require('./calendar/calendar-item');
export import CalendarSettingsPanel = require('./calendar/edit/calendar-settings_panel');
export import EditCalendarItemPanel = require('./calendar/edit/edit-calendar-item_panel');
export import EditCourseSchedulePanel = require('./calendar/edit/edit-course-schedule_panel');

//components
export import BbmlEditor = require('./components/bbml-editor');
export import Checkbox = require('./components/checkbox');
export import ConfirmationNeeded = require('./components/confirmation-needed');
export import ContentOutline = require('./components/content-outline');
export import DatePicker = require('./components/date-picker');
export import DisplayGrade = require('./components/display-grade');
export import DisplayGradePill = require('./components/display-grade-pill');
export import GradeInputPill = require('./components/grade-input-pill');
export import GradingBar = require('./components/grading-bar');
export import LegacyCheckbox = require('./components/legacy_checkbox');
export import LinkPluginModal = require('./components/link_plugin_modal');
export import ImagePluginModal = require('./components/image_plugin_modal');
export import MediaGallery = require('./components/media-gallery');
export import OverflowMenuDeleteConfirmation = require('./components/overflow-menu-delete-confirmation');
export import PanelTitleTextEditor = require('./components/panel-title-text-editor');
export import Select = require('./components/select');
export import TimePicker = require('./components/time-picker');
export import TinyEditor = require('./components/tiny-editor');
export import VisibilityRules = require('./components/visibility-rules');
export import VisibilitySelector = require('./components/visibility-selector');

//course
export import BooksAndToolsPanel = require('./course/content/books-and-tools_panel');
export import ClassicCoursePage = require('./course/classic-course_page');
export import ContentConversation = require('./course/content/conversation_panel');
export import ContentCopyPanel = require('./course/content/copy/content-copy_panel');
export import ContentCreateMenu = require('./course/content/content-create_menu');
export import ContentItem = require('./course/content/content-item');
export import ContentMarketPage = require('./course/content/content-market_page');
export import ContentSubmissions = require('./course/content/submissions/content-submissions_panel');
export import ContentSubmissionDetail = require('./course/content/submissions/content-submission-detail_panel');
export import CourseCard = require('./course/course-card');
export import CourseCalendarPage = require('./course/calendar/course-calendar_page');
export import CourseDescriptionPanel = require('./course/course_description_panel');
export import CourseDiscussionsPage = require('./course/discussions/course-discussions_page');
export import CourseDiscussionsItem = require('./course/discussions/discussion-item');
export import CourseDiscussionDetail = require('./course/discussions/discussion-detail');
export import CourseExportPanel = require('./course/export/course-export_panel');
export import CourseGradesGraderPage = require('./course/grades/course-grades-grader_page');
export import CourseGradesViewerPage = require('./course/grades/course-grades-viewer_page');
export import CourseGradesSettingsPanel = require('./course/grades/course-grades-settings_panel');
export import CourseImportPanel = require('./course/import/course-import_panel');
export import CourseImportReportPanel = require('./course/import/course-import-report_panel');
export import CourseList = require('./course/course-list');
export import CourseMessagesPage = require('./course/messages/course-messages_page');
export import CourseNotice = require('./course/content/course-notice');
export import CourseOutlinePage = require('./course/content/course-outline_page');
export import CoursePage = require('./course/course-page');
export import CourseRosterPage = require('./course/roster/course-roster_page');
export import CourseStatusModal = require('./course/course-status-modal');
export import CreateCourseDiscussion = require('./course/discussions/create-discussion_panel');
export import DiscussionSettings = require('./course/discussions/discussion-settings_panel');
export import EditAssignmentPanel = require('./course/content/edit/edit-assignment_panel');
export import EditContentGroupPanel = require('./course/content/edit/edit-content-group_panel');
export import EditContentPanel = require('./course/content/edit/edit-content_panel');
export import EditCourseDiscussion = require('./course/discussions/edit-discussion_panel');
export import EditDocumentPanel = require('./course/content/edit/edit-document_panel');
export import EditDocumentSettingsPanel = require('./course/content/edit/edit-document-settings_panel');
export import EditFilePanel = require('./course/content/edit/edit-file_panel');
export import EditFolderPanel = require('./course/content/edit/edit-folder_panel');
export import EditLinkPanel = require('./course/content/edit/edit-link_panel');
export import EditLtiGradebookOptionsPanel = require('./course/content/edit/edit-lti-gradebook-options_panel');
export import EditLtiPanel = require('./course/content/edit/edit-lti_panel');
export import EditLtiPlacementPanel = require('./course/content/edit/edit-lti-placement_panel');
export import EditRosterPanel = require('./course/roster/edit-roster_panel');
export import EnrollRosterPanel = require('./course/roster/enroll-roster_panel');
export import InviteRosterPanel = require('./course/roster/invite-roster_panel');
export import Folder = require('./course/content/folder');
export import GradedDiscussionSubmissions = require('./course/discussions/graded-discussion-submissions_panel');
export import GradedDiscussionSubmissionDetail = require('./course/discussions/graded-discussion-submission-detail_panel');
export import ScoreRecommendationPanel = require('./course/discussions/graded-discussion-submission-detail_panel');
export import NonAttemptGradesPanel = require('./course/content/non-attempt-grades_panel');
export import StudentAccommodationsPanel = require('./course/roster/student-accommodation_panel');
export import UnsupportedContentPanel = require('./course/conversion/unsupported-content_panel');

// course assessments
export import AddAssessmentQuestionPanel = require('./course/content/assessments/question/add-assessment-question-panel');
export import EditAssessmentPanel = require('./course/content/edit/edit-assessment_panel');
export import EditAssessmentQuestions = require('./course/content/assessments/question/edit-assessment-questions');
export import EditAssessmentQuestion = require('./course/content/assessments/question/edit-assessment-question');
export import EditAssessmentSettingsPanel = require('./course/content/edit/edit-assessment-settings_panel');
export import MultipleAttemptSubmissionsPanel = require('./course/content/assessments/multiple-attempt-submissions_panel');
export import ReviewAssessmentQuestion = require('./course/content/assessments/question/review-assessment-question');
export import ViewerAssessmentOverviewPanel = require('./course/content/assessments/viewer-assessment-overview_panel');
export import ViewerAssessmentAttemptPanel = require('./course/content/assessments/viewer-assessment-attempt_panel');
export import ViewerAssessmentAttemptReviewPanel = require('./course/content/assessments/viewer-assessment-attempt-review_panel');
export import ViewerAssessmentAnswers = require('./course/content/assessments/viewer-assessment-answers');
export import ViewerAssessmentQuestion = require('./course/content/assessments/question/viewer-assessment-question');
export import ViewerAssessmentQuestions = require('./course/content/assessments/question/viewer-assessment-questions');
export import ViewerAssessmentOptionsPanel = require('./course/content/assessments/viewer-assessment-options_panel');

// course assignments
export import Comments = require('./course/content/assignments/comments');
export import SubmissionCard = require('./course/content/assignments/submission-card');
export import SubmitAssignment = require('./course/content/assignments/submit-assignment_panel');
export import ViewAssignment = require('./course/content/assignments/view-assignment_panel');
export import AssignmentAttachment = require('./course/content/edit/assignment-attachment');
export import RubricListPanel = require('./course/content/assignments/rubric-list_panel');

// course conversation
export import ClassConversationPanel = require('./course/content/edit/class-conversation_panel');

//grades
export import BaseGradesCourseAsGrader = require('./base/grades/base-grades-course-as-grader');
export import BaseGradesCourseAsStudent = require('./base/grades/base-grades-course-as-student');
export import Calculation = require('./grades/calculation');
export import GradeGrid = require('./grades/grade-grid');
export import GradeGridReborn = require('./grades/grade-grid-reborn');
export import GraderColumn = require('./grades/grader-column');
export import OfflineItemPanel = require('./grades/course-grades-offline-item_panel');
export import OverallGrade = require('./grades/overall-grade');
export import OverallGradePanel = require('./grades/overall-grade_panel');
export import ViewerColumn = require('./grades/viewer-column');
export import StudentColumn = require('./base/grades/student-column');
export import SubmissionGrading = require('./grades/submission-grading');

//ftue
export import FtuePage = require('./ftue/ftue_page');

//messages
export import CourseConversation = require('./messages/course-conversation');
export import CourseConversations = require('./messages/course-conversations');

// media widget
export import MediaFileSettingsPanel = require( './course/content/media-widget/media-file-settings_panel' );

//organizations
export import OrganizationPage = require('./organization/organization_page');

//tools
export import Tools = require('./base/tools/tools');

//profile
export import BaseProfilePage = require('./base/profile/base-profile_page');
export import ChangeAvatarPanel = require('./base/profile/avatar/change-avatar_panel');
export import ChangePasswordPanel = require('./base/profile/password/change-password_panel');
export import ChangeLanguagePanel = require('./base/profile/language/change-language_panel');
export import ChangePrivacyPanel = require('./base/profile/privacy/change-privacy_panel');
export import EditContactInfoPanel = require('./base/profile/edit/edit-contact-info_panel');
export import OneDriveLoginWindow = require('./base/profile/one_drive/one-drive-login_window');

//Classic Learn
export import classic = require('./classic/index');

//goal
export import goalPickerPage= require('./goal/goal-picker_page');
export import goalAlignmentPage= require('./goal/goal-alignment_page');

//rubric
export import RubricList = require('./course/rubric/rubric-list');
export import RubricGrid = require('./course/rubric/rubric-grid');
export import RubricPage = require('./course/rubric/rubric_page');
export import RubricSettings = require('./course/rubric/rubric-settings');
export import RubricEvaluationPanel = require('./course/rubric/rubric-evaluation_panel');
export import RubricViewPanel = require('./course/rubric/rubric-view_panel');

//targeted notification
export import CreateTargetedNotification = require('./base/stream/targeted-notification/create-targeted-notification_page');

//telemetry
export import StudentActivityReport = require('./telemetry/student-activity-report');
export import DiscussionForumInsights = require('./telemetry/discussion-forum-insights');
