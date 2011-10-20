<import resource="classpath:alfresco/site-webscripts/org/alfresco/callutils.js">

// Grab the polls for the (current) site
var theUrl = "/extras/slingshot/polls/site/" + url.templateArgs.siteId; 

model.pollList = doGetCall(theUrl);