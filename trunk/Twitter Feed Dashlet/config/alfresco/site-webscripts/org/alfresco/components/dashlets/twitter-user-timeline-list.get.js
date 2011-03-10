var u = args.twitterUser ? args.twitterUser : "AlfrescoECM",
      maxId = args.maxId ? args.maxId : null,
      perPage = 20;

function main()
{
   if (u.indexOf("/") > 0)
   {
      var uparts = u.split("/");
      var theUrl = "http://api.twitter.com/1/" + uparts[0] + "/lists/" + uparts[1] + "/statuses.json";
      if (maxId != null)
      {
         // Request an extra tweet as we already have the first one
         theUrl += "?per_page=" + (perPage + 1) + "&max_id=" + maxId;
      }
      else
      {
         theUrl += "?per_page=" + perPage;
      }
   }
   else
   {
      var theUrl = "http://twitter.com/status/user_timeline/" + u + ".json?count=" + perPage;
   }
   connector = remote.connect("http");
   result = connector.get(theUrl);
   if (result.status == 200)
   {
      var tweets = eval("(" + result.response + ")");
      model.username = u;
      model.tweets = (maxId != null) ? tweets.slice(1) : tweets; // Remove duplicated tweet
   }
   else
   {
      model.username = u;
      model.status = result.status;
   }
}

main();
