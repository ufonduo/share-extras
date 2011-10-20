/**
 * Copyright (C) 20010-2011 Alfresco Share Extras project
 *
 * This file is part of the Alfresco Share Extras project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/*
 * From an array of total available searchers, get the remaining disabled (remove enabled)
 */
function getDisabled(enabled,disabled){
	for (var i = 0; i<enabled.length; i++) {
		var arrlen = disabled.length;
		for (var j = 0; j<arrlen; j++) {
			if (enabled[i] == disabled[j]) {
				disabled = disabled.slice(0, j).concat(disabled.slice(j+1, arrlen));
			}//if close
		}//for close
	}//for close
	return disabled
}

var c = sitedata.getComponent(url.templateArgs.componentId);

var searchterm = String(json.get("searchterm"));

c.properties["searchterm"] = searchterm;
model.searchterm = searchterm;

var limit = String(json.get("limit"));
c.properties["limit"] = limit;
model.limit = limit;

var enabledsearchers = String(json.get("enabledsearchers"));
var disabled = new Array("web","news","blog","video","image","books","patent");
var enabled = enabledsearchers.split(",");
disabled = getDisabled(enabled,disabled);

c.properties["enabledsearchers"] = enabledsearchers;
c.properties["disabledsearchers"] = disabled.toString();
model.enabledsearchers = enabledsearchers;
model.disabledsearchers = disabled.toString();

c.save();
