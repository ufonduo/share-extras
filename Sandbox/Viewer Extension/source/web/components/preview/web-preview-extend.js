/**
 * This file is part of the Share Extras pdfJS project.
 * It is an extension/rewrite of of Alfresco source code
 * and subject to their license.
 */

/**
 * This is an extension point for comment methods and properties used by viewers
 * in the extension project.
 * 
 */

(function()
{

	if (typeof Alfresco.ViewerExtension == "undefined" || !Alfresco.ViewerExtension)
	{
		Alfresco.ViewerExtension = {};
	}

	Alfresco.ViewerExtension.prototype = {
		/**
		 * Will find a previewer and set it up if one existed
		 * 
		 * @method resolvePreviewer
		 * @return {integer} size in pixels that preview div is set to
		 * @public
		 */
		setupPreviewSize : function WP_setupPreviewSize()
		{
			var sourceYuiEl = new YAHOO.util.Element(this.widgets.previewerElement), previewHeight, docHeight = YAHOO.util.Dom.getDocumentHeight(), clientHeight = YAHOO.util.Dom
					.getClientHeight(), elementPresent;
			// Take the smaller of the two
			previewHeight = (docHeight < clientHeight) ? docHeight : clientHeight;

			// see if the comments are loaded
			elementPresent = YAHOO.util.Dom.getElementsByClassName("comments-list");
			if (elementPresent.length > 0)
			{
				// there is a comment section, subtract space for that
				previewHeight = previewHeight - 108;
			}
			elementPresent = YAHOO.util.Dom.getElementsByClassName("comment-content");
			if (elementPresent.length > 0)
			{
				// there is a comment, at least allow for some of it to display
				previewHeight = previewHeight - 110;
			}
			elementPresent = YAHOO.util.Dom.getElementsByClassName("site-navigation");
			if (elementPresent.length > 0)
			{
				// there is a navigation section, subtract space for that
				previewHeight = previewHeight - 125;
			}
			elementPresent = YAHOO.util.Dom.getElementsByClassName("node-header");
			if (elementPresent.length > 0)
			{
				// there is a node header section, subtract space for that
				previewHeight = previewHeight - 110;
			}
			
			sourceYuiEl.setStyle("height", previewHeight + "px");

			return previewHeight;

		}

	}

	YAHOO.lang.augmentProto(Alfresco.WebPreview, Alfresco.ViewerExtension);
})();