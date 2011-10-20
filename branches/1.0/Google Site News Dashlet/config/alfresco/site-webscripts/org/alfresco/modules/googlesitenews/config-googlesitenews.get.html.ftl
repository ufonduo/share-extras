<#macro renderListItem item>
<#if item!="">
<#assign label="searcher."+item>

			          <li class="searcheritem">
			          	<input type="hidden" name="searcheritem" value="${item}"/>
	           			<a href="#"><img class="dnd-draggable" src="${url.context}/res/yui/assets/skins/default/transparent.gif" alt="" /></a>
	           			<span>${msg(label)}</span>
	           			<div class="dnd-draggable" title="${msg(label)}"></div>
			          </li>
</#if>			         
</#macro>
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

         <div class="yui-g">
         <hr/>
         <div id="searcher">
         <input type="hidden" id="${args.htmlid}-enabledsearchers" name="enabledsearchers" value="xxx"/>
	          <div id="${args.htmlid}-enabled-searcher" class="yui-u first" >
	          <div class="textlabel">${msg("label.enabled")}</div>
		          <ul id="${args.htmlid}-enabled-searcher-ul" class="enabledList">
		          	<#list enabledsearchers as item>	
   					<@renderListItem item />
					</#list>
		          </ul>
	          </div>
	          <div id="${args.htmlid}-disabled-searcher" class="yui-u" >
	          <div class="textlabel">${msg("label.disabled")}</div>
		          <ul id="${args.htmlid}-disabled-searcher-ul" class="disabledList">
		          	<#list disabledsearchers as item>	
   					<@renderListItem item />
					</#list>
		          </ul>
	          </div>
          </div>
          </diV>
          <div class="bdft">
            <input type="submit" id="${args.htmlid}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>

   </div>
</div>