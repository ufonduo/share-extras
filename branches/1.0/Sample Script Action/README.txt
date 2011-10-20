Sample Script Action for Alfresco Share
=======================================

Author: Will Abson

This project defines a custom Document Library action, which can be easily
customised to run a JavaScript file of your choice when run by a 
user.

You must create the JavaScript file yourself and place this directly into
the Data Dictionary/Scripts space in the repository. Once you have done
this you are ready to customise this action to use it.

Customisation
-------------

The folder source/web/extras/components/documentlibrary contains the
client-side assets used by the custom action. You should rename 
sample-script-action.css and sample-script-action.js to something 
that better describes your action. This will ensure that your
action can co-exist with any others you create using this method, but
it is recommended you stick to lowercase letters and hyphens (-).

You can leave the file sample-script-action-16.gif untouched, or you
can add your own 16x16 GIF or PNG image into the directory to represent 
your action. If you add your own image you will need to update the 
CSS file to reference this, instead of sample-script-action-16.gif.

You will then need to edit a few variables near the beginning of 
the renamed JS file.

  * JSCRIPT_NAME should define the name of the script which you added
    to the repository's Data Dictionary/Scripts space.
    
  * MSG_BASE is the prefix used for message bundle labels, which should
    be set to a unique value for your action. Generally you should use the 
    same value you used when renaming the client-side files.
    
  * FN_NAME will be used as the name of the client-side function
    used to define the action. Again it should be unique, but it 
    should normally start with the prefix 'onAction' and be a valid
    JavaScript function name, e.g. on onActionMyCustomScript.

After you have updated the JavaScript file, open the CSS file and 
replace the '.onActionSampleScript' selector on line 1 with the value
you set FN_NAME to in the JS file. Ensure you do not delete the leading
dot.

Next you will need to define your message bundle labels. Rename the Spring 
configuration file in config/org/springframework/extensions/surf to 
something unique, and change the bean's 'id' attribute within the file.

Inside the <value> element, the bean defines the path to a single message
bundle using dot notation. You should edit the part following the last dot
to a unique value for your action. After you have done this, rename the 
.properties file in config/alfresco/messages to match this value.

Lastly, update the property names inside the .property file, changing
'sample-script' to the value you specified in your MSG_BASE definition in 
the client-side JavaScript.

Now you are ready to install the action. Before you do, make sure you update
the jar.name property in the build.properties file to give your JAR file a 
unique name.

Installation
------------

The action has been developed to install on top of an existing Alfresco
3.3/3.4 installation.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' folder 
of your Alfresco installation.

To build the JAR file, run the following command from the base project 
directory.

    ant clean dist-jar

The command should build a JAR file named sample-script-action.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar

Once the JAR file has been deployed into your application server you will need to 
configure the Share application to display the action.

Firstly, copy the web script configuration file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/documentlibrary/documentlist.get.config.xml 
from the Share webapp into the directory 
alfresco/web-extension/site-webscripts/org/alfresco/components/documentlibrary 
in Tomcat’s shared/classes to override it. You should see a section 
<actionSet id="document"> which defines all the actions shown for a normal 
document in the document list view.

To add the backup action to this list, add the following line just before the 
</actionset> element for that block.

<action type="action-link" id="onActionSampleScript" permission="edit" label="actions.document.sample-script" />

Change `onActionSampleScript` to the value you specified for FN_NAME in the Customisation
section above. Set the final part of the value for the 'label' attribute to the value you 
specified in your MSG_BASE definition in the client-side JavaScript.

To make the action appear for folder items in addition to documents, add the same
line into the section <actionSet id="folder">.

If you also want the action to show up in the document details view, you need 
to copy the file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/document-details/document-actions.get.config.xml
into 
alfresco/web-extension/site-webscripts/org/alfresco/components/document-details 
in shared/classes, and add the extra <action> definition(s) in the same way.

Lastly, you need to ensure that the client-side JS and CSS assets get pulled 
into the UI as unfortunately the config files do not allow us to specify these 
dependencies.

To do this, you must override the file 
WEB-INF/classes/alfresco/site-webscripts/org/alfresco/components/documentlibrary/actions-common.get.head.ftl. 
Copy this into the directory alfresco/web-extension/site-webscripts/org/alfresco/components/documentlibrary in 
shared/classes and add the following lines at the bottom 
of the file.

<#-- Custom Script Action -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/extras/components/documentlibrary/sample-script-action.css" />
<@script type="text/javascript" src="${page.url.context}/res/extras/components/documentlibrary/sample-script-action.js"></@script>

You should edit the paths above to that the links point correctly to your 
client-side assets, as you renamed them in the Customisation section above.

Once you have made these changes you will need to restart Tomcat so that the 
configuration and your classpath resources in the JAR file are picked up.

Note: If you want the action to appear in the repository browsing pages or in 
Web Quick Start or DOD sites, you will also need to update the corresponding 
`.config.xml` and `.head.ftl` files for those page components.

Usage
-----

Log in to Alfresco Share and navigate to the Document Library of any site that
you have write permission on. You should see your custom action - 
complete with UI labels and icon - displayed for each file on the document list 
page, and also on the document details page if you have configured this too.

Credits
-------

Thanks to Mike Farman for the original suggestion.