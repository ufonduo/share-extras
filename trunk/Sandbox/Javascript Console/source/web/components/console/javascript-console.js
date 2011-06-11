/**
* Fme root namespace.
* 
* @namespace Fme
*/
// Ensure Fme root object exists
if (typeof Fme == "undefined" || !Fme)
{
   var Fme = {};
   
} 
   
/**
 * Admin Console Javascript Console
 * 
 * @namespace Alfresco
 * @class Fme.JavascriptConsole
 */
(function()
{
   /**
	 * YUI Library aliases
	 */
   var Dom = YAHOO.util.Dom,
       Event = YAHOO.util.Event,
       Element = YAHOO.util.Element;
   
   /**
	 * Alfresco Slingshot aliases
	 */
   var $html = Alfresco.util.encodeHTML,
       $hasEventInterest = Alfresco.util.hasEventInterest; 

   /**
	 * JavascriptConsole constructor.
	 * 
	 * @param {String}
	 *            htmlId The HTML id of the parent element
	 * @return {Fme.JavascriptConsole} The new JavascriptConsole instance
	 * @constructor
	 */
   Fme.JavascriptConsole = function(htmlId)
   {
      this.name = "Fme.JavascriptConsole";
      Fme.JavascriptConsole.superclass.constructor.call(this, htmlId);
      
      /* Register this component */
      Alfresco.util.ComponentManager.register(this);
      
      /* Load YUI Components */
      Alfresco.util.YUILoaderHelper.require(["button", "container", "datasource", "datatable",  "paginator", "json", "history"], this.onComponentsLoaded, this);
      
      /* Define panel handlers */
      var parent = this;
      
      /* File List Panel Handler */
      ListPanelHandler = function ListPanelHandler_constructor()
      {
         ListPanelHandler.superclass.constructor.call(this, "main");
      };
      
      YAHOO.extend(ListPanelHandler, Alfresco.ConsolePanelHandler,
      {
         /**
			 * Called by the ConsolePanelHandler when this panel shall be loaded
			 * 
			 * @method onLoad
			 */
         onLoad: function onLoad()
         {
        	 parent.widgets.pathField = Dom.get(parent.id + "-pathField"); 
        	 parent.widgets.nodeField = Dom.get(parent.id + "-nodeRef");
        	 parent.widgets.scriptInput = Dom.get(parent.id + "-jsinput");
        	 parent.widgets.scriptOutput = Dom.get(parent.id + "-jsoutput");
    		 
             // Buttons 
        	 parent.widgets.selectDestinationButton = Alfresco.util.createYUIButton(parent, "selectDestination-button", parent.onSelectDestinationClick);
             parent.widgets.executeButton = Alfresco.util.createYUIButton(parent, "execute-button", parent.onExecuteClick);
         }
      });
      new ListPanelHandler();
      
      return this;
   };
   
   YAHOO.extend(Fme.JavascriptConsole, Alfresco.ConsoleTool,
   {
	   clearOutput : function ACJC_clearOutput() {
	       this.widgets.scriptOutput.value="";
	   },

	   appendLineArrayToOutput: function ACJC_appendLineArrayToOutput(lineArray) {
	       	 var newLines = "";
	         for (line in lineArray) {
	         	newLines = newLines + lineArray[line] + "\n";
	         }
	         this.appendStringToOutput(newLines);
	   },
	
	   appendStringToOutput: function ACJC_appendStringToOutput(text) {
	       	 var outputfield = this.widgets.scriptOutput;
	         outputfield.value = outputfield.value + text;
	   },
  
	   browserSupportsHtml5Storage: function ACJC_browserSupportsHtml5Storage() {
		   try {
		     return 'localStorage' in window && window['localStorage'] !== null;
		   } catch (e) {
		     return false;
		   }
	   },
	   
	  createMenuButtons: function ACJC_createMenuButtons(listOfScripts) {

          var loadMenuItems = [{
        	  text : this.msg("button.load.create.new"),
        	  value : "NEW"
          }];
          loadMenuItems.push(listOfScripts);
		  
          var oLoadMenuButton = new YAHOO.widget.Button({ 
				id: "loadButton", 
				name: "loadButton",
				label: this.msg("button.load.script"),
				type: "menu",  
				menu: loadMenuItems,
				container: this.id + "-scriptload"
          });

          oLoadMenuButton.getMenu().subscribe("click", this.onLoadScriptClick, this);
          
          var saveMenuItems = [{
        	  text : this.msg("button.save.create.new"),
        	  value : "NEW"
          }];
          saveMenuItems.push(listOfScripts);
          
          var oSaveMenuButton = new YAHOO.widget.Button({ 
				id: "saveButton", 
				name: "saveButton",
				label: this.msg("button.save.script"),
				type: "menu",  
				menu: saveMenuItems,
				container: this.id + "-scriptsave"
          });

          oSaveMenuButton.getMenu().subscribe("click", this.onSaveScriptClick, this);
          
          var docsMenuItems = [
            [ { text : "W3Schools Javascript Reference", url : "http://www.w3schools.com/jsref/default.asp", target:"_new"},
              { text : "Alfresco 3.4 Javascript API", url : "http://wiki.alfresco.com/wiki/3.4_JavaScript_API", target:"_new" },
              { text : "Alfresco 3.4 Javascript Services API", url : "http://wiki.alfresco.com/wiki/3.4_JavaScript_Services_API", target:"_new" },
              { text : "Alfresco Javascript Cookbook", url : "http://wiki.alfresco.com/wiki/JavaScript_API_Cookbook", target:"_new" },
            ],
            [
              { text : "Lucene Search Reference", url : "http://wiki.alfresco.com/wiki/Search", target:"_new" },
            ],
            [
              { text : "Webscripts Reference", url : "http://wiki.alfresco.com/wiki/Web_Scripts", target:"_new" },
              { text : "Webscripts Examples", url : "http://wiki.alfresco.com/wiki/Web_Scripts_Examples", target:"_new" }
            ]
          ];
          
          var oDocsMenuButton = new YAHOO.widget.Button({ 
				id: "docsButton", 
				name: "docsButton",
				label: this.msg("button.docs"),
				type: "menu",  
				menu: docsMenuItems,
				container: this.id + "-documentation"
          });
          
          oDocsMenuButton.getMenu().setItemGroupTitle("Javascript", 0);
          oDocsMenuButton.getMenu().setItemGroupTitle("Lucene", 1);
          oDocsMenuButton.getMenu().setItemGroupTitle("Webscripts", 2);		  
	  },
	   
      /**
		 * Fired by YUI when parent element is available for scripting.
		 * Component initialisation, including instantiation of YUI widgets and
		 * event listener binding.
		 * 
		 * @method onReady
		 */
      onReady: function ACJC_onReady()
      {
         // Call super-class onReady() method
         Fme.JavascriptConsole.superclass.onReady.call(this);
         var self = this;

         YAHOO.Bubbling.on("folderSelected", this.onDestinationSelected, this);
         
         // Store and Restore script content to and from local storage
    	 if (self.browserSupportsHtml5Storage()) {
             window.onbeforeunload = function(e) {
           		 self.widgets.codeMirror.save();
           		 window.localStorage["javascript.console.script"] = self.widgets.scriptInput.value;
             };

             if (window.localStorage["javascript.console.script"]) {
            	 self.widgets.scriptInput.value = window.localStorage["javascript.console.script"];
             }
             else {
            	 this.loadDemoScript();
             }
    	 }
         
         // Load Scripts from Repository
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.PROXY_URI + "de/fme/jsconsole/listscripts.json",
            method: Alfresco.util.Ajax.GET,
            requestContentType: Alfresco.util.Ajax.JSON,
            successCallback: {
            	fn: function(res) {
            		var listOfScripts = res.json.scripts;
            		this.createMenuButtons(listOfScripts);
            	},
            	scope: this
            }
         });       
         
         // Attach the CodeMirror highlighting
         this.widgets.codeMirror = CodeMirror.fromTextArea(this.widgets.scriptInput, {
        	 lineNumbers: true,
        	 onKeyEvent: function(i, e) {
        		 // Hook into ctrl-enter
	             if (e.keyCode == 13 && (e.ctrlKey || e.metaKey) && !e.altKey) {
		               e.stop();
		               i.owner.onExecuteClick(i.owner, e);
		             }
	         	}
         });
         
         // Store this for use in event
         this.widgets.codeMirror.owner = this;
      },

      /**
		 * Fired when the user clicks on the execute button. Reads the script
		 * from the input textarea and calls the execute webscript in the repository
		 * to run the script.
		 * 
		 * @method onExecuteClick
		 */      
      onExecuteClick: function ACJC_onExecuteClick(e, p_obj)
      {
    	// Save any changes done in CodeMirror editor before submitting
    	this.widgets.codeMirror.save();
    	
    	// If something is selected, only get the selected part of the script
    	var scriptCode = "";
    	if (this.widgets.codeMirror.somethingSelected()) {
    		scriptCode = this.widgets.codeMirror.getSelection();
    	}
    	else {
    		scriptCode = this.widgets.scriptInput.value;
    	}
    	
    	// Build JSON Object to send to the server
   	  	var input = { 
     	   "input" : scriptCode,
   	  	   "context" : {},
           "space" : this.widgets.nodeField.value
   	  	};

   	  	// Disable the result textarea
   	  	this.widgets.scriptOutput.disabled = true;

   	  	Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.PROXY_URI + "de/fme/jsconsole/execute.json",
            method: Alfresco.util.Ajax.POST,
            dataObj: input,
            requestContentType: Alfresco.util.Ajax.JSON,
            successCallback:
            {
               fn: function(res) {
            	 this.clearOutput();
            	 this.appendLineArrayToOutput(res.json.output);
                 this.widgets.scriptOutput.disabled = false;
               	 YAHOO.util.Dom.removeClass(this.widgets.scriptOutput, 'jserror'); 
               },
               scope: this
            },
            failureCallback:
            {
               fn: function(res) {
                 var result = YAHOO.lang.JSON.parse(res.serverResponse.responseText);
                 
                 this.clearOutput();
                 this.appendStringToOutput(result.status.code + " " + result.status.name+"\n");
                 this.appendStringToOutput(result.status.description+"\n");
                 this.appendStringToOutput(result.message+"\n");

                 this.widgets.scriptOutput.disabled = false;
               	 Dom.addClass(this.widgets.scriptOutput, 'jserror'); 
               },
               scope: this
            }
         });
	  },

	  loadDemoScript: function ACJC_loadDemoScript() {
		  this.widgets.codeMirror.setValue(
			'var nodes = search.luceneSearch("@name:alfresco");\n'+
			'\n'+
			'for each(n in nodes) {\n'+
	        '  print(n.name + " (" + n.typeShort + ") " + n.nodeRef);\n'+
	        '}\n');
	  },
	  
      /**
		 * Fired when the user selects a script from the load scripts drop down menu.
		 * Calls a repository webscript to retrieve the script contents.
		 * 
		 * @method onLoadScriptClick
		 */ 	  
      onLoadScriptClick : function ACJC_onLoadScriptClick(p_sType, p_aArgs, self) { 
			 
          var callback = {
              success : function(o) {
        	  	  // set the new editor content
            	  self.widgets.codeMirror.setValue(o.responseText);
              },
              failure: function(o) {
            	  text: self.msg("error.script.load", filename)
              },
              scope: this
          }

          var nodeRef = p_aArgs[1].value;
          
    	  if (nodeRef == "NEW") {
    		  self.loadDemoScript.call(self);
    	  }
    	  else {
    		  var url = Alfresco.constants.PROXY_URI + "api/node/content/" + nodeRef.replace("://","/");
    		  YAHOO.util.Connect.asyncRequest('GET', url, callback);
    	  }
       }, 

       saveAsExistingScript : function ACJC_saveAsExistingScript(filename, nodeRef) {
           Alfresco.util.Ajax.request({
        	   url: Alfresco.constants.PROXY_URI + "api/node/content/" + nodeRef.replace("://","/"),
        	   method: Alfresco.util.Ajax.PUT,
        	   dataStr: this.widgets.scriptInput.value,
        	   requestContentType: "text/javascript",
        	   successMessage: this.msg("message.save.successful", filename),
        	   failureMessage: this.msg("error.script.save", filename)
           });
       },
       
       saveAsNewScript : function ACJC_saveAsNewScript(filename) {
           Alfresco.util.Ajax.request({
        	   url: Alfresco.constants.PROXY_URI + "de/fme/jsconsole/createscript.json?name="+encodeURIComponent(filename),
        	   method: Alfresco.util.Ajax.PUT,
        	   dataStr: this.widgets.scriptInput.value,
        	   requestContentType: "text/javascript",
        	   successMessage: this.msg("message.save.successful", filename),
        	   failureMessage: this.msg("error.script.save", filename)
           });
       },
       
       /**
		 * Fired when the user selects a script from the save scripts drop down menu.
		 * Calls a repository webscript to store the script contents.
		 * 
		 * @method onLoadScriptClick
		 */ 	  
       onSaveScriptClick : function ACJC_onSaveScriptClick(p_sType, p_aArgs, self) { 
    	  self.widgets.codeMirror.save();
    	   
    	  var menuItem = p_aArgs[1];
    	  var filename = menuItem.cfg.getProperty("text");
    	  var nodeRef = menuItem.value;

    	  if (nodeRef == "NEW") {
              Alfresco.util.PopupManager.getUserInput(
              {
            	  title: self.msg("title.save.choose.filename"),
            	  text: self.msg("message.save.choose.filename"),
            	  input: "text",
            	  callback: {
            		  fn: self.saveAsNewScript,
            		  obj: [ ],
            		  scope: self
                  }
              });                          
    	  } else {
              Alfresco.util.PopupManager.displayPrompt
              ({
                 title: self.msg("title.confirm.save"),
                 text: self.msg("message.confirm.save", filename),
                 buttons: [
                 {
                	 text: self.msg("button.save"),
                	 handler: function ACJC_onSaveScriptClick_save() 
                     {
                		 this.destroy();
                		 self.saveAsExistingScript(filename, nodeRef);
                     }
                 },
                 {
                	 text: self.msg("button.cancel"),
                	 handler: function ACJC_onSaveScriptClick_cancel()
                     {
                		 this.destroy();
                     },
                     isDefault: true
                 }]
              });    	   
    	  }
       }, 
       
      /**
		 * Dialog select destination button event handler
		 * 
		 * @method onSelectDestinationClick
		 * @param e
		 *            {object} DomEvent
		 * @param p_obj
		 *            {object} Object passed back from addListener method
		 */
      onSelectDestinationClick: function ACJC_onSelectDestinationClick(e, p_obj)
      {
         // Set up select destination dialog
         if (!this.widgets.destinationDialog)
         {
            this.widgets.destinationDialog = new Alfresco.module.DoclibGlobalFolder(this.id + "-selectDestination");

            var allowedViewModes =
            [
               Alfresco.module.DoclibGlobalFolder.VIEW_MODE_REPOSITORY
               //Alfresco.module.DoclibGlobalFolder.VIEW_MODE_SITE,
               //Alfresco.module.DoclibGlobalFolder.VIEW_MODE_USERHOME
            ];

            this.widgets.destinationDialog.setOptions(
            {
               allowedViewModes: allowedViewModes,
               siteId: this.options.siteId,
               containerId: this.options.containerId,
               title: this.msg("title.destinationDialog"),
               nodeRef: "alfresco://company/home"
            });
         }

         // Make sure correct path is expanded
         var pathNodeRef = this.widgets.nodeField.value;
         this.widgets.destinationDialog.setOptions(
         {
            pathNodeRef: pathNodeRef ? new Alfresco.util.NodeRef(pathNodeRef) : null              
         });

         // Show dialog
         this.widgets.destinationDialog.showDialog();
      }, 
 
      /**
		 * Folder selected in destination dialog
		 * 
		 * @method onDestinationSelected
		 * @param layer
		 *            {object} Event fired
		 * @param args
		 *            {array} Event parameters (depends on event type)
		 */
      onDestinationSelected: function ACJC_onDestinationSelected(layer, args)
      {
         // Check the event is directed towards this instance
        if ($hasEventInterest(this.widgets.destinationDialog, args))
        {
            var obj = args[1];
            if (obj !== null)
            {
               this.widgets.nodeField.value = obj.selectedFolder.nodeRef;
               this.widgets.pathField.innerHTML = obj.selectedFolder.path;
            }
        }
      }      
      
   });
})();
      


         
         
         
         
         




