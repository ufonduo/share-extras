<import resource="classpath:alfresco/extension/templates/webscripts/org/alfresco/slingshot/polls/polls.lib.js">

var siteId = url.templateArgs.siteId;
model.siteId = siteId;

var filter = args.filter;

model.polls = getPolls(siteId, filter);

function getPolls(siteId)
{
   if (siteId === null || siteId.length === 0)
   {
      status.setCode(status.STATUS_BAD_REQUEST, "Site not found: '" + siteId + "'");
      return;
   }
   
   var site = siteService.getSite(siteId);
   if (site === null)
   {
      status.setCode(status.STATUS_NOT_FOUND, "Site not found: '" + siteId + "'");
      return;
   }
   
   var pollsContainer = getPollsContainer(site);
   if (pollsContainer === null)
   {
      status.setCode(status.STATUS_BAD_REQUEST, "Poll container not found");
      return;
   }
   
   var query = "+PATH:\"" + pollsContainer.qnamePath + "//*\" ";
   query += " TYPE:\"{http://www.alfresco.org/model/poll/1.0}poll\"";
   
   if (filter)
   {
      query += getFilterQuery(filter);
   }
   
   var results = search.luceneSearch(query);
   
   var polls = [];   
   var poll, createdBy, modifiedBy;
   
   for each (poll in results)
   {
      createdBy = people.getPerson(poll.properties["cm:creator"]);
      modifiedBy = people.getPerson(poll.properties["cm:modifier"]);
      polls.push(
      {
         "poll": poll,
         "tags": poll.tags,
         "modified": poll.properties.modified,
         "createdBy": createdBy,
         "modifiedBy": modifiedBy
      });
   }
   
   return ( 
   {
      "container": pollsContainer,
      "polls": polls
   });
}

function getFilterQuery(filter)
{
   var filterQuery = "";
   
   switch (String(filter))
   {
      case "all":
         // Nothing to do
         break;
      
      case "recentlyModified":
         var usingModified = true;
         // fall through...
      case "recentlyAdded":
         // Which query: created, or modified?
         var dateField = "modified";
         if (typeof usingModified === "undefined")
         {
            dateField = "created";
         }
         
         // Default to 7 days - can be overridden using "days" argument
         var dayCount = 7;
         var argDays = args["days"];
         if ((argDays != null) && !isNaN(argDays))
         {
            dayCount = argDays;
         }
         var date = new Date();
         var toQuery = date.getFullYear() + "\\-" + (date.getMonth() + 1) + "\\-" + date.getDate();
         date.setDate(date.getDate() - dayCount);
         var fromQuery = date.getFullYear() + "\\-" + (date.getMonth() + 1) + "\\-" + date.getDate();

         filterQuery += "+@cm\\:" + dateField + ":[" + fromQuery + "T00\\:00\\:00 TO " + toQuery + "T23\\:59\\:59] ";
         break;
         
      case "myPages":
         filterQuery += "+@cm\\:creator:" + person.properties.userName;
         break;   
   }
   
   return filterQuery;
}