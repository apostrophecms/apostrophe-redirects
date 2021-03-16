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

By default a redirect includes any query string (the `?` and whatever follows it, up to but not including any `#`) on incoming requests when matching for redirection. You can toggle the "ignore query string when matching" option in a redirect definition to ignore query strings on incoming requests and only match on the base URL path. A redirect that does not use this option will always match first, so you can match various specific query strings and then have a fallback rule for other cases.

Be aware that each redirect is live as soon as you save it and that it is possible to make a mess with redirects. In a pinch, you can remove unwanted redirects via the MongoDB command line client (look for `{ type: "apostrophe-redirect" }` in the `aposDocs` collection in MongoDB).

Also be aware that Apostrophe already creates "soft redirects" every time you change the slug of a page. So you shouldn't need manually created "hard redirects" in that situation.

## Advanced configuration with pieces

If you have pieces on your site and you would like to make a safer more persistent redirect that will update if your redirect destination changes, you can use polymorphic joins. To do this you need to add your piece(s) when configuring the module:

```javascript
'apostrophe-redirects': {
  withType: ['apostrophe-page', 'product']
}
```

Note: When adding your own pieces, you should always define `apostrophe-page` to still make it possible to redirect to any normal page. Also note that your piece is written in singular and that you must have a suitable apostrophe-pieces-page for your piece (that is, it must have a `._url` property when Apostrophe fetches it). Refer to the core documentation for [reusable content with pieces](https://apostrophecms.org/docs/tutorials/getting-started/reusable-content-with-pieces.html#displaying-a-directory-of-people-on-a-page-with-code-apostrophe-pieces-pages-code).

Now when you create a new redirect, you have the option to browse for both pages and your pieces in the Apostrophe admin UI.
