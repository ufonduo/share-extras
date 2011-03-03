<div id="${args.htmlid}-configDialog" class="config-poll">
   <div class="hd">${msg("label.header")}</div>
   <div class="bd">
      <form id="${args.htmlid}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-station">${msg("label.station")}:</label></div>
            <div class="yui-u">
               <input type="text" name="station" id="${args.htmlid}-station" />
               <div id="${args.htmlid}-station-select"></div>
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-via">${msg("label.via")}:</label></div>
            <div class="yui-u">
               <input type="text" name="via" id="${args.htmlid}-via" />
               <div id="${args.htmlid}-via-select"></div>
            </div>
         </div>
         <div class="bdft">
            <input type="submit" id="${args.htmlid}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>
</div>