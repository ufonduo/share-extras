<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.TwitterSearch("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "searchTerm": "${searchTerm!''}",
      "defaultSearchTerm": "${defaultTwitterUser!""}",
      "numResults": "${numResults!20}"
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>

<div class="dashlet twitter-user-timeline">
   <div class="title" id="${args.htmlid}-title">${msg("header.search", searchTerm!'')}</div>
   <#if hasConfigPermission>
      <div class="toolbar">
         <a id="${args.htmlid}-configure-link" class="theme-color-1" title="${msg('link.configure')}" href="">${msg("link.configure")}</a>
      </div>
   </#if>
   <div id="${args.htmlid}-searchResults" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
   </div>
</div>