<div id="${args.htmlid}-configDialog" class="config-poll">
   <div class="hd">${msg("label.header")}</div>
   <div class="bd">
      <form id="${args.htmlid}-form" action="" method="POST">
         <input type="hidden" name="siteId" value="${url.templateArgs.siteId}"/>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-url">${msg("label.url")}:</label></div>
            <div class="yui-u">
            <#if pollList.polls?size &gt; 0>
               <select name="nodeRef" id="${args.htmlid}-poll-select" style="width: 30em;">
               <#list pollList.polls as p>
                  <option value="${p.nodeRef}">${p.title}</option>
               </#list>
               </select>
            <#else>
                ${msg("label.no-polls")}
            </#if>
            </div>
         </div>
         <div class="bdft">
            <input type="submit" id="${args.htmlid}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>
</div>