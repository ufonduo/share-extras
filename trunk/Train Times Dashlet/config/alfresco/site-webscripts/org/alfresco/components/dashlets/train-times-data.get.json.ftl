{
   "error": "${data.error}",
   "errorMsg": "${data.errorMsg}",
   "errorField": "${data.errorField}",
   "time": "${data.time}",
   "trains": [
   <#list data.trains as t>
      {
         "status": "${t[0]}",
         "time": "${t[1]}",
         "destination": "${t[2]}",
         "expected": "${t[3]}",
         "platform": "${t[4]}",
         "url": "${t[5]}"
      }<#if t_has_next>,</#if>
   </#list>
   ]
}