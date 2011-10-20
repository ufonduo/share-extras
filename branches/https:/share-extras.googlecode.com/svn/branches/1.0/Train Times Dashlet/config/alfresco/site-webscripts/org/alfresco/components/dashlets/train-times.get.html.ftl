<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.TrainTimes("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "station": "${args.station!''}",
      "via": "${args.via!''}"
   }).setMessages(
      ${messages}
   );
//]]></script>

<div class="dashlet train-times-dashlet">
   <div class="title" id="${args.htmlid}-title">${msg("header.default")}</div>
   <div class="refresh"><a id="${args.htmlid}-refresh" href="#">&nbsp;</a></div>
<#if hasConfigPermission>
   <div class="toolbar">
      <a class="theme-color-1" href="#" id="${args.htmlid}-configure-link">${msg("link.configure")}</a>
   </div>
</#if>
   <div class="body" id="${args.htmlid}-body">
      <div class="updates" id="${args.htmlid}-updates"></div>
      <div class="trains" id="${args.htmlid}-trains"></div>
      <div class="message" id="${args.htmlid}-message"></div>
   </div>
</div>
