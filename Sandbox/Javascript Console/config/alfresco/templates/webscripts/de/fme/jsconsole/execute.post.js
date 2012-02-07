
/*
 * Set up a wrapper for the logger, to write logging information to the 
 * output stream and yet keep all methods of the Java ScriptLogger available.
 */
var _$orglogger = logger;

logger = {
  log: function(text) {
    print(text);
    _$orglogger.log(text);
  },
  
  warn: function(text) {
    print(text);
    _$orglogger.warn(text);
  },
  
  isLoggingEnabled : function() {
    return _$orglogger.isLoggingEnabled();
  },
  
  isWarnLoggingEnabled : function() {
    return _$orglogger.isWarnLoggingEnabled();
  },

  system : _$orglogger.system,
  
  /**
   * Sets the log level of a class or package using log4j
   * @param classname a Java class or package name
   * @param level log level TRACE,DEBUG,INFO,ERROR as String
   */
  setLevel : function(classname, level) {
	  var log4j = Packages.org.apache.log4j.Logger.getLogger(classname);
	  var logLevel = Packages.org.apache.log4j.Level.toLevel(level);
	  log4j.setLevel(logLevel);	  
  }
}

/*
 * Generic function to easily process nodes recursively in javascripts.
 */
function recurse(scriptNode, processorOrOptions) {

  var result = [];	
	
  var recurseInternal = function(scriptNode, options, path, level) {
	var index = 0;
	
	if (level < options.maxlevel) { 
		for (c in scriptNode.children) {
			var child = scriptNode.children[c];
			var childPath = path + "/"+ child.name;
		
			if (options.filter === undefined || options.filter(child, childPath, index, level)) {
				var procResult = options.process(child, childPath, index, level);
				if (procResult !== undefined) {
					result.push(procResult);
				}
		    }
		
			if (child.isContainer) {
				if (options.branch === undefined || options.branch(child, childPath, index, level) ) {
					recurseInternal(child, options, childPath, level+1);
				}
			}
			
			index++;
		}
	}
  }

  var options = {};
  if (processorOrOptions === undefined) {
	  options.process = function(node) { return node; };
  } else if (typeof processorOrOptions == "function") {
		options.process = processorOrOptions;
  }
  else {
	  options = processorOrOptions;
  }
	
	if (options.maxlevel === undefined) {
		options.maxlevel = 100;
	}
	
	recurseInternal(scriptNode, options, "", 0);
	
	return result;
}



