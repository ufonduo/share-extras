/**
 * This file is part of the Share Extras pdfJS project.
 * It is an extension/rewrite of of Alfresco source code
 * and subject to their license.
 */

/**
 * This is the "IframeView" plugin used to display text files using the <iframe>
 * element.
 * 
 * Supports at least the following mime types: "plain/text".
 * 
 * @param wp
 *           {Alfresco.WebPreview} The Alfresco.WebPreview instance that decides
 *           which plugin to use
 * @param attributes
 *           {Object} Arbitrary attributes brought in from the <plugin> element
 */
Alfresco.WebPreview.prototype.Plugins.IframeView = function(wp, attributes)
{
   this.wp = wp;
   this.attributes = YAHOO.lang.merge(Alfresco.util.deepCopy(this.attributes), attributes);
   return this;
};

Alfresco.WebPreview.prototype.Plugins.IframeView.prototype =
   {
      /**
       * Attributes
       */
      attributes :
         {
            /**
             * Decides if the node's content or one of its thumbnails shall be
             * displayed. Leave it as it is if the node's content shall be used.
             * Set to a custom thumbnail definition name if the node's thumbnail
             * contains the IframeView to display.
             * 
             * @property src
             * @type String
             * @default null
             */
            src : null,
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
      report : function IframeView_report()
      {
         // Report nothing since all browsers support the <iframe> element
         // ....well maybe not ascii browsers :-)
      },
      
      /**
       * Display the node.
       * 
       * @method display
       * @public
       */
      display : function IframeView_display()
      {
         var src = this.wp.getContentUrl(), displaysrc;
         displaysrc = '<div id="iframe-view-controls"><div class="iframe-viewer-button">';
         displaysrc += '<a title="View In Browser" class="simple-link" href="' + src;
         displaysrc += '" target="_blank" style="background-image:url(' + Alfresco.constants.URL_RESCONTEXT
               + 'components/documentlibrary/actions/document-view-content-16.png)">';
         displaysrc += '<span>' + Alfresco.util.message("actions.document.view") + ' </span></a></div></div>'
         // Set the iframe
         displaysrc += '<iframe id="IframeView" src="' + src
               + '" scrolling="yes" marginwidth="0" marginheight="0" frameborder="0" vspace="5" hspace="5" ></iframe>';
         return displaysrc;
      }
   };