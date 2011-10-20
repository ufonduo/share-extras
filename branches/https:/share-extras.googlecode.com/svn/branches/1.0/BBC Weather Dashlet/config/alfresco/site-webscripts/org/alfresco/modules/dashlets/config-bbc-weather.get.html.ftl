<div id="${args.htmlid}-configDialog" class="config-bbc-weather">
   <div class="hd">${msg("label.header")}</div>
   <div class="bd">
      <form id="${args.htmlid}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-location">${msg("label.location")}:</label></div>
            <div class="yui-u">
               <input type="text" name="locname" style="width: 30em;" id="${args.htmlid}-location" />
               <div id="${args.htmlid}-location-names"></div>
               <input type="hidden" name="location" id="${args.htmlid}-location-id" />
            </div>
         </div>
         <div class="bdft">
            <input type="submit" id="${args.htmlid}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>
</div>