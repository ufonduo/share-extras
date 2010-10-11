{
   "location" :
   {
      "id" : ${location.id?html},
      "name" : "${location.name?html}"
   },
   "observations" :
   <#if observations?exists>
   {
      "conditions" : "${observations.conditions?trim?js_string}",
      "temperature" : "${observations.temperature?js_string}",
      "windDir" : "${observations.windDir?js_string}",
      "windSpeed" : "${observations.windSpeed?js_string}",
      "humidity" : "${observations.humidity?js_string}",
      "pressure" : "${observations.pressure?js_string}",
      "pressureTrend" : "${observations.pressureTrend?js_string}",
      "visibility" : "${observations.visibility?js_string}",
      "pubDate" : "${observations.pubDate?datetime?string("EEE, dd MMM yyyy HH:mm:ss z")}",
      "lat" : "${observations.lat?js_string}",
      "lon" : "${observations.lon?js_string}"
   },
   <#else>
   null,
   </#if>
   "forecast" : null
}