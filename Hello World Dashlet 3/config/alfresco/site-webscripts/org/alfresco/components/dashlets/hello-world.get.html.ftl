<script type="text/javascript">//<![CDATA[
   new Alfresco.widget.DashletResizer("${args.htmlid}", "${instance.object.id}");
//]]></script>
<div class="dashlet">
   <div class="title">${msg("header")}</div>
   <div class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
     <div class="detail-list-item first-item last-item">
        <span><#if greeting=="hello">${msg("label.hello")}<#else>${msg("label.goodbye")}</#if></span>
     </div>
   </div>
</div>