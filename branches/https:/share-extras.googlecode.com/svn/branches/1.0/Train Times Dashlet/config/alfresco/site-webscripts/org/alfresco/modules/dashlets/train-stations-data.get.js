function main()
{
   var station = args.query;
   
   if (station != null)
   {
      var uri = "http://ojp.nationalrail.co.uk/find/stations/" + stringUtils.urlEncode(station),
         connector = remote.connect("http"),
         result = connector.get(uri);
      
      if (result.status == status.STATUS_OK)
      {
         var sd = eval("(" + result.response + ")");
         model.stations = sd;
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
      status.setCode(status.STATUS_BAD_REQUEST, "No query was specifed");
      status.redirect = true;
   }
}
main();