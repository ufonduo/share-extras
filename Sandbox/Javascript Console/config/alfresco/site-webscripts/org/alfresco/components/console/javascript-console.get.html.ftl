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
	    	<div class="scriptmenu">
				<div id="${el}-scriptload"></div>
	    	</div>
	    	<div class="scriptmenu">
				<div id="${el}-scriptsave"></div>
	    	</div>
	    	<div class="scriptmenu">
				<div id="${el}-documentation"></div>
	    	</div>
	    	
			${msg("label.run.with")} <b>var space = </b>
			<span id="${el}-pathField" name="pathField" value=""></span> 	
			<input id="${el}-nodeRef" type="hidden" name="spaceNodeRef" value=""/>
			<button id="${el}-selectDestination-button" tabindex="0">${msg("button.select")}</button>
		</div>
		<div>
			<div class="header-bar">${msg("label.input")}</div>
			<div id="${el}-editorResize">
				<textarea id="${el}-jsinput" name="jsinput" cols="80" rows="22" class="jsbox"></textarea>
			</div>
		</div>
		<div class="execute-buttonbar">
			<button type="submit" name="${el}-execute-button" id="${el}-execute-button">${msg("button.execute")}</button>
			 ${msg("label.execute.key")}
		</div>
	    <div>
			<div class="header-bar">${msg("label.output")}</div>
  	        <div id="${el}-datatable" style="display:none;"></div>
  	        <div class="exportButton">
  	        	<button id="${el}-exportResults-button" tabindex="0">${msg("button.export.results")}</button>
  	        </div>
		    <div id="${el}-jsoutput" class="jsbox"></div>
	    </div>
	</div>
</div>
