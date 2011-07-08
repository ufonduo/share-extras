var searchTerm = args.q ? args.q : "#Alfresco",
        maxId = args.maxId ? args.maxId : null,
        minId = args.minId ? args.minId : null,
        rpp = args.pageSize ? args.pageSize : 20;

function main()
{
   var surl = "http://search.twitter.com/search.json?q=" + stringUtils.urlEncode(searchTerm) + "&rpp=" + stringUtils.urlEncode(rpp) + "&result_type=recent";
   if (maxId != null)
   {
       surl += "&max_id=" + stringUtils.urlEncode(maxId);
   }
   if (minId != null)
   {
       surl += "&since_id=" + stringUtils.urlEncode(minId);
   }
   connector = remote.connect("http");
   result = connector.get(surl);
   if (result.status == 200)
   {
      var results = eval("(" + result.response + ")");
      model.jsonResp = result.response;
      model.searchTerm = searchTerm;
      model.results = results.results;
   }
   else
   {
       var resp = eval("(" + result.response + ")");
       status.setCode(result.status, (resp != null && resp.error != null) ? resp.error : "Encountered an unknown error when loading remote data");
       status.redirect = true;
   }
}

main();