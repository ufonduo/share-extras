<script type="text/javascript">//<![CDATA[
   var dashlet = new Alfresco.dashlet.Notice("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "title": "<#if args.title?exists>${args.title?js_string}</#if>",
      "text": "<#if args.text?exists>${args.text?js_string}</#if>"
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

<div class="dashlet notice-dashlet">
   <div class="title" id="${args.htmlid}-title"><#if args.title?? && args.title != "">${args.title}<#else>${msg("notice.defaultTitle")}</#if></div>
   <div class="body scrollableList"<#if args.height??> style="height: ${args.height}px;"</#if>>
      <div id="${args.htmlid}-text" class="text-content">
         <#if args.text?? && args.text != "">${args.text}<#else><p>${msg("notice.defaultText")}</p></#if>
      </div>
   </div>
</div>