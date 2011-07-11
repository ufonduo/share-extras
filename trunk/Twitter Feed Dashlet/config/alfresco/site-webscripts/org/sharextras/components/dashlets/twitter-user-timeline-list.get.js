   var u = args.twitterUser ? args.twitterUser : "AlfrescoECM",
      maxId = args.maxId ? args.maxId : null,
      minId = args.minId ? args.minId : null,
      perPage = args.pageSize ? args.pageSize : 100;

function main()
{
   if (u.indexOf("/") > 0)
   {
      var uparts = u.split("/");
      var theUrl = "http://api.twitter.com/1/" + uparts[0] + "/lists/" + uparts[1] + 
         "/statuses.json?;
      if (perPage != null)
      {
         theUrl += "per_page=" + stringUtils.urlEncode(perPage);
      }
   }
   else
   {
      //var theUrl = "http://twitter.com/status/user_timeline/" + u + ".json?count=" + perPage;
      var theUrl = "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=" + 
         stringUtils.urlEncode(u) + "&include_rts=true";
      if (perPage != null)
      {
         theUrl += "&count=" + stringUtils.urlEncode(perPage);
      }
   }
   if (maxId != null)
   {
      theUrl += "&max_id=" + stringUtils.urlEncode(maxId);
   }
   if (minId != null)
   {
      theUrl += "&since_id=" + stringUtils.urlEncode(minId);
   }
   connector = remote.connect("http");
   result = connector.get(theUrl);
   if (result.status == 200)
   {
      var tweets = eval("(" + result.response + ")");
      model.jsonResp = result.response;
      model.username = u;
      model.tweets = tweets;
   }
   else
   {
      var resp = eval("(" + result.response + ")");
      status.setCode(result.status, (resp != null && resp.error != null) ? resp.error : "Encountered an unknown error when loading remote data");
      status.redirect = true;
   }
}

main();
