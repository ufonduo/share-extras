<script type="text/javascript">//<![CDATA[
   var dashlet = new Alfresco.dashlet.TrainTimes("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "station": "${args.station!''}",
      "via": "${args.via!''}"
   }).setMessages(
      ${messages}
   );
   
   var editDashletEvent = new YAHOO.util.CustomEvent("onDashletConfigure");
   editDashletEvent.subscribe(dashlet.onConfigClick, dashlet, true);
   
   var refreshDashletEvent = new YAHOO.util.CustomEvent("onDashletRefresh");
   refreshDashletEvent.subscribe(dashlet.onRefresh, dashlet, true);

   new Alfresco.widget.DashletTitleBarActions("${args.htmlid}").setOptions(
   {
      actions:
      [
         {
            cssClass: "refresh",
            eventOnClick: refreshDashletEvent,
            tooltip: "${msg("dashlet.refresh.tooltip")?js_string}"
         },
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

<div class="dashlet train-times-dashlet">
   <div class="title" id="${args.htmlid}-title">${msg("header.default")}</div>
   <div class="body" id="${args.htmlid}-body">
      <div class="updates" id="${args.htmlid}-updates"></div>
      <div class="trains" id="${args.htmlid}-trains"></div>
      <div class="message" id="${args.htmlid}-message"></div>
   </div>
</div>
