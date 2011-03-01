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