<script type="text/javascript">//<![CDATA[
   var dashlet = new Alfresco.dashlet.BBCWeather("${args.htmlid}").setOptions(
   {
      componentId: "${instance.object.id}",
      location: <#if args.location?? && args.location?number gt 0>${args.location?number?c}<#else>${defaultLocation?number?c}</#if>,
      temperatureScale: "${args.tscale!'C'}"
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
   
   var editDashletEvent = new YAHOO.util.CustomEvent("onDashletConfigure");
   editDashletEvent.subscribe(dashlet.onConfigClick, dashlet, true);

   new Alfresco.widget.DashletTitleBarActions("${args.htmlid}").setOptions(
   {
      actions:
      [
<#if hasConfigPermission>
         {
            cssClass: "edit",
            eventOnClick: editDashletEvent,
            tooltip: "${msg("dashlet.edit.tooltip")?js_string}"
         },
</#if>
         {
            cssClass: "help",
            bubbleOnClick:
            {
               message: "${msg("dashlet.help")?js_string}"
            },
            tooltip: "${msg("dashlet.help.tooltip")?js_string}"
         }
      ]
   });
//]]></script>
<div class="dashlet bbc-weather-dashlet">
   <div id="${args.htmlid}-title" class="title">${msg("weather.title")}</div>
   <div id="${args.htmlid}-body" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>></div>
</div> <#-- end dashlet -->