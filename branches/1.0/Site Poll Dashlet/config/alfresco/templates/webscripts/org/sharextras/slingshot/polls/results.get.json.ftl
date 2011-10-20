<#escape x as jsonUtils.encodeJSONString(x)>
{
    "totalVotes": ${totalVotes?c},
    "responses": [
    <#list responses as response>
        {
            "response": "${response.response}",
            "votes": ${response.votes?c}<#if (totalVotes > 0)>,
            "share": ${response.share?c}</#if>
        }
        <#if response_has_next>,</#if>
    </#list>
    ]
}
</#escape>