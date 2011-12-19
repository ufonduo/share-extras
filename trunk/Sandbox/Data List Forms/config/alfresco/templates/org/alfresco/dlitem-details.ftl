<#include "include/alfresco-template.ftl" />
<@templateHeader>
   <@script type="text/javascript" src="${url.context}/res/modules/data-lists/datalist-actions.js"></@script>
   <@templateHtmlEditorAssets />
</@>

<@templateBody>
   <div id="alf-hd">
      <@region id="header" scope="global" protected=true />
      <@region id="title" scope="template" protected=true />
      <@region id="navigation" scope="template" protected=true />
   </div>
   <div id="bd">
      <div class="share-form">
         <@region id="edit-metadata-mgr" scope="template" protected=true />
         <@region id="edit-metadata" scope="template" protected=true />
      </div>
   </div>
</@>

<@templateFooter>
   <div id="alf-ft">
      <@region id="footer" scope="global" protected=true />
   </div>
</@>
