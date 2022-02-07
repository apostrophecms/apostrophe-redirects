# Changelog

## 2.4.0
In the presence of workflow and locale prefixes, a redirect created in a different locale will now work if the URL matches, falling back to the redirect target's locale even if the user's current or default locale is different.

## 2.3.2
Corrects additional defects in query string handling that led to problems with the briefly released 2.3.1.

## 2.3.1
Improves regex for "ignore query string" option to allow redirects from pages that are not slug-like such as those ending in `.html`. Also fixes a regular expression bug introduced in 2.3.0 where a rule could match if any portion of it appeared in the URL.

## 2.3.0
"Ignore query string" option for times when you'd like to match the URL regardless of the `?` and everything that follows it. Thanks to Shaun Hurley for the contribution.

## 2.2.0
Implemented polymorphic joins for internal pages which also makes it possible to configure your own pieces for polymorphic joins.

## 2.1.0
Disables `apostrophe-site-map` for redirects to prevent more superfluous UI tabs.

## 2.0.0
Implemented `statusCode` option and user-editable `statusCode` field allowing the user to choose a permanent or temporary redirect. For bc the default is still `302`. If the `statusCode` option is set to `301` instead, permanent redirects will be the default for *new* redirects. Existing redirects may be manually switched to `301` if desired.

## 0.6.6
Disables `apostrophe-seo` and `apostrophe-open-graph` for redirects to prevent superfluous UI tabs.

## 0.6.5
Use express middleware instead of relying on `apos.pages.serve`. This lets redirects happen for files, etc.

## 0.6.1
the `redirectSlug` should be `type: 'string'` because the old site may have allowed nonsense in slugs that we do not allow. Also compare to `req.url` so query string matches are allowed.

## 0.6.0
initial release.
