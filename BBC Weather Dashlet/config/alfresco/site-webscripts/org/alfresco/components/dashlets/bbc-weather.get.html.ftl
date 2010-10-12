<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.BBCWeather("${args.htmlid}").setOptions(
   {
      siteId: "${page.url.templateArgs.site!""}",
      componentId: "${instance.object.id}",
      location: <#if args.location?? && args.location?number gt 0>${args.location?number?c}<#else>${defaultLocation?number?c}</#if>
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>
<div class="dashlet bbc-weather-dashlet">
   <div id="${args.htmlid}-title" class="title">${msg("weather.title")}</div>
   <div class="toolbar">
      <a class="theme-color-1" href="#" id="${args.htmlid}-configure-link">${msg("label.configure")}</a>
   </div>
   <div id="${args.htmlid}-body" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>></div>
</div> <#-- end dashlet -->