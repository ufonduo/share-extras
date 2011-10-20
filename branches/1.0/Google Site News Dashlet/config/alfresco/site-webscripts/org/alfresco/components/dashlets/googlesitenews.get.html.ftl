<script type="text/javascript">//<![CDATA[
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>
<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.GoogleSiteNews("${args.htmlid}").setOptions(
   {
      "componentId": "${instance.object.id}",
      "searchTerm": "${searchterm?js_string}", 
      "limit": "${limit}",
      "julianToday": "${julianToday}",
      "enabledSearchers": [<#list enabledsearchers as es>"${es}"<#if es_has_next>,</#if></#list>]      
   });
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
   //Load google components
   google.load('search', '1');
//]]></script>
<div class="dashlet googlesitenews">
   <div class="title">${msg("header.title")}</div>
   <#if userIsSiteManager>
   <div class="toolbar">
       <a href="#" id="${args.htmlid}-configGoogleSiteNews-link" class="theme-color-1">${msg("label.configure")}</a>
   </div>
   </#if>
   <div class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
</script>   
    <div id="${args.htmlid}-searchcontrol">Loading...</div> 
    <div id="${args.htmlid}-searchform" style="display:none;">Loading</div>
   </div>
</div>