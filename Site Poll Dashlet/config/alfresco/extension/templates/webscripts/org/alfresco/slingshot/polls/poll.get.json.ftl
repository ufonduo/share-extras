{
   nodeRef: "${poll.nodeRef}",
   name: "${poll.properties.name}",
   title: "${poll.properties.title}",
   description: "${poll.properties.description}",
   options: [ <#if poll.properties["pm:options"]??><#list poll.properties["pm:options"] as option>"${option}"<#if option_has_next>, </#if></#list></#if> ],
   hasVoted: ${hasVoted?string}
}