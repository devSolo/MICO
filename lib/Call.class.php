<?php
/*******************************************************************************
 *******************************************************************************
 ** Author: Samuel Levy <sam@samuellevy.com>
 ** 
 ** File: lib/Call.class.php
 ** 
 ** Description: Defines the call class and exceptions
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

class Call {
    protected $id;
    protected $user_id;
    protected $date;
    protected $caller_name;
    protected $company_name;
    protected $message;
    protected $users;
    protected $contact;
    protected $priority;
    protected $status;
    protected $action;
    protected $comments;
    
    // some save-data variables
    protected $dirty;
    protected $changes;
    protected $can_update;
    
    // Constructors
    /** Builds the call object off an ID
     * @param int $id The call ID
     * @return Call A call object
     */
    static function by_id($id) {
        $call = new Call();
        $call->set_id($id);
        $call->load();
        return $call;
    }
    
    // accessors
    function get_id() {
        return $this->id;
    }
    /** Gets user that took the call
     * @return User The user that took the call
     */
    function get_taker() {
        return User::by_id($this->user_id);
    }
    function get_date() {
        return $this->date;
    }
    function get_caller() {
        return $this->caller_name;
    }
    function get_company() {
        return $this->caller_company;
    }
    function get_message() {
        return $this->message;
    }
    /** Gets all users that this call is assigned to
     * @return array An array of user objects
     */
    function get_users() {
        $users = array();
        
        // build user objects for each user id
        foreach ($this->users as $u_id) {
            $users[] = User::by_id($u_id);
        }
        
        return $users;
    }
    function get_contacts() {
        return $this->contacts;
    }
    function get_priority() {
        return $this->priority;
    }
    function get_status() {
        return $this->status;
    }
    function get_action() {
        return $this->action;
    }
    
    // builds an array for returning call info through an API
    function to_array() {
        // Get taker information
        $taker = $this->get_taker();
        $users = $this->get_users();
        
        // build the array
        $arr = array("id"       =>$this->id,
                     "taker"    =>array("id"    =>$taker->get_id(),
                                        "name"  =>$taker->get_var('name')),
                     "date"     =>$this->date,
                     "caller"   =>$this->caller_name,
                     "company"  =>$this->company_name,
                     "message"  =>$this->message,
                     "users"    =>array(),  // a blank array for users - we'll fill this shortly
                     "contact"  =>$this->contact,
                     "priority" =>$this->priority,
                     "status"   =>$this->status,
                     "action"   =>$this->action,
                     "comments" =>$this->comments);
        
        // get the users
        foreach ($users as $u) {
            $arr['users'][] = array("id"    =>$u->get_id(),
                                    "name"  =>$u->get_var('name'));
        }
        
        return $arr;
    }
    
    function is_dirty() {
        return $this->dirty;
    }
    
    // mutators
    function set_id($id) {
        $this->id = intval($id);
    }
    
    /** Add a user to the call
     * @param int $id The user id
     */
    function add_user($id) {
        $id = intval($id);
        
        // add the user (if we don't have it already)
        if ($id > 0 && !in_array($id,$this->users)) {
            if (!isset($this->changes["user"])) { $this->changes["user"] = array(); }
            // add the change
            if (!array_key_exists($id,$this->changes["user"])) {
                try {
                    $u = User::by_id($id);
                    $this->dirty = true;
                    $this->changes["user"][$id] = $u;
                } catch (UserException $e) { /* Silently discard */ }
            }
        }
    }
    
    /** Add a comment to the call
     * @param string $comment The comment
     */
    function add_comment($comment) {
        // clean the comment
        $comment = trim(htmlspecialchars($comment));
        // check if it has any text
        if (strlen($comment)) {
            $this->dirty = true;
            $this->changes["comment"] = $comment;
        }
    }
    
    /** Sets the priority
     * @param string $priority The call priority
     */
    function set_priority($priority) {
        if (in_array($priority, array('critical','urgent','moderate','minor','negligible')) && $priority != $this->priority) {
            $this->dirty = true;
            $this->changes['priority'] = $priority;
        }
    }
    
    /** Sets the status
     * @param string $status The call status
     */
    function set_status($status) {
        if (in_array($status, array('new','closed')) && $status != $this->status) {
            $this->dirty = true;
            $this->changes['status'] = $status;
        }
    }
    
    /** Sets the user id of the updater
     * @param int $id The user ID
     */
    function set_updater($id) {
        $id = intval($id);
        
        try {
            $user = User::by_id($id);
            
            // check that the updater either opened the call, was assigned the call, or is a manager
            if ($id == $this->user_id || in_array($id,$this->users) || in_array($user->get_role(),array('manager','admin'))) {
                $this->changes['updater'] = $user;
                $this->can_update = true;
            }
        } catch (UserNotFoundException $e) { /* Can't find the updating user - no need to fail, though */ }
    }
    
    /** Notifies the object that the update is being performed by the system, not a user */
    function system_updater() {
        $this->changes['updater'] = null;
        $this->can_update = true;
    }
    
    // other stuff
    /** Loads all values into the object from the database */
    function load() {
        // Include the Language file
        global $LANG;
        
        // clean the user id
        $id = intval($this->id);
        
        // Get the user information
        $query = "SELECT `id`, `user_id`, `date`, `caller_name`, `company_name`,
                         `message`,`contact`,`priority`,`status`,`action`
                  FROM `".DB_PREFIX."calls`
                  WHERE `id`=$id";
        $res = run_query($query);
        
        // now set the values
        if ($row = mysql_fetch_assoc($res)) {
            // set the call information
            $this->user_id = $row['user_id'];
            $this->date = $row['date'];
            $this->caller_name = $row['caller_name'];
            $this->company_name = $row['company_name'];
            $this->message = $row['message'];
            $this->contact = unserialize($row['contact']);
            $this->priority = $row['priority'];
            $this->status = $row['status'];
            $this->action = $row['action'];
            
            // now get all the users attached
            $query = "SELECT `user_id`
                      FROM `".DB_PREFIX."user_calls`
                      WHERE `call_id`=$id";
            $res = run_query($query);
            
            // get the users
            $this->users = array();
            while($row = mysql_fetch_assoc($res)) {
                $this->users[] = intval($row['user_id']);
            }
            
            // and the comments (if there are any) sorted oldest first
            $query = "SELECT `id`,`user_id`,`date`,`action`,`comment`
                      FROM `".DB_PREFIX."call_comments`
                      WHERE `call_id`=$id
                      ORDER BY `date` ASC";
            $res = run_query($query);
            $this->comments = array();
            while($row = mysql_fetch_assoc($res)) {
                // get the commenter's name
                if ($row['user_id'] !== null) {
                    $commenter = User::by_id($row['user_id']);
                    $row['commenter'] = $commenter->get_var('name');
                } else {
                    $row['commenter'] = 'system';
                }
                
                // add the comment to the array
                $this->comments[] = $row;
            }
            
            // and mark the object as clean
            $this->dirty = false;
            $this->changes = array();
            $this->can_update = false;
        } else {
            throw new CallNotFoundException($LANG->get_string('Call/load/CallNotFoundException'));
        }
    }
    
    /** Commits all changes to the object (essentially saves to the database) */
    function commit() {
        // Include the Language file
        global $LANG;
        
        // check that we either have a user or the system updating
        if ($this->can_update) {
            // check that there is SOMETHING to update
            if ($this->dirty) {
                // only save the changes if the call isn't closed (and we're not re-opening it)
                if ($this->status == "new" || isset($this->changes['status'])) {
                    // check for updates to status or priority
                    if (isset($this->changes['status']) || $this->changes['priority']) {
                        // simple way of collating the changes
                        $call_changes = array();
                        // No need to be too defensive here. The only way to set these
                        // 'changes' is through functions that validate
                        if (isset($this->changes['status'])) {
                            $call_changes[] = "`status`='".$this->changes['status']."'";
                        }
                        if (isset($this->changes['priority'])) {
                            $call_changes[] = "`priority`='".$this->changes['priority']."'";
                        }
                        
                        // and make the updates
                        $query = "UPDATE `".DB_PREFIX."calls`
                                  SET ".implode(',',$call_changes)."
                                  WHERE `id`=".intval($this->id);
                        run_query($query);
                    }
                    
                    // check for adding/escalating to a user
                    if (isset($this->changes['user'])) {
                        // simple way of sorting out the user queries
                        $user_queries = array();
                        foreach ($this->changes['user'] as $u_id=>$user) {
                            $user_queries[] = "(".intval($u_id).",".intval($this->id).")";
                        }
                        
                        // and update
                        $query = "INSERT INTO `".DB_PREFIX."user_calls` (`user_id`,`call_id`)
                                  VALUES ".implode(",",$user_queries);
                        run_query($query);
                    }
                    
                    // Comment action should be save with the system language, not the user language
                    $l = $LANG->get_language(); // Get the current language
                    $LANG->set_language(Settings::get_default('LANGUAGE','EN'));
                    
                    // get the comment 'action' for context
                    $comment_text = "";
                    if (isset($this->changes['status']) && $this->changes['status'] == "closed") {
                        // Call closed
                        $comment_text = $LANG->get_string('Call/commit/CallClosed');
                    } else if (isset($this->changes['status']) && isset($this->changes['priority']) && isset($this->changes['user'])) {
                        // Call Reopened and Escalated to new users
                        if (count($this->changes['user'])==1) {
                            // Escalated to one user
                            $comment_text = $LANG->get_string('Call/commit/CallReopenedEscalatedPerson');
                        } else {
                            // Escalated to multiple users
                            $comment_text = $LANG->get_string('Call/commit/CallReopenedEscalatedPeople', array('%%NUM_PEOPLE%%'=>count($this->changes['user'])));
                        }
                    } else if (isset($this->changes['status']) && isset($this->changes['priority'])) {
                        // Call Reopened and Escalated
                        $comment_text = $LANG->get_string('Call/commit/CallReopenedEscalated');
                    } else if (isset($this->changes['status'])) {
                        // Call Reopened
                        $comment_text = $LANG->get_string('Call/commit/CallReopened');
                    } else if (isset($this->changes['priority']) && isset($this->changes['user'])) {
                        // Call Escalated to new users
                        if (count($this->changes['user'])==1) {
                            // Escalated to one user
                            $comment_text = $LANG->get_string('Call/commit/CallEscalatedPerson');
                        } else {
                            // Escalated to multiple users
                            $comment_text = $LANG->get_string('Call/commit/CallEscalatedPeople', array('%%NUM_PEOPLE%%'=>count($this->changes['user'])));
                        }
                    } else if (isset($this->changes['priority'])) {
                        // Call Escalated
                        $comment_text = $LANG->get_string('Call/commit/CallEscalated');
                    } else if (isset($this->changes['user'])) {
                        // Call assigned to new users
                        if (count($this->changes['user'])==1) {
                            // Assigned to one user
                            $comment_text = $LANG->get_string('Call/commit/CallAssignedPerson');
                        } else {
                            // Assigned to multiple users
                            $comment_text = $LANG->get_string('Call/commit/CallAssignedPeople', array('%%NUM_PEOPLE%%'=>count($this->changes['user'])));
                        }
                    } else if (isset($this->changes['comment'])) {
                        // Just a comment
                        $comment_text = $LANG->get_string('Call/commit/Comment');
                    } else {
                        // set a blank comment for the query
                        $this->changes['comment'] = '';
                    }
                    
                    // Return the language file to it's original language
                    $LANG->set_language($l);
                    
                    // now add the comment
                    $query = "INSERT INTO `".DB_PREFIX."call_comments` (`call_id`,`user_id`,`date`,`action`,`comment`)
                              VALUES (".intval($this->id).", -- call ID
                                      ".($this->changes['updater']===null?'NULL':$this->changes['updater']->get_id()).", -- User id or null for system update
                                      '".date('Y-m-d H:i:s')."', -- date of the change
                                      '".mysql_real_escape_string($comment_text)."', -- the comment action text
                                      '".mysql_real_escape_string($this->changes['comment'])."')";
                    run_query($query);
                    
                    // get the comment id
                    $c_id = mysql_insert_id();
                    
                    // notify new users added to the call
                    if (isset($this->changes['user'])) {
                        foreach ($this->changes['user'] as $u) {
                            $u->add_notification($this->id,'assigned',$c_id);
                        }
                    }
                    
                    // notify old users of the update
                    $users = $this->get_users();
                    foreach ($users as $u) {
                        // dont' notify the user that did the update
                        if ($this->changes['updater'] !== null && $u->get_id() != $this->changes['updater']->get_id()) {
                            $u->add_notification($this->id,'updated',$c_id);
                        }
                    }
                    
                    // and now that we're done, re-sync with the database
                    $this->load();
                } else {
                    throw new CallClosedException($LANG->get_string('Call/commit/CallClosedException'));
                }
            } else {
                throw new CallUpdateException($LANG->get_string('Call/commit/CallUpdateException'));
            }
        } else {
            throw new CallPermissionException($LANG->get_string('Call/commit/CallPermissionException'));
        }
    }
}

// exceptions
class CallException extends Exception {}
class CallNotFoundException extends CallException {}

// update exceptions
class CallUpdateException extends CallException {}
class CallUpdatePermissionException extends CallUpdateException {}
class CallClosedException extends CallUpdateException {}
?>