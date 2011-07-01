<div class="dashlet">
   <div class="title">${msg("header")}</div>
   <div class="body scrollableList">
     <div class="detail-list-item first-item last-item">
        <span><#if greeting=="hello">${msg("label.hello", user.firstName)}<#else>${msg("label.goodbye", user.firstName)}</#if></span>
     </div>
   </div>
</div>