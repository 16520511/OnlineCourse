import React from "react";
import {Modal} from 'react-materialize'
 
export default () => (
    <Modal className="authModal"
    trigger={<a href="#">Newsletter</a>}>
    <div>
    <h6 className='teal-text center'>Subscribe to our newsletter for news about events, special discount...</h6>
        <form id="WebToLeadForm" action="http://localhost/huycrm/index.php?entryPoint=WebToPersonCapture" method="POST" name="WebToLeadForm">
            <div className="input-field">
                <label>Your Name: <span class="required">*</span></label>
                <input name="last_name" id="last_name" type="text" required="" />
            </div>
            <div className="input-field">
                <label>Email Address:  <span class="required">*</span></label>
                <input name="email1" id="email1" type="email" required=""/>
            </div>
            <button name="Submit" className='btn blue-grey' type="submit" onclick="submit_form();">Subscribe</button>
            <input name="campaign_id" id="campaign_id" type="hidden" value="9ce38a61-ed48-8bfe-d31b-5c4a8a38b82f" />
            <input name="redirect_url" id="redirect_url" type="hidden" value="https://mysterious-river-53514.herokuapp.com/" />
            <input name="assigned_user_id" id="assigned_user_id" type="hidden" value="1" /> <input name="moduleDir" id="moduleDir" type="hidden" value="Leads" />
        </form>
    </div>
    </Modal>
);