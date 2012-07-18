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
 * @class Alfresco.dashlet.BBCWeather
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
      PREF_SITE_TAGS_FILTER = PREFERENCES_DASHLET + ".BBCWeatherFilter";


   /**
    * Dashboard BBCWeather constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.BBCWeather} The new component instance
    * @constructor
    */
   Alfresco.dashlet.BBCWeather = function BBCWeather_constructor(htmlId)
   {
      return Alfresco.dashlet.BBCWeather.superclass.constructor.call(this, "Alfresco.dashlet.BBCWeather", htmlId, ["button", "container", "datatable", "datasource", "autocomplete"]);
   };

   /**
    * Extend from Alfresco.component.Base and add class implementation
    */
   YAHOO.extend(Alfresco.dashlet.BBCWeather, Alfresco.component.Base,
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
          * The location ID of the forecast to show
          *
          * @property location
          * @type number
          * @default 0
          */
         location: 0,
      
         /**
          * The location name of the forecast to show
          *
          * @property locationName
          * @type string
          * @default ""
          */
         locationName: ""
      },

      /**
       * Dashlet title DOM container.
       * 
       * @property title
       * @type object
       */
      title: null,

      /**
       * Dashlet body DOM container.
       * 
       * @property body
       * @type object
       */
      body: null,

      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function BBCWeather_onReady()
      {
         Event.addListener(this.id + "-configure-link", "click", this.onConfigClick, this, true);
         
         // The dashlet title container
         this.title = Dom.get(this.id + "-title");

         // The dashlet body container
         this.body = Dom.get(this.id + "-body");
         
         // Load the data
         this.refreshData();
      },

      /**
       * Load the weather data using an AJAX call
       * @method refreshTimeline
       */
      refreshData: function BBCWeather_refreshData()
      {
         // Load the user timeline
         Alfresco.util.Ajax.jsonGet(
         {
            url: Alfresco.constants.URL_SERVICECONTEXT + "components/dashlets/bbc-weather/data?location=" + this.options.location,
            successCallback:
            {
               fn: this.onDataLoaded,
               scope: this
            },
            failureCallback:
            {
               fn: this.onDataLoadFailed,
               scope: this
            },
            scope: this,
            noReloadOnAuthFailure: true
         });
      },
      
      /**
       * Data loaded successfully
       * @method onDataLoaded
       * @param p_response {object} Response object from request
       */
      onDataLoaded: function BBCWeather_onDataLoaded(p_response)
      {
         // Retrieve the tags list from the JSON response and trim accordingly
         var location = p_response.json.location,
            observations = p_response.json.observations,
            forecast = p_response.json.forecast,
            html = "";
         
         this.options.locationName = location.name;
         
         if (observations != null)
         {
            html = "<div class=\"summary\"><span>" + 
            this._getWeatherIcon(observations.conditions, 64) + "</span>" +
            "<span class=\"temp-current\">" + $html(observations.temperature) + "</span>" + "</div>" +
            "<dl class=\"obs\"><dt>" + this.msg("obs.wind") + "</dt><dd>" + $html(observations.windSpeed) + ", " + $html(observations.windDir) + "</dd>" +
            "<dt>" + this.msg("obs.humidity") + "</dt><dd>" + $html(observations.humidity) + "</dd>" +
            "<dt>" + this.msg("obs.pressure") + "</dt><dd>" + $html(observations.pressure) + ", " + $html(observations.pressureTrend) + "</dd>" +
            "<dt>" + this.msg("obs.visibility") + "</dt><dd>" + $html(observations.visibility) + "</dd>" +
            "</dl>" + 
            "<div class=\"forecast\">";
            for ( var i = 0; i < forecast.items.length; i++)
            {
               var item = forecast.items[i], itemDate = new Date(item.date.substring(0,4),item.date.substring(5,7)-1,item.date.substring(8,10));
               html += "<div class=\"forecast-item\">" + 
               "<div class=\"date\">" + itemDate.toDateString().substring(0,3) + "</div><div class=\"conditions\">" + this._getWeatherIcon(item.conditions, 32) + "</div>" + 
               "<div class=\"temp-max\">" + item.maxTemp + "</div>" + "<div class=\"temp-min\">" + item.minTemp + "</div></div>";
            }
            html += "</div>" +
            "<div class=\"clear\"></div>" +
            "<div class=\"info\">" + this.msg("data.source") + " " + this.msg("data.updated", observations.pubDate).toString() + "</div>";
         }
         else
         {
            html = "<div class=\"msg\">" + this.msg("weather.noObs") + "</span>";
         }

         this.body.innerHTML = html;
         this.title.innerHTML = this.msg("weather.location-title", this.options.locationName);
      },

      /**
       * Data load failed
       * @method onDataLoadFailed
       */
      onDataLoadFailed: function BBCWeather_onDataLoadFailed()
      {
         this.body.innerHTML = '<div class="detail-list-item first-item last-item">' + this.msg("label.error") + '</div>';
      },

      /**
       * Convenience method for getting weather icon to use
       * @method _getWeatherIcon
       */
      _getWeatherIcon: function BBCWeather__getWeatherIcon(conditions, size)
      {
         var img = null, msgid = "conditions." + conditions.replace(" ", "-", "g"), title=this.msg(msgid);
         
         switch (conditions)
         {
         case "sunny":
            img = "weather-clear.png";
            break;
         case "sunny intervals":
            img = "weather-few-clouds.png";
            break;
         case "partly cloudy":
            img = "weather-few-clouds.png";
            break;
         case "white cloud":
            img = "weather-overcast.png";
            break;
         case "grey cloud":
            img = "weather-overcast.png";
            break;
         case "light rain shower":
            img = "weather-showers-scattered.png";
            break;
         case "heavy rain shower":
            img = "weather-showers.png";
            break;
         case "drizzle":
            img = "weather-showers-scattered.png";
            break;
         case "light rain":
            img = "weather-showers-scattered.png";
            break;
         case "heavy rain":
            img = "weather-showers.png";
            break;
         case "heavy snow":
            img = "weather-snow.png";
            break;
         case "clear sky":
            img = "weather-clear-night.png";
            break;
         }
         
         if (img != null)
         {
            return "<img src=\"" + Alfresco.constants.URL_CONTEXT + "res/components/dashlets/weather-icons/" + size + "x" + size + "/" + img + "\" width=\"" + size + "\" height=\"" + size + "\" alt=\"" + title + "\" title=\"" + title + "\" />";
         }
         else if (title != msgid)
         {
            return "<span class=\"conditions\">" + $html(title) + "</span>";
         }
         else
         {
            return "<span class=\"conditions\">" + $html(conditions) + "</span>";
         }
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
      onConfigClick: function BBCWeather_onConfigClick(e)
      {
         var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);
         
         Event.stopEvent(e);
         
         if (!this.configDialog)
         {
            this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
            {
               width: "50em",
               templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlets/bbc-weather/config",
               actionUrl: actionUrl,
               onSuccess:
               {
                  fn: function BBCWeather_onConfig_callback(e)
                  {
                     // Refresh the data
                     var loc = Dom.get(this.configDialog.id + "-location-id").value;
                     this.options.location = loc;
                     this.refreshData();
                  },
                  scope: this
               },
               doSetupFormsValidation:
               {
                  fn: function BBCWeather_doSetupForm_callback(form)
                  {
                     var l = Dom.get(this.configDialog.id + "-location");
                     if (l != null)
                     {
                        l.value = this.options.locationName;
                     }
                     var lid = Dom.get(this.configDialog.id + "-location-id");
                     if (lid != null)
                     {
                        lid.value = this.options.location;
                     }
                     
                     // Use a XHRDataSource
                     var oDS = new YAHOO.util.XHRDataSource(Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlets/bbc-weather/locations");
                     // Set the responseType
                     oDS.responseType = YAHOO.util.XHRDataSource.TYPE_JSARRAY;
                     oDS.responseSchema = {fields : ["id", "name", "display"]};

                     // Instantiate the AutoComplete
                     var oAC = new YAHOO.widget.AutoComplete(this.configDialog.id + "-location", this.configDialog.id + "-location-names", oDS);
                     oAC.useShadow = true;
                     oAC.resultTypeList = false;
                     
                     // Custom formatter
                     oAC.formatResult = function(oResultData, sQuery, sResultMatch) {
                        if (oResultData.display)
                        {
                           return oResultData.display;
                        }
                        else
                        {
                           return oResultData.name
                        }
                     };
                     
                     // Define an event handler to populate a hidden form field
                     // when an item gets selected
                     var myHandler = function(sType, aArgs) {
                         var myAC = aArgs[0]; // reference back to the AC instance
                         var elLI = aArgs[1]; // reference to the selected LI element
                         var oData = aArgs[2]; // object literal of selected item's result data
                         
                         // update hidden form field with the selected item's ID
                         lid.value = oData.id;
                         
                         myAC.getInputEl().value = oData.display ? oData.display : oData.name; 
                     };
                     oAC.itemSelectEvent.subscribe(myHandler);
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
