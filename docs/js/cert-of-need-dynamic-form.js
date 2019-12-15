// dynamic-form.js
// view, domain and controller for simple 2 way bound form


// --- validate phone, soc-sec, int, float, date in browser util
function validate_notes(fld, fldName, model, validateFun) {
    var fldVal = fld.value;
    var errName = "frm_msg_" + fldName
    if (fldVal.includes("X1")) {
        toDiv(errName, fldName + " May not contain 'X1'");
        return false;
    }
    else {
        toDiv(errName, "");
        return true;
    }
}

/* callback from default onChange automatic domain update handler
used to control GUI elements that need changed behavior when
things are dirty. */
function simpleFormOnDirty(fld, fldname, context) {
    context.isDirty = true;
    frmEnable('simple_form_save_button');
}
GContext.onDirty = simpleFormOnDirty;

// Process message header data received from server
function saveCertOfNeedOnData(err, pobj, parms) {
    context = parms.context;
    if (err) {
        console.log("saveCertOfNeedOnData() err=" + err);
        toDiv("simple_form_save_msg", "Last Save Failed");
    }
    else {
        console.log("saveCertOfNeedOnData() pobj=" + JSON.stringify(pobj, null, 2));
        context.model = pobj;
        context.isDirty = false;
        // Update message saving status
        toDiv("simple_form_save_msg", "");
        frmDisable('simple_form_save_button');
    }
}

// Fetch Certificate of Need for a given Cert 
function saveCertOfNeed(context, model) {
    var parms = {};
    //parms.certOfNeed = model.con_project_number;
    parms.req_uri = "/api/save-cert-of-need/" + model.con_project_number;
    console.log("saveCertOfNeed uri = " + parms.req_uri);
    parms.req_headers = {
        'Content-Type': "application/json",
        'Authorization': GContext.accessToken
    };
    parms.req_method = "POST";
    parms.callback = saveCertOfNeedOnData;
    parms.req_post_body = JSON.stringify(model)
    parms.context = context;
    // Display Saving Message
    toDiv("simple_form_save_msg", "saving");
    makeJSONCall(parms, saveCertOfNeedOnData);
}


// Process message header data received from server
function getCertOfNeedOnData(err, pobj, parms) {
    context = parms.context;
    if (err) {
        console.log("getCertOfNeedOnData() err=" + err);
        toDiv("ErrorMsg", "Failure getCertOfNeed\n" + err);
    } else {
        console.log("getCertOfNeedOnData() pobj=" + JSON.stringify(pobj, null, 2));
        context.model = pobj;
        context.isDirty = false;
        updateFormValuesFromModel(parms.formId, GContext.model);
        frmDisable('simple_form_save_button');
        context.lastLoad = curr_time();
    }
}


// Fetch Certificate of Need for a given Cert 
function getCertOfNeed(formId, certNum) {
    var parms = {};
    parms.certOfNeed = certNum
    parms.req_uri = "/data/cert-of-need/" + certNum + ".JSON"
    console.log("getCertOfNeed uri = " + parms.req_uri);
    parms.req_headers = {
        'Content-Type': "application/json",
        'Authorization': GContext.accessToken
    };
    parms.req_method = "GET";
    parms.callback = getCertOfNeedOnData;
    parms.formId = formId;
    parms.context = GContext;
    makeJSONCall(parms, getCertOfNeedOnData);
}

function saveFormChanges(context) {
    toDiv("simple_form_save_msg", "saving");
    saveCertOfNeed(context, context.model);
    frmDisable('simple_form_save_button');
    context.lastSave = curr_time();
}


// TODO: Validate should run in onValidate

// TODO: Right justify button
// TODO: When updating form from object clear any error messages
// TODO: Add DOM Update
// TODO: Turn off the Save button when DOM is not dirty
// TODO: Add option for Auto Flush for save to server
// TODO: Add Save form to server 


// --- TODO: Render list of first 20 of the CON project
// ---  numbers in left nav then when those are clicked 
// ---  update from values in the loaded domain object.

