{
    "totalVotes": ${jsonUtils.encodeJSONString(totalVotes)},
    "responses": [
    <#list responses as response>
        {
            "response": "${jsonUtils.encodeJSONString(response.response)}",
            "votes": ${jsonUtils.encodeJSONString(response.votes)}<#if (totalVotes > 0)>,
            "share": ${jsonUtils.encodeJSONString(response.share)}</#if>
        }
        <#if response_has_next>,</#if>
    </#list>
    ]
}