<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.TwitterSearch("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "searchTerm": "${searchTerm!''}",
      "defaultSearchTerm": "${defaultSearchTerm!""}",
      "pageSize": ${(pageSize!20)?c}
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>

<div class="dashlet twitter-user-timeline">
   <div class="title" id="${args.htmlid}-title">${msg("header.search", (searchTerm!'')?url, searchTerm!'')}</div>
   <#if hasConfigPermission>
      <div class="toolbar">
         <a id="${args.htmlid}-configure-link" class="theme-color-1" title="${msg('link.configure')}" href="">${msg("link.configure")}</a>
      </div>
   </#if>
   <div id="${args.htmlid}-body" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
      <div id="${args.htmlid}-notifications" class="notifications"></div>
      <div id="${args.htmlid}-searchResults" class="timeline"></div>
      <div id="${args.htmlid}-buttons" class="buttons"><input type="button" id="${args.htmlid}-btn-more" value="${msg('button.more')}" /></div>
   </div>
</div>
