# Moved to GitHub #

**Note** : This project, along with the rest of Share Extras, has moved to GitHub. See https://github.com/share-extras/audit-dashlet.

All wiki information, screenshots, sources, and current downloads are available in the GitHub project.

This wiki page will likely no longer receive updates.

The past releases/downloads that happened prior to the move to GitHub are left in Google Code for now.

# Introduction #

This project defines a custom dashlet to display events for a given audit application.

The dashlet will need to have auditing application(s) already configured, and, to be useful, some events captured.
See [Auditing (from V3.4)](http://wiki.alfresco.com/wiki/Auditing_(from_V3.4)) on how to define audit applications and some samples.

From 3.4.4, also see [Content\_Auditing](http://wiki.alfresco.com/wiki/Content_Auditing) and [Audit\_Filter](http://wiki.alfresco.com/wiki/Audit_Filter).

![http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-default.png](http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-default.png)

Note : the output in the "audited values" field will depend on the configuration of the current audit application (ie what data extractors have been configured, if using the access auditor or not, etc ...). The default applications output will generally be more verbose.
Here, the screenshots are made using simple data extractors, for clarity of the captured output.

# Installation #

The dashlet is packaged as a single JAR file for easy installation into Alfresco Share.

To install the dashlet, simply drop the `audit-dashlet-${version}.jar` file from the [GitHub project releases section](https://github.com/share-extras/audit-dashlet/releases) into the classpath (usually `tomcat/shared/lib`, or other appservers equivalents) within your Alfresco installation, and restart the application server.
Past releases are available from the  [Google Code project downloads section](http://code.google.com/p/share-extras/downloads/list).
You might need to create this folder if it does not already exist.

# Building from Source #

Check out the project if you have not already done so

```
svn checkout "http://share-extras.googlecode.com/svn/trunk/Audit Dashlet"
```

Change into the new directory

```
cd "Audit Dashlet"
```

An Ant build script is provided to build a JAR file containing the custom files, which can then be installed into the `tomcat/shared/lib` folder of your Alfresco installation.

To build the JAR file, run the following command from the base project directory.

```
ant clean dist-jar
```

The command should build a JAR file named `audit-dashlet-${version}.jar` in the `dist` directory within your project, which you can then copy into the `tomcat/shared/lib` folder of your Alfresco installation.

You can also use the build script to _hot deploy_ the JAR file directly into a local Tomcat instance for testing. You will need to use the `hotcopy-tomcat-jar task` and set the `tomcat.home`
property in Ant.

```
ant -Dtomcat.home=C:/Alfresco/tomcat clean dist-jar hotcopy-tomcat-jar
```

After you have deployed the JAR file you will need to restart Tomcat to ensure it picks up the changes.

As an alternative, you may also copy the _exploded_ files in your classpath, but they must have the same classpath tree than the one in the jar,
ie :
  * `config/alfresco/site-webscripts` would for example go into `classes/alfresco/web-extension`
  * `source/web/components` would go into `classes/META-INF/components`

If using development/debug mode for the web framework, you will not need to restart tomcat, but you may have to clear your
browser's cache.

# Usage #

  1. Log in to Alfresco Share and navigate to a site where you are a Site Manager, OR to your user dashboard
  1. On the dashboard and click the **Customize Dashboard** button to edit the contents of the dashboard. Drag the `Audit Application` dashlet into one of the columns from the list of dashlets to add it.
  1. Click **OK** to save the configuration.
  1. The dashlet should now be shown in your dashboard.

## Configuration ##

Click Configure to choose an existing audit application. Results will appear as you type and will be matched
against the live list of audit applications as reported by /api/audit/control.

For convenience, the list will pop out when opening the configure dialog with no applications currently configured.
Could be useful if you don't know what application name to search for.

The number of data rows (audit events) displayed per page is configurable with the 'Entries per page' parameter.

If you want you can also select an additional value filter to limit the results.
This server-side filter correspond to the "value" parameter optionally passed to the audit query. It defaults to 10.

Additional server side filters are configurable :

| **UI Name** | **Description** | **Audit API corresponding parameter** |
|:------------|:----------------|:--------------------------------------|

| Value Filter | filter on the audit value (exact match, optional). This filtering is done server-side. | 'value' |
|:-------------|:---------------------------------------------------------------------------------------|:--------|
| Max Entry Count | maximum number of audit entries retrieved (optional)                                   | 'limit' (default 100) |
| Audit Path Filter | select only the audit entries with a matching audit path key in their values map (optional) | URL path after application (default none) |
| additional query params | other possible server-side query parameters (optional). Separated by &. (See [Advanced\_Query](http://wiki.alfresco.com/wiki/Auditing_(from_V3.4)#Advanced_Query))) | from/to time, from/to id, user, valueType, ... |




The columns to display are also configurable (show/hide).


**Note** : the output in the "audited values" field will depend on the configuration of the current audit application.
(ie what data extractors have been configured, if using the access auditor or not, etc...).

**Note** : querying for values when an audit path query is configured will restrict the search to entries with that value for that specific audit path.

The "Trim Audit Paths" checkbox can be used to show the full audit paths up to the audit key, or just the audit key, in the audit values. It can be useful to temporarily turn on in case one wants to use the audit path filter above, as it will show the full audit paths required for that filter.

**Note** : The data webscript does a version check to determine if a workaround for the unquoted json feed prior to 3.4.3 Enterprise / 4.0 Community (ALF-8307) is required.
This can be overriden by copying the webscript config file (audit-application-data.get.config.xml) in the equivalent path in web-extension, if required.

Below is a screenshot of the current configuration dialog :

![http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-configuration-dialog.png](http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-configuration-dialog.png)


## Search box ##

The dashlet search box allows more search capabilities than the server side filter, ie :
  * field to search on (regex or not), e.g :
    * id:14
    * id:1.95$
    * name:romain
    * etc...

  * negation, e.g
    * -name:ro
    * -values:pro

  * mutliline matches are enabled, ^ and $ will match beginning of lines for audit values, useful since there can be more than one line per audit entry

  * query can match anywhere in the field by default. queries can be any valid javascript regular expression.
    * examples : ^romain, values:r.m...$ , id:\d\d8, -time:21 ...
    * The search box will turn green or red if the regex is valid or invalid, respectively.
    * query can be restricted to the beginning by using ^romain (standard regex) for example.
    * See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp for more details.

> Each match of the regex in the audit entry will be highlighted. Deferred submatches are also supported for highlighting.

  * to search for a colon (:), use the field prefix, eg; field:.+:.+ or values:`[`^:`]`+: or values:nodeName:.`*` etc... otherwise the colon will be interpreted as a field identifier

  * noderefs in the audit values will be detected, and "enhanced" with a link to the docdetails page of that noderef

  * multi field search is currently not supported, e.g +id:95 -name:romain. Would have to support ( ) , and/or grouping ,etc ...

## Screenshots ##

  1. filtering with regular expressions :

> ![http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-field-regex.png](http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-field-regex.png) .

> This search is done by filtering out undesired entries coming from the datasource prior to browser display.

> 2. transforming noderef into links :

> ![http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-noderef-links.png](http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-noderef-links.png)

> 3. using the [Access Auditor](http://wiki.alfresco.com/wiki/Content_Auditing#Audit_Data_Generated_By_AccessAuditor), de-selecting 'Trim Audit Paths' :

> ![http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-full-auditPaths.png](http://share-extras.googlecode.com/svn/trunk/Audit%20Dashlet/screenshots/en/audit-dashlet-full-auditPaths.png)

> 4. etc ...

# Changelog #
  * 0.5:
    * fixed config dialog URL to use /res, required in 4.2. addresses [issue 129](https://code.google.com/p/share-extras/issues/detail?id=129).
    * added the configurable server-side ability to query for entries containing a specific audit path.
      * Note : querying for values when an audit path query is configured will restrict the search to entries with that value for that specific audit path.
    * made the repo version check configurable through the audit application data webscript config file
    * made the audit path trimming configurable through the config dialog
    * minor : added the year by default in the displayed timestamps.
    * fixed ID format for json entries, to make sure the ID representation does not have comma separators for high entry IDs. addresses [issue 129](https://code.google.com/p/share-extras/issues/detail?id=129), comment #6.
    * fixed an unreported issue where storing config values with double quotes in the text would prevent the config options to be loaded afterwards.

  * 0.45:
    * refined workaround against unquoted json feed for application and user json properties
    * apply this workaround only when running against a repository affected by the bug
    * minor CSS fix : historical margins for dashlet body no longer required.

  * 0.44:
    * expanded workaround against unquoted json feed for application and user json properties. addresses [issue 71](https://code.google.com/p/share-extras/issues/detail?id=71).
    * additional newline sanitizing of the server side json feed, in addition to the checks already present in the freemarker output. possibly addresses [issue 82](https://code.google.com/p/share-extras/issues/detail?id=82).
    * rationalized indentation to 3 spaces and cleanup the tabs that have built up over time

  * 0.43:
    * allow the 'additional' query string to override any other configured options, not just the sort order
    * switched the copyright header from 'Share Extras project' to 'Share Extras contributors'

  * 0.42:
    * switched to share extras namespace
    * some comments and jsdoc review
    * aligned rowsPerPage / defaultRowsPerPage data types
    * merged some build.xml changes from upstream

  * 0.41:
    * better IE support
    * some css cleanup
    * some UI label changes
    * updated YUI compressor to 2.4.7
    * leading/trailing whitespaces cleanup

  * 0.4:
    * datatable columns can now be configured to be shown or hidden
    * an extra field has been added to the config dialog to pass additional server side query parameters.
    * datatable css fix for google chrome, and various css tweaks
    * Added help link opposite the config link
    * tweaked what links (configure, help) are shown to admins / site managers

  * 0.31:
    * build.properties more consistent with other projects
    * distributed jar had a wrong french bundle filename
    * added small precision in the README

  * 0.3:
    * some formatting, commenting, refactored to separate search box UI background coloring from the actual filtering
    * highlighting can now be expressed with CSS, rather than hardcoded html bold
    * deferred submatches highlighting support
    * marker block elision
    * results message altered
    * search box only shown when an audit application has been configured
    * application config will expand immediately on popup if no app is currently configured
    * better cross-browser support
    * rows per page now configurable in the config dialog

  * 0.22:
    * small bug fix   : regex remainder fix
    * bug fix : generated docdetails and profile links were incorrect when a regex search was already in progress
    * lots of other small regex corner cases fixed
    * search box background now green or red, depending on whether or not the user search is a valid regex or not, respectively
    * ability to list all applications in the config dialog by searching for a leading space, if one does not know what to search for
    * renamed some files and web scripts URLs

  * 0.21: small bug fixes : highlighting multiple matches and regression when clearing the search box

  * 0.2 : search box / query filtering

  * 0.1 : inital release



# Known Issues #