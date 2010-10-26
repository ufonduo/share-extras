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
<#local tweet = tweet?replace(m, '<a href="http://search.twitter.com/search?q=%23' + m?groups[1] + '">' + m + '</a>')>
</#list>
<#return tweet>
</#function>
<#function formatDate d>
<#return d?string("d MMM, yyyy HH:mm:ss")>
</#function>

<#if results??>
<#if results?size &gt; 0>
   <#list results as t>
      <#assign userLink><a href="http://twitter.com/${t.from_user?url}" title="${t.from_user?html}" class="theme-color-1">${t.from_user?html}</a></#assign>
      <#assign postedLink><a href="http://twitter.com/${t.from_user?url}/status/${t.id_str?url}">${formatDate(t.created_at?datetime("EEE, dd MMM yyyy HH:mm:ss Z"))}</a></#assign>
      <div class="list-tweet detail-list-item <#if t_index = 0>first-item<#elseif !t_has_next>last-item</#if>">
         <div class="user-icon"><a href="http://twitter.com/${t.from_user?url}" title="${t.from_user?html}"><img src="${t.profile_image_url}" alt="${t.from_user?html}" width="48" height="48" /></a></div>
         <div class="tweet">
         <p><strong>${userLink}</strong>: ${formatTweet(t.text)}</p>
         <div class="tweet-details">${msg("text.tweetDetails", postedLink, t.source?replace("&lt;", "<")?replace("&gt;", ">")?replace("&quot;", '"'))}</div>
         </div>
      </div>
   </#list>
<#else>
      <div class="detail-list-item first-item last-item">
         <span>${msg("label.noTweets")}</span>
      </div>
</#if>
<#else>
<div class="msg" style="margin: -8px 0">${msg("error.http", status)}</div>
</#if>