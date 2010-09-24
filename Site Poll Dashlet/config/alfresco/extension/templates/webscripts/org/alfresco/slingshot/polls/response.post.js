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
         responseNode = pollNode.createNode(username, "pm:response");
         responseNode.properties["pm:response"] = response;
         responseNode.save()
         model.result = true;
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