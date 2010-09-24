var u = args.twitterUser ? args.twitterUser : "AlfrescoECM";
var theUrl = "http://twitter.com/status/user_timeline/" + u + ".json?count=10";

function main()
{
   connector = remote.connect("http");
   result = connector.get(theUrl);
   if (result.status == 200)
   {
      var tweets = eval("(" + result.response + ")");
      model.tweets = tweets;
   }
   else
   {
      model.status = result.status;
   }
   model.twitterUser = u;
   
   // Work out if the user has permission to configure the dashlet
   
   var hasConfigPermission = false;
   
   if (page.url.templateArgs.site != null) // Site or user dashboard?
   {
      // Call the repository to see if the user is a site manager or not
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
         hasConfigPermission = (obj.role == "SiteManager");
      }
   }
   else
   {
      hasConfigPermission = true; // User dashboard
   }
   
   model.hasConfigPermission = hasConfigPermission;
}

main();