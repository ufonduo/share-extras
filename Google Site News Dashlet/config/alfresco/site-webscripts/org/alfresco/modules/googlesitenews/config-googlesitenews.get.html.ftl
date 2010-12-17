<div id="${args.htmlid}-configDialog" class="config-googlesitenews">
   <div class="hd">${msg("label.enterSearchCriteria")}:</div>
   <div class="bd">
      <form id="${args.htmlid}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-searchterm">${msg("label.searchterm")}:</label></div>
            <div class="yui-u"><input id="${args.htmlid}-searchterm" type="text" name="searchterm" value="" maxlength="2048" />&nbsp;*</div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label>${msg("label.numberOfDays")}:</label></div>
            <div class="yui-u">
               <select id="${args.htmlid}-limit" name="limit">
                <#assign limits = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 100]>
                <#list limits as limit><option value="${limit}">${limit}</option></#list>
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