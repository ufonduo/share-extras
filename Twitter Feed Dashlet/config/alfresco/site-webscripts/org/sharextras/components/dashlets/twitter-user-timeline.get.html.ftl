<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.TwitterUserTimeline("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "twitterUser": "${(args.twitterUser!"")?js_string}",
      "defaultTwitterUser": "${(defaultTwitterUser!"")?js_string}",
      "pageSize": ${(pageSize!20)?c},
      "checkInterval": ${(config.script["twitter-user-timeline"].checkInterval!0)?number?c}
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>

<div class="dashlet twitter-user-timeline">
   <div class="title" id="${args.htmlid}-title"><#if twitterUser?? && twitterUser != "">${msg("header.userTimeline", twitterUser!'')}<#else>${msg("header.timeline")}</#if></div>
   <#if hasConfigPermission>
      <div class="toolbar">
         <a id="${args.htmlid}-configure-link" class="theme-color-1" title="${msg('link.configure')}" href="">${msg("link.configure")}</a>
      </div>
   </#if>
   <div id="${args.htmlid}-body" class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
      <div id="${args.htmlid}-notifications" class="notifications"></div>
      <div id="${args.htmlid}-timeline" class="timeline"></div>
      <div id="${args.htmlid}-buttons" class="buttons"><input type="button" id="${args.htmlid}-btn-more" value="${msg('button.more')}" /></div>
   </div>
</div>