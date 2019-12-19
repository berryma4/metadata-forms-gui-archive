 var GTX = {
     forms: {}, // A list of forms by Id that have been loaded
     formContexts: {},
     filesLoading: {}, // list of files currently being loaded used to avoid duplicate load by uri
     filesLoaded: {}, // list of files already loaded used to avoid reload by uri
     widgets: {}, // list of  widgets already loaded by widget Id
     dataObj: {}, // list of dataObj already loaded by Object Id

     user: {
         "accessToken": "282872727" // Will need to get a real access token
     }
 };

 function gattr(ele, name) {
     return ele.getAttribute(name);
 }


 /*********
  **** INTERACTION / OnClick / EVENTS
  **********/
 function mformSaveFormChanges(hwidget) {
     var attr = hwidget.attributes;
     var formId = gattr(hwidget, "form_id");
     var widId = hwidget.id;
     var dataObjId = gattr(hwidget, "dataObjId");
     var context = GTX.formContexts[formId][dataObjId];
     console.log("in save form changes widId=", widId, "formId=", formId, " dataObjId=", dataObjId, "context=", context);
 }

 function mformFieldChanged(hwidget) {
     var attr = hwidget.attributes;
     var widId = hwidget.id;
     var widDef = GTX.widgets[widId];
     var dataContext = widDef.data_context;
     var formId = gattr(hwidget, "form_id");
     var dataObjId = gattr(hwidget, "dataObjId");
     var context = GTX.formContexts[formId][dataObjId];
     var dataObj = GTX.dataObj[dataObjId];
     var fldVal = hwidget.value.trim();
     var oldFldVal = getNested(dataObj, dataContext, null);
     if (fldVal != oldFldVal) {
         // Data has actually changed so we can upate the domain object
         setNested(dataObj, dataContext, fldVal);
         if ('show_data_obj_div' in context.form) {
             toDiv(context.form.show_data_obj_div, "<pre>" + JSON.stringify(dataObj, null, 2) + "</pre>");
         }
     }
     // console.log("FieldChanged", widId, "fldVal=", fldVal, "formId=", formId,
     //   " dataObjId=", dataObjId, "context=", context, "dataObj", dataObj);

     //TODO:  Add Field Validation and Error Message Here
     //TODO: Mark field context as dirty
     //TODO: Mark field invalid if any fields fail validation
 }

 function mformFieldInput(hwidget) {
     mformFieldChanged(hwidget);
 }

 /*
 // Ieterate the form to find all input fields and
 // then map their ID to the model.  Use this to
 // set the value for all form fields based on the
 // domain objects current values.
 function mformUpdateFormValuesFromModel(formId, model) {
     var aform = document.getElementById(formId);
     var elems = aform.elements;
     var numEle = elems.length;
     for (var i = 0; i < numEle; i++) {
         var ele = elems[i];
         var eleId = ele.id
         if (eleId.startsWith("frm_")) {
             var fld_name = eleId.replace("frm_", "");
             var aval = getNested(model, fld_name);
             if (aval != null) {
                 ele.value = aval;
                 // custom method to convert datetime to string
                 // custom method for checkbox
                 // custom method for radio button
                 // custom method for select box
             }
         }
     }
 }


 // Ieterate the form to find all input fields and
 // for each field that starts with frm_ update
 // the supplied DOM object.  This is not normally
 // required when automatic update via click handlers
 // is provided.
 function mformUpdateModelFromForm(formId, model) {
     var aform = document.getElementById(formId);
     var elems = aform.elements;
     var numEle = elems.length;
     for (var i = 0; i < numEle; i++) {
         var ele = elems[i];
         var eleId = ele.id
         if (eleId.startsWith("frm_")) {
             var fld_name = eleId.replace("frm_", "");
             var aval = setNested(model, fld_name);
             if (aval != null) {
                 ele.value = aval;
                 // custom method to convert datetime to string
                 // custom method for checkbox
                 // custom method for radio button
                 // custom method for select box
             }
         }
     }
 }

 // Call by the validate function in the on click handler.
 // diplays a error message if value is empty and returns false.
 // otherwise clears the error message and returns true.
 function mformValidateNotEmpty(fld, fldName, model, validateFun) {
     var fldVal = fld.value;
     var errName = "frm_msg_" + fldName
     if (fldVal <= "") {
         toDiv(errName, fldName + " May not be empty");
         return false;
     } else {
         toDiv(errName, "");
         return true;
     }
 }


 // On Field Change handler to process changes as fields are
 // processed.   Calls the defiined validate function if
 // present.
 function mformFieldOnChange(fld, fldName, context, validateFun) {
     var fldVal = fld.value.trim();
     if (validateFun) {
         var tRes = validateFun(fld, fldName, context, validateFun)
         if (tRes === false) {
             return false;
         }
     }
     if (context !== null) {
         var currVal = getNested(context.model, fldName);
         if (currVal !== fldVal) {
             // Field really has changed
             setNested(context.model, fldName, fldVal);
             context.isDirty = true;
             if (context.onDirty) {
                 context.onDirty(fld, fldName, context);
             }
         }
         toDiv("show_domain_obj", "Model as JSON" + JSON.stringify(context.model));
     }
 }
 */

 /***************
  **** RENDERING 
  **************  */
 var widgRenderFuncs = {
     "widgetGroup": mformsRenderGroupWidget,
     "text": mformsRenderTextWidget,
     "textarea": mformsRenderTextWidget,
     "button": mformsRenderButton,
     "dropdown": mformRenderDropdown
 }

 var mformTextFieldCopyAttr = {
     "size": true,
     "placeholder": true,
     "maxlength": true,
     "min": true,
     "max": true,
     "step": true,
     "autofocus": true,
     "disabled": true,
     "align": true,
     "pattern": true,
     "rows": true,
     "cols": true,
     "label": true,
     "class": true,
     "data_context": true,
     "form_id": true,
     "dataObjId": true
 };

 /*function mformAddContextAttributes(attr, widDef, context) {
     attr.dataObjId = context.dataObjId;
     attr.form_id = context.form_id;
     attr.id = widDef.id;
     attr.data_context = widDef.data_context;
     attr.class = widDef.class;
     attr.label = widDef.label;
 } */



 // Copy over the Attributes we are interested in 
 // as is.
 function mformCopyAttribs(widDef, widAttr, copySpec) {
     for (var atname in widDef) {
         lcname = atname.toLowerCase();
         if (lcname in copySpec) {
             widAttr[atname] = stripQuotes(widDef[atname]);
         }
     }
 }

 function mformsRenderButton(widDef, b, context) {
     attr = {
         "type": "button",
         "onClick": "saveFormChanges(this)"
     };
     mformCopyAttribs(widDef, attr, mformTextFieldCopyAttr);
     b.make("button", attr, "Save");
 }

 function mformsRenderGroupWidget(widDef, b, context) {
     var gtx = context.gbl;
     var flds = gtx.widgets;
     var parClass = parent.class;
     b.start("div", {
         "id": widDef.id + "group",
         "class": widDef.class
     });
     b.make("div", {
         "class": widDef.class + "Label"
     }, widDef.label);
     mformsRenderWidgets(widDef, widDef.widgets, b, context);
     b.finish("div");
 }

 // Start rendering the widget with common logic
 // for label and container. 
 function mformStartWidget(widDef, b, context) {
     b.start("div", {
         "id": widDef.id + "Container",
         "class": widDef.class + "Container"
     });

     // Add Div with Label
     b.make("div", {
         "class": widDef.class + "Label",
         "id": widDef.id + "Label"
     }, widDef.label);
 }

 function mformFinishWidget(widDef, b, context) {
     b.finish("div");
 }

 function mformBasicWidAttr(widDef, context) {
     return {
         'id': widDef.id,
         //'onblur': fieldSpec.onchange + "(" + onChgParms + ")",
         //'onchange': fieldSpec.onchange + "(" + onChgParms + ")",
         'type': widDef.type,
         'onChange': 'mformFieldChanged(this)',
         'onInput': 'mformFieldInput(this)',
         'dataObjId': context.dataObjId,
         'form_id': context.form_id,
     };
 }

 function mformRenderDropdown(widDef, b, context) {
     var gtx = context.gbl;
     var widId = widDef.id;
     mformStartWidget(widDef, b, context);
     // Add the actual Text Widget
     var widAttr = basicWidAttr(widDef, context);
     mformCopyAttribs(widDef, widAttr, mformTextFieldCopyAttr);

     finishWidget(widDef, b, context);
 }


 function mformsRenderTextWidget(widDef, b, context) {
     var gtx = context.gbl;
     var widId = widDef.id;
     mformStartWidget(widDef, b, context);
     // Add the actual Text Widget
     var widAttr = mformBasicWidAttr(widDef, context);
     mformCopyAttribs(widDef, widAttr, mformTextFieldCopyAttr);

     // Add Initial Field Value from the Data Object
     var widVal = "";
     if ("dataObj" in context) {
         widVal = getNested(context.dataObj, widDef.data_context);
         if (widVal != null) {
             widAttr.value = widVal;
         } else {
             widVal = null;
         }
     }

     var makeEleName = "input";
     if (widDef.type == "textarea") {
         b.make("textarea", widAttr, widVal);
     } else {
         b.make(makeEleName, widAttr);
     }
     mformFinishWidget(widDef, b, context)
 }


 function mformsRenderWidgets(parent, widgets, b, context) {
     var gtx = context.gbl;
     var flds = gtx.widgets;
     var parClass = parent.class;
     for (var i = 0; i < widgets.length; i++) {
         var widId = widgets[i];
         if (widId in flds) {
             var widDef = flds[widId];
             if (widDef.type in widgRenderFuncs) {

                 try {
                     var rendFunc = widgRenderFuncs[widDef.type];
                     rendFunc(widDef, b, context);
                 } catch (err) {
                     console.log("L324: Error rendering=", err, " widDef=", widDef, " funName", rendFunc);
                     b.b("<h6>Error Rendering See console</h6>");
                 }
             } else {
                 console.log("cound not find rendering func=", widDef.Type, "for id=", widId, "widNdx=", i, " widDef=", widDef);
                 b.make("h6", {
                     id: widId
                 }, "Unkown Widget Type " + widDef.type + " id=" + widId + " widDef=" + JSON.stringify(widDef)).nl();
             }
         } else if (widId > ".") {
             // Widget Defenition missing so output error message
             console.log("missing widget id=", widId, "id***" + widId + "***");
             var msg = "Widget ID " + widId + " can not be found";
             b.make("h6", {
                 "id": "wid" + widId
             }, msg);
         }
     }
 }

 // save complete context from rendering 
 // request so we can retrieve it latter 
 // using the combination for form_id
 // and data object Id.
 function mformSetFormContext(form, context) {
     var gtx = context.gbl;
     var formId = form.id;
     if (!("formContexts" in gtx)) {
         gtx.formContexts = {};
     }
     if (!(formId in gtx.formContexts)) {
         gtx.formContexts[formId] = {};
     }
     gtx.formContexts[formId][context.dataObjId] = context;
 }

 function mformsRenderForm(form, context) {
     var gtx = context.gbl;
     var b = new String_builder();
     var flds = gtx.widgets;
     context.form_id = form.id;
     mformSetFormContext(form, context);
     b.start("div", {
         "id": form.id + "cont",
         "class": form.class
     });
     b.start("form", {
         "id": form.id
     });

     b.make("h3", {
         "id": form.id + "Head",
         class: form.class + "Head"
     }, form.label);

     mformsRenderWidgets(form, form.widgets, b, context);
     /*
     b.addInputField({
         label: "Cert #",
         fldName: "current_operator__operating_certificate_number",
         type: 'text',
         size: 45,
         context: 'GContext'
     }).nl();
     */
     b.finish("form");
     b.finish("div"); // form container
     b.toDiv(context.targetDiv);
     if ('show_data_obj_div' in context.form) {
         toDiv(context.form.show_data_obj_div, "<pre>" + JSON.stringify(context.dataObj, null, 2) + "</pre>");
     }
 }

 // Process message header data received from server
 function mformGetDataObjOnData(data, httpObj, parms) {
     if (parms.uri in parms.context.gbl.filesLoading) {
         delete parms.context.gbl.filesLoading[parms.uri];
     }
     if (data <= "") {
         console.log("L5: mformGetDataObjOnData err=" + httpObj);
         toDiv("ErrorMsg", "Failure mformGetDataObjOnData  uri=" + parms.uri + "\n" + httpObj);
     } else {
         var objId = parms.context.dataObjId;
         var gtx = parms.context.gbl;
         console.log("L8: mformsGetDefOnData get data=", data, " parms=", parms);
         // TODO: Add support for alternative parsers.
         var pdata = null;
         try {
             pdata = JSON.parse(data);
         } catch (err) {
             console.log("error parsing=", err, " data=", data);
             pdata = {};
         }
         /// PUT Proper Processing HERE
         gtx.dataObj[objId] = pdata;
         parms.context.dataObj = pdata;
         parms.context.gbl.filesLoaded[parms.uri] = pdata;
         parms.widVal =
             console.log(" parsed dataObj=", pdata, " context=", parms.context);
         mformsRenderForm(context.form, context);
         if ('show_data_obj_div' in context.form) {
             toDiv(context.form.show_data_obj_div, "<pre>" + JSON.stringify(pdata, null, 2) + "</pre>");
         }
     }
 }


 // Load script file from server
 function mformGetDataObj(form, context) {
     var parms = {};
     // Add Iterpolation here
     var req_uri = InterpolateStr(form.fetch.uri, [context, form]);
     console.log("L263: mformGetDataObj req_uri=", req_uri);
     parms.req_headers = {
         'Content-Type': "application/json",
         'Authorization': context.gbl.user.accessToken
     };
     parms.req_method = form.fetch.method;
     parms.context = context;
     parms.uri = req_uri;
     context.gbl.filesLoading[req_uri] = true;
     simpleGet(req_uri, mformGetDataObjOnData, parms);
 }


 function mformsProcessFormSpec(data, context) {
     var gtx = context.gbl;
     for (var i = 0; i < data.length; i++) {
         var tObj = data[i];
         if ("widget" in tObj) {
             widg = tObj.widget;
             gtx.widgets[widg.id] = widg;
             if ("data_context" in widg) {
                 widg.data_context = widg.data_context.trim();
             }
         } else if ("form" in tObj) {
             form = tObj.form;
             gtx.forms[form.id] = form;
             context.form = form;
             // Check to see if the data object is loaded after
             // we have the form spec and fetch it if not and
             // then render it.  If it is already loaded then
             // simply render the form for that data Object.
             if (context.dataObjId in gtx.dataObj) {
                 // Data Object is already loaded so skip to render
                 context.dataObj = gtx.dataObj[context.dataObjId];
                 mformsRenderForm(context.form, context);
             } else {
                 // need to fetch the data object
                 mformGetDataObj(form, context);
             }
         }
     }
 }

 // Process message header data received from server
 function mformsGetDefOnData(data, httpObj, parms) {
     if (parms.uri in parms.context.gbl.filesLoading) {
         delete parms.context.gbl.filesLoading[parms.uri];
     }
     if (data <= "") {
         console.log("L5: mformsGetDefOnData err=" + httpObj);
         toDiv("ErrorMsg", "Failure mformsGetDefOnData\n" + httpObj);
     } else {
         console.log("L8: mformsGetDefOnData get data=", data, " parms=", parms);
         var pdata = mformsParseMeta(data);
         console.log(" parsed form data=", pdata, " context=", parms.context);
         parms.context.gbl.filesLoaded[parms.uri] = pdata;
         mformsProcessFormSpec(pdata, parms.context);
     }
 }

 // Load script file from server
 function mformsGetDef(scriptId, context) {
     var parms = {};
     var req_uri = scriptId + ".txt?ti=" + Date.now();
     req_uri = req_uri.replace("//", "/");
     console.log("L25: mformsGetDef req_uri=", req_uri);
     parms.req_headers = {
         'Content-Type': "application/json",
         'Authorization': context.gbl.user.accessToken
     };
     parms.req_method = "GET";
     parms.scriptId = scriptId;
     parms.context = context;
     parms.uri = req_uri;
     context.gbl.filesLoading[req_uri] = true;
     simpleGet(req_uri, mformsGetDefOnData, parms);
 }

 function display_form(targetDiv, formSpecUri, dataObjId, gContext) {
     //"dataSourceUri": dataSourceUri,
     console.log(" display_form() targetDiv=", targetDiv, " formSpecUri=", formSpecUri, " dataObjId=", dataObjId)

     // Create a new context but keep a copy of the Global context
     // passed in to allow us to access things like total list of
     // files already loaded and the users access token
     context = {
         "targetDiv": targetDiv,
         "formSpecUri": formSpecUri,
         "dataObjId": dataObjId,
         //"dataSourceUri": dataSourceUri,
         "gbl": gContext
     };

     mformsGetDef(formSpecUri, context);
 }