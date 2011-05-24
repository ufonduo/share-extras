[
   <#list matches as match>
   {
      "id" : ${match.id?c},
      "name" : "${match.name}",
      "display" : "${match.display}"
   }
   <#if match_has_next>,</#if>
   </#list>
]