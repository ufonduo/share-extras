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
 * Twitter search dashlet.
 * 
 * @namespace Alfresco
 * @class Alfresco.dashlet.TwitterSearch
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
    * Dashboard TwitterSearch constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.TwitterSearch} The new component instance
    * @constructor
    */
   Alfresco.dashlet.TwitterSearch = function TwitterSearch_constructor(htmlId)
   {
      return Alfresco.dashlet.TwitterSearch.superclass.constructor.call(this, "Alfresco.dashlet.TwitterSearch", htmlId);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Alfresco.dashlet.TwitterSearch, Alfresco.component.Base,
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
          * Twitter search term
          * 
          * @property searchTerm
          * @type string
          * @default ""
          */
         searchTerm: "",

         /**
          * Default Twitter search term, if no specific search term is configured
          * 
          * @property defaultSearchTerm
          * @type string
          * @default ""
          */
         defaultSearchTerm: "",

         /**
          * Number of search results to display
          * 
          * @property defaultSearchTerm
          * @type int
          * @default 20
          */
         numResults: 20
      },

      /**
       * Search results DOM container.
       * 
       * @property searchResults
       * @type object
       */
      searchResults: null,

      /**
       * Dashlet title DOM container.
       * 
       * @property title
       * @type object
       */
      title: null,

      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function TwitterSearch_onReady()
      {
         Event.addListener(this.id + "-configure-link", "click", this.onConfigClick, this, true);
         
         // The search results container
         this.searchResults = Dom.get(this.id + "-searchResults");
         
         // The dashlet title container
         this.title = Dom.get(this.id + "-title");
         
         // Load the results
         this.refreshResults();
      },

      /**
       * Reload the search results
       * @method refreshResults
       */
      refreshResults: function TwitterSearch_refreshResults()
      {
         // Load the search results
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.URL_SERVICECONTEXT + "components/dashlets/twitter-search/results",
            dataObj:
            {
               q: ((this.options.searchTerm != null && this.options.searchTerm != "") ? 
                     this.options.searchTerm : this.options.defaultSearchTerm),
               rpp: this.options.numResults
            },
            successCallback:
            {
               fn: this.onResultsLoaded,
               scope: this,
               obj: null
            },
            failureCallback:
            {
               fn: this.onSearchFailed,
               scope: this
            },
            scope: this,
            noReloadOnAuthFailure: true
         });
      },
      
      /**
       * Search results loaded successfully
       * @method onResultsLoaded
       * @param p_response {object} Response object from request
       */
      onResultsLoaded: function TwitterSearch_onResultsLoaded(p_response, p_obj)
      {
         this.searchResults.innerHTML = p_response.serverResponse.responseText;
         this.title.innerHTML = this.msg("header.search", ((this.options.searchTerm != "") ?
               this.options.searchTerm : this.options.defaultSearchTerm));
      },

      /**
       * Search results load failed
       * @method onSearchFailed
       */
      onSearchFailed: function TwitterSearch_onSearchFailed()
      {
         this.searchResults.innerHTML = '<div class="detail-list-item first-item last-item">' + this.msg("label.error") + '</div>';
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
      onConfigClick: function TwitterSearch_onConfigClick(e)
      {
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);
         
         Event.stopEvent(e);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlets/twitter-search/config", actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function VideoWidget_onConfigFeed_callback(response)
                  {
                     // Refresh the feed
                     var u = Dom.get(this.configDialog.id + "-searchTerm").value;
                     this.options.searchTerm = (u != "") ? u : this.options.defaultSearchTerm;
                     this.refreshResults();
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function VideoWidget_doSetupForm_callback(form)
                  {
                     Dom.get(this.configDialog.id + "-searchTerm").value = ((this.options.searchTerm != "") ?
                           this.options.searchTerm : this.options.defaultSearchTerm);
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
               searchTerm: this.options.searchTerm
            })
         }
         this.configDialog.show();
      }
      
   });
})();
