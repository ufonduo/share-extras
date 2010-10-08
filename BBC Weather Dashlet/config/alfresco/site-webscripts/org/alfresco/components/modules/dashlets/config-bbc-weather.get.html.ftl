<div id="${args.htmlid}-configDialog" class="config-bbc-weather">
   <div class="hd">${msg("label.header")}</div>
   <div class="bd">
      <form id="${args.htmlid}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-location">${msg("label.location")}:</label></div>
            <div class="yui-u">
               <select name="location" id="${args.htmlid}-location" style="width: 30em;">
                  <option value="2">Birmingham, West Midlands</option>
                  <option value="8">London, Greater London</option>
                  <option value="2576">London Heathrow, Greater London</option>
                  <option value="4297">Maidenhead, Berkshire</option>
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