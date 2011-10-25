/**
 * Copyright (C) 20010-2011 Alfresco Share Extras project
 *
 * This file is part of the Alfresco Share Extras project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
         julianToday: "0",
         
         /**
          * The enabled searhcers
          *
          * @property enabledSearchers
          * @type array
          * @default -
          */
         enabledSearchers: ["web","news","image"]
      },  
      
      /**
       * Fired by YUI when parent element is available for scripting.
       * Component initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function RF_onReady()
      {
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
               width: "35em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/googlesitenews/config?componentId=" + encodeURIComponent(this.options.componentId),
               onSuccess:
               {
                  fn: function GoogleSiteNews_onConfigGoogleSiteNews_callback(response)
                  {
                     var result = response.json;

                     // Save search terms for new config dialog openings
                     this.options.searchTerm = (result && result.searchterm) ? result.searchterm : this.options.searchTerm;
                     this.options.limit = (result && result.limit) ? result.limit : this.options.limit;
                     this.options.enabledSearchers = (result && result.enabledsearchers) ? result.enabledsearchers.split(",") : this.options.enabledSearchers;
                     
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
                     
                     //Set up DnD
                     //this.widgets.shadowEl = Dom.get(this.configDialog.id + "-dashlet-li-shadow");
                     this.widgets.enabledSearchers = Dom.get(this.configDialog.id+"-enabled-searcher-ul");
                     this.widgets.disabledSearchers = Dom.get(this.configDialog.id+"-disabled-searcher-ul");
                     var dndConfig =
                     {
                        draggables: [
                           {
                              container: this.widgets.enabledSearchers,
                              groups: [Alfresco.util.DragAndDrop.GROUP_MOVE],
                              cssClass: "enabledSearchers"
                           },
                           {
                               container: this.widgets.disabledSearchers,
                               groups: [Alfresco.util.DragAndDrop.GROUP_MOVE],
                               cssClass: "disabledSearchers"
                            }
                        ],
                        targets: [
                           {
                              container: this.widgets.enabledSearchers,
                              group: Alfresco.util.DragAndDrop.GROUP_MOVE,
                              maximum: 10
                              //You need to set a maximum, else it will not be accepted as target
                           },
                           {
                              container: this.widgets.disabledSearchers,
                              group: Alfresco.util.DragAndDrop.GROUP_MOVE,
                              maximum: 10
                           }
                        ]
                     };
                     var dnd = new Alfresco.util.DragAndDrop(dndConfig);
                  },

                  scope: this
               },
               doBeforeFormSubmit:
	         	  {
	         	  	fn: function GoogleSiteNews_doBeforeFormsSubmit(form)
	           			{
	         	  			//Before submit, iterate selected enabled items, and store in hidden input
	         	  			var inputsearchers = Dom.get(this.configDialog.id + "-enabledsearchers");
	         	  			var ul = Dom.get(this.configDialog.id + "-enabled-searcher-ul");
	         	  			var lis = Dom.getElementsByClassName("searcheritem", "li", ul);
	         	  			var enableditems=[];
	         	            for (var j = 0; j < lis.length; j++)
	         	            {
	         	            	var li = lis[j];
	         	            	enableditems.push(YAHOO.util.Selector.query("input[type=hidden][name=searcheritem]", li, true).value);
	         	            }
	         	  			Alfresco.logger.debug("Submit ", form);
	         	  			inputsearchers.value=enableditems;
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
  		var searchControl = new google.search.SearchControl(), 		
  			options = new google.search.SearcherOptions(),
  			searchers = this.options.enabledSearchers,
  			drawOptions = new google.search.DrawOptions();
  		
  		options.setExpandMode(google.search.SearchControl.EXPAND_MODE_OPEN);
  		
  		for (i=0;i<searchers.length;i++)
  		{
  			switch (searchers[i])
  			{
	  			case "web":
	  				searchControl.addSearcher(new google.search.WebSearch());
	  				break;
	  			case "news":
	  				var newsSearch = new google.search.NewsSearch();
	  				newsSearch.setResultOrder(google.search.Search.ORDER_BY_DATE);
	  				searchControl.addSearcher(newsSearch);
	  				break;
	  			case "blog":
	  		  		var blogSearch = new google.search.BlogSearch();
	  		  		blogSearch.setResultOrder(google.search.Search.ORDER_BY_DATE);
	  		  		searchControl.addSearcher(blogSearch);
	  		  		break;
	  			case "video":
	  				searchControl.addSearcher(new google.search.VideoSearch());
	  				break;
	  			case "image":
	  				searchControl.addSearcher(new google.search.ImageSearch());
	  				break;
	  			case "books":
	  				searchControl.addSearcher(new google.search.BookSearch());
	  				break;
	  			case "patent":
	  				searchControl.addSearcher(new google.search.PatentSearch());
	  				break;
  			}
  		}
 
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