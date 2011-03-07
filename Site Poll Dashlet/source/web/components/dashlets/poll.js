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
       * Results container div object
       * 
       * @property resultsContainer
       * @type object
       * @default null
       */
      resultsContainer: null,
      
      /**
       * Toggle results link object
       * 
       * @property toggleResultsLink
       * @type object
       * @default null
       */
      toggleResultsLink: null,

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
         this.resultsContainer = Dom.get(this.id + "-results");
         this.toggleResultsLink = Dom.get(this.id + "-toggle-results-link");
         
         Event.addListener(this.id + "-configure-link", "click", this.onConfigPollClick, this, true);
         Event.addListener(this.id + "-toggle-results-link", "click", this.onToggleResultsClick, this, true);

         this.initPoll();
      },

      /**
       * Load poll information over HTTP and initialise the dashlet
       * 
       * @method initPoll
       */
      initPoll: function SitePoll_initPoll()
      {
         if (this.options.nodeRef != "")
         {
            // Load the user timeline
            Alfresco.util.Ajax.request(
            {
               url: Alfresco.constants.PROXY_URI + "slingshot/poll/" + this.options.nodeRef.replace("://", "/"),
               successCallback:
               {
                  fn: this.onPollLoaded,
                  scope: this
               },
               failureCallback:
               {
                  fn: this.onPollLoadFailed,
                  scope: this
               },
               scope: this,
               noReloadOnAuthFailure: true
            });
         }
         else
         {
            Dom.get(this.id + "-poll-title").innerHTML = "";
            Dom.get(this.id + "-results").innerHTML = "";
            Dom.get(this.id + "-poll-message").innerHTML = this.msg("msg.notConfigured");
            Dom.setStyle(this.id + "-poll-message", "display", "block");
            Dom.setStyle([this.id + "-results", this.id + "-poll-links"], "display", "none");
            this.toggleResultsLink.innerHTML = this.msg("label.showResults");
         }
      },
      
      /**
       * Poll loaded successfully
       * @method onPollLoaded
       * @param p_response {object} Response object from request
       */
      onPollLoaded: function SitePoll_onPollLoaded(p_response, p_obj)
      {
         Dom.get(this.id + "-poll-title").innerHTML = p_response.json.title;
         
         if (!p_response.json.hasVoted)
         {
            var pollEnabled = p_response.json.enabled;
            var now = Date.now();
            if (pollEnabled && p_response.json.startDate)
            {
               var startDate = Date.parse(p_response.json.startDate);
               pollEnabled = startDate < now;
            }
            if (pollEnabled && p_response.json.startDate)
            {
               var endDate = Date.parse(p_response.json.endDate);
               pollEnabled = endDate > now;
            }
            
            if (pollEnabled)
            {
               if (p_response.json.hasCreateChildrenPermission)
               {
                  if (this.buttonGroup)
                  {
                     this.buttonGroup.destroy();
                  }
                  this.buttonGroup = new YAHOO.widget.ButtonGroup({
                        id: this.id + "-buttongroup",
                        name: "response",
                        container: this.id + "-poll-options"
                  });
                  
                  var opt, optid;
                  // Create buttons
                  for ( var i = 0; i < p_response.json.options.length; i++)
                  {
                     opt = p_response.json.options[i];
                     optid = this.id + "-poll-option-" + i;
                     this.buttonGroup.addButton(
                           {
                              id: optid,
                              name: "response",
                              label: opt,
                              value: opt,
                              type: "radio"
                           }
                        );

                     // Add event listener to each button
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
                              // Hide the results if shown
                              this.resultsContainer.innerHTML = "";
                              Dom.setStyle(this.resultsContainer, "display", "none");
                              this.toggleResultsLink.innerHTML = this.msg("label.showResults");
                           
                              // Replace the form with a thank you message and a link for the results
                              Dom.get(this.id + "-poll-message").innerHTML = this.msg("msg.thankyou", this.getSelectedOption());
                              Dom.setStyle(this.id + "-form", "display", "none");
                              Dom.setStyle([this.id + "-poll-message", this.id + "-poll-links"], "display", "block");
                           },
                           scope: this
                        },
                        failureMessage: "Could not post response to '" + Alfresco.constants.PROXY_URI + "slingshot/poll/" + this.options.nodeRef.replace("://", "/") + "/response'.",
                        scope: this,
                        execScripts: true
                     });
                  });
                  this.submitButton.set("disabled", true);

                  Dom.setStyle(this.id + "-form", "display", "block");
                  Dom.setStyle(this.id + "-poll-message", "display", "none");
               }
               else
               {
                  Dom.setStyle(this.id + "-form", "display", "none");
                  Dom.get(this.id + "-poll-message").innerHTML = this.msg("msg.noPermission");
                  Dom.setStyle(this.id + "-poll-message", "display", "block");
               }
            }
            else
            {
               Dom.setStyle(this.id + "-form", "display", "none");
               Dom.get(this.id + "-poll-message").innerHTML = this.msg("msg.notEnabled");
               Dom.setStyle(this.id + "-poll-message", "display", "block");
            }
         }
         else
         {
            Dom.setStyle(this.id + "-form", "display", "none");
         }
         
         // If they have voted or own the poll then allow the results to be shown
         if (p_response.json.hasVoted)
         {
            Dom.get(this.id + "-poll-message").innerHTML = this.msg("msg.thankyou", p_response.json.pollResponse);
            Dom.setStyle([this.id + "-poll-message", this.id + "-results", this.id + "-poll-links"], "display", "block");
         }
         else if (p_response.json.isOwner)
         {
            Dom.setStyle([this.id + "-results", this.id + "-poll-links"], "display", "block");
         }
         else
         {
            Dom.setStyle([this.id + "-results", this.id + "-poll-links"], "display", "none");
         }

         // Hide the results if shown
         this.resultsContainer.innerHTML = "";
         Dom.setStyle(this.resultsContainer, "display", "none");
         this.toggleResultsLink.innerHTML = this.msg("label.showResults");
      },
      
      /**
       * Poll load failed
       * @method onPollLoadFailed
       * @param p_response {object} Response object from request
       */
      onPollLoadFailed: function SitePoll_onPollLoadFailed(p_response)
      {
         if (p_response.serverResponse.status == 404)
         {
            Dom.get(this.id + "-poll-message").innerHTML = this.msg("msg.notFound");
         }
         else
         {
            Dom.get(this.id + "-poll-message").innerHTML = this.msg("msg.error");
         }
         Dom.setStyle(this.id + "-poll-message", "display", "block");
      },
      
      /**
       * Get the name of the currently-selected poll, set using the config dialogue
       * @method getSelectedOption
       */
      getSelectedOption: function SitePoll_getSelectedOption()
      {
         return this.selectedValue;
      },
      
      /**
       * Load and render the poll results in-line in the dashlet
       * @method loadResults
       */
      loadResults: function SitePoll_loadResults()
      {
         // Hide the existing content
         Dom.setStyle(this.resultsContainer, "display", "none");

         Alfresco.util.Ajax.jsonGet(
         {
            url: Alfresco.constants.PROXY_URI + "slingshot/poll/" + this.options.nodeRef.replace("://", "/") + "/results",
            successCallback: 
            {
               fn: this.onResultsSuccess,
               scope: this
            },
            failureMessage: "Could not load poll results from '" + Alfresco.constants.PROXY_URI + "slingshot/poll/" + this.options.nodeRef.replace("://", "/") + "/results'.",
            scope: this,
            noReloadOnAuthFailure: true
         });
      },

      /**
       * Poll results retrieved successfully
       * @method onResultsSuccess
       * @param p_response {object} Response object from request
       */
      onResultsSuccess: function SitePoll_onResultsSuccess(p_response)
      {
         var responses = p_response.json.responses, totalVotes = p_response.json.totalVotes, html = "", response;
         if (totalVotes > 0)
         {
            for (i = 0, ii = responses.length; i < ii; i++)
            {
               response = responses[i];
               html += "<h4 class=\"resultResponse\">" + $html(response.response) + "</h4><p class=\"pollResult\"><span class=\"resultBar\"><span class=\"outer\"><span class=\"inner\" style=\"width: " + Math.round(response.share * 100) + "%;\"> </span></span></span><span class=\"resultSummary\">" + $html(response.votes) + " <span class=\"detail\">(" + Math.round(response.share * 100) + "%)</span></span></p>";
            }
            html += "<p>" + this.msg("msg.totalVotes", totalVotes) + "</p>";
         }
         else
         {
            html = "<p>" + this.msg("msg.noVotes") + "</p>";
         }
         this.resultsContainer.innerHTML = html;
         // Fade the new content in
         Alfresco.util.Anim.fadeIn(this.resultsContainer);
      },

      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */

      /**
       * Currently-checked response set/changed
       * @method onOptionCheckedChanged
       * @param p_oEvent {object} Button event
       * @param p_obj {object} Button
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
                     var select = Dom.get(this.configDialog.id + "-poll-select");
                     if (select != null && this.options.nodeRef != select.value)
                     {
                        this.options.nodeRef = select.value;
                        this.initPoll();
                     }
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
      },

      /**
       * Toggle results click handler
       *
       * @method onToggleResultsClick
       * @param e {object} HTML event
       */
      onToggleResultsClick: function SitePoll_onToggleResultsClick(e)
      {
         Event.stopEvent(e);
         if (Dom.getStyle(this.resultsContainer, "display") == "none")
         {
            this.loadResults();
            this.toggleResultsLink.innerHTML = this.msg("label.hideResults");
         }
         else
         {
            // Hide the element
            Dom.setStyle(this.resultsContainer, "display", "none");
            this.toggleResultsLink.innerHTML = this.msg("label.showResults");
         }
      }
   });
})();
