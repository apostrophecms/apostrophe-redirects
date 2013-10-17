# apostrophe-redirects

**Table of Contents**
* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)

## <<a id="installation"></a> Installation

First make sure you have an [Apostrophe project](http://github.com/punkave/apostrophe-sandbox)!

Then:

    npm install --save apostrophe-redirects

## <<a id="installation"></a> Configuration

In `app.js`, add the module to your configuration:

    ... other modules ...
    'apostrophe-redirects': { }

Also, edit `outerLayout.html` so your admins can find the UI:

    {{ aposRedirectsMenu({ edit: permissions.admin }) }}

That's it!

## <<a id="usage"></a> Usage

While logged in as an admin, click the "Redirects" button. A list of redirects appears, initially empty. Add as many redirects as you like. The "from" URL must begin with a `/`. The "to" URL may be anything and need not be on your site. The "notes" field is for your own convenience.

Be aware that each redirect is live as soon as you save it and that it is possible to break your site through exceptionally clueless use of redirects. In a pinch, you can remove unwanted redirects via the MongoDB command line client (see the `apostrophe-redirects` collection).

Also be aware that Apostrophe already creates "soft redirects" every time you change the slug of a page. So you shouldn't need manually created "hard redirects" in that situation.

