PdfJs Viewer for Alfresco Share
=============================================================

Author: Peter Lšfgren, Loftux AB. Twitter: @loftux

This project defines a viewer that replaces the default Alfresco Share
flash based viewer.
It is targeted for version 4.0

The viewer makes use of an external project


Installation
------------

The component has been developed to install on top of an existing Alfresco
4.0 installation.

An Ant build script is provided to build a JAR file containing the 
custom files, which can then be installed into the 'tomcat/shared/lib' folder 
of your Alfresco installation.

To build the JAR file, run the following command from the base project 
directory.

    ant clean dist-jar

The command should build a JAR file named javascript-console.jar
in the 'dist' directory within your project.

To deploy the dashlet files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.

Using the component
-------------------

Navigate to the document details view of any pdf or office document, and the
viewer should display, under following conditions.
* Your browser is html5 compliant
* If not, pdf is displayed using a pdf reader plugin if present.
* If no reader plugin, display with standard Alfresco viewer.

Error reporting
---------------
Do NOT report any pdf rendering errors to this project, report them directly
to the pdf.js project. Provide them with a publicly available pdf that reproduce
the error.

If you have a web browser that works with 
http://mozilla.github.com/pdf.js/web/viewer.html
and it does not display the pdf.js viewer, then report the *exact* version
of the browser you are using and what OS. It may just be a problem with how
we try to detect browser compatibility.

If you have a pdf reader plugin that you expect as fallback and it does not
display, again report *exact* version of both reader and web browser.

License
-------
The pdf.js components,https://github.com/mozilla/pdf.js
are licensed under Mozilla License
https://github.com/mozilla/pdf.js/blob/master/LICENSE

This project is Licensed under Apache 2.0 License.

Some files are copies with minor modifications of original Alfresco source files.
http://www.alfresco.com/legal/