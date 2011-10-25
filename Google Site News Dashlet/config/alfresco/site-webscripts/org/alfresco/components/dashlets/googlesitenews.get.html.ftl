<script type="text/javascript">//<![CDATA[
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>
<script type="text/javascript">//<![CDATA[
   var googlesitenews = new Alfresco.dashlet.GoogleSiteNews("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "searchTerm": "${searchterm?js_string}", 
      "limit": "${limit}",
      "julianToday": "${julianToday}",
      "enabledSearchers": [<#list enabledsearchers as es>"${es}"<#if es_has_next>,</#if></#list>]      
   });
   
   //Config event handler
   var configGoogleSiteNewsEvent = new YAHOO.util.CustomEvent("onConfigFeedClick");
   configGoogleSiteNewsEvent.subscribe(googlesitenews.onConfigGoogleSiteNewsClick, googlesitenews, true);
   
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
   new Alfresco.widget.DashletTitleBarActions("${args.htmlid}").setOptions(
   {
      actions:
      [
<#if userIsSiteManager>
         {
            cssClass: "edit",
            eventOnClick: configGoogleSiteNewsEvent,
            tooltip: "${msg("dashlet.googlesitenews.edit.tooltip")?js_string}"
         },
</#if>
         {
            cssClass: "help",
            bubbleOnClick:
            {
               message: "${msg("dashlet.googlesitenews.help")?js_string}"
            },
            tooltip: "${msg("dashlet.googlesitenews.help.tooltip")?js_string}"
         }
      ]
   });
   //Load google components
   google.load('search', '1');
//]]></script>
<div class="dashlet googlesitenews">
   <div class="title">${msg("header.title")}</div>
   <div class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
</script>   
    <div id="${args.htmlid}-searchcontrol">Loading...</div> 
    <div id="${args.htmlid}-searchform" style="display:none;">Loading</div>
   </div>
</div>