JSCONSOLE = {
  global : this,
		
  resolveImports : function(scriptcode) {
    var RhinoScriptProcessor = Packages.org.alfresco.repo.jscript.RhinoScriptProcessor;
    var LogFactory = Packages.org.apache.commons.logging.LogFactory;
	var ScriptResourceHelper = Packages.org.alfresco.scripts.ScriptResourceHelper;
			  
	var log = LogFactory.getLog(RhinoScriptProcessor);
	var ctx = Packages.org.springframework.web.context.ContextLoader.getCurrentWebApplicationContext();
	var javaScriptProcessor = ctx.getBean("javaScriptProcessor");
			  
	return ScriptResourceHelper.resolveScriptImports(scriptcode, javaScriptProcessor, log);
  },		
		
  convertScriptNode : function(node) {
    return { 
      name : node.name, 
      nodeRef : node.nodeRef, 
      typeShort : node.typeShort,
      displayPath : node.displayPath
    };
  },
  
  isScalarType : function(value) {
	  return typeof value == "string" || typeof value == "boolean" || typeof value == "number";  
  },
  
  /**
   * Converts all ScriptNode objects within an result array.
   * The Parameter x can be any object but only arrays containing ScriptNode
   * objects will be converted. The function changes the given array!
   */
  convertReturnValues : function(x) {
    
	// a simple javascript object (no array) or a scalar value: wrap it in an array
	if ((typeof x == "object" && x.length == null) || JSCONSOLE.isScalarType(x)) {
		x = [x];		
	}
	  
    // if x is an array start converting it's values
    if (typeof x == "object" && x.length != null) {
      
      // iterate through all elements
      for (var i = 0; i < x.length; i++) {
    	  
    	// got a Java Class to Convert
        if (x[i].getClass !== undefined) {
          var javaClass = x[i].getClass().getName();
        
          // convert values based on the Java type
          if (javaClass == "org.alfresco.repo.jscript.ScriptNode") {
            x[i] = JSCONSOLE.convertScriptNode(x[i]);
          }
        }
        else if (JSCONSOLE.isScalarType(x[i])) {
        	// wrap a scalar value in a single value object
        	x[i] = { "value" : x[i] };
        }
      }
    }
    
    // finally return the array again
    return x;
  },
  
  /*
   * Converts different types of Java and Javascript objects
   * to Strings.
   */
  fmeToString : function(object, level) {

  	if (object == undefined) {
  		return "undefined";
  	}
  	
  	if ((typeof object["getClass"]) == "function") {  // this is a Java Object
  		if ((""+object.getClass().getName()) == "org.alfresco.repo.jscript.ScriptNode") {
  			return object.name + " ("+ object.typeShort + ", " + object.nodeRef.toString()+")";
  		}
  		else return object; // use Object.toString()
  	}
  	
  	
  	if (level > 10) {
  		return "overflow";
  	}
  	switch (typeof object) {
  		case "string" : 
  			return object;
  		case "boolean" : 
  			return ""+object;
  		case "number" :
  			return ""+object;
  		case "undefined" :
  			return "undefined";
  		case "function" :
  			return "function()";
  		case "object" :
  			var lines = "";
  			for (prop in object) {
  				lines = lines + (lines.length>0 ? "\n" : "") + prop + " : " + JSCONSOLE.fmeToString(object[prop], level+1);
  			}
  			return lines;
  		default: return "type conversion undefined";
  	}
  },
  
  getDataDictionaryIncludes : function() {
	//---Add includes from Data Dictionary --------------------
	  var includeFolders = search.xpathSearch("/app:company_home/app:dictionary/app:jsincludes");
	  var includeFolder = null;
	  if(includeFolders && includeFolders.length == 1) {
		 includeFolder = includeFolders[0];
	  }
	  else {
	    logger.log("Creating new Javascript Console Includes folder"); 
	    var dictionary = search.xpathSearch("/app:company_home/app:dictionary")[0];
	    includeFolder = dictionary.createNode("Javascript Console Includes", "cm:folder", [], "cm:contains", "app:jsincludes");
	  }

	  var includeScript = "";
	  if (includeFolder) {
		  for each(script in includeFolder.children) {
			  includeScript = includeScript + JSCONSOLE.resolveImports(script.content);
		  }
	  }
	  return includeScript;
  }
  
};


/* Defines the print function is used by the script to print
 * data to the output stream.
 */
function print(object) {
	printoutput.push(JSCONSOLE.fmeToString(object, 0));
}

/**
 * Main / Script execution ----------------------------------------- 
 */
var jsonData = jsonUtils.toObject(requestbody.content); 
var jscode = jsonData.input;

if (jsonData.space) {
  var space = search.findNode(jsonData.space);
}

// array of strings that are the lines of output filled by the print function
var printoutput = []

try {
	eval(JSCONSOLE.getDataDictionaryIncludes());
}
catch (err) {
	throw("Error executing one if the included scripts from the data dictionary.\n" + err);
}

// execute the script and capture the return value
var result = eval("((function() {" + JSCONSOLE.resolveImports(jscode) + "}).call(this))");

// return an empty array if no result is defined
if (!result) result = [];
model.result = jsonUtils.toJSONString(JSCONSOLE.convertReturnValues(result)); 

//return the script that was executed back to the caller
model.input = JSCONSOLE.resolveImports(jscode);

model.output = printoutput;

// return the state of the space variable
if (space) {
	model.spaceNodeRef = ""+space.nodeRef;
	model.spacePath = space.displayPath + "/" + space.name;
} else {
	model.spaceNodeRef = "";
	model.spacePath = "";
}
