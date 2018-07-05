This module allows admins to add redirects from one URL to another within an [Apostrophe site](http://apostrophecms.org/).

This version is for [Apostrophe 2.x](http://apostrophecms.org/). For Apostrophe 0.5 use the 0.x series.

**Table of Contents**

* [Installation](#installation)

* [Configuration](#configuration)

* [Usage](#usage)

## <a id="installation"></a> Installation

First make sure you have an [Apostrophe project](http://apostrophecms.org/)!

Then:

```javascript
npm install --save apostrophe-redirects
```

## <a id="installation"></a> Configuration

In `app.js`, add the module to your configuration:

```javascript
// Other modules, then...
'apostrophe-redirects': { }
```

If you wish, you can change the default status code to `301` (permanent redirect):

```javascript
// Other modules, then...
'apostrophe-redirects': {
  statusCode: 301
}
```

> Note that permanent redirects are cached by Google for a long time. It is a good idea to encourage users to test with a temporary redirect first, then switch to permanent which is an SEO best practice — as long as it's correct.

That's it!

## <a id="usage"></a> Usage

While logged in as an admin, click the "Redirects" button. A list of redirects appears, initially empty. Add as many redirects as you like. The "from" URL must begin with a `/`. The "to" URL may be anything and need not be on your site. The "description" field is for your own convenience.

Be aware that each redirect is live as soon as you save it and that it is possible to make a mess with redirects. In a pinch, you can remove unwanted redirects via the MongoDB command line client (look for `{ type: "apostrophe-redirect" }` in the aposDocs collection in MongoDB).

Also be aware that Apostrophe already creates "soft redirects" every time you change the slug of a page. So you shouldn't need manually created "hard redirects" in that situation.

## Changelog

2.1.0 Disables `apostrophe-site-map` for redirects to prevent more superfluous UI tabs.

2.0.0: Implemented `statusCode` option and user-editable `statusCode` field allowing the user to choose a permanent or temporary redirect. For bc the default is still `302`. If the `statusCode` option is set to `301` instead, permanent redirects will be the default for *new* redirects. Existing redirects may be manually switched to `301` if desired.

0.6.6: Disables `apostrophe-seo` and `apostrophe-open-graph` for redirects to prevent superfluous UI tabs.

0.6.5: Use express middleware instead of relying on `apos.pages.serve`. This lets redirects happen for files, etc.

0.6.1: the `redirectSlug` should be `type: 'string'` because the old site may have allowed nonsense in slugs that we do not allow. Also compare to `req.url` so query string matches are allowed.

0.6.0: initial release.
