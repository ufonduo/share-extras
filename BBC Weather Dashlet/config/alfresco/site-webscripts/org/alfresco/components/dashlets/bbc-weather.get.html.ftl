<div class="dashlet bbc-weather-dashlet">
   <div class="title">${msg("weather.title", location.name)?html}</div>
   <div class="body scrollableList">
   <div class="msg">
	<#if observations?exists>
	   <div class="summary">
	   <span><img src="${url.context}/components/dashlets/ext/bbc-weather/${observations.conditions?replace(' ','-')?html}.png" alt="${observations.conditions?html}" /></span>
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
	</div> <#-- end body -->
</div> <#-- end dashlet -->