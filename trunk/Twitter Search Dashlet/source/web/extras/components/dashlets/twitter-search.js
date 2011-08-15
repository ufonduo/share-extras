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
          * Number of Tweets to load per batch
          * 
          * @property pageSize
          * @type int
          * @default 20
          */
         pageSize: 20,

         /**
          * How often the dashlet should poll for new Tweets, in seconds. Setting to zero disabled checking.
          * 
          * @property checkInterval
          * @type int
          * @default 300
          */
         checkInterval: 300
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
       * Notifications DOM container.
       * 
       * @property notifications
       * @type object
       * @default null
       */
      notifications: null,

      /**
       * Load More button
       * 
       * @property moreButton
       * @type object
       * @default null
       */
      moreButton: null,

      /**
       * New Tweets cache. Populated by polling function, but cached so that the user
       * can then choose to display the tweets by clicking a link.
       * 
       * @property newTweets
       * @type object
       * @default null
       */
      newTweets: null,

      /**
       * Timer for new tweets poll function
       * 
       * @property pollTimer
       * @type object
       * @default null
       */
      pollTimer: null,

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
         
         // The new tweets notification container
         this.notifications = Dom.get(this.id + "-notifications");
         Event.addListener(this.notifications, "click", this.onShowNewClick, null, this);
         
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
         
         // Load the results
         this.load();
      },

      /**
       * Reload the search results
       * @method load
       */
      load: function TwitterSearch_load()
      {
         // Load the search results
         this._request(
         {
            dataObj:
            {
            },
            successCallback:
            {
               fn: this.onLoadSuccess,
               scope: this
            },
            failureCallback:
            {
               fn: this.onLoadFailure,
               scope: this
            }
         });
      },
      
      /**
       * Search results loaded successfully
       * 
       * @method onLoadSuccess
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onLoadSuccess: function TwitterSearch_onLoadSuccess(p_response, p_obj)
      {
         // Update the dashlet title
         this.title.innerHTML = this.msg("header.search", encodeURIComponent(this._getSearchTerm()), this._getSearchTerm());
         
         var html = "", tweets, t,userLink, postedLink;
         
         if (p_response.json)
         {
            tweets = p_response.json.results;
            
            if (tweets.length > 0)
            {
               html += this._generateTweetsHTML(tweets);
            }
            else
            {
               html += "<div class=\"msg\">\n";
               html += "<span>\n";
               html += this.msg("label.noTweets");
               html += "</span>\n";
               html += "</div>\n";
            }
         }
         
         this.searchResults.innerHTML = html;
         
         // Empty the new tweets cache and remove any notification
         this.newTweets = [];
         this._refreshNotification();
         
         // Enable the Load More button
         this.moreButton.set("disabled", false);
         Dom.setStyle(this.id + "-buttons", "display", "block");
         
         // Start the timer to poll for new tweets, if enabled
         this._resetTimer();
      },

      /**
       * Search results load failed
       * 
       * @method onLoadFailure
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onLoadFailure: function TwitterSearch_onLoadFailure(p_response, p_obj)
      {
         // Update the dashlet title
         this.title.innerHTML = this.msg("header.search", encodeURIComponent(this._getSearchTerm()), this._getSearchTerm());
         
         // Update the content
         this.searchResults.innerHTML = "<div class=\"msg\">" + this.msg("label.error") + "</div>";
         
         // Disable the Load More button
         this.moreButton.set("disabled", true);
         Dom.setStyle(this.id + "-buttons", "display", "none");
      },
      
      /**
       * Check for new Tweets since the last Tweet shown. Display a notice to the user
       * indicating that new Tweets are available, if shown.
       * 
       * @method pollNew
       */
      pollNew: function TwitterSearch_pollNew()
      {
         // Refresh existing dates
         this._refreshDates();
          
         // Load the user timeline
         this._request(
         {
            dataObj:
            {
               minId: this._getLatestTweetId()
            },
            successCallback:
            {
               fn: this.onNewTweetsLoaded,
               scope: this
            },
            failureCallback:
            {
               fn: this.onNewTweetsLoadFailure,
               scope: this
            }
         });
      },
      
      /**
       * New tweets loaded successfully
       * 
       * @method onNewTweetsLoaded
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onNewTweetsLoaded: function TwitterSearch_onNewTweetsLoaded(p_response, p_obj)
      {
         this.newTweets = p_response.json.results;
         this._refreshNotification();
         
         // Schedule a new poll
         this._resetTimer();
      },
      
      /**
       * New tweets load failed
       * 
       * @method onNewTweetsLoadFailure
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onNewTweetsLoadFailure: function TwitterSearch_onNewTweetsLoadFailure(p_response, p_obj)
      {
         // Schedule a new poll
         this._resetTimer();
      },

      /**
       * Load Tweets further back in time from the Twitter API and add to the dashlet contents
       * 
       * @method extend
       */
      extend: function TwitterSearch_extend()
      {
         // Load the user timeline
         this._request(
         {
            dataObj:
            {
               maxId: this._getEarliestTweetId(),
               pageSize: this.options.pageSize + 1
            },
            successCallback:
            {
               fn: this.onExtensionLoaded,
               scope: this
            },
            failureCallback:
            {
               fn: this.onExtensionLoadFailure,
               scope: this
            }
         });
      },
      
      /**
       * Extended timeline loaded successfully
       * 
       * @method onExtensionLoaded
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onExtensionLoaded: function TwitterSearch_onExtensionLoaded(p_response, p_obj)
      {
         this._refreshDates(); // Refresh existing dates
         this.searchResults.innerHTML += this._generateTweetsHTML(p_response.json.results.slice(1)); // Do not include duplicate tweet
         this.moreButton.set("disabled", false);
      },
      
      /**
       * Extended timeline load failed
       * 
       * @method onExtensionLoadFailure
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onExtensionLoadFailure: function TwitterSearch_onExtensionLoadFailure(p_response, p_obj)
      {
         Alfresco.util.PopupManager.displayMessage(
         {
            text: this.msg("message.extendFailed")
         });
         
         // Re-enable the button
         this.moreButton.set("disabled", false);
      },
      
      /**
       * PRIVATE FUNCTIONS
       */
      
      /**
       * Generate HTML markup for a collection of Tweets
       * 
       * @method _generateTweetsHTML
       * @private
       * @param tweets {array} Tweet objects to render into HTML
       * @return {string} HTML markup
       */
      _generateTweetsHTML: function TwitterSearch__generateTweetsHTML(tweets)
      {
         var html = "", t;
         for (var i = 0; i < tweets.length; i++)
         {
            t = tweets[i];
            html += this._generateTweetHTML(t);
         }
         return html;
      },
      
      /**
       * Generate HTML markup for a single Tweet
       * 
       * @method _generateTweetHTML
       * @private
       * @param t {object} Tweet object to render into HTML
       * @param rt {object} Retweet object, if the Tweet has been RT'ed
       * @return {string} HTML markup
       */
      _generateTweetHTML: function TwitterSearch__generateTweetHTML(t, rt)
      {
         var html = "", 
            profileUri = "http://twitter.com/" + encodeURIComponent(t.from_user),
            userLink = "<a href=\"" + profileUri + "\" title=\"" + $html(t.from_user) + "\" class=\"theme-color-1\">" + $html(t.from_user) + "</a>",
            postedRe = /([A-Za-z]{3}) ([A-Za-z]{3}) ([0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}) (\+[0-9]{4}) ([0-9]{4})/,
            postedMatch = postedRe.exec(t.created_at),
            postedOn = postedMatch != null ? (postedMatch[1] + ", " + postedMatch[3] + " " + postedMatch[2] + " " + postedMatch[6] + " " + postedMatch[4] + " GMT" + postedMatch[5]) : (t.created_at),
            postedLink = "<a href=\"" + profileUri + "\/status\/" + encodeURIComponent(t.id_str) + "\"><span class=\"tweet-date\" title=\"" + postedOn + "\">" + this._relativeTime(new Date(postedOn)) + "</span><\/a>";

         html += "<div class=\"user-tweet detail-list-item\" id=\"" + $html(this.id) + "-tweet-" + $html(t.id_str) + "\">\n";
         html += "<div class=\"user-icon\"><a href=\"" + profileUri + "\" title=\"" + $html(t.from_user) + "\"><img src=\"" + $html(t.profile_image_url) + "\" alt=\"" + $html(t.from_user) + "\" width=\"48\" height=\"48\" /></a></div>\n";
         html += "<div class=\"tweet\">\n";
         html += "<div class=\"tweet-hd\">\n";
         html += "<span class=\"screen-name\">" + userLink + "</span>\n";
         html += "</div>\n";
         html += "<div class=\"tweet-bd\">" + this._formatTweet(t.text) + "</div>\n";
         html += "<div class=\"tweet-details\">" + this.msg("text.tweetDetails", postedLink, Alfresco.util.decodeHTML(t.source)) + "</div>\n";
         html += "</div>\n"; // end tweet
         html += "</div>\n"; // end list-tweet
         return html;
      },

      /**
       * Insert links into Tweet text to highlight users, hashtags and links
       * 
       * @method _formatTweet
       * @private
       * @param {string} text The plain tweet text
       * @return {string} The tweet text, with hyperlinks added
       */
      _formatTweet: function TwitterSearch__formatTweet(text)
      {
         return text.replace(
               /https?:\/\/\S+[^\s.]/gm, "<a href=\"$&\">$&</a>").replace(
               /@(\w+)/gm, "<a href=\"http://twitter.com/$1\">$&</a>").replace(
               /#(\w+)/gm, "<a href=\"http://twitter.com/search?q=%23$1\">$&</a>");
      },
      
      /**
       * Get the current search term
       * 
       * @method getSearchTerm
       * @private
       * @return {string} The currently-configured search term, or the default if no value is configured
       */
      _getSearchTerm: function TwitterSearch__getSearchTerm()
      {
         return (this.options.searchTerm != "") ?
                 this.options.searchTerm : this.options.defaultSearchTerm;
      },
      
      /**
       * Get the ID of the earliest Tweet in the timeline
       * 
       * @method _getEarliestTweetId
       * @private
       * @return {string} The ID of the earliest Tweet shown in the timeline, or null if
       * no Tweets are available or the last Tweet has no compatible ID on its element
       */
      _getEarliestTweetId: function TwitterSearch__getEarliestTweetId()
      {
         var div = Dom.getLastChild(this.searchResults);
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
       * @method _getLatestTweetId
       * @private
       * @return {string} The ID of the latest Tweet shown in the timeline, or null if
       * no Tweets are available or the last Tweet has no compatible ID on its element
       */
      _getLatestTweetId: function TwitterSearch__getLatestTweetId()
      {
         var div = Dom.getFirstChild(this.searchResults);
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
       * Reset the poll timer
       * 
       * @method resetCounter
       * @private
       */
      _resetTimer: function TwitterSearch__resetTimer()
      {
         this._stopTimer();
         // Schedule next transition
         if (this.options.checkInterval > 0)
         {
            // Schedule next transition
            this.pollTimer = YAHOO.lang.later(this.options.checkInterval * 1000, this, this.pollNew);
         }
      },

      /**
       * Stop the poll timer
       * 
       * @method _stopTimer
       * @private
       */
      _stopTimer: function TwitterSearch__stopTimer()
      {
         if (this.pollTimer != null)
         {
            this.pollTimer.cancel();
         }
      },
      
      /**
       * Set up or refresh new tweets notification area
       * 
       * @method _refreshNotification
       * @private
       */
      _refreshNotification: function TwitterSearch__refreshNotification()
      {
          if (this.newTweets != null && this.newTweets.length > 0)
          {
             // Create notification
             if (this.newTweets.length == 1)
             {
                this.notifications.innerHTML = this.msg("message.newTweet");
             }
             else
             {
                this.notifications.innerHTML = this.msg("message.newTweets", this.newTweets.length);
             }
             Dom.setStyle(this.notifications, "display", "block");
          }
          else
          {
             // Remove notification
             Dom.setStyle(this.notifications, "display", "none");
          }
      },
      
      /**
       * Get relative time where possible, otherwise just return a simple string representation of the suppplied date
       * 
       * @method _relativeTime
       * @private
       * @param d {date} Date object
       */
      _relativeTime: function TwitterUserTimeline__getRelativeTime(d)
      {
          return typeof(Alfresco.util.relativeTime) === "function" ? Alfresco.util.relativeTime(d) : Alfresco.util.formatDate(d)
      },

      /**
       * Re-render relative post times in the tweet stream
       * 
       * @method _refreshDates
       * @private
       */
      _refreshDates: function TwitterUserTimeline__refreshDates()
      {
         var els = Dom.getElementsByClassName("tweet-date", "span", this.searchResults), dEl;
         for (var i = 0; i < els.length; i++)
         {
            dEl = els[i];
            dEl.innerHTML = this._relativeTime(new Date(Dom.getAttribute(dEl, "title")));
         }
      },

      /**
       * Request data from the web service
       * 
       * @method _request
       */
      _request: function TwitterUserTimeline__request(p_obj)
      {
         var url = Alfresco.constants.PROXY_URI.replace("/alfresco/", "/twitter-search/") + "search.json";
         var params = {
                q: this._getSearchTerm(),
                result_type: "recent",
                rpp: p_obj.dataObj.pageSize || this.options.pageSize
         };

         if (p_obj.dataObj.maxId != null)
         {
             params.max_id = p_obj.dataObj.maxId;
         }
         if (p_obj.dataObj.minId != null)
         {
             params.since_id = p_obj.dataObj.minId;
         }
         
         // Load the timeline
         Alfresco.util.Ajax.request(
         {
            url: url,
            dataObj: params,
            successCallback: p_obj.successCallback,
            failureCallback: p_obj.failureCallback,
            scope: this,
            noReloadOnAuthFailure: true
         });
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
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "extras/modules/dashlets/twitter-search/config", actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function VideoWidget_onConfigFeed_callback(response)
                  {
                     // Refresh the feed
                     var u = YAHOO.lang.trim(Dom.get(this.configDialog.id + "-searchTerm").value),
                         newSearchTerm = (u != "") ? u : this.options.defaultSearchTerm;
                     
                     if (newSearchTerm != this.options.searchTerm)
                     {
                        this.options.searchTerm = newSearchTerm;
                        this.load();
                     }
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function VideoWidget_doSetupForm_callback(form)
                  {
                     Dom.get(this.configDialog.id + "-searchTerm").value = this._getSearchTerm();
                     
                     // Search term is mandatory
                     this.configDialog.form.addValidation(this.configDialog.id + "-searchTerm", Alfresco.forms.validation.mandatory, null, "keyup");
                     this.configDialog.form.addValidation(this.configDialog.id + "-searchTerm", Alfresco.forms.validation.mandatory, null, "blur");
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
      },

      /**
       * Click handler for Show More button
       *
       * @method onMoreButtonClick
       * @param e {object} HTML event
       */
      onMoreButtonClick: function TwitterSearch_onMoreButtonClick(e, obj)
      {
         // Disable the button while we make the request
         this.moreButton.set("disabled", true);
         this.extend();
      },

      /**
       * Click handler for show new tweets link
       *
       * @method onShowNewClick
       * @param e {object} HTML event
       */
      onShowNewClick: function TwitterSearch_onShowNewClick(e, obj)
      {
         Event.stopEvent(e);
         if (this.newTweets !== null && this.newTweets.length > 0)
         {
            var thtml = this._generateTweetsHTML(this.newTweets);
            this._refreshDates(); // Refresh existing dates
            this.searchResults.innerHTML = thtml + this.searchResults.innerHTML;
            this.newTweets = null;
         }
         
         // Fade out the notification
         this._refreshNotification();
      }
      
   });
})();
