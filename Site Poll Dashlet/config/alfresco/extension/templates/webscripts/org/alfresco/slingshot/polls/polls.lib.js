var pollContainerName = "dataLists"
function getPollsContainer(site)
{
   var poll;
   
   if (site.hasContainer(pollContainerName))
   {
      poll = site.getContainer(pollContainerName);
   }
   else
   {
      poll = site.createContainer(pollContainerName);
   }
   
   if(poll != null)
   {
      if (!poll.isTagScope)
      {
         poll.isTagScope = true;
      }
   }
   
   return poll;
}