<#macro dateFormat date>${date?datetime?iso_utc}</#macro>
<#escape x as jsonUtils.encodeJSONString(x)>
{
   "nodeRef": "${poll.nodeRef}",
   "name": "${poll.properties.name}",
   "title": "${poll.properties.title}",
   "description": "${poll.properties.description}",
   "enabled": ${poll.properties["pm:enabled"]?string!true},
   "startDate": <#if poll.properties.from??>"<@dateFormat poll.properties.from />"<#else>null</#if>,
   "endDate": <#if poll.properties.to??>"<@dateFormat poll.properties.to />"<#else>null</#if>,
   "options": [ <#if options??><#list options as option>"${option}"<#if option_has_next>, </#if></#list></#if> ],
   "hasCreateChildrenPermission": ${hasCreateChildrenPermission?string},
   "isOwner": ${isOwner?string},
   "hasVoted": ${hasVoted?string}
   <#if pollResponse??>
   ,
   "pollResponse": "${pollResponse}"
   </#if>
}
</#escape>