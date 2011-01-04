/**
 * Copyright (C) 2005-2009 Alfresco Software Limited.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.

 * As a special exception to the terms and conditions of version 2.0 of 
 * the GPL, you may redistribute this Program in connection with Free/Libre 
 * and Open Source Software ("FLOSS") applications as described in Alfresco's 
 * FLOSS exception.  You should have recieved a copy of the text describing 
 * the FLOSS exception, and it is also available here: 
 * http://www.alfresco.com/legal/licensing
 */
 
/**
 * Dashboard Poll component.
 * 
 * @namespace Alfresco
 * @class Alfresco.dashlet.SitePoll
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $combine = Alfresco.util.combinePaths;

   /**
    * Preferences
    */
   var PREFERENCES_DASHLET = "org.alfresco.share.dashlet",
      PREF_SITE_TAGS_FILTER = PREFERENCES_DASHLET + ".SitePollFilter";


   /**
    * Dashboard SitePoll constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.SitePoll} The new component instance
    * @constructor
    */
   Alfresco.dashlet.SitePoll = function SitePoll_constructor(htmlId)
   {
      return Alfresco.dashlet.SitePoll.superclass.constructor.call(this, "Alfresco.dashlet.SitePoll", htmlId);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Alfresco.dashlet.SitePoll, Alfresco.component.Base,
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
          */
         componentId: "",
      
         /**
          * The nodeRef to the poll to display
          *
          * @property nodeRef
          * @type string
          * @default ""
          */
         nodeRef: "",

         /**
          * Whether the user has voted already or not.
          * 
          * @property hasVoted
          * @type boolean
          * @default false
          */
         hasVoted: false,

         /**
          * ID of the current site
          * 
          * @property siteId
          * @type string
          * @default ""
          */
         siteId: ""
      },

      /**
       * ContainerId for button group
       *
       * @property buttonGroup
       * @type string
       * @default ""
       */
      buttonGroup: null,

      /**
       * Submit Button object
       *
       * @property submitButton
       * @type string
       * @default ""
       */
      submitButton: null,

      /**
       * Value of the currently-selected option
       *
       * @property selectedValue
       * @type string
       * @default ""
       */
      selectedValue: null,

      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function SitePoll_onReady()
      {
         Event.addListener(this.id + "-configure-link", "click", this.onConfigPollClick, this, true);
         
         if (Dom.get(this.id + "-form") != null)
         {
            this.buttonGroup = new YAHOO.widget.ButtonGroup(this.id + "-buttongroup");
            
            // Add event listener to each button
            for ( var i = 0; i < this.buttonGroup.getCount(); i++)
            {
               var b = this.buttonGroup.getButton(i);
               b.on("checkedChange", this.onOptionCheckedChanged, b, this);
            }
            
            this.submitButton = Alfresco.util.createYUIButton(this, "submit", function()
            {
               Alfresco.util.Ajax.request(
               {
                  method: "POST",
                  requestContentType: Alfresco.util.Ajax.JSON,
                  responseContentType: Alfresco.util.Ajax.JSON,
                  url: Alfresco.constants.PROXY_URI + "slingshot/poll/" + this.options.nodeRef.replace("://", "/") + "/response",
                  dataObj: 
                  {
                     site: this.options.site,
                     response: this.getSelectedOption()
                  },
                  successCallback: 
                  {
                     fn: function(response)
                     {
                        // Replace the form with a thank you message
                        Dom.get(this.id + "-form").innerHTML = "<p>" + this.msg("msg.thankyou", this.getSelectedOption()) + "</p>";
                     },
                     scope: this
                  },
                  failureMessage: "Could not post response to '" + Alfresco.constants.PROXY_URI + "slingshot/poll/" + this.options.nodeRef.replace("://", "/") + "/response'.",
                  scope: this,
                  execScripts: true
               });
            });
            this.submitButton.set("disabled", true);
         }
      },
      
      getSelectedOption: function SitePoll_getSelectedOption()
      {
         return this.selectedValue;
      },

      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */
      
      onOptionCheckedChanged: function SitePoll_onOptionCheckedChanged(p_oEvent, p_obj)
      {
         this.selectedValue = p_obj.get("value");
         p_obj.set("checked", true, true);
         // Enable the submit button
         this.submitButton.set("disabled", false);
      },
      
      /**
       * Configuration click handler
       *
       * @method onConfigPollClick
       * @param e {object} HTML event
       */
      onConfigPollClick: function SitePoll_onConfigPollClick(e)
      {
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);
         
         Event.stopEvent(e);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/poll/config/" + this.options.siteId,
               actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function SitePoll_onConfigPoll_callback(e)
                  {
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function SitePoll_doSetupForm_callback(form)
                  {
                     var select = Dom.get(this.configDialog.id + "-poll-select");
                     if (select != null)
                     {
                        select.value = this.options.nodeRef;
                     }
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
      }
   });
})();
