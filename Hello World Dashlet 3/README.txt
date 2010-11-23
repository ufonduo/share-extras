Hello World dashlet for Alfresco Share (Step 3)
===============================================

Author: Will Abson

This project defines a custom dashlet that prints the text 'Hello World' on
the screen.

Installation
------------

The theme has been developed to install on top of an existing Alfresco
3.3 installation.

An Ant build script is provided to build a ZIP file containing the 
custom files, which can then be installed into the 'tomcat' folder of your
Alfresco installation.

To build the ZIP file, run the following command from the base project 
directory.

    ant clean dist-zip-tomcat

The command should build a ZIP file named hello-world-dashlet.zip
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
instead use the hotcopy-tomcat-zip task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-zip

Once you have run this you will need to refresh the list of web scripts in 
Alfresco Share using the page at http://localhost:8080/share/page/index. An 
optional Ant task reload-webscripts-webtier is provided commented out in the 
build script if you wish to use this.

For equivalent actions that deploy using the JAR mechanism in 3.3, use the 
deploy-jar and hotcopy-tomcat-jar targets.

Using the dashlet
-----------------

Log in to Alfresco Share and navigate to your user dashboard. Click the 
Customize Dashboard button to edit the contents of the dashboard and drag 
the dashlet into one of the columns from the list of dashlets.

As well as user dashboards the dashlet can also be used on site dashboards.