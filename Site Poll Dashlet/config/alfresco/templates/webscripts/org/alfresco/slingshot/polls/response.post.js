<import resource="classpath:alfresco/extension/templates/webscripts/org/alfresco/slingshot/polls/polls.lib.js">

var nodeRef = url.templateArgs.protocol + "://" + url.templateArgs.store + "/" + url.templateArgs.id,
   jsonData = jsonUtils.toObject(requestbody.content),
   response = jsonData.response,
   username = person.properties.userName;

// Locate the poll node
var pollNode = search.findNode(nodeRef);
if (pollNode != null)
{
   // Make sure the user has not voted already
   var responseNode = pollNode.childByNamePath(username);
   if (responseNode == null)
   {
      if (response != null)
      {
         // Check that the option is in the allowed list
         var opts = getPollOptions(pollNode);
         
         if (opts.indexOf(response) >= 0)
         {
            // Check the poll has not expired
            var pollEnabled = pollNode.properties["pm:enabled"];
            var now = Date.now();
            if (pollEnabled && pollNode.properties.from)
            {
               pollEnabled = pollNode.properties.from.getTime() < now;
            }
            if (pollEnabled && pollNode.properties.to)
            {
               pollEnabled = pollNode.properties.to.getTime() > now;
            }
            if (pollEnabled)
            {
               responseNode = pollNode.createNode(username, "pm:response", "pm:pollResponse");
               responseNode.properties["pm:response"] = response;
               responseNode.save()
               model.result = true;
            }
            else
            {
               status.code = 500;
               status.message = "Poll is not enabled or not currently active";
               status.redirect = true;
            }
         }
         else
         {
            status.code = status.BAD_REQUEST;
            status.message = "Response '" + response + "' is not a valid option";
            status.redirect = true;
         }
      }
      else
      {
         status.code = 500;
         status.message = "Response cannot be empty";
         status.redirect = true;
      }
   }
   else
   {
      status.code = 500;
      status.message = "User '" + username + "' has already responsed to the poll";
      status.redirect = true;
   }
}
else
{
   status.code = 404;
   status.message = "The poll identified by node '" + nodeRef + "' could not be found";
   status.redirect = true;
}