<import resource="classpath:alfresco/templates/webscripts/org/alfresco/slingshot/polls/polls.lib.js">

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
   model.hasCreateChildrenPermission = pollNode.hasPermission("CreateChildren");
   model.hasCoordinatorPermission = pollNode.hasPermission("Coordinator");
   model.pollOwner = pollNode.getOwner();
   model.isOwner = pollNode.getOwner() == person.properties.userName;
   model.hasVoted = responseNode != null;
   if (model.hasVoted)
   {
      model.pollResponse = responseNode.properties["pm:response"];
   }
   model.options = getPollOptions(pollNode);
}
else
{
   status.code = 404;
   status.message = "The poll could not be found";
   status.redirect = true;
}