function getSiteInfo(site)
{
   var info = {
         doclib: site.hasContainer("documentLibrary") ? getDoclibInfo(site.getContainer("documentLibrary")) : null,
         wiki: site.hasContainer("wiki") ? getWikiInfo(site.getContainer("wiki")) : null,
         calendar:
         {
            contentItems: 0 // number of event items
         },
         discussions:
         {
            topicItems: 0, // number of discussion topics
            postItems: 0 // number of posts
         },
         links:
         {
            contentItems: 0, // number of links
            comments: 0
         },
         dataLists:
         {
            contentItems: 0, // number of list items
         }
   };
   return info;
}
function getDoclibInfo(space, info)
{
   if (info == null)
   {
      info = {
            contentItems: 0, // number of documents
            spaceItems: 0, // number of folders
            contentSize: 0, // total size in bytes
            contentItemsByMimeType: [], // number of items of each mimetype
            comments: 0
         };
   }
   // Iterate through children
   for (var i=0; i<space.children.length; i++)
   {
      if (space.children[i].isDocument)
      {
         info.contentItems ++;
         info.contentSize += space.children[i].size;
         // TODO create mimetype object if mimetype has not been encountered before, otherwise increment
         // info.contentItemsByMimeType.push({mimetype: node.mimetype, items: 1});
         // TODO Get number of comment child objects
      }
      if (space.children[i].isContainer)
      {
         info.spaceItems ++;
         getDoclibInfo(space.children[i], info);
      }
   }
   return info;
}
function getWikiInfo(space, info)
{
   if (info == null)
   {
      info = {
            contentItems: 0, // number of wiki pages
            contentSize: 0, // total size in bytes
            comments: 0
         };
   }
   // Iterate through children
   for (var i=0; i<space.children.length; i++)
   {
      if (space.children[i].isDocument)
      {
         info.contentItems ++;
         info.contentSize += space.children[i].size;
         // TODO Get number of comment child objects
      }
      if (space.children[i].isContainer)
      {
         getDoclibInfo(space.children[i], info);
      }
   }
   return info;
}
function main()
   {
   var site = siteService.getSite(url.templateArgs.siteId);
   if (site != null)
   {
      // Do something
      var info = getSiteInfo(site, null);
      model.site = site;
      model.siteInfo = info;
      model.siteInfoJson = jsonUtils.toJSONString(info);
   }
   else
   {
      // Throw an error
   }
}
main();