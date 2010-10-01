Ext.QuickTips.init ();

Ext.BLANK_IMAGE_URL = "skin/custom/static/s.gif";

Ext.namespace ("Mantis");

Mantis.Application = function () {
    var viewport;
    
    var panel;
    
    return {
        /** Initialises the Application, and sets up a main card panel that all
         * other classes can add to.
         */
        init: function () {
            if (this.viewport === undefined) {
                // Set up the holder panel
                this.panel = new Ext.Panel ({
                    id: "Mantis.Application.panel", 
                    region: "center", 
                    layout: "card",
                    items: [
                        {
                            bodyStyle: 'background-color:#B6E0A3;'
                        }
                    ],
                    activeItem:0
                });
                
                // Set up the viewport!
                this.viewport = new Ext.Viewport ({
                    id: "Mantis.Application.viewport", 
                    layout: "border",
                    items: [{
                            region: "north", 
                            layout: "fit", 
                            contentEl: "pageHeader",
                            height: 70
                        }, 
                        this.panel
                    ]
                });
            }
            
            // now show the login page
            if (Mantis.Login !== undefined) {
                Mantis.Login.show();
            } else if (Mantis.PasswordReset !== undefined) {
                Mantis.PasswordReset.show();
            }
        },
        addPanel: function (panel) {
            this.panel.add (panel);
        },
        showPanel: function (id) {
            this.panel.getLayout().setActiveItem (id);
        }
    };
} ();

Ext.onReady (function () {
    Mantis.Application.init ();
});