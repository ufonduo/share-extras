<!--[if IE]>
<iframe id="yui-history-iframe" src="${url.context}/res/yui/history/assets/blank.html"></iframe> 
<![endif]-->
<input id="yui-history-field" type="hidden" />

<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
   new Fme.JavascriptConsole("${el}").setMessages(${messages});
//]]></script>
</script>

<div id="${el}-body" class="javascript-console">

	<div id="${el}-main" class="hidden">
	    <div class="buttonbar">
	    	<div class="scriptloader">
				<div id="${el}-scriptmanager"></div>
	    	</div>
			${msg("label.run.with")} <b>var space = </b>
			<span id="${el}-pathField" name="pathField" value=""></span> 	
			<input id="${el}-nodeRef" type="hidden" name="spaceNodeRef" value=""/>
			<button id="${el}-selectDestination-button" tabindex="0">${msg("button.select")}</button>
		</div>
		<div>
			<div class="header-bar">${msg("label.input")}</div>
			<textarea id="${el}-jsinput" name="jsinput" cols="80" rows="22" class="jsbox">var nodes = search.luceneSearch("TEXT:alfresco");
print(nodes);</textarea>
		</div>
		<div class="execute-buttonbar">
			<button type="submit" name="${el}-execute-button" id="${el}-execute-button">${msg("button.execute")}</button>
			 ${msg("label.execute.key")}
		</div>
	    <div>
			<div class="header-bar">${msg("label.output")}</div>
		    <textarea id="${el}-jsoutput" cols="80" rows="18" class="jsbox"></textarea>
	    </div>
	</div>
</div>
