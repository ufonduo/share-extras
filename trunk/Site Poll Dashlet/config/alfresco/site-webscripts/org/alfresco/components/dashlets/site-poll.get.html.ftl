<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.SitePoll("${args.htmlid}").setOptions(
   {
      "siteId": "${page.url.templateArgs.site!''}",
      "componentId": "${instance.object.id}",
      "nodeRef": "${args.nodeRef!''}"
   }).setMessages(
      ${messages}
   );
//]]></script>

<div class="dashlet poll">
   <div class="title">${msg("header.poll")}</div>
<#if userIsSiteManager>
   <div class="toolbar">
      <a class="theme-color-1" href="#" id="${args.htmlid}-configure-link">${msg("label.configure")}</a>
   </div>
</#if>
   <div class="body">
   <div class="msg">
   <h3 class="pollName" id="${args.htmlid}-poll-title"></h3>
   <div id="${args.htmlid}-poll-body">
   <p id="${args.htmlid}-poll-message" style="display: none;"></p>
   <form action="#" method="post" id="${args.htmlid}-form" class="poll-form">
   <div id="${args.htmlid}-poll-options" class="poptions"></div>
   <input type="submit" value="${msg("button.submit")}" name="action" id="${args.htmlid}-submit"/>
   </form>
   <div id="${args.htmlid}-results" class="pollResults" style="display: none;"></div>
   <p id="${args.htmlid}-poll-links" class="poll-links" style="display: none;"><a id="${args.htmlid}-toggle-results-link" href="#">${msg("label.showResults")}</a></p>
   </div>
   </div>
   </div>
</div>
