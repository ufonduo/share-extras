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
function main()
{
   var nodeRef = url.templateArgs.protocol + "://" + url.templateArgs.store + "/" + url.templateArgs.id,
      node = search.findNode(nodeRef),
      nodeProps = [],
      nodeParents = [],
      nodeChildren = [],
      nodeAssocs = [],
      nodeType,
      pv;
   
   for (p in node.properties)
   {
      pv = node.properties[p];
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

   for (assocType in node.childAssocs)
   {
      var assocs = node.childAssocs[assocType];
      for ( var i = 0; i < assocs.length; i++)
      {
         var child = assocs[i];
         nodeChildren.push({
            name: child.name,
            nodeRef: child.nodeRef.toString(),
            type: child.type,
            assocType: assocType
         });
      }
   }

   for (assocType in node.parentAssocs)
   {
      var assocs = node.parentAssocs[assocType];
      for ( var i = 0; i < assocs.length; i++)
      {
         var parent = assocs[i];
         nodeParents.push({
            name: parent.name,
            nodeRef: parent.nodeRef.toString(),
            type: parent.type,
            assocType: assocType
         });
      }
   }

   for (assocType in node.assocs)
   {
      var assocs = node.assocs[assocType];
      for ( var i = 0; i < assocs.length; i++)
      {
         var target = assocs[i];
         nodeAssocs.push({
            name: target.name,
            nodeRef: target.nodeRef.toString(),
            type: target.type,
            assocType: assocType
         });
      }
   }
   
   model.properties = nodeProps;
   model.children = nodeChildren;
   model.parents = nodeParents;
   model.assocs = nodeAssocs;
   model.node = node;
}
main();