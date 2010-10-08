<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.BBCWeather("${args.htmlid}").setOptions(
   {
      siteId: "${page.url.templateArgs.site!""}",
      componentId: "${instance.object.id}",
      location: <#if args.location??>${args.location?number?c}<#else>${defaultLocation?c}</#if>
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>
<div class="dashlet bbc-weather-dashlet">
   <div class="title">${msg("weather.title", location!"")?html}</div>
   <div class="toolbar">
      <a class="theme-color-1" href="#" id="${args.htmlid}-configure-link">${msg("label.configure")}</a>
   </div>
   <div id="${args.htmlid}-body" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>></div>
</div> <#-- end dashlet -->