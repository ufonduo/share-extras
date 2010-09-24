<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.SitePoll("${args.htmlid}").setOptions(
   {
      "siteId": "${page.url.templateArgs.site!""}",
      "componentId": "${instance.object.id}",
      "nodeRef": "<#if nodeRef?exists>${nodeRef}<#else></#if>", 
      "hasVoted": "<#if hasVoted?exists>${hasVoted?string}<#else></#if>"      
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
   <div class="body" <#if args.height??>style="height: ${args.height}px;"</#if>>
   <div class="msg">
   <#if args.nodeRef??>
   <h3 class="pollName"><#if pollTitle??>${pollTitle}<#else>${pollName}</#if></h3>
   <#if !hasVoted>
   <#if (options?size > 0)>
   <form action="#" method="post" id="${args.htmlid}-form">
   <div id="${args.htmlid}-buttongroup" class="yui-buttongroup poptions">
   <#list options as option>
      <div class="poption"><input type="radio" name="response" value="${option}" /></div>
   </#list>
   </div>
   <input type="submit" value="${msg("button.submit")}" name="action" id="${args.htmlid}-submit"/>
   </form>
   <#else>
   </#if>
   <#else>
   <p>${msg("msg.thankyou")}</p>
   </#if>
   <#else>
   ${msg("msg.notConfigured")}
   </#if>
   </div>
   </div>
</div>