// Demonstrate Simple Form with automatic updates to model
// with basic refresh from data model and rendering basic 
// form values from the domain model.
function renderSimpleFormStaticValues(divId) {
    var b = new String_builder;
    b.start("div", { "id": "simple_form" });
    b.start("h3").b("Current Operator").finish("h3");
    b.start("form", { "id": "sample_form_1" });
    //b.make("input", {
    //  "id": "frm_project_number", "type": "text",
    //  "value": SampleDomainObj.con_project_number, "disabled": "true"
    //}).br().nl();

    //b.addInputField({
    //  label: "Project#", fldName: "con_project_number",
    //  type: 'text', size: 30, "disabled": "true",
    //  model: 'SampleDomainObj', value: SampleDomainObj.con_project_number
    //}).nl();

    b.addInputField({
        label: "Project#", fldName: "con_project_number",
        type: 'text', size: 30, "disabled": "true",
        context: 'GContext'
    }).nl();

    b.addInputField({
        label: "Facility Name", fldName: "current_operator__name", type: 'text',
        size: 45, validate: "validate_notes", context: 'GContext'
    }).nl();

    b.addInputField({
        label: "Address", fldName: "current_operator__address_line1", type: 'text',
        size: 45, validate: "validate_notes", context: 'GContext'
    }).nl();

    b.addInputField({
        label: "City", fldName: "current_operator__city", type: 'text',
        size: 30, context: 'GContext'
    }).nl();

    b.addInputField({
        label: "State", fldName: "current_operator__state", type: 'text',
        size: 5, context: 'GContext'
    }).nl();
    // TODO: Add Validate State


    b.addInputField({
        label: "Zip", fldName: "current_operator__zip_code", type: 'text',
        size: 10, context: 'GContext'
    }).nl();
    // TODO: Add Validate Zip

    b.addInputField({
        label: "Cert #", fldName: "current_operator__operating_certificate_number", type: 'text',
        size: 45, context: 'GContext'
    }).nl();

    b.start("h3").b("Project").finish("h3");

    b.addInputField({
        label: "description", fldName: "project__description", type: 'textarea',
        size: 45, context: 'GContext'
    }).nl();

    b.addInputField({
        label: "status", fldName: "project__status", type: 'text',
        size: 20, context: 'GContext'
    }).nl();

    b.addInputField({
        label: "status date", fldName: "project__status_date", type: 'text',
        size: 18, context: 'GContext'
    }).nl();



    //b.radio()  // TODO
    //b.checkGrp()
    //b.SelectList()
    b.make("br");
    b.make("div", { "id": "simple_form_save_msg" });
    b.make("p", null, "Enter X1 in Facility Name  to Cause Validation Error Message");
    b.start("div", { "align": "right" });
    b.make("button", {
        "id": "simple_form_save_button", "class": "submit_button",
        "type": "button", "label": "save", "onClick": "(simple_form,saveFormChanges(GContext))"
    }, "Save");
    b.finish("div");
    b.finish("div");
    b.finish("form");
    b.to_div(divId);
}


function clearForm(formId, pObj) {
    GContext.model = deepClone(pObj);
    updateFormValuesFromModel(formId, GContext.model);
}

function onLoad() {
    renderSimpleFormStaticValues("DFORM");
    // Parse Out the document # from URI
    //renderSimpleForm("DFORM")

    // Shows how the form value for First name can be updated from the domain model 
    // even when the binding value is notsupplied when the form is created.
    //updateFormValuesFromModel("sample_form_1", SampleDomainObj);

    // -- TODO: Move to Click Save button. 
    // Copy Values from From back to the model. This shows how a value from the form can 
    // be copied into the model object even when the click handler is not supplied. 
    //updateModelFromForm("sample_form_1", SampleDomainObj);

    // Load a specific JSON object and update form contents
    // with the values from that object.
    getCertOfNeed("sample_form_1", "1004")
}

