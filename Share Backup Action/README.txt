Example Backup action for Alfresco Share
========================================

Author: Will Abson

This project defines a custom document action which can be configured into the
Document Library component of Alfresco Share, for use by site members.

Installation
------------

The theme has been developed to install on top of an existing Alfresco
3.3 installation.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' folder 
of your Alfresco installation.

To build the JAR file, run the following command from the base project 
directory.

    ant clean dist-jar

The command should build a JAR file named share-backup-action.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar

Once the files have been deployed into Tomcat you will need to configure the
Share application to display the action.

Firstly, copy the web script configuration file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/documentlibrary/documentlist.get.config.xml 
from the Share webapp into the directory 
alfresco/web-extension/site-webscripts/org/alfresco/components/documentlibrary 
in Tomcat’s shared/classes to override it. You should see a section 
<actionSet id="document"> which defines all the actions shown for a normal 
document in the document list view.

To add the backup action to this list, add the following line just before the 
</actionset> element for that block.

<action type="action-link" id="onActionBackup" permission="" 
label="actions.document.backup" />

If you also want the action to show up in the document details view, you need 
to copy the file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/document-details/document-actions.get.config.xml
into 
alfresco/web-extension/site-webscripts/org/alfresco/components/document-details 
in shared/classes in the same way.

Lastly, you need to ensure that the client-side JS and CSS assets get pulled 
into the UI as unfortunately the config files do not allow us to specify these 
dependencies.

To do this, you must override the file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/documentlibrary/actions-common.get.head.ftl. 
Again, copy this into the corresponding directory in 
shared/classes/alfresco/web-extension and add the following lines at the bottom 
of the file.

  <@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/documentlibrary/backup-action.css" />
  <@script type="text/javascript" src="${page.url.context}/res/components/documentlibrary/backup-action.js"<>/@script>

Once you have made these changes you will need to restart Tomcat so that the 
configuration and your classpath resources in the JAR file are picked up.

Using the action
----------------

Log in to Alfresco Share and navigate to the document library of any site that
you have write permission on. You should see a 'Backup' action - 
complete with UI labels and icon - on the document list page, and the
details page if you have configured this.

More information
----------------

http://blogs.alfresco.com/wp/wabson/2010/02/28/share-custom-actions-in-a-jar/