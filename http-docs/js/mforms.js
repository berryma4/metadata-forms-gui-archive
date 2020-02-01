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


 function mformValidateFieldValue(context, dataObj, widDef, hwidget, fldVal) {
     var dataContext = widDef.data_context;
     var widId = widDef.id;
     if (isObject(widDef.valid_fun)) {
         widDef.valid_fun = [widDef.valid_fun];
     }
     statusDiv = widDef.id + "Status";
     // Process Validation RegEx Patterns
     if ("valid_pat" in widDef) {
         var vpat = widDef.valid_pat;
         // If single validation pattern convert to array
         // so we can treat the main logic as an array
         if (isString(vpat.pattern)) {
             vpat.pattern = [vpat.pattern];
         }

         // Walk the Validation patterns and apply them 
         // if needed.
         var numPat = vpat.pattern.length;
         var errMsg = null;
         for (var pndx = 0; pndx < numPat; pndx++) {
             var pat = vpat.pattern[pndx];
             try {
                 var compRePat = new RegExp(pat);
                 testRes = compRePat.test(fldVal);
                 if (testRes == false) {
                     errMsg = vpat.message;
                 } else {
                     errMsg = null; // valid at least one sucess match
                     break;
                 }
             } catch (err) {
                 console.log("L64: Error trying to apply RE pattern: " + pat + "FldVal=" + fldVal + " err=" + err);
             }
         }
         // Display or hide status message as needed.
         if (errMsg != null) {
             showDiv(statusDiv);
             toDiv(statusDiv, errMsg);
             return false;
         } else {
             toDiv(statusDiv, "");
             hideDiv(statusDiv);
         }
     } // at least one valid_pat to check.

     // Process Validation Functions


 }

 function mformFieldChanged(hwidget) {
     var attr = hwidget.attributes;
     var widId = hwidget.id.split("-_")[0];
     var widDef = GTX.widgets[widId];
     var dataContext = widDef.data_context;
     var dataContextOvr = gattr(hwidget, "data_context");
     if (dataContextOvr > "") {
         // override the widget data context with the 
         // value encoded into the widget if present.
         // needed this to support array elements that 
         // require a differnt data context for every row of every cell.
         dataContext = dataContextOvr;
     }
     var formId = gattr(hwidget, "form_id");
     var dataObjId = gattr(hwidget, "dataObjId");
     var context = GTX.formContexts[formId][dataObjId];
     var dataObj = GTX.dataObj[dataObjId];
     var fldVal = null;
     if (widDef.type == "radio") {
         if (hwidget.checked == true) {
             fldVal = hwidget.value;
         } else {
             fldVal = "NULL";
         }
     } else {
         // read value like we do as text field.
         fldVal = hwidget.value.trim();
     }

     var isValdVal = mformValidateFieldValue(context, dataObj, widDef, hwidget, fldVal)
     var oldFldVal = getNested(dataObj, dataContext, null);
     var saveFlg = true;
     if ((fldVal != oldFldVal) && (fldVal != null)) {
         // Data has actually changed so we can upate the domain object
         if ((widDef.type == "dropdown") && (oldFldVal == null) && (fldVal == "NULL")) {
             // Do not save to the tree if we get the speical sentinal NULL
             // when there is no value in the exisitng DOM record. 
             saveFlg = false;
             // TODO:  If user sets to NULL and the value exists then
             // remove it from the DOM tree all together.
         }

         if (saveFlg == true) {
             setNested(dataObj, dataContext, fldVal);
             if ('show_data_obj_div' in context.form) {
                 toDiv(context.form.show_data_obj_div, "<pre>" + JSON.stringify(dataObj, null, 2) + "</pre>");
             }
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
     "dropdown": mformRenderDropdown,
     "radio": mformRenderRadio,
     "date": mformsRenderTextWidget,
     "table": mformsRenderTable
 }
 // "col": mformsRenderColumn

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
     "dataObjId": true,
     "title": true,
     "jimbo": true
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

 function getDataValue(dataObj, widDef, context, custParms) {
     var dataPath = widDef.data_context;
     if (dataPath == undefined) {
         alert("ERROR Widget Data Context is not specified " + JSON.stringify(widDef));
     }
     var dataVal = getNested(dataObj, dataPath, null);
     if (dataVal == null) {
         // If no data value is found in the source object
         // then set based on field default specified in 
         // widget defenition. 
         dataVal = getNested(widDef, "default", null);
         if (dataVal != null) {
             setNested(dataObj, dataPath, dataVal)
         }
     }
     return dataVal;
 }

 function mformsRenderButton(widDef, b, context, custParms) {
     attr = {
         "type": "button",
         "onClick": "saveFormChanges(this)"
     };
     mformCopyAttribs(widDef, attr, mformTextFieldCopyAttr);
     b.make("button", attr, "Save");
 }

 // Start rendering the widget with common logic
 // for label and container. 
 function mformStartWidget(widDef, b, context, custParms) {
     var cssClass = widDef.class;
     var widId = widDef.id;
     if ("widIdRow" in custParms) {
         widId = custParms.widIdRow;
     }
     if (widDef.force_wrap == true) {
         cssClass = "forceWrap " + cssClass;
     }

     b.start("div", {
         "id": widId + "Cont",
         "class": cssClass + "Cont",
     }).nl();

     if (("label" in widDef) && (widDef.skip_label != true) && (custParms.skip_label != true)) {
         // Add Div with Label
         b.make("div", {
             "class": widDef.class + "Label",
             "id": widId + "Label"
         }, widDef.label).nl();
     }
     return b;
 }

 function mformFinishWidget(widDef, b, context, custParms) {
     b.make("div", {
         "class": "fieldStatusMsg",
         "id": widDef.id + "Status"
     }).nl();
     b.finish("div").nl();
     return b;
 }

 function mformBasicWidAttr(widDef, context, custParms) {
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

 function mformsRenderGroupWidget(widDef, b, context, custParms) {
     var gtx = context.gbl;
     var flds = gtx.widgets;
     var parClass = parent.class;
     var cssClass = widDef.class;
     b.start("div", {
         "id": widDef.id + "cont",
         "class": cssClass + "cont"
     });

     var rendFieldSet = getNested(widDef, "renderFieldset", true);
     if (rendFieldSet == true) {
         b.start("fieldset", {
             "id": widDef.id + "FS",
             "class": cssClass + "FS"
         });
     }

     var contDivName = widDef.id + "Content";

     if ("label" in widDef) {
         b.make("legend", {
             "id": widDef.id + "Legend",
             "class": cssClass + "Leg",
         }, widDef.label);

         b.make("div", {
             "class": "arrow-up",
             "onclick": "toggleDivEvent(this, '" + contDivName + "')"
         });
         b.start("div", {
             "id": contDivName,
             "class": "groupContentDiv"
         });
     }

     mformsRenderWidgets(widDef, widDef.widgets, b, context, {});
     if (rendFieldSet == true) {
         b.finish("div");
         b.finish("fieldset");
     }
     b.finish("div");
 }

 function mformRenderRadio(widDef, b, context, custParms) {
     var gtx = context.gbl;
     var widId = widDef.id;
     custParms.skip_label = true;
     mformStartWidget(widDef, b, context, custParms);
     // Add the actual Text Widget
     var widAttr = mformBasicWidAttr(widDef, context);
     mformCopyAttribs(widDef, widAttr, mformTextFieldCopyAttr);
     var fldName = widDef.id + "Name";
     widAttr.name = fldName;
     //widAttr["-webkit-appearance"] = "none";
     delete widAttr.onChange;
     delete widAttr.onInput;
     widAttr.id = widDef.id + "FS";
     if ("label" in widDef) {
         b.make("div", {
             "class": widDef.class + "label",
             "id": widDef.id + "legend",
             "name": fldName,
         }, widDef.label);
     }

     b.start("fieldset", widAttr).nl();

     var matchOptVal = null;

     var dataObj = context.dataObj;
     var dataVal = getDataValue(dataObj, widDef, context);

     var opt = null;
     var optndx = null;
     if ("option" in widDef) {

         // TODO: Move this to function MatchChoice
         var options = widDef.option;
         if (dataVal != null) {
             // Find the matching option and default
             var dataValMatch = dataVal.trim().toLowerCase();
             // search options to find one that matches the 
             // value. 
             for (optndx in options) {
                 opt = options[optndx];
                 if ("value" in opt) {
                     var oval = opt.value.trim().toLowerCase();
                     if (oval == dataValMatch) {
                         matchOptVal = opt.value;
                         break;
                     }
                 }
             }
         }
         b.start("div", {
             "id": widId + "OptWrap",
             "class": "optWrap"
         });

         var optattr = null;
         for (optndx in options) {
             opt = options[optndx];
             optattr = widAttr;
             optattr.value = opt.value;
             optattr.id = widDef.id + "-_" + optndx;
             optattr.type = "radio";
             optattr.name = fldName;
             optattr.onClick = 'mformFieldInput(this)';
             if ("checked" in optattr) {
                 delete optattr.checked;
             }
             if (opt.value == matchOptVal) {
                 optattr.checked = true;
             } else if ((matchOptVal == false) && ("default" in opt) && (opt.default == true)) {
                 optattr.checked = true;
             }
             b.start("div", {
                 "id": optattr.id + "cont",
                 "class": "buttonCont"
             });
             b.make("input", optattr);
             b.b(opt.label).nl();
             b.finish("div").nl();
         }
         b.finish("div").nl();

     } // if options defined
     b.finish("fieldset").nl();
     mformFinishWidget(widDef, b, context)
     b.nl();
 }



 function mformRenderDropdown(widDef, b, context, custParms) {
     var gtx = context.gbl;
     var widId = widDef.id;
     mformStartWidget(widDef, b, context, custParms);
     // Add the actual Text Widget
     var widAttr = mformBasicWidAttr(widDef, context);
     mformCopyAttribs(widDef, widAttr, mformTextFieldCopyAttr);
     //widAttr["-webkit-appearance"] = "none";
     b.start("select", widAttr);

     var matchOptVal = null;
     getDataValue(context.dataObj, widDef, context);
     var opt = null;
     var optndx = null;
     if ("option" in widDef) {
         var options = widDef.option;
         if (dataVal != null) {
             // Find the matching option and default
             var dataValMatch = dataVal.trim().toLowerCase();
             // search options to find one that matches the 
             // value. 
             for (optndx in options) {
                 opt = options[optndx];
                 if ("value" in opt) {
                     var oval = opt.value.trim().toLowerCase();
                     if (oval == dataValMatch) {
                         matchOptVal = opt.value;
                         break;
                     }
                 }
             }
         }

         var optattr = null;
         for (optndx in options) {
             opt = options[optndx];
             optattr = {
                 "value": opt.value
             };
             if (opt.value == matchOptVal) {
                 optattr.selected = true;
             } else if ((matchOptVal == false) && ("default" in opt) && (opt.default == true)) {
                 optattr.selected = true;
             }
             b.make("option", optattr, opt.label);
         } // for
     } // if options defined

     b.finish("select");
     mformFinishWidget(widDef, b, context);
 }

 function copyOverCustParms(widAttr, widDef, custParms) {
     if ("id" in custParms) {
         widAttr.id = custParms.id; // overlay locally computed.
     } else if ("id" in widDef) {
         custParms.id = widDef.id;
         widAttr.id = widDef.id;
     }

     if ("data_context" in custParms) {
         widAttr.data_context = custParms.data_context;
     } else if ("data_context" in widDef) {
         custParms.data_context = widDef.data_context;
         widAttr.data_Context = widDef.data_context;
     }

     if ("widId" in custParms) {
         widAttr.widId = custParms.widId; // original widget without array modifier
     }
 }

 function mformsRenderTextWidget(widDef, b, context, custParms) {
     var gtx = context.gbl;
     //mformsAdjustCustParms(widDef, b, context, custParms);
     var widId = custParms.widId;
     var colPath = custParms.dataContext;
     mformStartWidget(widDef, b, context, custParms);
     // Add the actual Text Widget
     var widAttr = mformBasicWidAttr(widDef, context);

     mformCopyAttribs(widDef, widAttr, mformTextFieldCopyAttr);
     copyOverCustParms(widAttr, widDef, custParms);
     // "rowNdx": rowndx,
     // "dataArr": dataArr,
     //"table": widDef

     var widVal = "";
     if (widDef.isColumn == true) {
         var dataArr = custParms.dataArr;
         if (dataArr.length > custParms.rowNdx) {
             var dataRow = custParms.dataArr[custParms.rowNdx];
             widVal = getNested(datarow, widDef.dataContext);
         }
         widArr.iscolumn = true;
         widArr.data_context = colPath;
     } else {
         // Add Initial Field Value from the Data Object
         if ("dataObj" in context) {
             widVal = getDataValue(context.dataObj, widDef, context);
             if (widVal != null) {
                 widAttr.value = widVal;
             } else {
                 widVal = null;
             }
         }
     }
     var makeEleName = "input";
     if (widDef.type == "textarea") {
         b.make("textarea", widAttr, widVal);
     } else {
         b.make(makeEleName, widAttr);
     }
     mformFinishWidget(widDef, b, context);
 }


 function mformsRenderTable(widDef, b, context, custParms) {
     var gtx = context.gbl;
     var flds = gtx.widgets;
     var tblId = widDef.id;
     var cols = widDef.columns;
     var dataObj = context.dataObj;
     if (!("data_context" in widDef)) {
         console.log("ERROR  data_context is mandatory for widget: " + JSON.stringify(widDef));
         return;
     }

     mformStartWidget(widDef, b, context, custParms);
     // TODO: determine right or left alignment
     // by column

     //b.make("div", {
     //    "class": widDef.class + "caption"
     //}, widDef.label);

     b.start("table", {
         "id": tblId + "tbl",
         "class": widDef.class
     });

     // Render column Headers

     b.start("tr", {
         "id": tblId + "tblhead",
         "class": widDef.class + "tr"
     });

     var dataArr = getNested(dataObj, widDef.data_context, []);
     if (dataArr.length == 0) {
         // Create the data array if there is not one.
         setNested(dataObj, widDef.data_context, dataArr);
     }
     // Render the Rows of the Table
     // We have to render the requested number
     // of rows even if there is not that much data
     var numRowtoRender = getNested(widDef, "min_rows", 1);
     var rowExtra = getNested(widDef, "rows_extra", 0);
     if (dataArr.length + rowExtra > numRowtoRender) {
         numRowtoRender = dataArr.length + rowExtra;
     }

     var colId = null;
     var rendFunc = null;
     var colWidDef = null;
     for (var i = 0; i < cols.length; i++) {
         colId = cols[i];
         if (colId in flds) {
             colWidDef = flds[colId];
             b.start("th", {
                 "id": tblId + colId + "id",
                 "class": colWidDef.class,
                 "tableId": tblId,
                 "colId": colId,
                 "onClick": "mformsColHeadClicked(" + tblId + "," + colId + ")"
             });
             b.b(colWidDef.label);
             b.finish("th");
         }
     }
     b.finish("tr");


     for (var rowndx = 0; rowndx < numRowtoRender; rowndx++) {
         // Render the Data rows
         b.start("tr");
         for (var colndx = 0; colndx < cols.length; colndx++) {
             colId = cols[colndx];
             if (colId in flds) {
                 b.start("td");
                 colWidDef = flds[colId];
                 if (colWidDef.type in widgRenderFuncs) {
                     dataContextCell = colPath = widDef.data_context + ".[" + rowndx + "]." + colWidDef.data_context;
                     try {
                         rendFunc = widgRenderFuncs[colWidDef.type];
                         rendFunc(colWidDef, b, context, {
                             "rowNdx": rowndx,
                             "dataArr": dataArr,
                             "table": widDef,
                             "id": colId + "-_" + rowndx,
                             "data_context": dataContextCell,
                             "skip_label": true
                         });
                     } catch (err) {
                         console.log("L324: Error rendering=", err, " colWidDef=", colWidDef, " funName", rendFunc);
                         b.b("<h6>Error Rendering See console</h6>");
                     }
                 } else {
                     console.log("cound not find rendering func=", colWidDef.Type, "for id=", colId, "colWidNdx=", i, " colWidDef=", colWidDef);
                     b.make("h6", {
                         id: widId
                     }, "Unkown Widget Type " + colWidDef.type + " id=" + colId + " colWidDef=" + JSON.stringify(colWidDef)).nl();
                 }
                 b.finish("td");
             }
         }
         b.finish("tr");
     }

     b.finish("table");
     b.make("div", {
         "id": tblId + "-_AddBut",
         "dataObjId": context.dataObjId,
         "class": widDef.class + "AddBut",
         "onClick": "addTableButton(this)"
     }, "Add row");
     mformFinishWidget(widDef, b, context);
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
                     rendFunc(widDef, b, context, {});
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
     if (context.dataObjId == null) {
         //User did not specify a object so give it a 
         //random data object Id and skip direct to 
         //rendering 
     }
     // Interpolate variables into URI Here
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

     if (dataObjId == null) {
         // Initialize empty data object with fabricated Id 
         // so we can skip a fetch on the server.  This assumes
         // that all fields have reasonable defaults specified in 
         // their form spec.
         dataObjId = "AUTO" + (0 - curr_time()) + "-" + (Math.floor(Math.random() * 1000));
         var dataObj = {
             "_id": dataObjId,
             "_client_created": true
         };
         gContext.dataObj[dataObjId] = dataObj;
     }


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