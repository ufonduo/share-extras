function main()
{
   var station = args.station;
   var via = args.via ? args.via : "";
   
   if (station != null)
   {
      var uri = "http://ojp.nationalrail.co.uk/service/ldb/liveTrainsJson?departing=true&liveTrainsFrom=" + stringUtils.urlEncode(station) + "&liveTrainsTo=" + stringUtils.urlEncode(via) + "&serviceId=",
         connector = remote.connect("http"),
         result = connector.get(uri);
      
      if (result.status == status.STATUS_OK)
      {
         var td = eval("(" + result.response + ")");
         model.data = td;
         model.jsonResp = result.response;
      }
      else
      {
         status.setCode(result.status, "Error during remote call. " +
               "Status: " + result.status + ", Response: " + result.response);
         status.redirect = true;
      }
   }
   else
   {
      status.setCode(status.STATUS_BAD_REQUEST, "No station was specifed");
      status.redirect = true;
   }
}
main();