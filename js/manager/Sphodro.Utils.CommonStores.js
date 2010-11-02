/*******************************************************************************
 *******************************************************************************
 ** Author: Samuel Levy <sam@samuellevy.com>
 ** 
 ** File: js/manager/Sphodro.Utils.CommonStores.js
 ** 
 ** Description: Common store data for manager users
 **
 ** Copyright (c) 2010 Samuel Levy
 ** 
 ** Sphodro is free software: you can redistribute it and/or
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
Sphodro.Utils.CommonStores = function () {
    return {
        // search options for calls; manager users can see all calls in the system
        callsSearchFilter:[['Calls assigned to me','assigned'],['Calls opened by me','opened'],['All Calls','all']],
        // order options for calls
        callsOrderFilter:[['Most recent','recent'],['Most urgent','urgent']],
        // call priority
        callPriority:[['critical','Critical'],['urgent','Urgent'],['moderate','Moderate'],['minor','Minor'],['negligible','Negligible']],
        /** USER MANAGEMENT **/
        // user types for adding users; manager users can only add managers or standard users
        userTypesActive:[['Manager','manager'],['Standard User','user']],
        // user types for editing users; manager users can set user types up to manager
        userTypesAll:[['Manager','manager'],['Standard User','user'],['Disabled','disabled']]
    };
} ();