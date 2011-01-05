<import resource="classpath:alfresco/extension/templates/webscripts/org/alfresco/slingshot/polls/polls.lib.js">

var pollNode, username = person.properties.userName;

// Locate the poll node by name or nodeRef
if (url.templateArgs.site != null)
{
   pollNode = findPollByName(url.templateArgs.site, url.templateArgs.pname);
}
else
{
   var nodeRef = url.templateArgs.protocol + "://" + url.templateArgs.store + "/" + url.templateArgs.id;
   pollNode = findPoll(nodeRef);
}

if (pollNode != null)
{
   var responseNode = pollNode.childByNamePath(username);
   model.poll = pollNode;
   model.hasPermission = pollNode.hasPermission("CreateChildren");
   model.hasVoted = responseNode != null;
   if (model.hasVoted)
   {
      model.pollResponse = responseNode.properties["pm:response"];
   }
}
else
{
   status.code = 404;
   status.message = "The poll could not be found";
   status.redirect = true;
}