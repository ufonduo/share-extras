<div id="${args.htmlid}-configDialog">
   <div class="hd">${msg("label.header")}</div>
   <div class="bd">
      <form id="${args.htmlid}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-survey-id">${msg("label.survey-id")}:*</label></div>
            <div class="yui-u" >
               <input type="text" name="surveyId" id="${args.htmlid}-survey-id" />
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-survey-title">${msg("label.survey-title")}:</label></div>
            <div class="yui-u" >
               <input type="text" name="title" id="${args.htmlid}-survey-title" />
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"></div>
            <div class="yui-u">
               <input type="checkbox" name="use-panel-cb" value="1" id="${args.htmlid}-use-panel-cb" />
               <label for="${args.htmlid}-use-panel-cb">${msg("label.use-panel")}</label>
            </div>
         </div>
         <div class="bdft">
            <input type="hidden" name="usePanel" value="" id="${args.htmlid}-use-panel" />
            <input type="submit" id="${args.htmlid}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>
</div>