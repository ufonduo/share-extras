/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */
 
/**
 * Alfresco.dashlet.GoogleSiteNews
 *
 * Displays recently index data from google
 *
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * GoogleSiteNews constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.GoogleSiteNews} The new GoogleSiteNews instance
    * @constructor
    */
   Alfresco.dashlet.GoogleSiteNews = function GoogleSiteNews_constructor(htmlId)
   {
      Alfresco.dashlet.GoogleSiteNews.superclass.constructor.call(this, "Alfresco.dashlet.GoogleSiteNews", htmlId);
      
      this.configDialog = null;
      
      return this;
   };

   YAHOO.extend(Alfresco.dashlet.GoogleSiteNews, Alfresco.component.Base,
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
          * The component id
          *
          * @property componentId
          * @type string
          * @default ""
          */
         componentId: "",

         /**
          * THe url to the feed to display
          *
          * @property searchTerm
          * @type string
          * @default ""
          */
         searchTerm: "",

         /**
          * The number of days back in index
          *
          * @property limit
          * @type string
          * @default "5"
          */
         limit: "5",
         /**
          * Holds today in julian for refresh
          *
          * @property juliantoday
          * @type number
          * @default 0
          */
         julianToday: "0"
      },  
      
      /**
       * Fired by YUI when parent element is available for scripting.
       * Component initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function RF_onReady()
      {
         // Add click handler to config feed link that will be visible if user is site manager.
         var configGoogleSiteNewsLink = Dom.get(this.id + "-configGoogleSiteNews-link");
         if (configGoogleSiteNewsLink)
         {
            Event.addListener(configGoogleSiteNewsLink, "click", this.onConfigGoogleSiteNewsClick, this, true);            
         }
         //Execute new search
         var lower = parseInt(this.options.julianToday)-parseInt(this.options.limit);
         var search = "daterange:"+lower.toString()+"-"+this.options.julianToday+" "+this.options.searchTerm;
         this._doSearch(search);
      },

      /**
       * Called when the user clicks the config rss feed link.
       * Will open a rss config dialog
       *
       * @method onConfigFeedClick
       * @param e The click event
       */
      onConfigGoogleSiteNewsClick: function RF_onConfigGoogleSiteNewsClick(e)
      {
         Event.stopEvent(e);
         
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/googlesitenews/config/" + encodeURIComponent(this.options.componentId);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/googlesitenews/config",
               onSuccess:
               {
                  fn: function GoogleSiteNews_onConfigGoogleSiteNews_callback(response)
                  {
                     var result = response.json;

                     // Save search terms for new config dialog openings
                     this.options.searchTerm = (result && result.searchterm) ? result.searchterm : this.options.searchTerm;
                     this.options.limit = (result && result.limit) ? result.limit : this.options.limit;
                     
                     //Execute new search
                     var lower = parseInt(this.options.julianToday)-parseInt(this.options.limit);
                     var search = "daterange:"+lower.toString()+"-"+this.options.julianToday+" "+this.options.searchTerm;
                     this._doSearch(search);
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function GoogleSiteNews_doSetupForm_callback(form)
                  {
                     form.addValidation(this.configDialog.id + "-searchterm", Alfresco.forms.validation.mandatory, null, "keyup");
                     form.setShowSubmitStateDynamically(true, false);
                     
                     Dom.get(this.configDialog.id + "-searchterm").value = this.options.searchTerm;
                     
                     var select = Dom.get(this.configDialog.id + "-limit"), options = select.options, option, i, j;
                     for (i = 0, j = options.length; i < j; i++)
                     {
                        option = options[i];
                        if (option.value === this.options.limit)
                        {
                           option.selected = true;
                           break;
                        }
                     }
                  },
                  scope: this
               }
            });
         }
         this.configDialog.setOptions(
         {
            actionUrl: actionUrl
         }).show();
      },
      /**
       * Update search
       */
      _doSearch: function GoogleSiteNews_doSearch(search)
      {
  		// Create a search control
  		var searchControl = new google.search.SearchControl();

  		// Add in a full set of searchers
  		
  		var options = new google.search.SearcherOptions();
  		options.setExpandMode(google.search.SearchControl.EXPAND_MODE_OPEN);
  		
  		//var localSearch = new google.search.LocalSearch();
  		// Set the Local Search center point
  		//localSearch.setCenterPoint("New York, NY");
  		//searchControl.addSearcher(localSearch);

  		searchControl.addSearcher(new google.search.WebSearch());
  		
  		var newsSearch = new google.search.NewsSearch();
  		newsSearch.setResultOrder(google.search.Search.ORDER_BY_DATE);
  		searchControl.addSearcher(newsSearch);
  		
  		//searchControl.addSearcher(new google.search.VideoSearch());
  		var blogSearch = new google.search.BlogSearch();
  		blogSearch.setResultOrder(google.search.Search.ORDER_BY_DATE);
  		searchControl.addSearcher(blogSearch);

  		searchControl.addSearcher(new google.search.ImageSearch());
  		
  		//searchControl.addSearcher(new google.search.BookSearch());
  		
  		searchControl.addSearcher(new google.search.PatentSearch());



  		// draw in tabbed layout mode
  		var drawOptions = new google.search.DrawOptions();
  		drawOptions.setSearchFormRoot(document.getElementById(this.id + "-searchform"));
  		drawOptions.setDrawMode(google.search.SearchControl.DRAW_MODE_TABBED);
  		searchControl.draw(document.getElementById(this.id + "-searchcontrol"), drawOptions);

  		// execute an inital search
  		searchControl.execute(search);
  		//Instead of redefining the google style sheet, change the div from fixed width to relative
  		document.getElementById(this.id + "-searchcontrol").childNodes[0].style.width="93%";
      }
   });
})();