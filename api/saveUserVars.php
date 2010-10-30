<?php
/*******************************************************************************
 *******************************************************************************
 ** Author: Samuel Levy <sam@samuellevy.com>
 ** 
 ** File: api/saveUserVars.php
 ** 
 ** Description: Saves a user's variables
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

// get the values
$vars = unserialize($_POST['vars']);

// go through and set the required variables to update
foreach ($vars as $k=>$v) {
    // check for a strict boolean true or false
    if (boolval($v,true)!== null) {
        $v = boolval($v,true);
    } else {
        $v = trim(html_scrub($v));
    }
    // Check if the update is a change
    if ($user->get_var($k) != $v) {
        $user->set_var($k,$v);
    }
}

// if anything was changed, commit it
if ($user->is_dirty()) {
    $user->commit();
}

// notify the client that the update was successful.
$data = array("success"=>true);
?>