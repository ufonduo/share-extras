{
   "numResults": ${results?size},
   "results": [
   <#list results as result>
   	<#assign qnamePath=result.qnamePath />
      {
         "name": "${qnamePath?substring(qnamePath?last_index_of('/') + 1)}",
         "path": "${result.qnamePath}",
         "parentPath": "${qnamePath?substring(0, qnamePath?last_index_of('/'))}",
         "parentNodeRef": "<#if result.parent??>${result.parent.nodeRef}</#if>",
         "nodeRef": "${result.nodeRef}"
      }<#if result_has_next>,</#if>
   </#list>
   ]
}