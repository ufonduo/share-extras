<import resource="classpath:alfresco/site-webscripts/org/alfresco/utils/feed.utils.js">

var c = sitedata.getComponent(url.templateArgs.componentId);

var searchterm = String(json.get("searchterm"));

c.properties["searchterm"] = searchterm;
model.searchterm = searchterm;

var limit = String(json.get("limit"));
c.properties["limit"] = limit;
model.limit = limit;

c.save();
