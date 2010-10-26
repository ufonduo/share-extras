var searchTerm = args.q ? args.q : "#Alfresco",
      rpp = args.rpp ? args.rpp : 20;

function main()
{
   var surl = "http://search.twitter.com/search.json?q=" + stringUtils.urlEncode(searchTerm) + "&rpp=" + stringUtils.urlEncode(rpp) + "&result_type=recent";
   connector = remote.connect("http");
   result = connector.get(surl);
   if (result.status == 200)
   {
      var results = eval("(" + result.response + ")");
      model.searchTerm = searchTerm;
      model.results = results.results;
   }
   else
   {
      model.status = result.status;
   }
}

main();