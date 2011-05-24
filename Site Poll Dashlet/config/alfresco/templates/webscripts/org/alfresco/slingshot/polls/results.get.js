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
   var responses = [], found, response, totalVotes = 0;
   
   // Pre-populate the allowed options
   // pm:options is a multi-valued prop, but options can also be comma-separated within a single value (as
   // the form service does not yet support m-v props)
   options = getPollOptions(pollNode);
   for (var i=0; i<options.length; i++)
   {
      responses.push(
            {
               "response": options[i],
               "votes": 0
            }
         );
   }
   
   var assocs = pollNode.childAssocs["pm:pollResponse"];
   
   // Step through each of the responses
   if (assocs)
   {
      for (var i=0; i<assocs.length; i++)
      {
         found = false;
         if (pollNode.childAssocs["pm:pollResponse"][i].typeShort == "pm:response")
         {
            response = pollNode.childAssocs["pm:pollResponse"][i].properties["pm:response"];
            for (var j=0; j<responses.length; j++)
            {
               if (response == responses[j].response)
               {
                  responses[j].votes ++;
                  found = true;
               }
            }
            if (! found)
            {
               // Register any non-allowed responses that might have slipped through (e.g. if an option name was changed)
               responses.push(
                        {
                           "response": response,
                           "votes": 1
                        }
                     );
            }
            totalVotes ++;
         }
      }
   }

   // Go through all the results and add percentages
   for (var i=0; i<responses.length; i++)
   {
      responses[i].share = responses[i].votes / totalVotes;
   }

   model.responses = responses;
   model.totalVotes = totalVotes;
}
else
{
   status.code = 404;
   status.message = "The poll could not be found";
   status.redirect = true;
}