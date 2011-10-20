{
   "stations": [
   <#list stations as s>
      {
         "code": "${s[0]}",
         "name": "${s[1]}",
         "type": ${s[2]}
      }<#if s_has_next>,</#if>
   </#list>
   ]
}