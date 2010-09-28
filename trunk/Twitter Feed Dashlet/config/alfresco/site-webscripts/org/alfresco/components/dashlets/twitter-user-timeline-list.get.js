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
}

main();