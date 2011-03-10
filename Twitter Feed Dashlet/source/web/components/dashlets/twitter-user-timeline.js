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
 * Dashboard blog component.
 * 
 * @namespace Alfresco
 * @class Alfresco.dashlet.TwitterUserTimeline
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
    * Dashboard TwitterUserTimeline constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.TwitterUserTimeline} The new component instance
    * @constructor
    */
   Alfresco.dashlet.TwitterUserTimeline = function TwitterUserTimeline_constructor(htmlId)
   {
      return Alfresco.dashlet.TwitterUserTimeline.superclass.constructor.call(this, "Alfresco.dashlet.TwitterUserTimeline", htmlId);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Alfresco.dashlet.TwitterUserTimeline, Alfresco.component.Base,
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
          * Twitter username of the user to display the timeline for
          * 
          * @property twitterUser
          * @type string
          * @default ""
          */
         twitterUser: "",

         /**
          * Default Twitter username of the user to display the timeline for, if no specific user is configured
          * 
          * @property defaultTwitterUser
          * @type string
          * @default ""
          */
         defaultTwitterUser: ""
      },

      /**
       * User timeline DOM container.
       * 
       * @property activityList
       * @type object
       * @default null
       */
      timeline: null,

      /**
       * Dashlet title DOM container.
       * 
       * @property title
       * @type object
       * @default null
       */
      title: null,

      /**
       * Load More button
       * 
       * @property moreButton
       * @type object
       * @default null
       */
      moreButton: null,

      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
      onReady: function TwitterUserTimeline_onReady()
      {
         Event.addListener(this.id + "-configure-link", "click", this.onConfigClick, this, true);
         
         // The user timeline container
         this.timeline = Dom.get(this.id + "-timeline");
         
         // The dashlet title container
         this.title = Dom.get(this.id + "-title");
         
         // Set up the More Tweets button
         this.moreButton = new YAHOO.widget.Button(
            this.id + "-btn-more",
            {
               disabled: true,
               onclick: {
                  fn: this.onMoreButtonClick,
                  obj: this.moreButton,
                  scope: this
               }
            }
         );
         
         // Load the timeline
         this.refreshTimeline();
      },

      /**
       * Reload the timeline from the Twitter API and refresh the contents of the dashlet
       * 
       * @method refreshTimeline
       */
      refreshTimeline: function TwitterUserTimeline_refreshTimeline()
      {
         // Load the timeline
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.URL_SERVICECONTEXT + "components/dashlets/twitter-user-timeline/list",
            dataObj:
            {
               twitterUser: this.getTwitterUser(),
               htmlid: this.id
            },
            successCallback:
            {
               fn: this.onTimelineLoaded,
               scope: this,
               obj: null
            },
            failureCallback:
            {
               fn: this.onTimelineLoadFailed,
               scope: this
            },
            scope: this,
            noReloadOnAuthFailure: true
         });
      },
      
      /**
       * Timeline loaded successfully
       * 
       * @method onTimelineLoaded
       * @param p_response {object} Response object from request
       */
      onTimelineLoaded: function TwitterUserTimeline_onTimelineLoaded(p_response, p_obj)
      {
         this.timeline.innerHTML = p_response.serverResponse.responseText;
         this.title.innerHTML = this.msg("header.userTimeline", this.getTwitterUser());
         
         /*
          * Enable the Load More button if the feed is a list feed. The button is not supported for 
          * users since the user_timeline API does not support max_id and since_id.
          */
         if (this.getTwitterUser().indexOf("/") > 0)
         {
            this.moreButton.set("disabled", false);
            Dom.setStyle(this.id + "-buttons", "display", "block");
         }
         else
         {
            this.moreButton.set("disabled", true);
            Dom.setStyle(this.id + "-buttons", "display", "none");
         }
      },

      /**
       * Timeline load failed
       * 
       * @method onTimelineLoadFailed
       */
      onTimelineLoadFailed: function TwitterUserTimeline_onTimelineLoadFailed()
      {
         this.timeline.innerHTML = '<div class="detail-list-item first-item last-item">' + this.msg("label.error") + '</div>';
      },

      /**
       * Load Tweets further back in time from the Twitter API and add to the dashlet contents
       * 
       * @method extendTimeline
       */
      extendTimeline: function TwitterUserTimeline_extendTimeline()
      {
         // Load the user timeline
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.URL_SERVICECONTEXT + "components/dashlets/twitter-user-timeline/list",
            dataObj:
            {
               twitterUser: this.getTwitterUser(),
               maxId: this.getEarliestTweetId(),
               htmlid: this.id
            },
            successCallback:
            {
               fn: this.onTimelineExtensionLoaded,
               scope: this,
               obj: null
            },
            failureCallback:
            {
               fn: this.onTimelineExtensionLoadFailure,
               scope: this,
               obj: null
            },
            scope: this,
            noReloadOnAuthFailure: true
         });
      },
      
      /**
       * Extended timeline loaded successfully
       * 
       * @method onTimelineExtensionLoaded
       * @param p_response {object} Response object from request
       */
      onTimelineExtensionLoaded: function TwitterUserTimeline_onTimelineLoaded(p_response, p_obj)
      {
         this.timeline.innerHTML += p_response.serverResponse.responseText;
         this.moreButton.set("disabled", false);
      },
      
      /**
       * Extended timeline load failed
       * 
       * @method onTimelineExtensionLoadFailure
       * @param p_response {object} Response object from request
       */
      onTimelineExtensionLoadFailure: function TwitterUserTimeline_onTimelineExtensionLoadFailure(p_response, p_obj)
      {
         Alfresco.util.PopupManager.displayMessage(
         {
            text: this.msg("message.extendFailed")
         });
         
         // Re-enable the button
         this.moreButton.set("disabled", false);
      },
      
      /**
       * Get the current Twitter user or list ID
       * 
       * @method getTwitterUser
       * @return {string} The name of the currently-configured user or list, or the default
       * user/list if unconfigured or blank
       */
      getTwitterUser: function TwitterUserTimeline_getTwitterUser()
      {
         return (this.options.twitterUser != null && this.options.twitterUser != "") ? 
               this.options.twitterUser : this.options.defaultTwitterUser;
      },
      
      /**
       * Get the ID of the earlist Tweet in the timeline
       * 
       * @method getEarliestTweetId
       * @return {string} The ID of the earliest Tweet shown in the timeline, or null if
       * no Tweets are available or the last Tweet has no compatible ID on its element
       */
      getEarliestTweetId: function TwitterUserTimeline_getEarliestTweetId()
      {
         var div = Dom.getLastChild(this.timeline);
         if (div !== null)
         {
            var id = Dom.getAttribute(div, "id");
            if (id !== null && id.lastIndexOf("-") != -1)
            {
               return id.substring(id.lastIndexOf("-") + 1);
            }
         }
         return null;
      },
      
      /**
       * Get the ID of the latest Tweet in the timeline
       * 
       * @method getLatestTweetId
       * @return {string} The ID of the latest Tweet shown in the timeline, or null if
       * no Tweets are available or the last Tweet has no compatible ID on its element
       */
      getLatestTweetId: function TwitterUserTimeline_getLatestTweetId()
      {
         var div = Dom.getFirstChild(this.timeline);
         if (div !== null)
         {
            var id = Dom.getAttribute(div, "id");
            if (id !== null && id.lastIndexOf("-") != -1)
            {
               return id.substring(id.lastIndexOf("-") + 1);
            }
         }
         return null;
      },

      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */

      /**
       * Configuration click handler
       *
       * @method onConfigClick
       * @param e {object} HTML event
       */
      onConfigClick: function TwitterUserTimeline_onConfigClick(e)
      {
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);
         
         Event.stopEvent(e);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlets/twitter-user-timeline/config", actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function VideoWidget_onConfigFeed_callback(response)
                  {
                     // Refresh the feed
                     var u = Dom.get(this.configDialog.id + "-twitterUser").value;
                     this.options.twitterUser = (u != "") ? u : this.options.defaultTwitterUser;
                     this.refreshTimeline();
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function VideoWidget_doSetupForm_callback(form)
                  {
                     Dom.get(this.configDialog.id + "-twitterUser").value = this.getTwitterUser();
                  },
                  scope: this
               }
            });
         }
         else
         {
            this.configDialog.setOptions(
            {
               actionUrl: actionUrl,
               twitterUser: this.options.twitterUser
            });
         }
         this.configDialog.show();
      },

      /**
       * Click handler for Show More button
       *
       * @method onMoreButtonClick
       * @param e {object} HTML event
       */
      onMoreButtonClick: function TwitterUserTimeline_onMoreButtonClick(e, obj)
      {
         // Disable the button while we make the request
         this.moreButton.set("disabled", true);
         this.extendTimeline();
      }
      
   });
})();
