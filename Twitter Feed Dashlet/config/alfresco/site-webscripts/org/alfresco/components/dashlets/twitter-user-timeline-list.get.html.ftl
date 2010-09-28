<#macro printTweet tweet>
<#local res = tweet?matches("https?://\\S+[^\\s.]")>
<#list res as m>
<#local tweet = tweet?replace(m, '<a href="' + m + '">' + m + '</a>')>
</#list>
<#local res = tweet?matches("@(\\w+)")>
<#list res as m>
<#local tweet = tweet?replace(m, '<a href="http://twitter.com/' + m?groups[1] + '">' + m + '</a>')>
</#list>
<#local res = tweet?matches("#(\\w+)")>
<#list res as m>
<#local tweet = tweet?replace(m, '<a href="http://search.twitter.com/search?q=%23' + m?groups[1] + '">' + m + '</a>')>
</#list>
${tweet}
</#macro>

<#if tweets??>
<#if tweets?size &gt; 0>
   <#list tweets as t>
      <#-- Not currently used -->
      <#-- <#assign postedBy><a href="http://twitter.com/${t.user.screen_name?html}" class="theme-color-1">${t.user.name?html}</a></#assign> -->
      <div class="detail-list-item <#if t_index = 0>first-item<#elseif !t_has_next>last-item</#if>">
         <h4><@printTweet tweet=t.text?html /></h4>
         <div class="tweet-details">${msg("text.tweetDetails", '<a href="http://twitter.com/' + t.user.screen_name?html + '/status/' + t.id + '">' + t.created_at?datetime("EEE MMM dd HH:mm:ss Z yyyy")?string("d MMM, yyyy HH:mm:ss") + '</a>', t.source)}</div>
      </div>
   </#list>
<#else>
      <div class="detail-list-item first-item last-item">
         <span>${msg("label.noTweets")}</span>
      </div>
</#if>
<#elseif status?number==401>
<div class="msg" style="margin: -8px 0">${msg("error.http.401")}</div>
<#elseif status?number==404>
<div class="msg" style="margin: -8px 0">${msg("error.http.404")}</div>
<#else>
<div class="msg" style="margin: -8px 0">${msg("error.http", status)}</div>
</#if>