Document Geographic Details component for Alfresco Share
========================================================

Author: Will Abson

This project provides an additional page component for the Document Details 
page to display a small map view for geotagged content items.

The page component will display automatically for content items which already
have the Geographic aspect applied to them. For other items, a custom Document
library action named 'Geotag' is supplied, which can be enabled at install 
time.

Installation
------------

The dashlet has been developed to install on top of an existing Alfresco
3.4 installation. It can work with version 3.3 if the cm:geographic aspect 
is added to the repository's content model.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' folder 
of your Alfresco installation.

To build the JAR file, run the following command from the base project 
directory.

    ant clean dist-jar

The command should build a JAR file named document-geographic-details.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.

Custom Action Installation (Optional)
-------------------------------------

This will enable the custom Geotag Document Library Action in Share's document
list page, and document details page.

Firstly, copy the web script configuration file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/documentlibrary/documentlist.get.config.xml 
from the Share webapp into the directory 
alfresco/web-extension/site-webscripts/org/alfresco/components/documentlibrary 
in Tomcat’s shared/classes to override it. You should see a section 
<actionSet id="document"> which defines all the actions shown for a normal 
document in the document list view.

To add the backup action to this list, add the following line just before the 
</actionset> element for that block.

<action type="action-link" id="onActionGeotag" permission="edit" label="actions.document.geotag" />

If you also want the action to show up in the document details view, you need 
to copy the file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/document-details/document-actions.get.config.xml
into 
alfresco/web-extension/site-webscripts/org/alfresco/components/document-details 
in shared/classes, and add the extra <action> definition in the same way.

Lastly, you need to ensure that the client-side JS and CSS assets get pulled 
into the UI as unfortunately the config files do not allow us to specify these 
dependencies.

To do this, you must override the file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/documentlibrary/actions-common.get.head.ftl. 
Copy this into the directory alfresco/web-extension/site-webscripts/org/alfresco/components/documentlibrary in 
shared/classes and add the following lines at the bottom 
of the file.

<#-- Google Maps scripts -->
<#-- optional google map key @script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&key=your domain's google maps key" -->
<@script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></@script>
<#-- Custom Geotag Action -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/extras/components/documentlibrary/geotag-action.css" />
<@script type="text/javascript" src="${page.url.context}/res/extras/components/documentlibrary/geotag-action.js"></@script>

Once you have made these changes you will need to restart Tomcat so that the 
configuration and your classpath resources in the JAR file are picked up.

Note: If you want the action to appear in the repository browsing pages or in 
Web Quick Start or DOD sites, you will also need to update the corresponding 
`.config.xml` and `.head.ftl` files for those page components.

Usage
-----

  1. Log in to Alfresco Share and navigate to a site containing geotagged 
     content in the Document Library. Any content items with the Geographic 
     aspect applied and Latitude/Longitude properties set can be used, but 
     geotagged photos from camera phones will have this information populated 
     automatically.
     
  2. Locate one of the geotagged content item(s) and click into the Document 
     Details page.
     
  3. Scroll down the page to see the Geographic Information section below the 
     metadata list. Note that this section will only be shown on the page if 
     latitude and longitude values are available and the Geographic aspect 
     has been applied.
     
  4. To geotag other content items or to update the geographic information 
     on already-tagged items, click the Geotag action on the document list or
     document details pages. You must have edit permissions on the file and 
     have enabled the custom action at installation time (see above).