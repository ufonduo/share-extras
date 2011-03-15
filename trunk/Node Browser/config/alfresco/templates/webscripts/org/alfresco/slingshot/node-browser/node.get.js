function getPropertyType(p)
{
   if (typeof(p.getClass) == "function")
   {
      var className = p.getClass().name;
      if (className == "org.alfresco.repo.jscript.ScriptNode$ScriptContentData")
      {
         return "d:content";
      }
   }
   else
   {
      var typeName = typeof(p);
      if (typeName == "number")
      {
         return "d:int";
      }
      else if (typeName == "boolean")
      {
         return "d:boolean";
      }
      else if (typeName == "string")
      {
         return "d:text";
      }
      else if (typeName == "object")
      {
         var constructorName = p.constructor.name;
         if (constructorName == "Date")
         {
            return "d:datetime";
         }
      }
   }
}
function getAssocList(assocsArray)
{
   var assocsList = [], assocs, target;
   for (assocType in assocsArray)
   {
      assocs = assocsArray[assocType];
      for (var i = 0; i < assocs.length; i++)
      {
         target = assocs[i];
         assocsList.push({
            name: target.name,
            nodeRef: target.nodeRef.toString(),
            type: target.type,
            assocType: assocType
         });
      }
   }
   return assocsList;
}
function main()
{
   var nodeRef = url.templateArgs.protocol + "://" + url.templateArgs.store + "/" + url.templateArgs.id,
      node = search.findNode(nodeRef),
      nodeProps = [],
      nodeParents = getAssocList(node.parentAssocs),
      nodeChildren = getAssocList(node.childAssocs),
      nodeAssocs = getAssocList(node.assocs),
      nodeSourceAssocs = getAssocList(node.sourceAssocs),
      nodeType,
      pv;
   
   for (p in node.properties)
   {
      pv = node.properties[p];
      if (pv !== null)
      {
         nodeType = getPropertyType(pv);
         if (nodeType == "d:text" || nodeType == "d:int" || nodeType == "d:boolean")
         {
            nodeProps.push({
               name: p,
               value: pv,
               type: nodeType
            });
         }
         else if (nodeType == "d:datetime")
         {
            nodeProps.push({
               name: p,
               value: pv.toString(),
               type: nodeType
            });
         }
         else if (nodeType == "d:content")
         {
            nodeProps.push({
               name: p,
               value: "mimetype=" + pv.mimetype + "|size=" + pv.size + "|encoding=" + pv.encoding,
               type: nodeType
            });
         }
      }
   }
   
   model.properties = nodeProps;
   model.children = nodeChildren;
   model.parents = nodeParents;
   model.assocs = nodeAssocs;
   model.sourceAssocs = nodeSourceAssocs;
   model.node = node;
}
main();