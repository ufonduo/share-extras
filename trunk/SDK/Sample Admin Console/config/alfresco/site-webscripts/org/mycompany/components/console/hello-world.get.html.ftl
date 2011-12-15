<#-- Hidden iframe is used by yui-history module -->
<!--[if IE]>
<iframe id="yui-history-iframe" src="${url.context}/res/yui/history/assets/blank.html"></iframe> 
<![endif]-->
<input id="yui-history-field" type="hidden" />

<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
    new MyCompany.ConsoleHelloWorld("${el}").setMessages(${messages});
//]]></script>
</script>

<div id="${el}-body" class="sample-console">
    <div id="${el}-form" class="hidden">
        <div class="header-bar">
            <div class="title">${msg("label.title-sample")}</div>
        </div>
        <div>${msg("label.prompt")}</div>
        <div class="sample-console-buttons">
            <button type="submit" name="${el}-test-button" id="${el}-test-button">${msg("button.test")}</button>
        </div>
    </div>
</div>
