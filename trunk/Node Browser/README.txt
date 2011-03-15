Node Browser Admin Console component for Alfresco Share
=======================================================

Author: Will Abson

This project defines a Node Browser component for Share's Administration Console, 
similar to the Node Browser provided in Alfresco Explorer.

Installation
------------

The component has been developed to install on top of an existing Alfresco
3.4 installation.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' folder 
of your Alfresco installation.

To build the JAR file, run the following command from the base project 
directory.

    ant clean dist-jar

The command should build a JAR file named node-browser.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.

Using the component
-------------------

Log in to Alfresco Share as an admin user and navigate to the Administration
page. Click 'Node Browser' in the left hand side navigation.