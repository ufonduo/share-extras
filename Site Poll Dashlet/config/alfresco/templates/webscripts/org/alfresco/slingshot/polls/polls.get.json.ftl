<#escape x as jsonUtils.encodeJSONString(x)>
{
   "totalPolls" : ${polls.polls?size},
   "permissions":
   {
      "create": ${polls.container.hasPermission("CreateChildren")?string}
   },
   "polls":
   [
   <#list polls.polls?sort_by(['modified'])?reverse as p>
      <#assign poll = p.poll>
      {
         "nodeRef" : "${poll.nodeRef}",
         "name" : "${poll.name}",
         "title" : "<#if poll.properties.title?exists>${poll.properties.title}<#else>${poll.name}</#if>",
         <#-- Strip out any HTML tags -->
         "tags" : [
             <#list p.tags as tag>
                "${tag}"<#if tag_has_next>,</#if>
             </#list>  
           ],
         "createdOn": "${poll.properties.created?string("MMM dd yyyy, HH:mm:ss")}",
         <#if p.createdBy??>
            <#assign createdBy = (p.createdBy.properties.firstName + " " + p.createdBy.properties.lastName)?trim>
            <#assign createdByUser = p.createdBy.properties.userName>
         <#else>
            <#assign createdBy="">
            <#assign createdByUser="">
         </#if>
         "createdBy": "${createdBy}",
         "createdByUser": "${createdByUser}",
         "modifiedOn": "${poll.properties.modified?string("MMM dd yyyy, HH:mm:ss")}",
         <#if p.modifiedBy??>
            <#assign modifiedBy = (p.modifiedBy.properties.firstName + " " + p.modifiedBy.properties.lastName)?trim>
            <#assign modifiedByUser = p.modifiedBy.properties.userName>
         <#else>
            <#assign modifiedBy="">
            <#assign modifiedByUser="">
         </#if>
         "modifiedBy": "${modifiedBy}",
         "modifiedByUser": "${modifiedByUser}",
         "permissions":
         {
            "edit": ${poll.hasPermission("Write")?string},
            "delete": ${poll.hasPermission("Delete")?string}
         }
      }<#if p_has_next>,</#if>
   </#list>
   ]
}
</#escape>