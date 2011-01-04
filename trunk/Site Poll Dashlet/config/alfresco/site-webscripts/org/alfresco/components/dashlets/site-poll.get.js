var nodeRef = args.nodeRef;

if (nodeRef != null)
{
   var uri = "/slingshot/poll/" + nodeRef.replace("://", "/"),
      connector = remote.connect("alfresco"),
      result = connector.get(uri);
   
   if (result.status == status.STATUS_OK)
   {
      var response = eval('(' + result.response + ')');
      model.pollName = response.name;
      model.pollTitle = response.title;
      model.options = response.options;
      model.nodeRef = response.nodeRef;
      model.hasPermission = response.hasPermission;
      model.hasVoted = response.hasVoted;
      if (response.pollResponse)
      {
         model.pollResponse = response.pollResponse;
      }
      var pollEnabled = response.enabled
      var now = Date.now();
      if (pollEnabled && response.startDate)
      {
         var startDate = Date.parse(response.startDate);
         pollEnabled = startDate < now;
      }
      if (pollEnabled && response.startDate)
      {
         var endDate = Date.parse(response.endDate);
         pollEnabled = endDate > now;
      }
      model.pollEnabled = pollEnabled;
   }
}

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