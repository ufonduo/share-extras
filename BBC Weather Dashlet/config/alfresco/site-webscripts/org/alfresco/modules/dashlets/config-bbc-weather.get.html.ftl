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
         <div class="yui-gd">
            <div class="yui-u first"></div>
            <div class="yui-u">
               <div id="${args.htmlid}-tempbuttons" class="yui-buttongroup">
                  <input type="radio" name="tscale-btn" value="${msg('label.celcius')}" />
                  <input type="radio" name="tscale-btn" value="${msg('label.fahrenheight')}" />
               </div>
            </div>
         </div>
         <div class="bdft">
            <input type="submit" id="${args.htmlid}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" />
         </div>
         <input type="hidden" id="${args.htmlid}-tscale" name="tscale" value="" />
      </form>
   </div>
</div>