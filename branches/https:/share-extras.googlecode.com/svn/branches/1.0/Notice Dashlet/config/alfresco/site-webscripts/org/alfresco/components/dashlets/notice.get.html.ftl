<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.Notice("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "title": "<#if args.title?exists>${args.title?js_string}</#if>",
      "text": "<#if args.text?exists>${args.text?js_string}</#if>"
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>

<div class="dashlet notice-dashlet">
   <div class="title" id="${args.htmlid}-title"><#if args.title?? && args.title != "">${args.title}<#else>${msg("notice.defaultTitle")}</#if></div>
   <#if hasConfigPermission>
   <div class="toolbar">
      <a id="${args.htmlid}-configure-link" class="theme-color-1" title="${msg('link.configure')}" href="">${msg("link.configure")}</a>
   </div>
   </#if>
   <div class="body scrollableList"<#if args.height??> style="height: ${args.height}px;"</#if>>
      <div id="${args.htmlid}-text" class="text-content">
         <#if args.text?? && args.text != "">${args.text}<#else><p>${msg("notice.defaultText")}</p></#if>
      </div>
   </div>
</div>