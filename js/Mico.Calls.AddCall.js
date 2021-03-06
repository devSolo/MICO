/*******************************************************************************
 *******************************************************************************
 ** Author: Samuel Levy <sam@samuellevy.com>
 ** 
 ** File: js/Mico.Calls.AddCall.js
 ** 
 ** Description: Defines the 'Add Call' functionality
 **
 ** Copyright (c) 2010 Samuel Levy
 ** 
 ** Mico is free software: you can redistribute it and/or
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

Mico.Calls.AddCall = function () {
    // caller form
    var callerForm;
    var callerNameStore;
    var callerNameField;
    var callerCompanyStore;
    var callerCompanyField;
    var userStore;
    var userField;
    var userAddExtraButton;
    // user extras
    var userExtrasForm;
    var extraUserFieldCount;
    // Message form
    var callerMessageBox;
    var callerMessageForm;
    var callerContactStore;
    var callerContactField;
    var callerContactAddExtraButton;
    // caller contact form
    var callerContactExtraForm;
    var extraContactFieldCount;
    // priority/actions form
    var callPriorityField;
    var actionField;
    var priorityForm;
    
    // buttons
    var addCallButton;
    var clearFormButton;
    var buttonPanel;
    
    // main panel
    var panel;
    
    return {
        /** Shows the panel */
        show: function () {
            if (this.panel == undefined) {
                // Caller form
                this.callerNameStore = new Ext.data.Store({
                    url: APP_ROOT+"/api.php?f=getCallerName",
                    reader: new Ext.data.JsonReader ({
                        root: "caller", 
                        id: "name"
                    }, [
                        {name: "name", mapping: "name"}, 
                        {name: "match", mapping: "match"}
                    ]), 
                    baseParams: {
                        session: Mico.User.getSession()
                    },
                    disableCaching:true
                });
                
                // if we load, only have one 'option', and have nothing set, just assume that that option is it
                this.callerNameStore.on('load', function (store, recs, opts) {
                    if (recs.length == 1 && this.callerNameField.getRawValue() == '') {
                        this.callerNameField.setValue(recs[0].get('name'));
                        this.callerNameVal = recs[0].get('name');
                    }
                }, this);
                
                // and make sure we don't load when we have nothing to filter on
                this.callerNameStore.on('beforeload', function (store, opts) {
                    var doLoad = true;
                    if ((opts.params.filter == '' || opts.params.filter == undefined) &&
                            (opts.params.query == '' || opts.params.query == undefined)) {
                        doLoad = false;
                    }
                    return doLoad;
                }, this);
                
                // and the field
                this.callerNameField = new Ext.form.ComboBox({
                    store: this.callerNameStore,
                    triggerAction: 'all',
                    hideTrigger:true,
                    required:false,
                    allowBlank:true,
                    editable:true,
                    autoSelect:false,
                    valueField:'name',
                    displayField:'name',
                    tpl:Mico.Utils.callerTemplate('name'),
                    mode:'remote',
                    enableKeyEvents: true,
                    emptyText: Mico.Lang.Calls.AddCall.callerNameField_emptyText,
                    width:200,
                    value:''
                });
                
                // if the field is left or something is selected, search for companies
                this.callerNameField.on('blur', function () {
                    // search for companies
                    if (this.callerNameField.getEl().dom.value != '' && this.callerCompanyField.getRawValue() == '') {
                        this.callerCompanyStore.load({params:{
                            filter: this.callerNameField.getEl().dom.value,
                            query: ''
                        }});
                    }
                }, this);
                
                // use a field to track the basic text changes
                this.callerNameVal = '';
                // Load a search
                this.callerNameField.on('keyup', function() {
                    if (String(this.callerNameField.getEl().dom.value).trim().length >= 3) {
                        if (this.callerNameField.getEl().dom.value != this.callerNameVal) {
                            // caller name field is our search term
                            var s = this.callerNameField.getEl().dom.value;
                            // caller company field is our filter
                            var f = this.callerCompanyField.getValue();
                            // and search
                            this.callerNameStore.load({params:{query:s,filter:f}});
                        }
                    }
                    // set the caller name val
                    this.callerNameVal = this.callerNameField.getEl().dom.value;
                }, this);
                
                // caller company
                this.callerCompanyStore = new Ext.data.Store({
                    url: APP_ROOT+"/api.php?f=getCompanyName", 
                    reader: new Ext.data.JsonReader ({
                        root: "company", 
                        id: "name"
                    }, [
                        {name: "name", mapping: "name"}, 
                        {name: "match", mapping: "match"}
                    ]), 
                    baseParams: {
                        session: Mico.User.getSession()
                    },
                    disableCaching:true
                });
                
                // and make sure we don't load when we have nothing to filter on
                this.callerCompanyStore.on('beforeload', function (store, opts) {
                    var doLoad = true;
                    if ((opts.params.filter == '' || opts.params.filter == undefined) &&
                            (opts.params.query == '' || opts.params.query == undefined)) {
                        doLoad = false;
                    }
                    return doLoad;
                }, this);
                
                // if we load, only have one 'option', and have nothing set, just assume that that option is it
                this.callerCompanyStore.on('load', function (store, recs, opts) {
                    if (recs.length == 1 && this.callerCompanyField.getRawValue() == '') {
                        this.callerCompanyField.setValue(recs[0].get('name'));
                        this.callerCompanyVal = recs[0].get('name');
                    }
                }, this);
                
                // and the field
                this.callerCompanyField = new Ext.form.ComboBox({
                    store: this.callerCompanyStore,
                    triggerAction: 'all',
                    hideTrigger:true,
                    required:false,
                    allowBlank:true,
                    editable:true,
                    autoSelect:false,
                    valueField:'name',
                    displayField:'name',
                    tpl:Mico.Utils.callerTemplate('name'),
                    mode:'remote',
                    enableKeyEvents: true,
                    emptyText: Mico.Lang.Calls.AddCall.callerCompanyField_emptyText,
                    width:200,
                    value:''
                });
                
                // when we leave the field or select an item, load the caller store
                this.callerCompanyField.on('blur', function () {
                    // search for caller names
                    if (this.callerCompanyField.getEl().dom.value != '' && this.callerNameField.getRawValue() == '') {
                        this.callerNameStore.load({params:{
                            filter: this.callerCompanyField.getEl().dom.value,
                            query: ''
                        }});
                    }
                }, this);
                
                this.callerCompanyVal = '';
                
                // Load a search
                this.callerCompanyField.on('keyup', function() {
                    if (String(this.callerCompanyField.getEl().dom.value).trim().length >= 3) {
                        if (this.callerCompanyField.getEl().dom.value != this.callerCompanyVal) {
                            // caller name field is our filter
                            var f = this.callerNameField.getValue();
                            // caller company field is our search term
                            var s = this.callerCompanyField.getEl().dom.value;
                            // and search
                            this.callerCompanyStore.load({params:{query:s,filter:f}});
                        }
                    }
                    // set the value
                    this.callerCompanyVal = this.callerCompanyField.getEl().dom.value;
                }, this);
                
                // get the list of users
                this.userStore = new Ext.data.Store({
                    url: APP_ROOT+"/api.php?f=getUsers", 
                    reader: new Ext.data.JsonReader ({
                        root: "users", 
                        id: "id"
                    }, [
                        {name: "id", mapping: "id"}, 
                        {name: "name", mapping: "name"}, 
                        {name: "status", mapping: "status"}, 
                        {name: "statustext", mapping: "statustext"}
                    ]), 
                    baseParams: {
                        session: Mico.User.getSession()
                    },
                    disableCaching:true
                });
                
                // and the field
                this.userField = new Ext.form.ComboBox({
                    store: this.userStore,
                    triggerAction: 'all',
                    hideTrigger:false,
                    required:true,
                    allowBlank:false,
                    editable:false,
                    valueField:'id',
                    displayField:'name',
                    tpl:Mico.Utils.userTemplate(),
                    mode:'remote',
                    enableKeyEvents: true,
                    emptyText: Mico.Lang.Calls.AddCall.userField_emptyText,
                    width:200
                });
                
                // force the store to re-load when we expand the field (in case any statuses have changed, etc)
                this.userField.on('focus',function () {
                    this.userStore.load();
                }, this);
                
                this.userAddExtraButton = new Ext.Button({
                    text: Mico.Lang.Calls.AddCall.userAddExtraButton_text,
                    tooltip: Mico.Lang.Calls.AddCall.userAddExtraButton_tooltip,
                    icon: APP_ROOT+'/skin/static/icons/add.png',
                    scope:this,
                    handler: function() {
                        this.addRecipient();
                    }
                });
                
                // and the caller form
                this.callerForm = new Ext.Panel({
                    id:'Mico.Calls.callerForm',
                    layout:'form',
                    width:300,
                    items:[
                        {
                            layout:'hbox',
                            items:[
                                this.callerNameField,
                                {html:'&nbsp;&nbsp;('+Mico.Lang.Calls.AddCall.callerNameField_hint+')',cls:'field-helper'}
                            ]
                        },
                        {html:Mico.Lang.Calls.AddCall.callerCompanyField_label,cls:'field-label'},
                        {
                            layout:'hbox',
                            items:[
                                this.callerCompanyField,
                                {html:'&nbsp;&nbsp;('+Mico.Lang.Calls.AddCall.callerCompanyField_hint+')',cls:'field-helper'}
                            ]
                        },
                        {html:Mico.Lang.Calls.AddCall.userField_label,cls:'field-label'},
                        {
                            layout:'hbox',
                            items:[
                                this.userField,
                                {html:'&nbsp;&nbsp;'},
                                this.userAddExtraButton
                            ]
                        }
                    ],
                    bodyStyle: 'padding-top:8px;',
                    cls:'sub-form',
                    defaults: {
                        hideLabel:true
                    }
                });
                
                // the user extras panel
                this.userExtrasForm = new Ext.Panel({
                    layout:'form',
                    labelWidth: 20,
                    cls:'dynamic-sub-form'
                });
                this.extraUserFieldCount = 0;
                
                // The message box
                this.callerMessageBox = new Ext.form.TextArea({
                    width:270,
                    height:120,
                    emptyText:Mico.Lang.Calls.AddCall.callerMessageBox_emptyText,
                    allowBlank:false,
                    required:true
                });
                
                // caller contact store
                this.callerContactStore = new Ext.data.Store({
                    url: APP_ROOT+"/api.php?f=getCallerContacts",
                    reader: new Ext.data.JsonReader ({
                        root: "contacts", 
                        id: "contact"
                    }, [
                        {name: "contact", mapping: "contact"}, 
                        {name: "match", mapping: "match"}
                    ]), 
                    baseParams: {
                        session: Mico.User.getSession()
                    },
                    disableCaching:true
                });
                
                // and the field
                this.callerContactField = new Ext.form.ComboBox({
                    store: this.callerContactStore,
                    triggerAction: 'all',
                    hideTrigger:true,
                    required:false,
                    allowBlank:true,
                    editable:true,
                    autoSelect:false,
                    valueField:'contact',
                    displayField:'contact',
                    tpl:Mico.Utils.callerTemplate('contact'),
                    mode:'local',
                    enableKeyEvents: true,
                    emptyText:Mico.Lang.Calls.AddCall.callerContactField_emptyText,
                    width:200
                });
                
                this.callerContactField.on('focus',function () {
                    this.callerContactStore.load({params:{
                        caller: this.callerNameField.getValue(),
                        company: this.callerCompanyField.getValue()
                    }}, this);
                }, this);
                
                this.callerContactAddExtraButton = new Ext.Button({
                    text:Mico.Lang.Calls.AddCall.callerContactAddExtraButton_text,
                    tooltip:Mico.Lang.Calls.AddCall.callerContactAddExtraButton_tooltip,
                    icon: APP_ROOT+'/skin/static/icons/add.png',
                    scope:this,
                    handler: function() {
                        this.addcallerContact();
                    }
                });
                
                // and the form to hold it
                this.callerMessageForm = new Ext.Panel({
                    id:'Mico.Calls.callerMessageForm',
                    layout:'form',
                    width:300,
                    items:[
                        {html:Mico.Lang.Calls.AddCall.callerMessageBox_label,cls:'field-label'},
                        this.callerMessageBox,
                        {html:Mico.Lang.Calls.AddCall.callerContactField_label,cls:'field-label'},
                        {
                            layout:'hbox',
                            items:[
                                this.callerContactField,
                                {html:'&nbsp;&nbsp;'},
                                this.callerContactAddExtraButton
                            ]
                        }
                    ],
                    cls:'sub-form',
                    defaults: {
                        hideLabel:true
                    }
                });
                
                // the contact extras panel
                this.callerContactExtraForm = new Ext.Panel({
                    layout:'form',
                    labelWidth: 20,
                    cls:'dynamic-sub-form'
                });
                this.extraContactFieldCount = 0;
                
                // priotiy and action form
                this.callPriorityField = new Ext.form.ComboBox({
                    allowBlank:false,
                    required:true,
                    editable:false,
                    store: new Ext.data.ArrayStore ({
                        fields:['priority','view'],
                        data: Mico.Utils.CommonStores.callPriority
                    }),
                    displayField:'view',
                    valueField:'priority',
                    value:'moderate',
                    mode:'local',
                    triggerAction:'all',
                    tpl:Mico.Utils.priorityTemplate(),
                    lazyInit:false,
                    listeners: {
                        scope:this,
                        'focus': function () { this.callPriorityField.doQuery('',true); } // display the dropdown on focus
                    }
                });
                
                // action field
                this.callActionField = new Ext.form.ComboBox({
                    allowBlank:true,
                    editable:true,
                    store: new Ext.data.ArrayStore ({
                        fields:['action'],
                        data: Mico.Lang.Calls.AddCall.callActionField_data
                    }),
                    displayField:'action',
                    valueField:'action',
                    value:Mico.Lang.Calls.AddCall.callActionField_default,
                    mode:'local',
                    triggerAction:'all',
                    hideTrigger:true,
                    maxLength:200,
                    lazyInit:false,
                    listeners: {
                        scope:this,
                        'focus': function () { this.callActionField.doQuery('',true); } // display the dropdown on focus
                    }
                });
                
                // and the form to hold the action and priority
                this.priorityForm = new Ext.Panel({
                    id:'Mico.Calls.priorityForm',
                    layout:'form',
                    width:300,
                    items:[
                        {html:Mico.Lang.Calls.AddCall.callPriorityField_label,cls:'field-label'},
                        this.callPriorityField,
                        {html:Mico.Lang.Calls.AddCall.callActionField_label,cls:'field-label'},
                        this.callActionField
                    ],
                    cls:'sub-form',
                    defaults: {
                        hideLabel:true
                    }
                });
                
                // add call button
                this.addCallButton = new Ext.Button({
                    text: Mico.Lang.Calls.AddCall.addCallButton_text,
                    scope:this,
                    handler: function() {
                        this.addCall();
                    }
                });
                
                // clear form button
                this.clearFormButton = new Ext.Button({
                    text: Mico.Lang.Calls.AddCall.clearFormButton_text,
                    scope:this,
                    handler: function() {
                        this.clear();
                    }
                });
                
                this.buttonsForm = new Ext.Panel({
                    layout:'fit',
                    buttons: [
                        this.addCallButton,
                        this.clearFormButton
                    ]
                });
                
                // and build the panel
                this.panel = new Ext.Panel ({
                    id: "Mico.Calls.AddCall.panel", 
                    region:'west',
                    width: 300,
                    collapsible: false,
                    layout: 'vbox',
                    cls:'main-form-panel dynamic-panel-scroll-y',
                    items: [
                        this.callerForm,
                        this.userExtrasForm,
                        this.callerMessageForm,
                        this.callerContactExtraForm,
                        this.priorityForm,
                        this.buttonsForm
                    ],
                    title:Mico.Lang.Calls.AddCall.title
                });
                
                // and add it to the main 'calls' section
                Mico.Calls.addPanel(this.panel);
            }
        },
        /** Adds a new recipient dropdown to the 'add call' form */
        addRecipient: function () {
            // build a temporary field
            var tempUserField = new Ext.form.ComboBox({
                id:'tempUserField_'+this.extraUserFieldCount,
                store: this.userStore,
                triggerAction: 'all',
                hideTrigger:false,
                required:false,
                allowBlank:true,
                editable:false,
                valueField:'id',
                displayField:'name',
                tpl:Mico.Utils.userTemplate(),
                mode:'remote',
                enableKeyEvents: true,
                emptyText:Mico.Lang.Calls.AddCall.userField_emptyText,
                width: 175,
                fieldLabel:Mico.Lang.Calls.AddCall.userFieldExtra_label
            });
            
            tempUserField.on('focus',function () {
                this.userStore.load();
            }, this);
            
            // add it to the panel
            this.userExtrasForm.add(tempUserField);
            // increase the counter
            this.extraUserFieldCount ++;
            // ensure that the form is correctly laid out
            this.userExtrasForm.doLayout();
            this.panel.doLayout();
        },
        /** Removes all the extra recipients from the 'add calls' form' */
        clearRecipients: function() {
            // remove all the fields and destroy them
            this.userExtrasForm.removeAll(true);
            // reset the counter
            this.extraUserFieldCount = 0;
            // ensure that the form is correctly laid out
            this.userExtrasForm.doLayout();
            this.panel.doLayout();
        },
        /** Adds a new recipient dropdown to the 'add call' form */
        addcallerContact: function () {
            // build a temporary field
            var tempContactField = new Ext.form.ComboBox({
                id:'tempContactField_'+this.extraContactFieldCount,
                store: this.callerContactStore,
                triggerAction: 'all',
                hideTrigger:true,
                required:false,
                allowBlank:true,
                editable:true,
                autoSelect:false,
                valueField:'contact',
                displayField:'contact',
                tpl:Mico.Utils.callerTemplate('contact'),
                mode:'local',
                emptyText:Mico.Lang.Calls.AddCall.callerContactField_emptyText,
                width: 175,
                fieldLabel:Mico.Lang.Calls.AddCall.callerContactFieldExtra_label
            });
            
            tempContactField.on('focus',function () {
                this.callerContactStore.load({params:{
                    caller: this.callerNameField.getValue(),
                    company: this.callerCompanyField.getValue()
                }}, this);
            }, this);
            
            // add it to the panel
            this.callerContactExtraForm.add(tempContactField);
            // increase the counter
            this.extraContactFieldCount ++;
            // ensure that the form is correctly laid out
            this.callerContactExtraForm.doLayout();
            this.panel.doLayout();
        },
        /** Removes all the extra recipients from the 'add calls' form' */
        clearContacts: function() {
            // remove all the fields and destroy them
            this.callerContactExtraForm.removeAll(true);
            // reset the counter
            this.extraContactFieldCount = 0;
            // ensure that the form is correctly laid out
            this.callerContactExtraForm.doLayout();
            this.panel.doLayout();
        },
        /** Clears all the form elements, resets everything */
        clear: function () {
            this.callerNameField.reset();
            this.callerCompanyField.reset();
            this.userField.reset();
            this.clearRecipients();
            this.callerMessageBox.reset();
            this.callerContactField.reset();
            this.clearContacts();
            this.callPriorityField.reset();
            this.callActionField.reset();
            // clear the stores
            this.callerNameStore.removeAll();
            this.callerNameVal = '';
            this.callerCompanyStore.removeAll();
            this.callerCompanyVal = '';
            this.callerContactStore.removeAll();
        },
        /** Adds a call to the system */
        addCall: function () {
            // collect the data
            var caller = this.callerNameField.getValue().trim();
            var company = this.callerCompanyField.getValue().trim();
            
            // collate the list of users
            var users = [];
            // check the first user field
            var u_id = this.userField.getValue();
            if (u_id > 0) {
                users[users.length] = u_id;
            }
            // now check for extra users
            for (var i = 0; i < this.extraUserFieldCount; i++) {
                u_id = this.userExtrasForm.findById('tempUserField_'+i).getValue();
                if (u_id > 0) {
                    users[users.length] = u_id;
                }
            }
            
            // get more variables
            var message = this.callerMessageBox.getValue().trim();
            
            // collate the list of contacts
            var contacts = [];
            // check the first contact field
            var contact = this.callerContactField.getValue().trim();
            if (contact.length > 0) {
                contacts[contacts.length] = contact;
            }
            // now check for extra contacts
            for (var i = 0; i < this.extraContactFieldCount; i++) {
                contact = this.callerContactExtraForm.findById('tempContactField_'+i).getValue().trim();
                if (contact.length > 0) {
                    contacts[contacts.length] = contact;
                }
            }
            
            // get the final fields
            var priority = this.callPriorityField.getValue();
            var action = this.callActionField.getValue().trim();
            
            // now check that we have everything we need
            if (users.length == 0) {
                // Ensure we have at least one user selected
                this.userField.focus(false,10);
                Ext.Msg.alert(Mico.Lang.Calls.AddCall.validateRecipientsError_title,Mico.Lang.Calls.AddCall.validateRecipientsError_text);
            } else if (caller == '' && company == '' && contacts.length == 0 && message == '') {
                // Ensure we have at least one piece of useful information
                this.callerNameField.focus(false,10);
                Ext.Msg.alert(Mico.Lang.Calls.AddCall.callerDetailsError_title,Mico.Lang.Calls.AddCall.callerDetailsError_text);
            } else {
                // passed our basic validation - add the call
                var conn = new Ext.data.Connection();
                
                conn.request({
                    url:APP_ROOT+'/api.php?f=addCall',
                    params: {
                        session: Mico.User.getSession(),
                        caller: caller,
                        company: company,
                        users: Mico.Utils.serialiseArray(users),
                        message: message,
                        contacts: Mico.Utils.serialiseArray(contacts),
                        priority:priority,
                        action:action
                    },
                    callback: function (options, success, response) {
                        var res = Ext.decode(response.responseText);
                        if (success && res.success) {
                            this.clear();
                            Mico.Calls.ViewCalls.gridStore.reload();
                        } else {
                            var msg = Mico.Lang.Common.unknownError_text;
                            if (res.info !== undefined) {
                                msg = res.info;
                            }
                            Ext.Msg.alert(Mico.Lang.Common.unknownError_title, msg);
                        }
                    },
                    scope: this
                });
            }
        }
    };
} ();