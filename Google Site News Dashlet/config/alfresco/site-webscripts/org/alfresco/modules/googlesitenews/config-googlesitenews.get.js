var c = sitedata.getComponent(args.componentId);

var enabledsearchers = c.properties["enabledsearchers"];
var disabledsearchers = c.properties["disabledsearchers"];

if(!enabledsearchers){
	//There is no saved config, so set up default
	enabledsearchers = "web,news,blog";
	disabledsearchers = "video,image,books,patent";
}
if(!disabledsearchers){
	disabledsearchers = "";
}
model.enabledsearchers = enabledsearchers.split(",");
model.disabledsearchers = disabledsearchers.split(",");