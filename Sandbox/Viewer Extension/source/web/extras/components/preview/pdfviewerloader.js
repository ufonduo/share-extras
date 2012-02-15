/*
 * Copyright (C) 2010-2012 Share Extras contributors
 *
 * This file is part of the Share Extras project.
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

/**
 * This is the "PdfViewer" plugin that renders pdf file using
 * third party pdf.js library, or as fallback any pdf viewer plugin
 * installed in the browser
 * 
 * Supports the following mime types: "application/pdf".
 *
 * @namespace Alfresco.WebPreview.prototype.Plugins
 * @class Alfresco.WebPreview.prototype.Plugins.PdfViewer
 * @author Peter Lšfgren Loftux AB
 */

Alfresco.WebPreview.prototype.Plugins.PdfViewer = function(wp, attributes)
{
	this.wp = wp;
	this.attributes = YAHOO.lang.merge(Alfresco.util.deepCopy(this.attributes), attributes);
	return this;
};

Alfresco.WebPreview.prototype.Plugins.PdfViewer.prototype = {
	/**
	 * Attributes
	 */
	attributes : {
		/**
		 * Decides if the node's content or one of its thumbnails shall be
		 * displayed. Leave it as it is if the node's content shall be used. Set
		 * to a custom thumbnail definition name if the node's thumbnail contains
		 * the PdfViewer to display.
		 * 
		 * @property src
		 * @type String
		 * @default null
		 */
		src : null,
		/**
		 * Sets if canvas is supported and pdf.js can be used.
		 * Internal only.
		 * 
		 * @property canvassuport
		 * @type Boolean
		 * @default false
		 */
		canvassupport : false,
		/**
		 * Sets if there is a pdf plugin installed
		 * Internal only.
		 * 
		 * @property pdfplugininstalled
		 * @type Boolean
		 * @default false
		 */
		pdfplugininstalled : false,
		/**
		 * Force the use of selected plugin
		 * Valid options
		 * pdfjs - use the pdf.js library
		 * plugin - use the browser plugin
		 * 
		 * @property forceplugin
		 * @type String
		 * @default null
		 */		
		forceplugin : null,
		/**
		 * Skipbrowser test, mostly for developer to force test loading
		 * Valid options "true" "false" as String
		 * 
		 * @property forceplugin
		 * @type String
		 * @default null
		 */		
		skipbrowsertest : null
	},

	/**
	 * Tests if the plugin can be used in the users browser.
	 * 
	 * @method report
	 * @return {String} Returns nothing if the plugin may be used, otherwise
	 *         returns a message containing the reason it cant be used as a
	 *         string.
	 * @public
	 */
	report : function PdfViewer_report()
	{
		var skipbrowsertest = (this.attributes.skipbrowsertest && this.attributes.skipbrowsertest === "true") ? true : false;

		if (skipbrowsertest === false)
		{
			if (this.attributes.forceplugin !== "plugin")
			{
				// Test if canvas is supported
				if (window.HTMLCanvasElement)
				{
					this.attributes.canvassupport = true;
					// Do some engine test as well, some support canvas but not the
					// rest for full html5
					if (YAHOO.env.ua.webkit > 0 && YAHOO.env.ua.webkit < 534)
					{
						// http://en.wikipedia.org/wiki/Google_Chrome
						// Guessing for the same for safari
						this.attributes.canvassupport = false;
					}
					if (YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 9)
					{
						this.attributes.canvassupport = false;
					}
					if (YAHOO.env.ua.gecko > 0 && YAHOO.env.ua.gecko < 5)
					{
						// http://en.wikipedia.org/wiki/Gecko_(layout_engine)
						this.attributes.canvassupport = false;
					}
				}
			}

			if (this.attributes.forceplugin !== "pdfjs" && this.attributes.canvassupport === false)
			{
				// We only need to test for pdf plugin if canvas is not supported
				if (Alfresco.util.isBrowserPluginInstalled("application/pdf"))
				{
					this.attributes.pdfplugininstalled = true;
				}
				// Since there is no reliable method, try several ways to detect
				if (this.attributes.pdfplugininstalled === false)
				{
					for ( var i = 0; i < navigator.mimeTypes.length; i++)
					{
						if (navigator.mimeTypes[i].suffixes.toLowerCase() === "pdf")
						{
							this.attributes.pdfplugininstalled = true;
							break;
						}
					}
				}
				// Now a special for IE
				if (YAHOO.env.ua.ie > 0 && this.attributes.canvassupport === false)
				{
					this.attributes.pdfplugininstalled = this._detectPdfPluginIE();
				}
			}
		} else
		{
			if (this.attributes.forceplugin === "pdfjs")
			{
				this.attributes.canvassupport = true;
			} else if (this.attributes.forceplugin === "plugin")
			{
				this.attributes.pdfplugininstalled = true;
			}
		}

		// If neither is supported, then report this, and bail out as viewer
		if (this.attributes.canvassupport === false && this.attributes.pdfplugininstalled === false)
		{
			return this.wp.msg("label.browserReport", "&lt;canvas&gt; plugin/pdf");
		}
	},

	/**
	 * Display the node.
	 * 
	 * @method display
	 * @public
	 */
	display : function PdfViewer_display()
	{
		var fileurl, displaysource, previewHeight;

		previewHeight = this.wp.setupPreviewSize();

		if (this.attributes.src)
		{
			// We do not use the built in function to get url, since pdf.js will
			// strip
			// attributes from the url. Instead we add it back in pdfviewer.js
			fileurl = Alfresco.constants.PROXY_URI + "api/node/" + this.wp.options.nodeRef.replace(":/", "") + "/content/thumbnails/pdf/" + this.wp.options.name
					+ '.pdf';
		} else
		{
			fileurl = this.wp.getContentUrl();
		}
		if (this.attributes.canvassupport)
		{
			// html5 is supported, display with pdf.js
			// id and name needs to be equal, easier if you need scripting access
			// to iframe
			displaysource = '<iframe id="PdfViewer" name="PdfViewer" src="' + Alfresco.constants.URL_PAGECONTEXT + 'pdfviewer?file=' + fileurl
					+ '" scrolling="yes" marginwidth="0" marginheight="0" frameborder="0" vspace="5" hspace="5"  style="height:' + (previewHeight - 10).toString()
					+ 'px;"></iframe>';
		} else if (this.attributes.pdfplugininstalled)
		{
			// Display with the pdf plugin
			if (this.attributes.src)
			{
				// In this case we need the attributes, so add them
				fileurl += '?noCache=' + new Date().getTime() + '&c=force';
			}

			displaysource = '<div id="iframe-view-controls"><div class="iframe-viewer-button">';
			displaysource += '<a title="View In Browser" class="simple-link" href="' + fileurl;
			displaysource += '" target="_blank" style="background-image:url(' + Alfresco.constants.URL_RESCONTEXT
					+ 'components/documentlibrary/actions/document-view-content-16.png)">';
			displaysource += '<span>' + Alfresco.util.message("actions.document.view") + ' </span></a></div></div>'
			// Set the iframe
			displaysource += '<iframe id="PdfViewer" name="PdfViewer" src="' + fileurl
					+ '" scrolling="yes" marginwidth="0" marginheight="0" frameborder="0" vspace="0" hspace="0"  style="height:' + (previewHeight - 10).toString()
					+ 'px;"></iframe>';
		} else
		{
			// We should not get here, but if we do, report
			displaysource = 'Error loading pdf viewer ' + this.attributes.canvassupport + ' ' + this.attributes.pdfplugininstalled;
		}
		return displaysource;

	},

	/**
	 * Detect PDF plugin in IE
	 * 
	 * @method _detectPdfPluginIE
	 * @private
	 */
	_detectPdfPluginIE : function PdfViewer_detectPDFPluginIE()
	{
		// TODO: Add more known pdf plugins
		if (window.ActiveXObject)
		{
			var control = null;
			try
			{
				// AcroPDF.PDF is used by version 7 and later
				control = new ActiveXObject('AcroPDF.PDF');
			} catch (e)
			{
				// Do nothing
			}
			if (!control)
			{
				try
				{
					// PDF.PdfCtrl is used by version 6 and earlier
					control = new ActiveXObject('PDF.PdfCtrl');
				} catch (e)
				{
				}
			}
			if (!control)
			{
				try
				{
					// PDF.PdfCtrl is used by version 6 and earlier
					control = new ActiveXObject('FOXITREADEROCX.FoxitReaderOCXCtrl.1');
				} catch (e)
				{
				}
			}
			if (control)
			{
				return true;
			}
		}

		return false;
	}
};