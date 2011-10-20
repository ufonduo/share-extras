// Call the repository to see if the user is a site manager or not
var userIsSiteManager = false;
var obj = context.properties["memberships"];
if (!obj)
{
   var json = remote.call("/api/sites/" + page.url.templateArgs.site + "/memberships/" + stringUtils.urlEncode(user.name));
   if (json.status == 200)
   {
      obj = eval('(' + json + ')');
   }
}
if (obj)
{
   userIsSiteManager = (obj.role == "SiteManager");
}
model.userIsSiteManager = userIsSiteManager;