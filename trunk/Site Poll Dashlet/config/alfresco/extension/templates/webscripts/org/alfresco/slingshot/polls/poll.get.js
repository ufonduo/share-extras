<import resource="classpath:alfresco/extension/templates/webscripts/org/alfresco/slingshot/polls/polls.lib.js">

var pollNode, username = person.properties.userName;

if (url.templateArgs.site != null)
{
   var site = siteService.getSite(url.templateArgs.site);
   if (site === null)
   {
      status.setCode(status.STATUS_NOT_FOUND, "Site not found: '" + siteId + "'");
      status.redirect = true;
   }
   
   var pollsContainer = getPollsContainer(site);
   if (pollsContainer === null)
   {
      status.setCode(status.STATUS_BAD_REQUEST, "Poll container not found");
      status.redirect = true;
   }
   
   pollNode = pollsContainer.childByNamePath(url.templateArgs.pname);
}
else
{
   // Locate the poll node
   var nodeRef = url.templateArgs.protocol + "://" + url.templateArgs.store + "/" + url.templateArgs.id;
   pollNode = search.findNode(nodeRef);
}

if (pollNode != null)
{
   var responseNode = pollNode.childByNamePath(username);
   model.hasVoted = responseNode != null;
   model.poll = pollNode;
}
else
{
   status.code = 404;
   status.message = "The poll could not be found";
   status.redirect = true;
}