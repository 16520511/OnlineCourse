import React from "react";
import Popup from "reactjs-popup";
 
export default () => (
  <Popup trigger={<a href="#"> Subscribe</a>} position="center center" modal>
    <div>
        <form id="WebToLeadForm" action="http://localhost/huycrm/index.php?entryPoint=WebToPersonCapture" method="POST" name="WebToLeadForm">
            <h5 className='teal-text'>Subscribe for news about new course, discount...</h5>
            <div className="input-field">
                <label>Last Name: <span class="required">*</span></label><input name="last_name" id="last_name" type="text" required="" />
            <div></div>
            <div className="input-field">
                <label>First Name: </label><input name="first_name" id="first_name" type="text" required="" />
            </div>
            </div>
            <div className="input-field">
                <label>Email Address: </label><input name="email1" id="email1" type="email" required=""/>
            </div>
            <div className="input-field">
                <label>Mobile: </label><input name="phone_mobile" id="phone_mobile" type="text" />
            </div>
            <div className="input-field">
                <label>Website: </label><input name="website" id="website" type="text" />
            </div>
            <div className="input-field">
                <label>Address Street: </label><input name="primary_address_street" id="primary_address_street" type="text" />
            </div>
            <div className="input-field">
                <label>Primary Address City: </label><input name="primary_address_city" id="primary_address_city" type="text" />
            </div>
            <button name="Submit" className='btn blue-grey' type="submit" onclick="submit_form();">Đăng kí</button>
            <input name="campaign_id" id="campaign_id" type="hidden" value="9ce38a61-ed48-8bfe-d31b-5c4a8a38b82f" />
            <input name="redirect_url" id="redirect_url" type="hidden" value="https://mysterious-river-53514.herokuapp.com/" />
            <input name="assigned_user_id" id="assigned_user_id" type="hidden" value="1" /> <input name="moduleDir" id="moduleDir" type="hidden" value="Leads" />
        </form>
    </div>
  </Popup>
);