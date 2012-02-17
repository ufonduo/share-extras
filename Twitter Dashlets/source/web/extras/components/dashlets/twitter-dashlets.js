/**
 * Copyright (C) 2010-2011 Share Extras contributors.
 */

/**
* Extras root namespace.
* 
* @namespace Extras
*/
if (typeof Extras == "undefined" || !Extras)
{
   var Extras = {};
}

/**
* Extras dashlet namespace.
* 
* @namespace Extras.dashlet
*/
if (typeof Extras.dashlet == "undefined" || !Extras.dashlet)
{
   Extras.dashlet = {};
}

/**
* Base Twitter dashlet
 * 
 * @namespace Alfresco
 * @class Extras.dashlet.TwitterBase
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
    * Dashboard TwitterBase constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Extras.dashlet.TwitterBase} The new component instance
    * @constructor
    */
   Extras.dashlet.TwitterBase = function TwitterBase_constructor(name, id, components)
   {
      return Extras.dashlet.TwitterBase.superclass.constructor.call(this, name, id, components);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Extras.dashlet.TwitterBase, Alfresco.component.Base,
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
           * Number of Tweets to load per batch
           * 
           * @property pageSize
           * @type int
           * @default 50
           */
          pageSize: 50,

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
        * ID of the earlist known Tweet, not including newly-posted tweets from the current user
        * 
        * @property earliestTweetId
        * @type string
        * @default null
        */
       earliestTweetId: null,

       /**
        * ID of the latest known Tweet, not including newly-posted tweets from the current user
        * 
        * @property latestTweetId
        * @type string
        * @default null
        */
       latestTweetId: null,

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
        * OAuth helper for connecting to the Twitter service
        * 
        * @property oAuth
        * @type Extras.OAuthHelper
        * @default null
        */
       oAuth: null,

       /**
        * Fired by YUI when parent element is available for scripting
        * 
        * @method onReady
        */
       onReady: function TwitterBase_onReady()
       {
          Event.addListener(this.id + "-configure-link", "click", this.onConfigClick, this, true);
          
          // The user timeline container
          this.widgets.timeline = Dom.get(this.id + "-timeline");
          
          // The dashlet title container
          this.widgets.title = Dom.get(this.id + "-title");

          // Loading icon div
          this.widgets.loading = Dom.get(this.id + "-loading");
          
          // The dashlet body container
          this.widgets.body = Dom.get(this.id + "-body");
          
          // The new tweets notification container
          this.widgets.notifications = Dom.get(this.id + "-notifications");
          Event.addListener(this.widgets.notifications, "click", this.onShowNewClick, null, this);
          
          // Set up the buttons container and the More Tweets button
          this.widgets.buttons = Dom.get(this.id + "-buttons");
          this.widgets.moreButton = new YAHOO.widget.Button(
             this.id + "-btn-more",
             {
                disabled: true,
                onclick: {
                   fn: this.onMoreButtonClick,
                   obj: this.widgets.moreButton,
                   scope: this
                }
             }
          );
       },

       /**
        * Reload the timeline from the Twitter API and refresh the contents of the dashlet
        * 
        * @method load
        */
       load: function TwitterBase_load()
       {
          // Reset earliest and latest tweet IDs
          this.earliestTweetId = null;
          this.latestTweetId = null;
          
          // Show the loading spinner
          this._showLoading();
          
          // Load the timeline
          this._request(
          {
             dataObj:
             {
                pageSize: this.options.pageSize
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
        * Timeline loaded successfully
        * 
        * @method onLoadSuccess
        * @param p_response {object} Response object from request
        * @param p_obj {object} Custom object passed to function
        */
       onLoadSuccess: function TwitterBase_onLoadSuccess(p_response, p_obj)
       {
          this._hideLoading();
       },

       /**
        * Timeline load failed
        * 
        * @method onLoadFailure
        * @param p_response {object} Response object from request
        * @param p_obj {object} Custom object passed to function
        */
       onLoadFailure: function TwitterBase_onLoadFailure(p_response, p_obj)
       {
          this._hideLoading();
       },

       /**
        * Load Tweets further back in time from the Twitter API and add to the dashlet contents
        * 
        * @method extend
        */
       extend: function TwitterBase_extend()
       {
          this._showLoading();
          // Load the user timeline
          this._request(
          {
             dataObj:
             {
                maxId: this.earliestTweetId,
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
       onExtensionLoaded: function TwitterBase_onExtensionLoaded(p_response, p_obj)
       {
          this._hideLoading();
          var tweets = p_response.json.slice(1);
          this._refreshDates(); // Refresh existing dates
          if (tweets.length > 0)
          {
             this.widgets.timeline.innerHTML += this._generateTweetsHTML(tweets); // Do not include duplicate tweet
             this.earliestTweetId = this._getEarliestTweetId(tweets);
          }
          this.widgets.moreButton.set("disabled", false);
       },
       
       /**
        * Extended timeline load failed
        * 
        * @method onExtensionLoadFailure
        * @param p_response {object} Response object from request
        * @param p_obj {object} Custom object passed to function
        */
       onExtensionLoadFailure: function TwitterBase_onExtensionLoadFailure(p_response, p_obj)
       {
          this._hideLoading();
          Alfresco.util.PopupManager.displayMessage(
          {
             text: this.msg("message.extendFailed")
          });
          
          // Re-enable the button
          this.widgets.moreButton.set("disabled", false);
       },
       
       /**
        * Check for new Tweets since the last Tweet shown. Display a notice to the user
        * indicating that new Tweets are available, if shown.
        * 
        * @method pollNew
        */
       pollNew: function TwitterBase_pollNew()
       {
          // Refresh existing dates
          this._refreshDates();
          
          // Show loading icon
          this._showLoading();
           
          // Load the user timeline
          this._request(
          {
             dataObj:
             {
                minId: this.latestTweetId
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
       onNewTweetsLoaded: function TwitterBase_onNewTweetsLoaded(p_response, p_obj)
       {
          this._hideLoading();
          this.newTweets = p_response.json;
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
       onNewTweetsLoadFailure: function TwitterBase_onNewTweetsLoadFailure(p_response, p_obj)
       {
          this._hideLoading();
          // Schedule a new poll
          this._resetTimer();
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
       _generateTweetsHTML: function TwitterBase__generateTweetsHTML(tweets)
       {
          var html = "", t;
          for (var i = 0; i < tweets.length; i++)
          {
             t = tweets[i];
             if (t.retweeted_status)
             {
                html += this._generateTweetHTML(t.retweeted_status, t);
             }
             else
             {
                if (this.options.activeFilter == "direct")
                {
                   html += this._generateDirectMessageHTML(t);
                }
                else
                {
                   html += this._generateTweetHTML(t);
                }
             }
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
       _generateTweetHTML: function TwitterBase__generateTweetHTML(t, rt)
       {
          var html = "", 
             profileUri = "http://twitter.com/" + encodeURIComponent(t.user.screen_name),
             userLink = "<a href=\"" + profileUri + "\" title=\"" + $html(t.user.name) + "\" class=\"theme-color-1\">" + $html(t.user.screen_name) + "</a>",
             postedRe = /([A-Za-z]{3}) ([A-Za-z]{3}) ([0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}) (\+[0-9]{4}) ([0-9]{4})/,
             postedMatch = postedRe.exec(t.created_at),
             postedOn = postedMatch != null ? (postedMatch[1] + ", " + postedMatch[3] + " " + postedMatch[2] + " " + postedMatch[6] + " " + postedMatch[4] + " GMT" + postedMatch[5]) : (t.created_at),
             postedLink = "<a href=\"" + profileUri + "\/status\/" + encodeURIComponent(t.id_str) + "\"><span class=\"tweet-date\" title=\"" + postedOn + "\">" + this._relativeTime(new Date(postedOn)) + "</span><\/a>";

          html += "<div class=\"user-tweet" + " detail-list-item\" id=\"" + $html(this.id) + "-tweet-" + $html(t.id_str) + "\">\n";
          html += "<div class=\"user-icon\"><a href=\"" + profileUri + "\" title=\"" + $html(t.user.name) + "\"><img src=\"" + $html(t.user.profile_image_url) + "\" alt=\"" + $html(t.user.screen_name) + "\" width=\"48\" height=\"48\" /></a></div>\n";
          html += "<div class=\"tweet\">\n";
          html += "<div class=\"tweet-hd\">\n";
          html += "<span class=\"screen-name\">" + userLink + "</span> <span class=\"user-name\">" + $html(t.user.name) + "</span>\n";
          html += !YAHOO.lang.isUndefined(rt) ? " <span class=\"retweeted\">" + this.msg("label.retweetedBy", rt.user.screen_name) + "</span>\n" : "";
          html += "</div>\n";
          html += "<div class=\"tweet-bd\">" + this._formatTweet(t.text) + "</div>\n";
          html += "<div class=\"tweet-details\">\n";
          html += "<span>" + this.msg("text.tweetDetails", postedLink, t.source) + "</span>";
          if (this.oAuth != null)
          {
              html += "<span class=\"twitter-actions\">\n";
              html += "<a href=\"\" class=\"twitter-favorite-link" + (t.favorited ? "-on" : "") + "\"><span>" + this.msg("link.favorite") + "</span></a>\n";
              html += "<a href=\"\" class=\"twitter-retweet-link\"><span>" + this.msg("link.retweet") + "</span></a>\n";
              html += "<a href=\"\" class=\"twitter-reply-link\"><span>" + this.msg("link.reply") + "</span></a>\n";
              html += "</span>\n";
          }
          html += "</div>\n";
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
       _formatTweet: function TwitterBase__formatTweet(text)
       {
          return text.replace(
                /https?:\/\/\S+[^\s.]/gm, "<a href=\"$&\" target=\"_blank\">$&</a>").replace(
                /@(\w+)/gm, "<a href=\"http://twitter.com/$1\" target=\"_blank\">$&</a>").replace(
                /#(\w+)/gm, "<a href=\"http://twitter.com/search?q=%23$1\" target=\"_blank\">$&</a>");
       },
       
       /**
        * Get the ID of the earliest tweet a set of tweets, if later than the current known latest ID.
        * 
        * @method _getEarliestTweetId
        * @private
        * @param {array} tweets Array of tweet objects
        * @return {string} The ID of the earliest tweet, or null if no tweets are available
        */
       _getEarliestTweetId: function TwitterBase__getEarliestTweetId(tweets)
       {
           var earliestId = this.earliestTweetId, tid;
           for (var i = 0; i < tweets.length; i++)
           {
              tid = tweets[i].id_str;
              if (earliestId == null || tid.length < earliestId.length || tid < earliestId)
              {
                  earliestId = tid;
              }
           }
           return earliestId;
       },
       
       /**
        * Get the ID of the latest tweet a set of tweets, if earlier than the current known latest ID.
        * 
        * @method _getLatestTweetId
        * @private
        * @param {array} tweets Array of tweet objects
        * @return {string} The ID of the latest tweet, or null if no tweets are available
        */
       _getLatestTweetId: function TwitterBase__getLatestTweetId(tweets)
       {
          var latestId = this.latestTweetId, tid;
          for (var i = 0; i < tweets.length; i++)
          {
             tid = tweets[i].id_str;
             if (latestId == null || tid.length > latestId.length || tid > latestId)
             {
                 latestId = tid;
             }
          }
          return latestId;
       },

       /**
        * Reset the poll timer
        * 
        * @method _resetCounter
        * @private
        */
       _resetTimer: function TwitterBase__resetTimer()
       {
          this._stopTimer();
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
       _stopTimer: function TwitterBase__stopTimer()
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
       _refreshNotification: function TwitterBase__refreshNotification()
       {
           if (this.newTweets != null && this.newTweets.length > 0)
           {
              // Create notification
              if (this.newTweets.length == 1)
              {
                 this.widgets.notifications.innerHTML = this.msg("message.newTweet");
              }
              else
              {
                 this.widgets.notifications.innerHTML = this.msg("message.newTweets", this.newTweets.length);
              }
              Dom.setStyle(this.widgets.notifications, "display", "block");
           }
           else
           {
              // Remove notification
              Dom.setStyle(this.widgets.notifications, "display", "none");
           }
       },
       
       /**
        * Get relative time where possible, otherwise just return a simple string representation of the suppplied date
        * 
        * @method _relativeTime
        * @private
        * @param d {date} Date object
        */
       _relativeTime: function TwitterBase__getRelativeTime(d)
       {
           return typeof(Alfresco.util.relativeTime) === "function" ? Alfresco.util.relativeTime(d) : Alfresco.util.formatDate(d)
       },

       /**
        * Re-render relative post times in the tweet stream
        * 
        * @method _refreshDates
        * @private
        */
       _refreshDates: function TwitterBase__refreshDates()
       {
          var els = Dom.getElementsByClassName("tweet-date", "span", this.widgets.timeline), dEl;
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
       _request: function TwitterBase__request(p_obj)
       {
       },

       /**
        * Hide the loading icon
        *
        * @method _hideLoading
        */
       _hideLoading: function TwitterTimeline__hideLoading()
       {
           if (this.widgets.loading != null)
           {
               Dom.setStyle(this.widgets.loading, "display", "none");
           }
       },

       /**
        * Show the loading icon
        *
        * @method _showLoading
        */
       _showLoading: function TwitterTimeline__showLoading()
       {
           if (this.widgets.loading != null)
           {
               Dom.setStyle(this.widgets.loading, "display", "inline");
           }
       },

       /**
        * YUI WIDGET EVENT HANDLERS
        * Handlers for standard events fired from YUI widgets, e.g. "click"
        */

       /**
        * Click handler for Show More button
        *
        * @method onMoreButtonClick
        * @param e {object} HTML event
        */
       onMoreButtonClick: function TwitterBase_onMoreButtonClick(e, obj)
       {
          // Disable the button while we make the request
          this.widgets.moreButton.set("disabled", true);
          this.extend();
       },

       /**
        * Click handler for show new tweets link
        *
        * @method onShowNewClick
        * @param e {object} HTML event
        */
       onShowNewClick: function TwitterBase_onShowNewClick(e, obj)
       {
          Event.stopEvent(e);
          if (this.newTweets !== null && this.newTweets.length > 0)
          {
             var thtml = this._generateTweetsHTML(this.newTweets), tEl;
             // Remove existing tweets with the same ID
             for (var i = 0; i < this.newTweets.length; i++)
             {
                tEl = document.getElementById(this.id + "-tweet-" + this.newTweets[i].id_str);
                if (tEl != null)
                {
                   this.widgets.timeline.removeChild(tEl);
                }
             }
             this._refreshDates(); // Refresh existing dates
             this.widgets.timeline.innerHTML = thtml + this.widgets.timeline.innerHTML;
             this.latestTweetId = this._getLatestTweetId(this.newTweets);
             this.newTweets = null;
          }
          
          // Fade out the notification
          this._refreshNotification();
       }
   });
   
})();

/**
 * Twitter timeline dashlet.
 * 
 * @namespace Alfresco
 * @class Extras.dashlet.TwitterTimeline
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
    * Dashboard TwitterTimeline constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Extras.dashlet.TwitterTimeline} The new component instance
    * @constructor
    */
   Extras.dashlet.TwitterTimeline = function TwitterTimeline_constructor(htmlId)
   {
      return Extras.dashlet.TwitterTimeline.superclass.constructor.call(this, "Extras.dashlet.TwitterTimeline", htmlId, ["selector", "event-delegate"]);
   };

   /**
    * Extend from Extras.dashlet.TwitterBase and add class implementation
    */
   YAHOO.extend(Extras.dashlet.TwitterTimeline, Extras.dashlet.TwitterBase,
   {
       /**
        * Object container for initialization options
        *
        * @property options
        * @type object
        */
       options: YAHOO.lang.merge(Extras.dashlet.TwitterBase.prototype.options,
       {
          /**
           * Active filter value
           * 
           * @property activeFilter
           * @type string
           * @default "home"
           */
           activeFilter: "home"
       }),
       
       /**
        * Array of two-valued arrays, storing the shortned links used by the 'new tweet' dialogue
        * 
        * @property shortenedLinks
        * @type array
        * @default []
        */
       shortenedLinks : [],

      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
      onReady: function TwitterTimeline_onReady()
      {
          Extras.dashlet.TwitterTimeline.superclass.onReady.call(this);
          var me = this;
          
          // Connect button
          this.widgets.connect = Dom.get(this.id + "-connect");

          // Toolbar div
          this.widgets.toolbar = Dom.get(this.id + "-toolbar");
          
          // Set up the Connect button
          this.widgets.connectButton = new YAHOO.widget.Button(
             this.id + "-btn-connect",
             {
                disabled: true,
                onclick: {
                   fn: this.onConnectButtonClick,
                   obj: this.widgets.connectButton,
                   scope: this
                }
             }
          );
          
          // titleBarActions
          Dom.getElementsByClassName ("titleBarActions", "div", this.id, function(el) {
              this.widgets.titleBarActions = el;
          }, this, true);
          
          // Utility links
          this.widgets.utils = Dom.get(this.id + "-utils");
          Event.addListener(this.id + "-link-disconnect", "click", this.onDisconnectClick, this, true);

          // New tweet link
          Event.addListener(this.id + "-link-new-tweet", "click", this.onNewTweetClick, this, true);

          // Delegate setting up the favorite/retweet/reply links
          Event.delegate(this.widgets.timeline, "click", this.onTweetFavoriteClick, "a.twitter-favorite-link, a.twitter-favorite-link-on", this, true);
          Event.delegate(this.widgets.timeline, "click", this.onTweetRetweetClick, "a.twitter-retweet-link", this, true);
          Event.delegate(this.widgets.timeline, "click", this.onTweetReplyClick, "a.twitter-reply-link", this, true);
          
          // Dropdown filter
          this.widgets.filter = new YAHOO.widget.Button(this.id + "-filter",
          {
             type: "split",
             menu: this.id + "-filter-menu",
             lazyloadmenu: false
          });
          this.widgets.filter.on("click", this.onFilterClicked, this, true);
          
         // TODO Check OAuth is supported and warn if not
         
         this.oAuth = new Extras.OAuthHelper().setOptions({
             providerId: "twitter",
             endpointId: "twitter-auth",
             requestTokenCallbackUri: window.location.href + "?cmpt_htmlid="  + encodeURIComponent(this.id)
         });
         
         this.oAuth.init({
             successCallback: { 
                 fn: function TwitterTimeline_onReady_oAuthInit()
                 {
                     if (this.oAuth.isAuthorized()) // An access token exists
                     {
                         // Run the success handler directly to load the messages
                         this.onAuthSuccess();
                     }
                     else if (this.oAuth.hasToken()) // Found a request token (TODO persist verifier via a web script and redirect user back)
                     {
                         // Get verifier from URL
                         var verifier = Alfresco.util.getQueryStringParameter("oauth_verifier", window.location.href),
                             cid = Alfresco.util.getQueryStringParameter("cmpt_htmlid", window.location.href);
                         if (verifier != null && cid != null && cid == this.id)
                         {
                             this.oAuth.requestAccessToken(this.oAuth.authData, verifier, {
                                 successCallback: {
                                     fn: this.onAuthSuccess, 
                                     scope: this
                                 },
                                 failureHandler: {
                                     fn: this.onAuthFailure,
                                     scope: this
                                 }
                             });
                         }
                         else // Incomplete verifier info, possible we were not redirected
                         {
                             this.oAuth.clearCredentials();
                             // Display the Connect information and button
                             Dom.setStyle(this.widgets.connect, "display", "block");
                             // Enable the button
                             this.widgets.connectButton.set("disabled", false);
                             // Hide the toolbar
                             this._hideToolbar();
                         }
                     }
                     else // Not connected at all
                     {
                         // Display the Connect information and button
                         Dom.setStyle(this.widgets.connect, "display", "block");
                         // Enable the button
                         this.widgets.connectButton.set("disabled", false);
                         // Hide the toolbar
                         this._hideToolbar();
                     }
                 }, 
                 scope: this
             },
             failureHandler: { 
                 fn: function TwitterTimeline_onReady_oAuthInit() {
                     // Failed to init the oauth helper, e.g. credentials not loaded
                     Alfresco.util.PopupManager.displayMessage({
                         text: this.msg("error.initOAuth")
                     });
                 }, 
                 scope: this
             }
         });
      },
      
      /**
       * Callback method used to prompt the user for a verification code to confirm that the
       * application has been granted access
       * 
       * @method onRequestTokenGranted
       * @param {object} obj Object literal containing properties
       *    authParams {object} Parameters received from get token stage
       *    onComplete {function} the callback function to be called to pass back the value provided by the user
       */
      onRequestTokenGranted: function TwitterTimeline_onRequestTokenGranted(obj)
      {
          Alfresco.util.assertNotEmpty(obj);
          Alfresco.util.assertNotEmpty(obj.authParams);
          Alfresco.util.assertNotEmpty(obj.onComplete);
          
          var authToken = obj.authParams.oauth_token,
              callbackConfirmed = obj.authParams.oauth_callback_confirmed,
              callbackFn = obj.onComplete,
              authorizationUrl = "http://api.twitter.com/oauth/authorize?oauth_token=" + authToken;
          
          if (callbackConfirmed == "true")
          {
              // Save the request token data
              this.oAuth.saveCredentials({
                  successCallback: {
                      fn: function() {
                          // Navigate to the authorization page
                          window.location.href = authorizationUrl;
                      },
                      scope: this
                  }
              });
          }
          else
          {
              Alfresco.util.PopupManager.displayMessage({
                  text: "Callback was not confirmed"
              });
          }
      },
      
      /**
       * Callback method to use to set up the dashlet when it is known that the authentication
       * has completed successfully
       * 
       * @method onAuthSuccess
       */
      onAuthSuccess: function TwitterTimeline_onAuthSuccess()
      {
          // TODO Wire this up with Bubbling, so multiple dashlets will work

          // Remove the Connect information and button, if they are shown
          Dom.setStyle(this.widgets.connect, "display", "none");
          
          // Enable the Disconnect button
          this._showDisconnectButton();
          
          // Display the toolbar
          this._showToolbar();

          // Set up filter menu - loading is triggerred via a click event
          var me = this;

          // Clear the lazyLoad flag and fire init event to get menu rendered into the DOM
          var menu = this.widgets.filter.getMenu();
          menu.subscribe("click", function (p_sType, p_aArgs)
          {
             var menuItem = p_aArgs[1];
             if (menuItem)
             {
                me.widgets.filter.set("label", menuItem.cfg.getProperty("text"));
                me.onFilterChanged.call(me, p_aArgs[1]);
             }
          });
          
          this.widgets.filter.value = this.options.activeFilter;

          // Loop through and find the menuItem corresponding to the default filter
          var menuItems = menu.getItems(),
             menuItem,
             i, ii;

          for (i = 0, ii = menuItems.length; i < ii; i++)
          {
             menuItem = menuItems[i];
             if (menuItem.value == this.options.activeFilter)
             {
                menu.clickEvent.fire(
                {
                   type: "click"
                }, menuItem);
                break;
             }
          }
          
          //this.load();
      },
      
      /**
       * Callback method when a problem occurs with the authentication
       * 
       * @method onAuthFailure
       */
      onAuthFailure: function TwitterTimeline_onAuthFailure()
      {
          Alfresco.util.PopupManager.displayMessage({
              text: this.msg("error.general")
          });
      },
      
      /**
       * Timeline loaded successfully
       * 
       * @method onLoadSuccess
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onLoadSuccess: function TwitterTimeline_onLoadSuccess(p_response, p_obj)
      {
         this._hideLoading();
         // Update the dashlet title
         this.widgets.title.innerHTML = this.msg("header.userTimeline", this._getTwitterUser());
         
         var html = "", tweets, t,userLink, postedLink, isList = this._getTwitterUser().indexOf("/") > 0;
         
         if (p_response.json)
         {
            tweets = p_response.json;
            
            if (tweets.length > 0)
            {
               html += this._generateTweetsHTML(tweets);
            }
            else
            {
               html += "<div class=\"detail-list-item first-item last-item\">\n";
               html += "<span>\n";
               if (isList)
               {
                  html += this.msg("list.noTweets");
               }
               else
               {
                  html += this.msg("user.noTweets");
               }
               html += "</span>\n";
               html += "</div>\n";
            }
         }
         
         this.widgets.timeline.innerHTML = html;
         this.latestTweetId = this._getLatestTweetId(tweets);
         this.earliestTweetId = this._getEarliestTweetId(tweets);
         
         // Enable the Load More button
         this.widgets.moreButton.set("disabled", false);
         Dom.setStyle(this.widgets.buttons, "display", "block");
         
         // Start the timer to poll for new tweets, if enabled
         this._resetTimer();
      },

      /**
       * Timeline load failed
       * 
       * @method onLoadFailure
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onLoadFailure: function TwitterTimeline_onLoadFailure(p_response, p_obj)
      {
         this._hideLoading();
         // Update the dashlet title
         this.widgets.title.innerHTML = this.msg("header.userTimeline", this._getTwitterUser());
          
         var status = p_response.serverResponse.status,
            isList = this._getTwitterUser().indexOf("/") > 0;
         if (status == 401 || status == 404)
         {
            this.widgets.timeline.innerHTML = "<div class=\"msg\">" + this.msg("error." + (isList ? "list" : "user") + "." + status) + "</div>";
         }
         else
         {
            this.widgets.timeline.innerHTML = "<div class=\"msg\">" + this.msg("label.error") + "</div>";
         }
         
         // Disable the Load More button
         this.widgets.moreButton.set("disabled", true);
         Dom.setStyle(this.widgets.buttons, "display", "none");
      },
      
      /**
       * PRIVATE FUNCTIONS
       */
      
      /**
       * Generate HTML markup for a direct message
       * 
       * @method _generateDirectMessageHTML
       * @private
       * @param t {object} Tweet object to render into HTML
       * @param rt {object} Retweet object, if the Tweet has been RT'ed
       * @return {string} HTML markup
       */
      _generateDirectMessageHTML: function TwitterBase__generateDirectMessageHTML(t, rt)
      {
         var html = "", 
            profileUri = "http://twitter.com/" + encodeURIComponent(t.sender.screen_name),
            userLink = "<a href=\"" + profileUri + "\" title=\"" + $html(t.sender.name) + "\" class=\"theme-color-1\">" + $html(t.sender.screen_name) + "</a>",
            postedRe = /([A-Za-z]{3}) ([A-Za-z]{3}) ([0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}) (\+[0-9]{4}) ([0-9]{4})/,
            postedMatch = postedRe.exec(t.created_at),
            postedOn = postedMatch != null ? (postedMatch[1] + ", " + postedMatch[3] + " " + postedMatch[2] + " " + postedMatch[6] + " " + postedMatch[4] + " GMT" + postedMatch[5]) : (t.created_at),
            postedLink = "<a href=\"" + profileUri + "\/status\/" + encodeURIComponent(t.id_str) + "\"><span class=\"tweet-date\" title=\"" + postedOn + "\">" + this._relativeTime(new Date(postedOn)) + "</span><\/a>";

         html += "<div class=\"user-tweet" + " detail-list-item\" id=\"" + $html(this.id) + "-tweet-" + $html(t.id_str) + "\">\n";
         html += "<div class=\"user-icon\"><a href=\"" + profileUri + "\" title=\"" + $html(t.sender.name) + "\"><img src=\"" + $html(t.sender.profile_image_url) + "\" alt=\"" + $html(t.sender.screen_name) + "\" width=\"48\" height=\"48\" /></a></div>\n";
         html += "<div class=\"tweet\">\n";
         html += "<div class=\"tweet-hd\">\n";
         html += "<span class=\"screen-name\">" + userLink + "</span> <span class=\"user-name\">" + $html(t.sender.name) + "</span>\n";
         html += !YAHOO.lang.isUndefined(rt) ? " <span class=\"retweeted\">" + this.msg("label.retweetedBy", rt.sender.screen_name) + "</span>\n" : "";
         html += "</div>\n";
         html += "<div class=\"tweet-bd\">" + this._formatTweet(t.text) + "</div>\n";
         html += "<div class=\"tweet-details\">\n";
         html += "<span>" + postedLink + "</span>";
         if (this.oAuth != null)
         {
             /*
             html += "<span class=\"twitter-actions\">\n";
             html += "<a href=\"\" class=\"twitter-favorite-link" + (t.favorited ? "-on" : "") + "\"><span>" + this.msg("link.favorite") + "</span></a>\n";
             html += "<a href=\"\" class=\"twitter-retweet-link\"><span>" + this.msg("link.retweet") + "</span></a>\n";
             html += "<a href=\"\" class=\"twitter-reply-link\"><span>" + this.msg("link.reply") + "</span></a>\n";
             html += "</span>\n";
             */
         }
         html += "</div>\n";
         html += "</div>\n"; // end tweet
         html += "</div>\n"; // end list-tweet
         return html;
      },
      
      /**
       * Get the current Twitter user or list ID
       * 
       * @method _getTwitterUser
       * @private
       * @return {string} The name of the currently-configured user or list, or the default
       * user/list if unconfigured or blank
       */
      _getTwitterUser: function TwitterTimeline__getTwitterUser()
      {
         if (this.oAuth.authData && this.oAuth.authData.screen_name)
         {
             return this.oAuth.authData.screen_name;
         }
         else
         {
             return null;
         }
      },

      /**
       * Request data from the web service
       * 
       * @method _request
       * @private
       * @param p_obj {object} Request parameters
       */
      _request: function TwitterTimeline__request(p_obj)
      {
         var requestItems = this._getRequestItems(p_obj),
             url = requestItems.uri,
             params = requestItems.params;

         if (p_obj.dataObj.maxId != null)
         {
             params.max_id = p_obj.dataObj.maxId;
         }
         if (p_obj.dataObj.minId != null)
         {
             params.since_id = p_obj.dataObj.minId;
         }
         
         // Load the timeline
         this.oAuth.request(
         {
            url: url,
            dataObj: params,
            successCallback: p_obj.successCallback,
            failureCallback:  p_obj.failureCallback
         });
      },
      
      /**
       * Generate request url and parameters based on the current active filter
       * 
       * @method _getRequestItems
       * @private
       * @param p_obj {object} Request parameters
       */
      _getRequestItems: function TwitterTimeline__getRequestItems(p_obj)
      {
         var uri = "", 
         params = {
                 per_page: p_obj.dataObj.pageSize || this.options.pageSize
         };
         switch (this.options.activeFilter)
         {
            case "home":
               uri = '/1/statuses/home_timeline.json';
               break;

            case "mentions":
               uri = '/1/statuses/mentions.json';
               params.include_rts = 1;
               break;

            case "favorites":
               uri = '/1/favorites.json';
               break;

            case "user":
               uri = '/1/statuses/user_timeline.json';
               params.include_rts = 1;
               break;

            case "direct":
               uri = '/1/direct_messages.json';
               break;
         }
         return {uri: uri, params: params };
      },

      /**
       * Saves active filter to dashlet config
       * 
       * @method _setActiveFilter
       * @private
       * @param filter {string} New filter to set
       * @param noPersist {boolean} [Optional] If set, preferences are not updated
       */
      _setActiveFilter: function TwitterTimeline_setActiveFilter(filter, noPersist)
      {
         this.options.activeFilter = filter;
         this.load();
         if (noPersist !== true)
         {
            // Persist state to the dashlet config
            Alfresco.util.Ajax.jsonRequest(
            {
                method: "POST",
                url: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + this.options.componentId,
                dataObj:
                {
                    activeFilter: filter
                },
                successCallback: function(){},
                successMessage: null,
                failureCallback: function(){},
                failureMessage: null
            });
         }
      },
      
      /**
       * Post a new tweet
       *
       * @method _postTweet
       * @param replyToId {string} ID of tweet this is in reply to, null otherwise
       * @param text {string} Text to prepopulate the textarea
       */
      _postTweet: function TwitterTimeline__postTweet(replyToId, text)
      {
         text = text || "";
         var me = this,
            linkRe = new RegExp(/((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?\^=%&:\/~\+#]*[\w\-\@?\^=%&\/~\+#])?)/gm),
            shortLinkRe = new RegExp(/^http:\/\/is\.gd\//),
            id = Alfresco.util.generateDomId(),
            maxCharCount = 140,
            html = '<div><textarea id="' + id + '-input" tabindex="0">' + (text || "") + '</textarea>' +
               '<input type="hidden" id="' + id + '-shortened"></input></div>' + 
               '<div><div id="' + id + '-count" class="twitter-char-count">' + (maxCharCount - text.length) + '</div>' +
               '<div id="' + id + '-status" class="twitter-post-status"></div></div>';
         
         var callBack = {
             fn: function TwitterTimeline_onNewPostClick_postCB(value, obj) {
                 if (value != null && value != "")
                 {
                     var dataObj = {
                             status: value
                     };
                     if (replyToId)
                         dataObj.in_reply_to_status_id = replyToId;
                     
                     // Post the update
                     this.oAuth.request({
                         url: "/1/statuses/update.json",
                         method: "POST",
                         dataObj: dataObj,
                         requestContentType: Alfresco.util.Ajax.FORM,
                         successCallback: {
                             fn: function(o) {
                                 if (o.responseText == "")
                                 {
                                     throw "Empty response received";
                                 }
                                 else
                                 {
                                     if (typeof o.json == "object")
                                     {
                                         var thtml = this._generateTweetsHTML([o.json]);
                                         this._refreshDates(); // Refresh existing dates
                                         this.widgets.timeline.innerHTML = thtml + this.widgets.timeline.innerHTML;

                                         Alfresco.util.PopupManager.displayMessage({
                                             text: this.msg("message.post-tweet")
                                         });
                                     }
                                     else
                                     {
                                         throw "Could not parse JSON response";
                                     }
                                 }
                             },
                             scope: this
                         },
                         failureCallback: {
                             fn: function() {
                                 Alfresco.util.PopupManager.displayMessage({
                                     text: this.msg("error.post-tweet")
                                 });
                             },
                             scope: this
                         }
                     });
                 }
             },
             scope: this
         };
         
         /**
          * Return short version of a link, if we know it, and if it is not a short URL itself
          */
         var shortenUrl = function(url) {
            if (!shortLinkRe.test(url))
            {
               for (var i = 0; i < me.shortenedLinks.length; i++)
               {
                  if (me.shortenedLinks[i][0] == url && me.shortenedLinks[i][1])
                  {
                     return me.shortenedLinks[i][1];
                  }
               }
            }
            return url;
         }

         /**
          * Return text
          */
         var getText = function() {
            var value = null, input = Dom.get(id + "-input");
            if (input)
            {
               value = input.value;
            }
            return value;
         }

         /**
          * Return text, with all links that we are able to shorten, shortened
          */
         var getShortenedText = function() {
            var value = getText();
            if (value)
            {
               value = YAHOO.lang.trim(value.replace(linkRe, shortenUrl));
            }
            return value;
         }
         
         // Create the dialog - returns instance of YAHOO.widget.SimpleDialog
         this.widgets.postDialog = Alfresco.util.PopupManager.getUserInput({
             title: this.msg("title.new-tweet"),
             html: html,
             buttons: [
                {
                   text: Alfresco.util.message("button.ok", this.name),
                   handler: function TwitterTimeline_postTweet_okClick() {
                      // Grab the input, destroy the pop-up, then callback with the value
                      var value = getShortenedText();
                      this.destroy();
                      if (callBack.fn)
                      {
                         callBack.fn.call(callBack.scope || window, value, callBack.obj);
                      }
                   },
                   isDefault: true
                },
                {
                   text: Alfresco.util.message("button.cancel", this.name),
                   handler: function TwitterTimeline_postTweet_cancelClick() {
                      this.destroy();
                   }
                }
             ]
         });
         
         // Cache a reference to the buttons
         var buttons = this.widgets.postDialog.getButtons(); // Should be two YUI buttons

         var setCharsLeft = function(n) {
             Dom.get(id + "-count").innerHTML = n;
             if (n < 0)
             {
                // Add the count-over class
                Dom.addClass(id + "-count", "count-over");
                // Disable the OK button
                buttons[0].set("disabled", true);
             }
             else
             {
                // Remove the count-over class
                 Dom.removeClass(id + "-count", "count-over");
                // Enable the OK button
                 buttons[0].set("disabled", false);
             }
         }
         /**
          * Return links in the given text that have not been shortned, and are not in the process of being shortened
          * 
          * @param text Input text
          * @returns {array} Unique list of links which have not been shortened
          */
         var getUnshortenedLinks = function(text)
         {
            var m, link, links = [], found;
            while ((m = linkRe.exec(text)) != null)
            {
               // Make sure link is not right at the end of the text (probably means we are still typing it)
               if (linkRe.lastIndex == text.length)
               {
                  continue;
               }
               link = m[0];
               if (!Alfresco.util.arrayContains(links, link)) // Check not already in array
               {
                  found = false;
                  for (var i = 0; i < me.shortenedLinks.length && !found; i++)
                  {
                     if (me.shortenedLinks[i][0] == link)
                     {
                        found = true;
                     }
                  }
                  if (!found)
                  {
                     links.push(link);
                  }
               }
            }
            return links;
         }
         var onTextChange = function(e, obj) {
             // TODO Execute this on a timer
             // First calculate the length based on what we know now, and set this
             var text = getShortenedText();
             setCharsLeft(maxCharCount - text.length);
             
             // Now, if there are any links that have not been shortened then we must call out for these
             var unshortened = getUnshortenedLinks(getText()),
                numLinks = unshortened.length,
                numCompleted = 0,
                link;
             
             if (unshortened.length > 0)
             {
                // Set the 'Shortening...' text
                Dom.get(id + "-status").innerHTML = me.msg("label.status-shortening");
                for (var i = 0; i < numLinks; i++)
                {
                   link = unshortened[i];
                   // Add 'null' link to shortenedLinks to signify we are busy shortening it (prevents other events from trying the same)
                   me.shortenedLinks.push([link, null]);
                   
                   // Make the XHR call
                   Alfresco.util.Ajax.request(
                   {
                      url: Alfresco.constants.PROXY_URI.replace("/alfresco/", "/is-gd/") + "create.php",
                      dataObj: {
                         format: "json",
                         url: link
                      },
                      successCallback: {
                         fn: function shortenLink_onSuccess(p_obj) {
                            // add short url to shortenedLinks, re-calculate chars left
                            var json = Alfresco.util.parseJSON(p_obj.serverResponse.responseText), 
                                shortLink = json.shorturl;
                            
                            for (var i = 0; i < me.shortenedLinks.length; i++)
                            {
                               if (me.shortenedLinks[i][0] == link)
                               {
                                  me.shortenedLinks[i][1] = shortLink;
                               }
                               setCharsLeft(maxCharCount - getShortenedText().length);
                            }
                            // increment numCompleted, unset the 'Shortening...' only if numCompleted == numLinks
                            numCompleted ++;
                            if (numCompleted == numLinks)
                            {
                               Dom.get(id + "-status").innerHTML = me.msg("label.status-shortened");
                               YAHOO.lang.later(1500, me, function() {
                                  if (Dom.get(id + "-status").innerHTML == me.msg("label.status-shortened"))
                                  {
                                     Dom.get(id + "-status").innerHTML = "";
                                  }
                               });
                            }
                         },
                         scope: this
                      },
                      failureCallback: {
                         fn: function shortenLink_onFailure(p_obj) {
                            // remove null value from shortenedLinks to signal we have finished shortening it
                            for (var i = 0; i < me.shortenedLinks.length; i++)
                            {
                               if (me.shortenedLinks[i][0] == link)
                               {
                                  me.shortenedLinks.splice(i, 1);
                               }
                            }
                            // increment numCompleted, unset the 'Shortening...' only if numCompleted == numLinks
                            numCompleted ++;
                            if (numCompleted == numLinks)
                            {
                               Dom.get(id + "-status").innerHTML = me.msg("label.status-shortened");
                               YAHOO.lang.later(1500, me, function() {
                                  if (Dom.get(id + "-status").innerHTML == me.msg("label.status-shortened"))
                                  {
                                     Dom.get(id + "-status").innerHTML = "";
                                  }
                               });
                            }
                         },
                         scope: this
                      },
                      scope: this,
                      noReloadOnAuthFailure: true
                   });
                }
             }
         };

         Event.on(id + "-input", "keyup", onTextChange);
         Event.on(id + "-input", "click", onTextChange);
         
         // Position cursor at end of textarea
         // as per http://stackoverflow.com/questions/4715762/javascript-move-caret-to-last-character/4716021#4716021
         var moveCaretToEnd = function (el) {
             if (typeof el.selectionStart == "number") {
                 el.selectionStart = el.selectionEnd = el.value.length;
                 el.focus();
             } else if (typeof el.createTextRange != "undefined") {
                 el.focus();
                 var range = el.createTextRange();
                 range.collapse(false);
                 range.select();
             }
         }
         
         moveCaretToEnd(Dom.get(id + "-input"));

         // Work around Chrome's little problem
         window.setTimeout(function() {
             moveCaretToEnd(Dom.get(id + "-input"));
         }, 1);

      },

      /**
       * Hide the dashlet toolbar
       *
       * @method _hideToolbar
       */
      _hideToolbar: function TwitterTimeline__hideToolbar()
      {
          Dom.setStyle(this.widgets.toolbar, "display", "none");
      },

      /**
       * Show the dashlet toolbar
       *
       * @method _showToolbar
       */
      _showToolbar: function TwitterTimeline__showToolbar()
      {
          Dom.setStyle(this.widgets.toolbar, "display", "block");
      },

      /**
       * Hide the disconnect button
       *
       * @method _hideDisconnectButton
       */
      _hideDisconnectButton: function TwitterTimeline__hideDisconnectButton()
      {
          if (this.widgets.titleBarActions != null)
          {
              Dom.getElementsByClassName ("disconnect", "div", this.widgets.titleBarActions, function(el) {
                  Dom.setStyle(el, "display", "none");
              }, this, true);
          }
          else
          {
              Dom.setStyle(this.widgets.utils, "display", "none");
          }
      },

      /**
       * Show the disconnect button
       *
       * @method _showDisconnectButton
       */
      _showDisconnectButton: function TwitterTimeline__showDisconnectButton()
      {
          if (this.widgets.titleBarActions != null)
          {
              Dom.getElementsByClassName ("disconnect", "div", this.widgets.titleBarActions, function(el) {
                  Dom.setStyle(el, "display", "block");
              }, this, true);
          }
          else
          {
              Dom.setStyle(this.widgets.utils, "display", "block");
          }
      },

      /**
       * YUI WIDGET EVENT HANDLERS
       * Handlers for standard events fired from YUI widgets, e.g. "click"
       */

      /**
       * Click handler for Connect button
       *
       * @method onConnectButtonClick
       * @param e {object} HTML event
       */
      onConnectButtonClick: function TwitterTimeline_onConnectButtonClick(e, obj)
      {
         // Disable the button while we make the request
         this.widgets.connectButton.set("disabled", true);

         if (!this.oAuth.isAuthorized()) // Double-check we are still not connected
         {
             this.oAuth.requestToken({
                 successCallback: { 
                     fn: this.onAuthSuccess, 
                     scope: this
                 },
                 failureHandler: { 
                     fn: this.onAuthFailure, 
                     scope: this
                 },
                 requestTokenHandler:  { 
                     fn: this.onRequestTokenGranted, 
                     scope: this
                 }
             });
         }
         else
         {
             this.onAuthSuccess();
         }
      },
      
      /**
       * Click handler for Disconnect link
       *
       * @method onDisconnectClick
       * @param e {object} HTML event
       */
      onDisconnectClick: function TwitterTimeline_onDisconnectClick(e)
      {
         // Prevent default action
         Event.stopEvent(e);
         
         var me = this;
         
         Alfresco.util.PopupManager.displayPrompt({
             title: this.msg("title.disconnect"),
             text: this.msg("label.disconnect"),
             buttons: [
                 {
                     text: Alfresco.util.message("button.ok", this.name),
                     handler: function TwitterTimeline_onDisconnectClick_okClick() {
                         me.oAuth.clearCredentials();
                         me.oAuth.saveCredentials();
                         // Remove existing messages
                         me.widgets.timeline.innerHTML = "";
                         me.newTweets = [];
                         me._refreshNotification.call(me);
                         // Display the Connect information and button
                         Dom.setStyle(me.widgets.connect, "display", "block");
                         // Enable the Connect button
                         me.widgets.connectButton.set("disabled", false);
                         // Disable the Disconnect button and More button
                         me._hideDisconnectButton.call(me);
                         Dom.setStyle(me.widgets.buttons, "display", "none");
                         // Disable the toolbar
                         me._hideToolbar.call(me);
                         this.destroy();
                     },
                     isDefault: true
                 },
                 {
                     text: Alfresco.util.message("button.cancel", this.name),
                     handler: function TwitterTimeline_onDisconnectClick_cancelClick() {
                         this.destroy();
                     }
                 }
             ]
         });
      },
      
      /**
       * Click handler for New Tweet link
       *
       * @method onNewTweetClick
       * @param e {object} HTML event
       */
      onNewTweetClick: function TwitterTimeline_onNewPostClick(e, obj)
      {
         // Prevent default action
         Event.stopEvent(e);
         this._postTweet(null);
      },
      
      /**
       * Click handler for Reply link
       *
       * @method onTweetReplyClick
       * @param e {object} HTML event
       */
      onTweetReplyClick: function TwitterTimeline_onTweetReplyClick(e, matchEl, obj)
      {
         // Prevent default action
         Event.stopEvent(e);
         
         var tEl = Dom.getAncestorByClassName(matchEl, "tweet"),
             elId = tEl.id,
             tId = elId.substring(elId.lastIndexOf("-") + 1), // Tweet id
             snEl = Dom.getElementsByClassName("screen-name", "span" ,tEl)[0],
             sn = snEl.textContent || snEl.innerText;
         
         this._postTweet(tId, "@" + sn + " ");
      },
      
      /**
       * Click handler for Retweet link
       *
       * @method onTweetRetweetClick
       * @param e {object} HTML event
       */
      onTweetRetweetClick: function TwitterTimeline_onTweetRetweetClick(e, matchEl, obj)
      {
         // Prevent default action
         Event.stopEvent(e);
         
         var elId = Dom.getAncestorByClassName(matchEl, "user-tweet").id,
             tId = elId.substring(elId.lastIndexOf("-") + 1); // Tweet id
         
         var me = this;
         
         Alfresco.util.PopupManager.displayPrompt({
             title: this.msg("title.retweet"),
             text: this.msg("label.retweet"),
             buttons: [
                 {
                     text: Alfresco.util.message("button.ok", this.name),
                     handler: function TwitterTimeline_onRetweetClick_okClick() {
                         me.oAuth.request({
                             url: "/1/statuses/retweet/" + tId + ".json",
                             method: "POST",
                             successCallback: {
                                 fn: function(o) {
                                     if (o.responseText == "")
                                     {
                                         throw "Empty response received";
                                     }
                                     else
                                     {
                                         if (typeof o.json == "object")
                                         {
                                             var thtml = me._generateTweetsHTML([o.json]);
                                             me._refreshDates(); // Refresh existing dates
                                             me.widgets.timeline.innerHTML = thtml + me.widgets.timeline.innerHTML;
                                             
                                             Alfresco.util.PopupManager.displayMessage({
                                                 text: me.msg("message.retweet")
                                             });
                                         }
                                         else
                                         {
                                             throw "Could not parse JSON response";
                                         }
                                     }
                                 },
                                 scope: this
                             },
                             failureCallback: {
                                 fn: function() {
                                     Alfresco.util.PopupManager.displayMessage({
                                         text: me.msg("error.retweet")
                                     });
                                 },
                                 scope: this
                             }
                         });
                         this.destroy();
                     },
                     isDefault: true
                 },
                 {
                     text: Alfresco.util.message("button.cancel", this.name),
                     handler: function TwitterTimeline_onDisconnectClick_cancelClick() {
                         this.destroy();
                     }
                 }
             ]
         });
      },
      
      /**
       * Click handler for Favorite link
       *
       * @method onTweetFavoriteClick
       * @param e {object} HTML event
       */
      onTweetFavoriteClick: function TwitterTimeline_onTweetFavoriteClick(e, matchEl, obj)
      {
         // Prevent default action
         Event.stopEvent(e);
         
         var elId = Dom.getAncestorByClassName(matchEl, "user-tweet").id,
             tId = elId.substring(elId.lastIndexOf("-") + 1), // Tweet id
             isFavorite = Dom.hasClass(matchEl, "twitter-favorite-link-on"),
             action = !isFavorite ? "create" : "destroy",
             newClass = !isFavorite ? "twitter-favorite-link-on" : "twitter-favorite-link",
             oldClass = !isFavorite ? "twitter-favorite-link" : "twitter-favorite-link-on",
             errMsgId = !isFavorite ? "error.favorite" : "error.unfavorite";
         
         this.oAuth.request({
             url: "/1/favorites/" + action + "/" + tId + ".json",
             method: "POST",
             successCallback: {
                 fn: function(o) {
                     if (o.responseText == "")
                     {
                         throw "Empty response received";
                     }
                     else
                     {
                         if (typeof o.json == "object")
                         {
                             Dom.addClass(matchEl, newClass);
                             Dom.removeClass(matchEl, oldClass);
                         }
                         else
                         {
                             throw "Could not parse JSON response";
                         }
                     }
                 },
                 scope: this
             },
             failureCallback: {
                 fn: function() {
                     Alfresco.util.PopupManager.displayMessage({
                         text: this.msg(errMsgId)
                     });
                 },
                 scope: this
             }
         });
      },
      
      /**
       * Filter drop-down changed event handler
       * @method onFilterChanged
       * @param p_oMenuItem {object} Selected menu item
       */
      onFilterChanged: function TwitterTimeline_onFilterChanged(p_oMenuItem)
      {
         var filter = p_oMenuItem.value;
         this.widgets.filter.value = filter;
         this._setActiveFilter(filter);

         this.newTweets = [];
         this._refreshNotification();
      },

      /**
       * Filter button clicked event handler
       * 
       * @method onFilterClicked
       * @param p_oEvent {object} Dom event
       */
      onFilterClicked: function TwitterTimeline_onFilterClicked(p_oEvent)
      {
         // Re-load tweets
         this.load();
         // Clear the notification
         this.newTweets = [];
         this._refreshNotification();
      }
      
   });
})();

/**
 * Twitter feed dashlet.
 * 
 * @namespace Alfresco
 * @class Extras.dashlet.TwitterUserTimeline
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
    * @return {Extras.dashlet.TwitterUserTimeline} The new component instance
    * @constructor
    */
   Extras.dashlet.TwitterUserTimeline = function TwitterUserTimeline_constructor(htmlId)
   {
      return Extras.dashlet.TwitterUserTimeline.superclass.constructor.call(this, "Extras.dashlet.TwitterUserTimeline", htmlId);
   };

   /**
    * Extend from Extras.dashlet.TwitterBase and add class implementation
    */
   YAHOO.extend(Extras.dashlet.TwitterUserTimeline, Extras.dashlet.TwitterBase,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options: YAHOO.lang.merge(Extras.dashlet.TwitterBase.prototype.options,
      {
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
      }),

      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
      onReady: function TwitterUserTimeline_onReady()
      {
          Extras.dashlet.TwitterTimeline.superclass.onReady.call(this);
          // Load the timeline
          this.load();
      },
      
      /**
       * Timeline loaded successfully
       * 
       * @method onLoadSuccess
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onLoadSuccess: function TwitterUserTimeline_onLoadSuccess(p_response, p_obj)
      {
         this._hideLoading();
         // Update the dashlet title
         this.widgets.title.innerHTML = this.msg("header.userTimeline", this._getTwitterUser());
         
         var html = "", tweets, t,userLink, postedLink, isList = this._getTwitterUser().indexOf("/") > 0;
         
         if (p_response.json)
         {
            tweets = p_response.json;
            
            if (tweets.length > 0)
            {
               html += this._generateTweetsHTML(tweets);
            }
            else
            {
               html += "<div class=\"detail-list-item first-item last-item\">\n";
               html += "<span>\n";
               if (isList)
               {
                  html += this.msg("list.noTweets");
               }
               else
               {
                  html += this.msg("user.noTweets");
               }
               html += "</span>\n";
               html += "</div>\n";
            }
         }
         
         this.widgets.timeline.innerHTML = html;
         this.latestTweetId = this._getLatestTweetId(tweets);
         this.earliestTweetId = this._getEarliestTweetId(tweets);
         
         // Enable the Load More button
         this.widgets.moreButton.set("disabled", false);
         Dom.setStyle(this.widgets.buttons, "display", "block");
         
         // Start the timer to poll for new tweets, if enabled
         this._resetTimer();
      },

      /**
       * Timeline load failed
       * 
       * @method onLoadFailure
       * @param p_response {object} Response object from request
       * @param p_obj {object} Custom object passed to function
       */
      onLoadFailure: function TwitterUserTimeline_onLoadFailure(p_response, p_obj)
      {
         this._hideLoading();
         // Update the dashlet title
         this.widgets.title.innerHTML = this.msg("header.userTimeline", this._getTwitterUser());
          
         var status = p_response.serverResponse.status,
            isList = this._getTwitterUser().indexOf("/") > 0;
         if (status == 401 || status == 404)
         {
            this.widgets.timeline.innerHTML = "<div class=\"msg\">" + this.msg("error." + (isList ? "list" : "user") + "." + status) + "</div>";
         }
         else
         {
            this.widgets.timeline.innerHTML = "<div class=\"msg\">" + this.msg("label.error") + "</div>";
         }
         
         // Disable the Load More button
         this.widgets.moreButton.set("disabled", true);
         Dom.setStyle(this.widgets.buttons, "display", "none");
      },
      
      /**
       * PRIVATE FUNCTIONS
       */
      
      /**
       * Get the current Twitter user or list ID
       * 
       * @method _getTwitterUser
       * @private
       * @return {string} The name of the currently-configured user or list, or the default
       * user/list if unconfigured or blank
       */
      _getTwitterUser: function TwitterUserTimeline__getTwitterUser()
      {
         return (this.options.twitterUser != null && this.options.twitterUser != "") ? 
               this.options.twitterUser : this.options.defaultTwitterUser;
      },

      /**
       * Request data from the web service
       * 
       * @method _request
       */
      _request: function TwitterUserTimeline__request(p_obj)
      {
         var url;
         var uparts = this._getTwitterUser().split("/");
         var params = {};

         if (uparts.length > 1)
         {
            url = Alfresco.constants.PROXY_URI.replace("/alfresco/", "/twitter/") + "1/" + uparts[0] + "/lists/" + uparts[1] + 
               "/statuses.json";
            params = {
                    per_page: p_obj.dataObj.pageSize || this.options.pageSize
            };
            /*
            url = Alfresco.constants.PROXY_URI.replace("/alfresco/", "/twitter/") + "1/statuses/lists/show.json";
            params = {
                    slug: uparts[0],
                    owner_screen_name: uparts[1],
                    per_page: p_obj.dataObj.pageSize || this.options.pageSize
            };*/
         }
         else
         {
            url = Alfresco.constants.PROXY_URI.replace("/alfresco/", "/twitter/") + "1/statuses/user_timeline.json";
            params = {
                    screen_name: uparts[0],
                    count: p_obj.dataObj.pageSize || this.options.pageSize,
                    include_rts: true
            };
         }

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
      onConfigClick: function TwitterUserTimeline_onConfigClick(e)
      {
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);
         
         Event.stopEvent(e);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "extras/modules/dashlets/twitter-user-timeline/config", actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function VideoWidget_onConfigFeed_callback(response)
                  {
                     // Refresh the feed
                     var u = YAHOO.lang.trim(Dom.get(this.configDialog.id + "-twitterUser").value),
                        newUser = (u != "") ? u : this.options.defaultTwitterUser;
                     
                     if (this.options.twitterUser != newUser)
                     {
                        this.options.twitterUser = newUser;
                        this.load();
                     }
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function VideoWidget_doSetupForm_callback(form)
                  {
                     Dom.get(this.configDialog.id + "-twitterUser").value = this._getTwitterUser();

                     // Search term is mandatory
                     this.configDialog.form.addValidation(this.configDialog.id + "-twitterUser", Alfresco.forms.validation.mandatory, null, "keyup");
                     this.configDialog.form.addValidation(this.configDialog.id + "-twitterUser", Alfresco.forms.validation.mandatory, null, "blur");
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
      }
      
   });
})();

/**
 * Twitter search dashlet.
 * 
 * @namespace Alfresco
 * @class Extras.dashlet.TwitterSearch
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
    * @return {Extras.dashlet.TwitterSearch} The new component instance
    * @constructor
    */
   Extras.dashlet.TwitterSearch = function TwitterSearch_constructor(htmlId)
   {
      return Extras.dashlet.TwitterSearch.superclass.constructor.call(this, "Extras.dashlet.TwitterSearch", htmlId);
   };

   /**
    * Extend from Extras.dashlet.TwitterBase and add class implementation
    */
   YAHOO.extend(Extras.dashlet.TwitterSearch, Extras.dashlet.TwitterBase,
   {
      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options: YAHOO.lang.merge(Extras.dashlet.TwitterBase.prototype.options,
      {
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
         defaultSearchTerm: ""
      }),

      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function TwitterSearch_onReady()
      {
          Extras.dashlet.TwitterTimeline.superclass.onReady.call(this);
         // Load the results
         this.load();
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
         this._hideLoading();
         // Update the dashlet title
         this.widgets.title.innerHTML = this.msg("header.search", encodeURIComponent(this._getSearchTerm()), this._getSearchTerm());
         
         var html = "", tweets;
         
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
         
         this.widgets.timeline.innerHTML = html;
         this.latestTweetId = this._getLatestTweetId(tweets);
         this.earliestTweetId = this._getEarliestTweetId(tweets);
         
         // Empty the new tweets cache and remove any notification
         this.newTweets = [];
         this._refreshNotification();
         
         // Enable the Load More button
         this.widgets.moreButton.set("disabled", false);
         Dom.setStyle(this.widgets.buttons, "display", "block");
         
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
         this._hideLoading();
         // Update the dashlet title
         this.widgets.title.innerHTML = this.msg("header.search", encodeURIComponent(this._getSearchTerm()), this._getSearchTerm());
         
         // Update the content
         this.widgets.timeline.innerHTML = "<div class=\"msg\">" + this.msg("label.error") + "</div>";
         
         // Disable the Load More button
         this.widgets.moreButton.set("disabled", true);
         Dom.setStyle(this.widgets.buttons, "display", "none");
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
         this._hideLoading();
         this._refreshDates(); // Refresh existing dates
         this.widgets.timeline.innerHTML += this._generateTweetsHTML(p_response.json.results.slice(1)); // Do not include duplicate tweet
         this.widgets.moreButton.set("disabled", false);
      },
      
      /**
       * PRIVATE FUNCTIONS
       */
      
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
       * Request data from the web service
       * 
       * @method _request
       */
      _request: function TwitterSearch__request(p_obj)
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
         
         // Make the request
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
      }
      
   });
})();
