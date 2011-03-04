<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.SitePoll("${args.htmlid}").setOptions(
   {
      "siteId": "${page.url.templateArgs.site!""}",
      "componentId": "${instance.object.id}",
      "nodeRef": "<#if nodeRef?exists>${nodeRef}<#else></#if>", 
      "hasVoted": <#if hasVoted?exists>${hasVoted?string}<#else>false</#if>
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
   <#if args.nodeRef??>
   <#if pollName??>
   <h3 class="pollName"><#if pollTitle??>${pollTitle}<#else>${pollName}</#if></h3>
   <div id="${args.htmlid}-poll-body">
   <#if !hasVoted>
   <#if pollEnabled>
   <#if hasPermission>
   <#if (options?size > 0)>
   <p id="${args.htmlid}-poll-message" style="display: none;"></p>
   <form action="#" method="post" id="${args.htmlid}-form">
   <div id="${args.htmlid}-buttongroup" class="yui-buttongroup poptions">
   <#list options as option>
      <div class="poption"><input type="radio" name="response" value="${option}" /></div>
   </#list>
   </div>
   <input type="submit" value="${msg("button.submit")}" name="action" id="${args.htmlid}-submit"/>
   </form>
   </#if>
   <#else>
   <p id="${args.htmlid}-poll-message">${msg("msg.noPermission")}</p>
   </#if>
   <#else>
   <p id="${args.htmlid}-poll-message">${msg("msg.notEnabled")}</p>
   </#if>
   <#else>
   <p id="${args.htmlid}-poll-message">${msg("msg.thankyou", pollResponse)}</p>
   </#if>
   <div id="${args.htmlid}-results" class="pollResults" style="display: none;"></div>
   <p id="${args.htmlid}-poll-links" style="display: none;"><a id="${args.htmlid}-toggle-results-link" href="#">${msg("label.showResults")}</a></p>
   </div>
   <#else>
   ${msg("msg.notFound")}
   </#if>
   <#else>
   ${msg("msg.notConfigured")}
   </#if>
   </div>
   </div>
</div>
