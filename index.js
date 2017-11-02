module.exports = {
  extend: 'apostrophe-pieces',
  name: 'apostrophe-redirect',
  alias: 'redirects',
  label: 'Redirect',
  pluralLabel: 'Redirects',
  searchable: false,
  adminOnly: true,

  addFields: [
    {
      name: 'redirectSlug',
      // This is *not* type: 'slug' because we want to let you match any
      // goldang nonsense the old site had in there, including mixed case
      type: 'string',
      label: 'Old URL',
      help: 'Format with leading / such as /old-url'
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
      name: '_newPage',
      type: 'joinByOne',
      withType: 'apostrophe-page',
      label: 'Page Title',
      idField: 'pageId', 
      filters: {
        projection: { slug: 1, title: 1 },
        // Admins set up redirects, so it's OK for non-admins to follow them anywhere
        // (they won't actually get access without logging in)
        permission: false
      }
    }, 
    {
      name: 'externalUrl',
      label: 'URL',
      type: 'url'
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
        '_newPage',
        'externalUrl',
      ]
    }
  ],

  construct: function(self, options) {
    var pages = self.apos.pages;

    self.beforeSave = function(req, doc, options, callback) {
      //prefix the actual slug so it's not treated as a page
      doc.slug = 'redirect-' + doc.redirectSlug;

      if (!doc.title) {
        doc.title = doc.redirectSlug;
      }

      return callback(null);
    };

    // ALL pages should check to see if a redirect exists
    var superPagesServe = pages.serve;
    pages.serve = function(req, res) {
      // req.url rather than req.params[0], lets us match query strings
      var slug = req.url;
      return self.find(req, { slug: 'redirect-' + slug }, { 
        title: 1,
        slug: 1,
        urlType: 1,
        pageId: 1,
        type: 1,
        externalUrl: 1,
        redirectSlug: 1,
        _newPage: 1
      }).toObject(function(err, result) {
        if(result) {
          if(result.urlType == 'internal' && result._newPage) {
            return req.res.redirect(result._newPage.slug);
          } else if(result.urlType == 'external' && result.externalUrl.length) {
            return req.res.redirect(result.externalUrl);
          }
        }
        return superPagesServe(req, res);
      });
    };
  }
}
