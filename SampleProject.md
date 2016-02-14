This project defines a common source directory layout, [Eclipse](http://www.eclipse.org/) project configuration and [Ant](http://ant.apache.org/) build script that is used by all the Share Extras add-ons, in addition to some sample files from a basic 'Hello World' dashlet.

The sample project is intended to help you build your own Share customisations, using standard tools such as Eclipse and Ant.

## Download ##

[Download Sample Dashlet Sample Project](http://code.google.com/p/share-extras/downloads/list?can=2&q=sample-dashlet)

## Creating Your Own Projects ##

To use the sample project, download the `sample-dashlet.zip` file from the [Downloads](http://code.google.com/p/share-extras/downloads/list) area, and use this to start a new project using Eclipse's Import wizard (click _File_ > _New_ and then select _General_ > _Existing Projects into Workspace_).

Once you have created your project, it should be named _Sample Dashlet_ in Eclipse. You should rename this to something of your choosing and update the corresponding JAR file name specified in `build.properties`.

You should also update the information in `README.txt` and `MAINTAINERS.txt` to give some basic information about your project.

### Adding Web Scripts ###

All dashlet projects will define one web-tier [web script](http://wiki.alfresco.com/wiki/Web_Scripts) for each dashlet, but may also use additional web-tier scripts, or repository scripts for loading data.

The project supports any number of repository-tier and web-tier web scripts. The scripts must be added in the following directories below `config`.

For web-tier web scripts, place your scripts under

  * `alfresco/site-webscripts` for your custom web scripts
  * `alfresco/web-extension/site-webscripts` for any existing web-tier scripts that you want to override.

For repository-tier web scripts, place scripts under

  * `alfresco/templates/webscripts` for your custom web scripts
  * `alfresco/extension/templates/webscripts` for any existing repository scripts that you want to override.

Below these locations you should place scripts in a folder hierarchy as per standard web script packaging techniques, e.g. `org/mycompany/projectname` or `org/mycompany/components/dashlets`.

An example directory structure containing a _Hello World_ example web script is provided in the `config` directory. You can remove these files once you have defined your own scripts.

Note that Java web scripts are not supported by the sample project.

### Adding Resource Files ###

You can add client-side resources such as JavaScript, CSS and image files within the `source/web` directory in the project. Some example files are included in the project, which you can remove once you have created your own structure.

To link to the client-side assets, you can use the resources servlet in the Share webapp at `http://server/share/res/path/to/asset`. Within your Freemarker templates, you can construct links using code such as

```
<img src="${url.context}/res/mycompany/components/dashlets/refresh.png" alt="Image description here" />
```

The resources servlet will look for assets under the path following `/res`, first within the Share web application (from 3.4c / 3.4 Enterprise) and then in the `META-INF` folders of any JAR files on the web application's class path. The build targets defined in `build.xml` will ensure that resources are packaged up so as to be accessible via this method.

### Adding SpringSurf Configuration ###

For more advanced customisations, you can place additional global-scoped configuration in the file `alfresco/web-extension/share-config-custom.xml` within `config`.

### Adding Spring Configuration ###

For even more advanced customisations, you can place additional Spring configuration in the directory `alfresco/web-extension` within `config`.

In order to be imported, your configuration must reside in one or more XML files with the suffix `-context.xml` and each file must have a globally unique name.

## Building Your Project ##

The Ant build script `build.xml` can be used to help you distribute your customisations for testing or deployment. You can run the script from a command line or using Eclipse's _External Tools Configurations_ dialogue (_Run_ > _External Tools_ > _External Tools Configurations_).

  * Use the `build-jar` target to build a JAR file in the `dist` directory, suitable for deploying as a shared library on any Share 3.3+ installation.

  * Use the `hotcopy-tomcat-jar` target to copy the JAR file containing the customisations into a local Tomcat installation on your system. You will need to specify the location of your Tomcat installation by defining the variable `tomcat.home` when you call the script.

  * Use the `hotcopy-tomcat-zip` target to copy all the individual configuration and resource files into a local Tomcat installation on your system for testing. Unlike `hotcopy-tomcat-jar`, this method allows you to reload changes to your files without having to restart the Tomcat server, and so is better suited for development. You will need to specify the location of your Tomcat installation by defining the variable `tomcat.home` when you call the script.

  * Use the `reload-webscripts-repo` and `reload-webscripts-share` targets to reload the repository and web-tier web scripts respectively. This will not reload resources deployed in JAR files but is suitable for local testing in combination with the `hotcopy-tomcat-zip` target.

For more information on these targets and the other targets available in `build.xml`, see the inline comments within the [build script](http://code.google.com/p/share-extras/source/browse/trunk/Sample%20Dashlet/build.xml).

### Command line examples ###

If you have Ant installed and have configured your system `PATH` correctly as per the [Ant manual](http://ant.apache.org/manual/), you can run the targets from a command line as per the following examples.

`ant build-jar`

This will build a JAR file using the default file name specified in `build.properties`, containing the custom files.

`ant -Djar.name=my-custom.jar build-jar`

This will build a JAR file named `my-custom.jar`

`ant -Dtomcat.home=C:\Alfresco\tomcat hotcopy-tomcat-zip`

This will copy all your custom files into the Tomcat instance installed at `C:\Alfresco\tomcat`. Configuration files will be placed into `shared/classes`, while resources will be copied below `webapps/share`.

`ant -Dtomcat.repo.home=C:\Alfresco\tomcat -Dtomcat.share.home=C:\Alfresco\tomcat-share hotcopy-tomcat-zip`

This will copy all your custom repository files into the Tomcat instance installed at `C:\Alfresco\tomcat` and your custom Share files into the Tomcat instance installed at `C:\Alfresco\tomcat-share`.