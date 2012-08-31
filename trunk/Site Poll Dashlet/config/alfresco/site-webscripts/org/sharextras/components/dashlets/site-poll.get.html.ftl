<script type="text/javascript">//<![CDATA[
   var dashlet = new Alfresco.dashlet.SitePoll("${args.htmlid}").setOptions(
   {
      "siteId": "${page.url.templateArgs.site!''}",
      "componentId": "${instance.object.id}",
      "nodeRef": "${args.nodeRef!''}"
   }).setMessages(
      ${messages}
   );
   
   var editDashletEvent = new YAHOO.util.CustomEvent("onDashletConfigure");
   editDashletEvent.subscribe(dashlet.onConfigClick, dashlet, true);

   new Alfresco.widget.DashletTitleBarActions("${args.htmlid}").setOptions(
   {
      actions:
      [
<#if userIsSiteManager>
         {
            cssClass: "edit",
            eventOnClick: editDashletEvent,
            tooltip: "${msg("dashlet.edit.tooltip")?js_string}"
         },
</#if>
         {
            cssClass: "help",
            bubbleOnClick:
            {
               message: "${msg("dashlet.help")?js_string}"
            },
            tooltip: "${msg("dashlet.help.tooltip")?js_string}"
         }
      ]
   });
//]]></script>

<div class="dashlet poll">
   <div class="title">${msg("header.poll")}</div>
   <div class="body">
   <div class="msg">
   <h3 class="pollName" id="${args.htmlid}-poll-title"></h3>
   <div id="${args.htmlid}-poll-body">
   <p id="${args.htmlid}-poll-message" style="display: none;"></p>
   <form action="#" method="post" id="${args.htmlid}-form" class="poll-form">
   <div id="${args.htmlid}-poll-options" class="poptions"></div>
   <input type="submit" value="${msg("button.submit")}" name="action" id="${args.htmlid}-submit"/>
   </form>
   <div id="${args.htmlid}-results" class="pollResults" style="display: none;"></div>
   <p id="${args.htmlid}-poll-links" class="poll-links" style="display: none;"><a id="${args.htmlid}-toggle-results-link" href="#">${msg("label.showResults")}</a></p>
   </div>
   </div>
   </div>
</div>
