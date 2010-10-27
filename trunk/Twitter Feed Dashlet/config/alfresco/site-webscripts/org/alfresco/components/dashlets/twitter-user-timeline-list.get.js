var u = args.twitterUser ? args.twitterUser : "AlfrescoECM";

function main()
{
   if (u.indexOf("/") > 0)
   {
      var uparts = u.split("/");
      var theUrl = "http://api.twitter.com/1/" + uparts[0] + "/lists/" + uparts[1] + "/statuses.json?per_page=20";
   }
   else
   {
      var theUrl = "http://twitter.com/status/user_timeline/" + u + ".json?count=10";
   }
   connector = remote.connect("http");
   result = connector.get(theUrl);
   if (result.status == 200)
   {
      var tweets = eval("(" + result.response + ")");
      model.username = u;
      model.tweets = tweets;
   }
   else
   {
      model.username = u;
      model.status = result.status;
   }
}

main();
