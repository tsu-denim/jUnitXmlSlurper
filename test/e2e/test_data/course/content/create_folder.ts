import ab = require('asyncblock');
import createAssignment = require('../../assessment/create-assessment');
import createBase = require('../../create_base');
import createDiscussion = require('../../course/content/create_discussion');
import createGeneric = require('../../generic/create_generic');
import dataApi = require('../../data_api');
import dataBuilder = require('../../data_builder');
import enums = require('../../../controls/enums/index');

export class CreateFolder<T extends createBase.CreateBase> extends createGeneric.CreateGeneric<T> {

  folder( args?: { resultName?: string; overrides?: any} ) {
    var folder = this._getData();
    var folderTitle = dataBuilder.generateCourseContentTitle(enums.ContentHandler.Folder);
    var folderDetail = dataBuilder.generateFolderDetail();
    var folderVisibility = (args && args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;

    var newFolder = dataBuilder.generateCourseContent(folder.courseId,
      folder.id,
      folderTitle,
      enums.ContentHandler.Folder,
      folderDetail,
      folderVisibility
    );
    var dataRecord = this._createDataRecord('folder', args && args.resultName);

    dataApi.createFolder({ folder: newFolder, courseId: folder.courseId }, this._adminAuth, dataRecord.callback);

    return new CreateFolder(this, dataRecord);
  }

  /**
   * Creates a link in the folder in context.
   *
   * @param args.resultName An optional name to store the created link under
   */
  externalLink(args?: { resultName?: string; overrides?: any; url?: string }) {
    var folder = this._getData();
    var externalLinkTitle = (args && args.overrides && args.overrides.title)
      || dataBuilder.generateCourseContentTitle(enums.ContentHandler.ExternalLink);
    var linkVisibility = (args && args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;
    var adaptiveReleaseRules = args && args.overrides && args.overrides.adaptiveReleaseRules;
    var positionBefore = args && args.overrides && args.overrides.positionBefore;
    var positionAfter = args && args.overrides && args.overrides.positionAfter;

    var link = dataBuilder.generateCourseContent(
      folder.courseId,
      folder.id,
      externalLinkTitle,
      enums.ContentHandler.ExternalLink,
      dataBuilder.generateExternalLinkDetail({url: args && args.url}),
      linkVisibility,
      adaptiveReleaseRules,
      positionBefore,
      positionAfter
    );

    var dataRecord = this._createDataRecord('externalLink', args && args.resultName);

    dataApi.createCourseContent({
      content: link,
      courseId: folder.courseId
    }, this._adminAuth, dataRecord.callback);

    return new createGeneric.CreateGeneric(this, dataRecord);
  }

  /**
   * Creates a discussion in the folder in context
   *
   * @param args.resultName An optional name to store the created link under
   */
  discussion(args: { from: string; resultName?: string; overrides?: any; }) {
    var folder = this._getData();
    var parentId = folder.id;
    var discussionTitle = (args.overrides && args.overrides.title)
      || dataBuilder.generateCourseContentTitle(enums.ContentHandler.Discussion);
    var discussionContentDetail = dataBuilder.generateDiscussionContentDetail(discussionTitle);
    var discussionVisibility = (args.overrides && args.overrides.visibility) ? args.overrides.visibility : enums.Visibility.Hidden;

    var dataRecord = this._createDataRecord('discussion', args.resultName);
    var discussionContent = dataBuilder.generateCourseContent(folder.courseId,
      parentId,
      discussionTitle,
      enums.ContentHandler.Discussion,
      discussionContentDetail,
      discussionVisibility
    );

    var from = this._resolve(args.from);
    dataApi.createDiscussion({ discussionContent: discussionContent, courseId: folder.courseId }, from, dataRecord.callback);

    return new createDiscussion.CreateDiscussion(this, dataRecord);
  }
}