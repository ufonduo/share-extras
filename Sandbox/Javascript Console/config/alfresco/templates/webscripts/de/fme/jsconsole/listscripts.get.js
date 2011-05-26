

function findScripts(folder) {
  var scriptlist = [];

  var children = folder.children;

  for (c in children) {
    var node = children[c];

    if (node.isContainer) {
       scriptlist.push({text : node.name, submenu : {
            id: node.properties["sys:node-uuid"], itemdata : findScripts(node) 
       }});
    }
    else {
       scriptlist.push({text : node.name, value : node.nodeRef});
    }
  }
  
  return scriptlist;
}

var scriptFolder = search.luceneSearch('PATH:"/app:company_home/app:dictionary/app:scripts"')[0];
model.scripts = jsonUtils.toJSONString(findScripts(scriptFolder));
