var _ = require('lodash');

module.exports = {
  extend: 'apostrophe-pieces',
  name: 'apostrophe-redirect',
  alias: 'redirects',
  label: 'Redirect',
  pluralLabel: 'Redirects',
  searchable: false,
  adminOnly: true,
  // Default type being joined for internal redirects.
  // Can be overwritten project level with an array of
  // multiple piece types: ex: [ 'apostrophe-page', 'news', 'people' ]
  withType: 'apostrophe-page',
  // Default status code. Must be one of the valid choices
  // for the `statusCode` select field
  statusCode: 302,
  openGraph: false, // Disables apostrophe-open-graph for redirects
  seo: false, // Disables apostrophe-seo for redirects
  sitemap: false, // Disables apostrophe-site-map for redirects
  addFields: [
    {
      name: 'redirectSlug',
      // This is *not* type: 'slug' because we want to let you match any
      // goldang nonsense the old site had in there, including mixed case
      type: 'string',
      label: 'Old URL',
      help: 'Format with leading / such as /old-url',
      required: true
    },
    {
      // contextual flag set so you don't see it in the editor; this gets updated
      // by beforeSave
      type: 'slug',
      name: 'slug',
      label: 'Slug',
      required: true,
      contextual: true
    },
    {
      name: 'title',
      label: 'Description',
      type: 'string',
      required: true
    },
    {
      // contextual: true to hide this property
      type: 'boolean',
      name: 'published',
      label: 'Published',
      required: true,
      def: true,
      contextual: true
    },
    {
      name: 'urlType',
      label: 'Link To',
      type: 'select',
      choices: [
        { label: 'Internal Page', value: 'internal', showFields: [ '_newPage' ] },
        { label: 'External URL', value: 'external', showFields: [ 'externalUrl' ] }
      ]
    },
    {
      name: 'ignoreQueryString',
      label: 'Ignore query string when matching.',
      type: 'boolean',
      def: false
    },
    {
      name: '_newPage',
      type: 'joinByOne',
      withType: 'apostrophe-page',
      label: 'Page Title',
      idField: 'pageId',
      filters: {
        projection: { slug: 1, title: 1, _url: 1 },
        // Admins set up redirects, so it's OK for non-admins to follow them anywhere
        // (they won't actually get access without logging in)
        permission: false
      }
    },
    {
      name: 'externalUrl',
      label: 'URL',
      type: 'url'
    },
    {
      name: 'statusCode',
      label: 'Redirect Type',
      type: 'select',
      help: 'Test new redirects as temporary redirects first. Permanent redirects are an SEO best practice, but only if they are correct.',
      choices: [
        { label: 'Temporary', value: '302' },
        { label: 'Permanent', value: '301' }
      ],
      def: '302'
    }
  ],
  removeFields: ['tags'],
  arrangeFields: [
    {
      name: 'info',
      label: 'Info',
      fields: [
        'redirectSlug',
        'title',
        'urlType',
        'ignoreQueryString',
        '_newPage',
        'externalUrl',
        'statusCode'
      ]
    }
  ],

  beforeConstruct: function (self, options) {
    var _newPage = _.find(options.addFields, { name: '_newPage' });
    _newPage.withType = options.withType;

    var field = _.find(options.addFields, { name: 'statusCode' });
    if (!field) {
      return;
    }
    field.def = options.statusCode.toString();
    if (field.def === '301') {
      field.help = 'By default, redirects are permanent and Google will cache them. Please proofread this carefully or test first with the "temporary" setting.';
    }
  },

  construct: function (self, options) {
    self.beforeSave = function (req, doc, options, callback) {
      // prefix the actual slug so it's not treated as a page
      doc.slug = 'redirect-' + doc.redirectSlug;

      if (!doc.title) {
        doc.title = doc.redirectSlug;
      }

      return callback(null);
    };

    // Check to see if a redirect exists before sending user on their way
    self.expressMiddleware = async (req, res, next) => {
      let slug = req.url;
      let pathOnly = slug.split('?')[0];
      let redirectRegEx = new RegExp(`^redirect-${self.apos.utils.regExpQuote(pathOnly)}(\\?.*)?$`);

      try {
        let results;
        results = await self.apos.docs.db.find({
          slug: redirectRegEx,
          type: self.name,
          trash: {
            $ne: true
          },
          published: true,
          workflowLocale: {
            $not: {
              $regex: /-draft$/
            }
          }
        }).project({
          title: 1,
          slug: 1,
          urlType: 1,
          ignoreQueryString: 1,
          pageId: 1,
          type: 1,
          externalUrl: 1,
          redirectSlug: 1,
          statusCode: 1,
          _newPage: 1,
          workflowLocale: 1
        }).toArray();
        let target;
        if (results) {
          if (results.some(result => result.redirectSlug === slug)) {
            target = results.find(result => result.redirectSlug === slug);
          } else if (results.some(result => result.redirectSlug === pathOnly && result.ignoreQueryString)) {
            target = results.find(result => result.redirectSlug === pathOnly && result.ignoreQueryString);
          }
          if (target) {
            let status = parseInt(target.statusCode);
            if (isNaN(status) || !status) {
              status = 302;
            }
            if (target.urlType === 'internal') {
              const doc = await self.apos.docs.db.findOne({
                _id: target.pageId,
                trash: {
                  $ne: true
                },
                published: true,
                workflowLocale: {
                  $not: {
                    $regex: /-draft$/
                  }
                }
              });
              if (doc) {
                const manager = self.apos.docs.getManager(doc.type);
                if (!manager) {
                  return next();
                }
                let oldLocale;
                try {
                  oldLocale = req.locale;
                  req.locale = doc.workflowLocale;
                  target._newPage = await manager.find(req, { _id: target.pageId }).toObject();
                } finally {
                  req.locale = oldLocale;
                }
              }
              if (!target._newPage) {
                return next();
              }
              return req.res.redirect(status, target._newPage._url);
            } else if (target.urlType === 'external' && target.externalUrl.length) {
              return req.res.redirect(status, target.externalUrl);
            }
          }
        }
        return next();
      } catch (e) {
        self.apos.utils.error(e);
        return next();
      }
    };
  }
};
