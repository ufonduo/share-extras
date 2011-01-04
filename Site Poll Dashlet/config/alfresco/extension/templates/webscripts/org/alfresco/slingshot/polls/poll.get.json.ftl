{
   "nodeRef": "${poll.nodeRef}",
   "name": "${poll.properties.name}",
   "title": "${poll.properties.title}",
   "description": "${poll.properties.description}",
   "enabled": ${poll.properties["pm:enabled"]?string!true},
   "startDate": <#if poll.properties.from??>"${poll.properties.from?datetime?string("EEE, dd MMM yyyy HH:mm:ss z")}"<#else>null</#if>,
   "endDate": <#if poll.properties.to??>"${poll.properties.to?datetime?string("EEE, dd MMM yyyy HH:mm:ss z")}"<#else>null</#if>,
   "options": [ <#if poll.properties["pm:options"]??><#list poll.properties["pm:options"] as option><#list option?split(",") as suboption>"${suboption}"<#if suboption_has_next>, </#if></#list><#if option_has_next>, </#if></#list></#if> ],
   "hasPermission": ${hasPermission?string},
   "hasVoted": ${hasVoted?string}
   <#if pollResponse??>
   ,
   "pollResponse": "${pollResponse}"
   </#if>
}