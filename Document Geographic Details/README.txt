Document Geographic Details component for Alfresco Share
========================================================

Author: Will Abson

This project provides an additional page component for the Document Details 
page to display a small map view for geotagged content items. 

Installation
------------

The dashlet has been developed to install on top of an existing Alfresco
3.3/3.4 installation.

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