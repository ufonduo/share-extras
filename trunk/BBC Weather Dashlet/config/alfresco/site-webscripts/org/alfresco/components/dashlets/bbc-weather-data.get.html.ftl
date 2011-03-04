<div class="msg">
<#if observations?exists>
   <div class="summary">
   <span><@weather_icon observations.conditions?trim /></span>
   <span class="temperature">${observations.temperature?html}</span>
   </div>
   <dl class="obs">
   <dt>${msg("obs.wind")}</dt><dd>${observations.windSpeed?html}, ${observations.windDir?html}</dd>
   <dt>${msg("obs.humidity")}</dt><dd>${observations.humidity?html}</dd>
   <dt>${msg("obs.pressure")}</dt><dd>${observations.pressure?html}, ${observations.pressureTrend?html}</dd>
   <dt>${msg("obs.visibility")}</dt><dd>${observations.visibility?html}</dd>
   </dl>
   <p><em>${msg("data.source")} ${msg("data.updated", observations.pubDate?html)}</em></p>
<#else>
	${msg("weather.noObs")}
</#if>
</div> <#-- end msg -->
<#macro weather_icon conditions>
   <#if conditions == "sunny">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-clear.png" alt="${conditions?html}" />
   <#elseif conditions == "sunny intervals">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-few-clouds.png" alt="${conditions?html}" />
   <#elseif conditions == "white cloud">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-overcast.png" alt="${conditions?html}" />
   <#elseif conditions == "grey cloud">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-overcast.png" alt="${conditions?html}" />
   <#elseif conditions == "light rain shower">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-showers-scattered.png" alt="${conditions?html}" />
   <#elseif conditions == "heavy rain shower">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-showers.png" alt="${conditions?html}" />
   <#elseif conditions == "heavy rain">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-showers.png" alt="${conditions?html}" />
   <#elseif conditions == "light rain">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-showers-scattered.png" alt="${conditions?html}" />
   <#elseif conditions == "heavy snow">
      <img src="${url.context}/res/components/dashlets/weather-icons/64x64/weather-snow.png" alt="${conditions?html}" />
   <#else>
      ${conditions?html}
   </#if>
</#macro>