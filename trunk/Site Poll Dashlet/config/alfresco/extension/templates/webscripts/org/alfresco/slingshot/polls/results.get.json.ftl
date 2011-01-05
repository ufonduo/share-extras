{
    "totalVotes": ${jsonUtils.encodeJSONString(totalVotes)},
    "responses": [
    <#list responses as response>
        {
            "response": "${jsonUtils.encodeJSONString(response.response)}",
            "votes": ${jsonUtils.encodeJSONString(response.votes)},
            "share": ${jsonUtils.encodeJSONString(response.share)}
        }
        <#if response_has_next>,</#if>
    </#list>
    ]
}