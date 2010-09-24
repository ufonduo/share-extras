function getPollsContainer(site)
{
   var poll;
   
   if (site.hasContainer("polls"))
   {
      poll = site.getContainer("polls");
   }
   else
   {
      poll = site.createContainer("polls");
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