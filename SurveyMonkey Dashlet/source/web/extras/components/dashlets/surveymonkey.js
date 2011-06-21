/**
 * Copyright (C) 2010-2011 Share Extras contributors.
 *
 */

/**
* Extras root namespace.
* 
* @namespace Extras
*/
// Ensure Extras root object exists
if (typeof (Extras) == "undefined" || !Extras)
{
   var Extras = {};
}
// Ensure Extras.dashlet object exists
if (typeof (Extras.dashlet) == "undefined" || !Extras.dashlet)
{
   Extras.dashlet = {};
}

/**
 * SurveyMonkey Dashlet.
 * 
 * @namespace Extras
 * @class Extras.dashlet.SurveyMonkey
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      Cookie = YAHOO.util.Cookie;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $combine = Alfresco.util.combinePaths;

   /**
    * Dashboard SurveyMonkey constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Extras.dashlet.SurveyMonkey} The new component instance
    * @constructor
    */
   Extras.dashlet.SurveyMonkey = function SurveyMonkey_constructor(htmlId)
   {
      return Extras.dashlet.SurveyMonkey.superclass.constructor.call(this, "Extras.dashlet.SurveyMonkey", htmlId, [ "cookie" ]);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Extras.dashlet.SurveyMonkey, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
         /**
          * The component id.
          *
          * @property componentId
          * @type string
          * @default ""
          */
         componentId: "",
         
         /**
          * Survey ID
          * 
          * @property surveyId
          * @type string
          * @default ""
          */
         surveyId: "",
         
         /**
          * Survey title
          * 
          * @property title
          * @type string
          * @default ""
          */
         title: "",
         
         /**
          * Whether to use a modal panel to display the survey
          * 
          * @property usePanel
          * @type boolean
          * @default false
          */
         usePanel: false
      },
      
      /**
       * Body DOM container.
       * 
       * @property bodyContainer
       * @type object
       * @default null
       */
      bodyContainer: null,

      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
      onReady: function SurveyMonkey_onReady()
      {
         // Dashlet body and title containers
         this.bodyContainer = Dom.get(this.id + "-body");
         this.titleContainer = Dom.get(this.id + "-title");
         
         // Panel body and title containers
         this.panelBodyContainer = Dom.get(this.id + "-panel-bd");
         this.panelTitleContainer = Dom.get(this.id + "-panel-hd");
         
         // Configure button event listener
         Event.addListener(this.id + "-config-link", "click", this.onConfigClick, this, true);
         
         // Set up the panel
         this.widgets.panel = new YAHOO.widget.Panel(this.id + "-panel", {
             draggable: true,
             visible: false,
             width: "700px",
             height: "618px",
             autofillheight: "body",
             constraintoviewport: true,
             context: [this.id + "-panel-bd", this.id + "-panel-tl", this.id + "-panel-tl"]
         });
         this.widgets.panel.render();
         this.widgets.panel.subscribe("hide", this.onPanelClose, this);
         // Unhide the container div
         Dom.setStyle(this.id + "-panel", "display", "block");
         
         // Render the contents
         this.refresh();
      },

      /**
       * Refresh the contents of the dashlet
       * 
       * @method refresh
       */
      refresh: function SurveyMonkey_refresh()
      {
         this.bodyContainer.innerHTML = "";
         this.titleContainer.innerHTML = this.options.title || this.msg("label.title");
         this.panelTitleContainer.innerHTML = this.options.title || this.msg("label.title");
         
         if (this.options.surveyId)
         {
            var skippedSurvey = this._getSkippedSurvey();
            
            // Populate dashlet content
            this._addScriptContent(this.bodyContainer);
            if (this.options.usePanel && !skippedSurvey)
            {
               this.panelBodyContainer.innerHTML = "";
               this._addScriptContent(this.panelBodyContainer);
               this.widgets.panel.cfg.setProperty("visible", true);
               this.widgets.panel.render();
            }
         }
         else
         {
            this.bodyContainer.innerHTML = "<div>" + this.msg("msg.not-configured") + "</div>";
         }
      },

      /**
       * Check if the user already skipped this survey
       *
       * @method _getSkippedSurvey
       * @return {boolean} True if the user has skipped the survey, false otherwise
       * @private
       */
      _getSkippedSurvey: function SurveyMonkey__getSkippedSurvey()
      {
         var skipped = YAHOO.util.Cookie.get("skippedSurvey_" + this.options.surveyId, Boolean);
         return (skipped != null);
      },

      /**
       * Insert surveyMonkey script tags into the selected element
       *
       * @method _addScriptContent
       * @param el {HTMLElement} The element inside which to place the script tags
       * @private
       */
      _addScriptContent: function SurveyMonkey__addScriptContent(el)
      {
         var se = document.createElement("script");
         se.type = "text/javascript";
         se.async = true;
         se.src = "http://www.surveymonkey.com/jsEmbed.aspx?sm=" + this.options.surveyId;
         el.appendChild(se);
      },

      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */
      
      /**
       * Config dialog click handler
       *
       * @method onConfigClick
       * @param e {object} HTML event
       */
      onConfigClick: function SurveyMonkey_onConfigClick(e)
      {
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);
         
         Event.stopEvent(e);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "extras/modules/dashlets/surveymonkey/config",
               actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function SurveyMonkey_onConfigFeed_callback(response)
                  {
                     // Refresh the feed
                     this.options.surveyId = Dom.get(this.configDialog.id + "-survey-id").value;
                     this.options.title = Dom.get(this.configDialog.id + "-survey-title").value;
                     this.options.usePanel = Dom.get(this.configDialog.id + "-use-panel").checked;
                     this.refresh();
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function SurveyMonkey_doSetupForm_callback(form)
                  {
                     Dom.get(this.configDialog.id + "-survey-id").value = this.options.surveyId;
                     Dom.get(this.configDialog.id + "-survey-title").value = this.options.title;
                     Dom.get(this.configDialog.id + "-use-panel").checked = this.options.usePanel;
                  },
                  scope: this
               }
            });
         }
         else
         {
            this.configDialog.setOptions(
            {
               actionUrl: actionUrl
            });
         }
         
         this.configDialog.show();
      },

      /**
       * Panel close click handler
       *
       * @method onPanelClose
       * @param e {object} HTML event
       */
      onPanelClose: function SurveyMonkey_onPanelClose(type, args, me)
      {
         YAHOO.util.Cookie.set("skippedSurvey_" + me.options.surveyId, "true");
         return;
      }
   });
})();
