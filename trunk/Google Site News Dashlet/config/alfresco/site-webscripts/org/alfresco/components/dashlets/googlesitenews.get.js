function getJulianToday() {
	//This Julian Day calculator is based on work by Dan Bruton
	// http://www.physics.sfasu.edu/astro/javascript/julianday.html
	var now = new Date();
	var month = now.getUTCMonth() + 1;
	var day = now.getUTCDate();
	var year = now.getUTCFullYear();
	MM=now.getUTCMonth() + 1;
	DD=now.getUTCDate();
	YY=now.getUTCFullYear();
	HR=now.getUTCHours();
	MN=now.getUTCMinutes();
	SC=now.getUTCSeconds();
	with (Math) {  
		HR = HR + (MN / 60) + (SC/3600);
		GGG = 1;
		if (YY <= 1585) GGG = 0;
		JD = -1 * floor(7 * (floor((MM + 9) / 12) + YY) / 4);
		S = 1;
		if ((MM - 9)<0) S=-1;
		A = abs(MM - 9);
		J1 = floor(YY + S * floor(A / 7));
		J1 = -1 * floor((floor(J1 / 100) + 1) * 3 / 4);
		JD = JD + floor(275 * MM / 9) + DD + (GGG * J1);
		JD = JD + 1721027 + 2 * GGG + 367 * YY - 0.5;
		JD = JD + (HR / 24);
	}
	var upper = new Number(JD.toFixed(0));
	return upper;

}

var searchterm = args.searchterm;
if (!searchterm) {
	var siteId = (page.url.templateArgs["site"] != undefined) ? page.url.templateArgs["site"] : "";
	// fetch the site title if we got a site id
	if (siteId.length != 0)
	{
	   // Call the repository for the site profile
	   var json = remote.call("/api/sites/" + siteId);
	   if (json.status == 200)
	   {
	      // Create javascript objects from the repo response
	      var obj = eval('(' + json + ')');
	      if (obj)
	      {
			//Put the sitename in model, so that can be part of the google query
	        model.searchterm = (obj.title.length != 0) ? obj.title : obj.shortName;
			//
	      }
	   }
	}	
}else{
	model.searchterm = searchterm;
}

var limit = args.limit;
if (!limit) {
	model.limit="15"
} else {
	model.limit=limit;
}

var julianToday = getJulianToday();
model.julianToday=julianToday.toString();

var userIsSiteManager = true;
//Check whether we are within the context of a site
if (page.url.templateArgs.site)
{
	   //If we are, call the repository to see if the user is site manager or not
	   userIsSiteManager = false;
   var obj = context.properties["memberships"];
   if (!obj)
   {
	   var json = remote.call("/api/sites/" + page.url.templateArgs.site + "/memberships/" + stringUtils.urlEncode(user.name));
	   if (json.status == 200)
	   {
	      obj = eval('(' + json + ')');
	   }
	}
	if (obj)
	{
	      userIsSiteManager = (obj.role == "SiteManager");
	}
}
model.userIsSiteManager = userIsSiteManager;
