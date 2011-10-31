
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

/*
 * Converts diffenrent types of Java and Javascript objects
 * to Strings.
 */
function fmeToString(object, level) {

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
				lines = lines + (lines.length>0 ? "\n" : "") + prop + " : " + fmeToString(object[prop], level+1);
			}
			return lines;
		default: return "type conversion undefined";
	}
}

/* Defines the print function is used by the script to print
 * data to the output stream.
 */
function print(object) {
	printoutput.push(fmeToString(object, 0));
}

/**
 * Main / Script execution 
 */
var jsonData = jsonUtils.toObject(requestbody.content); 
var jscode = jsonData.input;

if (jsonData.space) {
  var space = search.findNode(jsonData.space);
}

var printoutput = []

model.input = jscode;

var result = eval("((function() {" + jscode + "}).call(this))");

if (!result) result = [];
model.result = jsonUtils.toJSONString(result); 
model.output = printoutput;

