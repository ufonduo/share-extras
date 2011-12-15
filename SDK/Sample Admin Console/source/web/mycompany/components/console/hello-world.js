// Ensure MyCompany namespace exists
if (typeof MyCompany == "undefined" || !MyCompany)
{
    var MyCompany = {};
}
(function() // Function closure
{
    MyCompany.ConsoleHelloWorld = function(htmlId) // Component constructor
    {
        /* Give instance a name and call the superclass constructor */
        this.name = "MyCompany.ConsoleHelloWorld";
        MyCompany.ConsoleHelloWorld.superclass.constructor.call(this, htmlId);
        
        /* Register this component */
        Alfresco.util.ComponentManager.register(this);

        /* Load required YUI Components */
        Alfresco.util.YUILoaderHelper.require(["button", "container", "datasource", "datatable", "json", "history"], this.onComponentsLoaded, this);

        /* Define panel handlers */
        
        var parent = this; // Cached reference to object since 'this' may refer to something else in handler functions
        
        // NOTE: the panel registered first is considered the "default" view and is displayed first
        
        /* Form Panel Handler */
        FormPanelHandler = function FormPanelHandler_constructor() // 'form' panel constructor
        {
            FormPanelHandler.superclass.constructor.call(this, "form");
        };
        
        YAHOO.extend(FormPanelHandler, Alfresco.ConsolePanelHandler, // Extend Alfresco.ConsolePanelHandler
        {
            /**
             * Called by the ConsolePanelHandler when this panel shall be loaded
             *
             * @method onLoad
             */
            onLoad: function onLoad() // Fired on initial panel load
            {
                // Buttons
                parent.widgets.createButton = Alfresco.util.createYUIButton(parent, "test-button", parent.onTestClick);
            }
        });
        new FormPanelHandler(); // Instantiate panel instance
        
        // Define any additional form panels here...
        
        return this;
    };
   
    YAHOO.extend(MyCompany.ConsoleHelloWorld, Alfresco.ConsoleTool,
    {
        /**
         * Object container for initialization options
         *
         * @property options
         * @type object
         */
        options: // Console component configurable options
        {
        },

        /**
         * Fired by YUI when parent element is available for scripting.
         * Component initialisation, including instantiation of YUI widgets and event listener binding.
         *
         * @method onReady
         */
        onReady: function ConsoleHelloWorld_onReady() // Fired when component ready
        {
            // Call super-class onReady() method
            MyCompany.ConsoleHelloWorld.superclass.onReady.call(this);
        },
        
        /**
         * YUI WIDGET EVENT HANDLERS
         * Handlers for standard events fired from YUI widgets, e.g. "click"
         */

        /**
         * Test button click event handler
         *
         * @method onTestClick
         * @param e {object} DomEvent
         * @param args {array} Event parameters (depends on event type)
         */
        onTestClick: function ConsoleHelloWorld_onTestClick(e, args)
        {
            Alfresco.util.PopupManager.displayMessage({
                text: this.msg("text.hello")
            });
        }
    });

})(); // End function closure