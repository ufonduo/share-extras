{
   "nodeRef": "${poll.nodeRef}",
   "name": "${poll.properties.name}",
   "title": "${poll.properties.title}",
   "description": "${poll.properties.description}",
   "enabled": ${poll.properties["pm:enabled"]?string!true},
   "startDate": <#if poll.properties.from??>"${poll.properties.from?datetime?string("EEE, dd MMM yyyy HH:mm:ss z")}"<#else>null</#if>,
   "endDate": <#if poll.properties.to??>"${poll.properties.to?datetime?string("EEE, dd MMM yyyy HH:mm:ss z")}"<#else>null</#if>,
   "options": [ <#if options??><#list options as option>"${option}"<#if option_has_next>, </#if></#list></#if> ],
   "hasCreateChildrenPermission": ${hasCreateChildrenPermission?string},
   "isOwner": ${isOwner?string},
   "hasVoted": ${hasVoted?string}
   <#if pollResponse??>
   ,
   "pollResponse": "${pollResponse}"
   </#if>
}