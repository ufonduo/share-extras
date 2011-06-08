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

         YAHOO.Bubbling.on("folderSelected", this.onDestinationSelected, this);
 
         // Load Scripts from Repository
         Alfresco.util.Ajax.request(
                 {
                    url: Alfresco.constants.PROXY_URI + "de/fme/jsconsole/listscripts.json",
                    method: Alfresco.util.Ajax.GET,
                    requestContentType: Alfresco.util.Ajax.JSON,
                    successCallback: {
                       fn: function(res) {

                          var oMenuButton3 = new YAHOO.widget.Button({ 
        						id: "scriptlist", 
        						name: "scriptlist",
        						label: this.msg("button.load.script"),
        						type: "menu",  
        						menu: res.json.scripts,
        						container: this.id + "-scriptmanager"
                          });

                          oMenuButton3.getMenu().subscribe("click", this.onLoadScriptClick, this); 
                       },
                       scope: this
                    }
                  });       
         
         //Attach the CodeMirror highlighting
         this.shareCodeMirror = CodeMirror.fromTextArea(this.widgets.scriptInput,{
	        	 lineNumbers: true,
	        	 onKeyEvent: function(i, e) {
	             // Hook into ctrl-enter
	             if (e.keyCode == 13 && (e.ctrlKey || e.metaKey) && !e.altKey) {
		               e.stop();
		               i.owner.onExecuteClick(i.owner, e);
		             }
	         	}
         });
         //Store this for use in event
         this.shareCodeMirror.owner=this;
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
    	//Save any changes done in CodeMirror editor before submitting
    	this.shareCodeMirror.save();
    	var ta = this.widgets.scriptInput;
   	  	var selection = ta.value.substring(ta.selectionStart, ta.selectionEnd);

   	  	var input = { 
     	   "input" : (selection.length > 0) ? selection : ta.value,
   	  	   "context" : {},
           "space" : this.widgets.nodeField.value
   	  	};

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
	 
      /**
		 * Fired when the user selects a script from the load scripte drop down menu.
		 * Calls a repository webscript to retrieve the script contents.
		 * 
		 * @method onLoadScriptClick
		 */ 	  
      onLoadScriptClick : function ACJC_onLoadScriptClick(p_sType, p_aArgs, self) { 
			 
          var callback = {
              success : function(o) {
            	  //self.widgets.scriptInput.value = o.responseText;
        	  	  //set the new editor content
            	  self.shareCodeMirror.setValue(o.responseText);
              },
              failure: function(o) {
                  alert("Error loading script."); 
              },
              scope: this
          }

          var nodeRef = p_aArgs[1].value;
          var url = Alfresco.constants.PROXY_URI + "api/node/content/" + nodeRef.replace("://","/");
          YAHOO.util.Connect.asyncRequest('GET', url, callback);
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
      


         
         
         
         
         




