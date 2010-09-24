<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.TwitterUserTimeline("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "twitterUser": "${args.twitterUser!''}"
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>

<div class="dashlet twitter-user-timeline">
   <div class="title"><#if twitterUser?? && twitterUser != "">${msg("header.userTimeline", twitterUser!'')}<#else>${msg("header.timeline")}</#if></div>
   <#if hasConfigPermission>
      <div class="toolbar">
         <a id="${args.htmlid}-configure-link" class="theme-color-1" title="${msg('link.configure')}" href="">${msg("link.configure")}</a>
      </div>
   </#if>
   <div class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
<#if tweets??>
<#if tweets?size &gt; 0>
   <#list tweets as t>
      <#-- Not currently used -->
      <#-- <#assign postedBy><a href="http://twitter.com/${t.user.screen_name?html}" class="theme-color-1">${t.user.name?html}</a></#assign> -->
      <div class="detail-list-item <#if t_index = 0>first-item<#elseif !t_has_next>last-item</#if>">
         <h4>${(t.text)?html}</h4>
         <div class="tweet-details">${msg("text.tweetDetails", t.created_at?datetime("EEE MMM dd HH:mm:ss Z yyyy")?string("d MMM, yyyy HH:mm:ss"), t.source)}</div>
      </div>
   </#list>
<#else>
      <div class="detail-list-item first-item last-item">
         <span>${msg("label.noTweets")}</span>
      </div>
</#if>
<#else>
<div class="msg"><p>${msg("error.http", status)}</p></div>
</#if>
   </div>
</div>