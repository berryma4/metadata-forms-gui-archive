 var GTX = {
     forms: {}, // A list of forms by Id that have been loaded
     filesLoading: {}, // list of files currently being loaded used to avoid duplicate load by uri
     filesLoaded: {}, // list of files already loaded used to avoid reload by uri
     widgets: {}, // list of  widgets already loaded by widget Id
     dataObj: {}, // list of dataObj already loaded by Object Id
     user: {
         "accessToken": "282872727" // Will need to get a real access token
     }
 };

 function mformsRenderButton(widDef, b, context) {
     b.make("button", {
         "id": widDef.id,
         "class": widDef.class,
         "type": "button",
         "label": widDef.label,
         "onClick": "(simple_form,saveFormChanges(GContext))"
     }, "Save");
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

 function mformsRenderForm(form, context) {
     var gtx = context.gbl;
     var b = new String_builder;
     var flds = gtx.widgets;

     b.start("div", {
         "id": form.id,
         "class": form.class
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

     b.finish("div"); // form container
     b.toDiv(context.targetDiv);
 }

 function mformsProcessFormSpec(data, context) {
     var gtx = context.gbl;
     for (var i = 0; i < data.length; i++) {
         var tObj = data[i];
         if ("widget" in tObj) {
             widg = tObj.widget;
             gtx.widgets[widg.id] = widg;
         } else if ("form" in tObj) {
             form = tObj.form;
             gtx.forms[form.id] = form;
             mformsRenderForm(form, context);
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
         toDiv("ErrorMsg", "Failure getScript\n" + httpObj);
     } else {
         console.log("L8: mformsGetDefOnData get data=", data, " parms=", parms);
         var pdata = mformsParseMeta(data);
         console.log(" parsed form data=", pdata, " context=", parms.context);
         mformsProcessFormSpec(pdata, parms.context);
         parms.context.gbl.filesLoaded[parms.uri] = pdata;
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



 function display_form(targetDiv, formSpecUri, dataSourceUri, gContext) {
     console.log(" display_form() targetDiv=", targetDiv, " formSpecUri=", formSpecUri, " dataSourceUri=", dataSourceUri)

     // Create a new context but keep a copy of the Global context
     // passed in to allow us to access things like total list of
     // files already loaded and the users access token
     context = {
         "targetDiv": targetDiv,
         "formSpecUri": formSpecUri,
         "dataSourceUri": dataSourceUri,
         "gbl": gContext
     };

     mformsGetDef(formSpecUri, "", context);
 }