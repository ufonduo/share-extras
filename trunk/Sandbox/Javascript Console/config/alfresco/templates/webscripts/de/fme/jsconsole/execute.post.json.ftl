{
	"result" : ${result!"[]"},
<#escape x as jsonUtils.encodeJSONString(x)>
	"output" : [
		<#list output as line>
		"${line!""?js_string}"<#if line_has_next>,</#if> 
		</#list> 
</#escape>
	]
}
