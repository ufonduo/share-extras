<#function formatTweet tweet>
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
<#local tweet = tweet?replace(m, '<a href="http://twitter.com/search?q=%23' + m?groups[1] + '">' + m + '</a>')>
</#list>
<#return tweet>
</#function>
<#function formatDate d>
<#return d?string("d MMM, yyyy HH:mm:ss")>
</#function>

<#if tweets??>
<#if tweets?size &gt; 0>
<#if (username?index_of("/") > 0)>
   <#list tweets as t> <#-- List feed -->
      <#assign userLink><a href="http://twitter.com/${t.user.screen_name?html}" title="${t.user.name?html}" class="theme-color-1">${t.user.screen_name?html}</a></#assign>
      <#assign postedLink><a href="http://twitter.com/${t.user.screen_name?html}/status/${t.id?c}">${formatDate(t.created_at?datetime("EEE MMM dd HH:mm:ss Z yyyy"))}</a></#assign>
      <div class="list-tweet detail-list-item <#if t_index = 0>first-item<#elseif !t_has_next>last-item</#if>">
         <div class="user-icon"><a href="http://twitter.com/${t.user.screen_name?html}" title="${t.user.name?html}"><img src="${t.user.profile_image_url}" alt="${t.user.screen_name?html}" width="48" height="48" /></a></div>
         <div class="tweet">
         <p><strong>${userLink}</strong>: ${formatTweet(t.text)}</p>
         <div class="tweet-details">${msg("text.tweetDetails", postedLink, t.source)}</div>
         </div>
      </div>
   </#list>
<#else>
   <#list tweets as t> <#-- User feed -->
      <#assign postedLink><a href="http://twitter.com/${t.user.screen_name?html}/status/${t.id?c}">${formatDate(t.created_at?datetime("EEE MMM dd HH:mm:ss Z yyyy"))}</a></#assign>
      <div class="detail-list-item <#if t_index = 0>first-item<#elseif !t_has_next>last-item</#if>">
         <p>${formatTweet(t.text)}</p>
         <div class="tweet-details">${msg("text.tweetDetails", postedLink, t.source)}</div>
      </div>
   </#list>
</#if>
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
