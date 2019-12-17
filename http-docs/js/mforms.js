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


 /* Interpolate data values into variables named by { + variableName + }
and generate a new string.  variables not found are left as is
in the generated string. Searches the dictionaries as supplied
to perform the interpolation  */
 function InterpolateStr(pstr, dictArr) {
     b = [];
     if ((pstr === undefined) || (pstr.length < 1)) {
         return "";
     }
     var tarr = pstr.split(/(\{.*?\})/);
     if (tarr.length < 1) {
         return "";
     }
     for (var ndx = 0; ndx < tarr.length; ndx++) {
         var tseg = tarr[ndx];
         var tsegTrim = tseg.trim();
         if ((tsegTrim[0] === '{') && (tsegTrim[tseg.length - 1] === '}')) {
             var tpath = tsegTrim.slice(1, -1);
             var lookVal = null;
             for (var dictNdx in dictArr) {
                 tdict = dictArr[dictNdx];
                 lookVal = getNested(tdict, tpath);
                 if (lookVal !== null) {
                     break;
                 }
             }
             if ((lookVal === null) || (lookVal === undefined)) {
                 lookVal = tseg;
             }
             tseg = lookVal;
         }
         b.push(tseg);
     }
     return b.join("");
 }


 function saveFormChanges(hwidget) {
     var attr = hwidget.attributes;
     var formId = gattr(hwidget, "form_id");
     var widId = hwidget.id;
     var dataObjId = gattr(hwidget, "dataObjId");
     var context = GTX.formContexts[formId][dataObjId];
     console.log("in save form changes widId=", widId, "formId=", formId, " dataObjId=", dataObjId, "context=", context);
 }

 function addContextAttributes(attr, widDef, context) {
     attr.dataObjId = context.dataObjId;
     attr.form_id = context.form_id;
     attr.id = widDef.id;
     attr.data_context = widDef.data_context;
     attr.class = widDef.class;
     attr.label = widDef.label;
 }

 function mformsRenderButton(widDef, b, context) {
     attr = {
         "type": "button",
         "onClick": "saveFormChanges(this)"
     };
     addContextAttributes(attr, widDef, context);
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

 var textFieldCopyAttr = {
     "size": true,
     "placeholder": true,
     "maxlength": true,
     "min": true,
     "max": true,
     "step": true,
     "autofocus": true,
     "disabled": true,
     "align": true,
     "pattern": true

 };

 function stripQuotes(astr) {
     if ((astr[0] == '"') || (astr[0] == "'")) {
         return astr.slice(1, -1); // strip surrounding quotes
     }
     return astr;
 }

 function mformsRenderTextWidget(widDef, b, context) {
     var gtx = context.gbl;
     var flds = gtx.widgets;
     var parClass = parent.class;
     var widId = widDef.id;
     // Add Container div for label and Field
     b.start("div", {
         "id": widId + "Container",
         "class": widDef.class + "Container"
     });

     // Add Div with Label
     b.make("div", {
         "class": widDef.class + "Label"
     }, widDef.label);

     // Add the actual Text Widget

     var widAttr = {
         'id': widId + "Fld",
         //'onblur': fieldSpec.onchange + "(" + onChgParms + ")",
         //'onchange': fieldSpec.onchange + "(" + onChgParms + ")",
         'type': widDef.type,
         'class': widDef.class
     };

     // Copy over the Attributes we are interested in 
     // as is.
     for (var atname in widDef) {
         lcname = atname.toLowerCase();
         if (lcname in textFieldCopyAttr) {
             widAttr[atname] = stripQuotes(widDef[atname]);
         }
     }

     // Add Initial Field Value from the Data Object
     if ("dataObj" in context) {
         var widVal = getNested(context.dataObj, widDef.data_context);
         if (widVal != null) {
             widAttr.value = widVal;
         }
     }
     b.make("input", widAttr);
     b.finish("div");
 }

 var widgRenderFuncs = {
     "widgetGroup": mformsRenderGroupWidget,
     "text": mformsRenderTextWidget,
     "textarea": mformsRenderTextWidget,
     "button": mformsRenderButton
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
                 var rendFunc = widgRenderFuncs[widDef.type];
                 rendFunc(widDef, b, context);
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
 // requeset so we can retrieve it latter 
 // using the combination for form_id
 // and data object Id.
 function setFormContext(form, context) {
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
     setFormContext(form, context);
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
         var objId = parms.context.dataobjId;
         var gtx = parms.context.gbl;
         console.log("L8: mformsGetDefOnData get data=", data, " parms=", parms);
         // TODO: Add support for alternative parsers.
         var pdata = JSON.parse(data);
         /// PUT Proper Processing HERE
         gtx.dataObj[objId] = pdata;
         parms.context.dataObj = pdata;
         parms.context.gbl.filesLoaded[parms.uri] = pdata;
         console.log(" parsed dataObj=", pdata, " context=", parms.context);
         mformsRenderForm(context.form, context);
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
 function mformsGetDef(scriptId, prefix, context) {
     var parms = {};
     var req_uri = prefix + "/" + scriptId + ".txt?ti=" + Date.now();
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

     mformsGetDef(formSpecUri, "", context);
 }