<div id="${args.htmlid}-configDialog" class="config-poll">
   <div class="hd">${msg("label.header")}</div>
   <div class="bd">
      <form id="${args.htmlid}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-poll-select">${msg("label.poll-select")}:</label></div>
            <div class="yui-u">
               <select name="nodeRef" id="${args.htmlid}-poll-select" style="width: 30em;">
               <#if pollList.polls?size &gt; 0>
                  <option value="-">${msg("label.select-one")}</option>
                  <#list pollList.polls as p>
                  <option value="${p.nodeRef}">${p.title}</option>
                  </#list>
               <#else>
                  <option value="-">${msg("label.no-polls")}</option>
               </#if>
               </select>
            </div>
         </div>
         <div class="bdft">
            <input type="submit" id="${args.htmlid}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>
</div>