{
<#escape x as jsonUtils.encodeJSONString(x)>
	"result" : "${result!""?js_string}",
	"output" : [
		<#list output as line>
		"${line!""?js_string}"<#if line_has_next>,</#if> 
		</#list> 
	]
</#escape>
}
