/*******************************************************************************
 *******************************************************************************
 ** Author: Samuel Levy <sam@samuellevy.com>
 ** 
 ** File: js/Mantis.Calls.js
 ** 
 ** Description: The main 'calls' section of the system
 **
 ** Copyright (c) 2010 Samuel Levy
 ** 
 ** Mantis Simple Call Centre is free software: you can redistribute it and/or
 ** modify it under the terms of the GNU Lesser General Public License as
 ** published by the Free Software Foundation, either version 3 of the License,
 ** or (at your option) any later version.
 **
 ** This program is distributed in the hope that it will be useful, but WITHOUT
 ** ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 ** FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License
 ** for more details.
 **
 ** You should have received a copy of the GNU Lesser General Public License
 *******************************************************************************
 ******************************************************************************/
Ext.namespace('Mantis.Calls');

Mantis.Calls = function () {
    // menu id
    var menuId;
    
    // main panel
    var panel;
    
    return {
        /** Adds the link to the menu */
        init: function () {
            if (this.menuId == undefined) {
                this.menuId = Mantis.SystemMenu.addItem('Calls', 'Mantis.Calls.show()','system');
            }
        },
        /** Shows the panel */
        show: function () {
            if (this.panel == undefined) {
                // ensure that the menu item is initialised
                if (this.menuId == undefined) {
                    this.init();
                }
                
                // set up the panel
                this.panel = new Ext.Panel({
                    id:'Mantis.Calls.panel',
                    layout:'border'
                });
                
                // Build the panels
                Mantis.Calls.AddCall.show();
                Mantis.Calls.ViewCalls.show();
                
                // Add to the main panel
                Mantis.Application.addPanel(this.panel);
            }
            
            // mark this panel as selected
            Mantis.SystemMenu.markSelected(this.menuId);
            Mantis.Application.showPanel('Mantis.Calls.panel');
        },
        /** Adds a panel to this panel
         * @param panel {Ext.Panel} The panel to add
         */
        addPanel: function (panel) {
            this.panel.add(panel);
        },
        /** Updates a call
         * @param id {int} The call ID to update
         * @param updates {object} The updates to make. Options are:
         *          status {string} new|closed
         *          priority {string} critical|urgent|moderate|minor|negligible
         *          users {int|array} A user ID to add to the call, or an array of user IDs
         *          comment {string} A comment for the update
         */
        updateCall: function (id,updates) {
            var conn = new Ext.data.Connection();
            
            // build the base paramaters object
            var params = {
                session: Mantis.User.getSession(),
                id:id
            }
            
            // add the extra parameters (if they exist)
            if (updates.status !== undefined) { params.status = updates.status; }
            if (updates.priority !== undefined) { params.priority = updates.priority; }
            // users can be either an integer or an array
            if (updates.users !== undefined) { params.users = (typeof(updates.users)=='int'?updates.users:Mantis.Utils.serialiseArray(updates.users)); }
            if (updates.comment !== undefined) { params.comment = updates.comment; }
            
            // make the call
            conn.request({
                url:APP_ROOT+'/api.php?f=updateCall',
                params: params,
                callback: function (options, success, response) {
                    var res = Ext.decode(response.responseText);
                    if (success && res.success) {
                        Mantis.Calls.ViewCalls.gridStore.reload();
                    } else {
                        var msg = "Unknown system error";
                        if (res.info !== undefined) {
                            msg = res.info;
                        }
                        Ext.Msg.alert("Error", msg);
                    }
                },
                scope: this
            });
        },
        /** Checks for updates affecting the active user */
        checkUpdates: function () {
            var conn = new Ext.data.Connection();
            
            conn.request({
                url:APP_ROOT+'/api.php?f=getLastUpdate',
                params: { session: Mantis.User.getSession() },
                callback: function (options, success, response) {
                    var res = Ext.decode(response.responseText);
                    if (success && res.success) {
                        // check if there have been any updates
                        if (res.lastupdate != Mantis.User.getVar('lastupdate')) {
                            // don't reload if we're viewing a call
                            if (Mantis.Calls.ViewCalls.grid.getSelectionModel().getCount() !== 1) {
                                // reload the grid
                                Mantis.Calls.ViewCalls.gridStore.reload();
                                
                                dirty = Mantis.User.dirty;
                                // set the variable
                                Mantis.User.setVar('lastupdate',res.lastupdate);
                                // commit the changes locally
                                Mantis.User.commit(true);
                            }
                        }
                    } else {
                        // if the user's session has expired, block access to the system, and refresh
                        if (res.sessionexpired) {
                            Ext.Msg.alert('Session Expired','Your session has expired.<br /><br />You will now be redirected to the login page.',function () {window.location=APP_ROOT;}, this);
                        }
                    }
                    
                    // if we're not logged out, check again
                    if (!res.sessionexpired) {
                        // set the timeout to check again in 15 seconds
                        this.updateTimeout = setTimeout('Mantis.Calls.checkUpdates()',15000);
                    }
                },
                scope: this
            });
        }
    };
} ();