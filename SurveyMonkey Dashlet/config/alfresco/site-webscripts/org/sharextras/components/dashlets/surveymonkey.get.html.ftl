<script type="text/javascript">//<![CDATA[
   var dashlet = new Extras.dashlet.SurveyMonkey("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "surveyId": "${args.surveyId!''}",
      "title": "${args.title!''}",
      "usePanel": ${((args.usePanel!"0")=="1")?string}
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
   
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

<div class="dashlet surveymonkey-dashlet">
   <div class="surveymonkey-panel" id="${args.htmlid}-panel" style="display: none;">
      <div class="hd" id="${args.htmlid}-panel-hd"><#if args.title?? && args.title!="">${args.title}<#else>${msg("label.title")}</#if></div>
      <div class="bd" id="${args.htmlid}-panel-bd"></div>
      <div class="ft" id="${args.htmlid}-panel-ft"></div>
   </div>
   <div class="title" id="${args.htmlid}-title"><#if args.title?? && args.title!="">${args.title}<#else>${msg("label.title")}</#if></div>
   <div class="body" id="${args.htmlid}-body" <#if args.height??>style="height: ${args.height}px;"</#if>>
   </div>
</div>