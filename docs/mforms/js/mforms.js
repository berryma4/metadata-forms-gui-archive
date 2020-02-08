 var GTX = {
     forms: {}, // A list of forms by Id that have been loaded
     formContexts: {},
     filesLoading: {}, // list of files currently being loaded used to avoid duplicate load by uri
     filesLoaded: {}, // list of files already loaded used to avoid reload by uri
     widgets: {}, // list of  widgets already loaded by widget Id
     dataObj: {}, // list of dataObj already loaded by Object Id
     newObIdCnt: 0,
     user: {
         "accessToken": "282872727" // Will need to get a real access token
     }
 };

 function gattr(ele, name) {
     return ele.getAttribute(name);
 }


 //--------------
 //--- INTERACTION / OnClick / EVENTS
 //---------------


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

 // Receive the Change events from the individual widgets.
 // use metadata encoded in the widget to lookup a context
 // use that context to validate data,  reformat the data,
 // enable auto suggest and update underlying DOM model
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


     // Apply Field Level Transforms as specified in the metadata
     // TODO:  Create a set of wiget types as an object that should not
     //  apply transforms so we can skip them without a complex if here
     if ((widDef.force_upper_case == true) && (fldVal != null) && (widDef.type != "dropdown") && (widDef.type != "radio")) {
         fldVal = fldVal.toUpperCase();
         if (hwidget.value != fldVal) {
             hwidget.value = fldVal;
         }
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
     if (widDef.isCol == true) {
         tableCellChanged(hwidget);
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

 // When a table column header is clicked default behavior is
 // to sort the table on that column. This function receives the
 // sort event. 
 function mformsColHeadClicked(hwidget) {
     var formId = gattr(hwidget, "form_id");
     var tblId = gattr(hwidget, "table_id");
     var colId = gattr(hwidget, "col_id");
     var dataObjId = gattr(hwidget, "dataObjId");
     var widDef = GTX.widgets[tblId];
     var dataContext = widDef.data_context;
     var context = GTX.formContexts[formId][dataObjId];
     var dataObj = GTX.dataObj[dataObjId];
     var dataArr = getNested(dataObj, dataContext);
     // TODO: Set Sort Specification for this column
     widDef.userSortCol = colId;
     var targetDiv = tblId + "Cont";

     // TODO: Set Build The Sort Keys with pointers to data records


     // TODO: Re-Render the HTML for the Table and replace it in the container
     var b = new String_builder();
     mformsRenderEditableTable(widDef, b, context, {
         "skip_container": true
     });
     b.toDiv(targetDiv);

 }

 // when table cells change we may need to do 
 // special things like update totals
 function tableCellChanged(hwidget) {
     var widId = hwidget.id.split("-_")[0];
     //var colId = gattr(hwidget, "col_id");
     var widDef = GTX.widgets[widId];
     if ((widDef.isCol == true) && (widDef.total_cell)) {
         var formId = gattr(hwidget, "form_id");
         var tblId = gattr(hwidget, "table_id");
         var tblDef = GTX.widgets[tblId];
         var dataObjId = gattr(hwidget, "dataObjId");
         var eleId = formId + tblId + widId + "total";
         var tblDataContext = tblDef.data_context;
         //var context = GTX.formContexts[formId][dataObjId];
         var dataObj = GTX.dataObj[dataObjId];
         var dataArr = getNested(dataObj, tblDataContext);
         var newTotal = mformsCalcArrTotal(dataArr, widDef.data_context);
         var outStr = newTotal;
         if (widDef.num_dec != undefined) {
             outStr = newTotal.toFixed(widDef.num_dec);
         }
         toDiv(eleId, outStr);
     }
 }

 function addTableRowButton(hwidget) {
     var formId = gattr(hwidget, "form_id");
     var tblId = gattr(hwidget, "table_id");
     var colId = gattr(hwidget, "col_id");
     var dataObjId = gattr(hwidget, "dataObjId");
     var widDef = GTX.widgets[tblId];
     var dataContext = widDef.data_context;
     var context = GTX.formContexts[formId][dataObjId];
     var dataObj = GTX.dataObj[dataObjId];
     var dataArr = getNested(dataObj, dataContext);
     // TODO: Set Sort Specification for this column
     widDef.userSortCol = colId;
     var targetDiv = tblId + "Cont";
     dataArr.push({});

     // TODO: Re-Render the HTML for the Table and replace it in the container
     var b = new String_builder();
     mformsRenderEditableTable(widDef, b, context, {
         "skip_container": true
     });
     b.toDiv(targetDiv);
 }


 // --------------
 // ---- Rendering Support Functions 
 // --------------


 var widgRenderFuncs = {
     "widgetGroup": mformsRenderGroupWidget,
     "text": mformsRenderTextWidget,
     "textarea": mformsRenderTextWidget,
     "button": mformsRenderButton,
     "dropdown": mformRenderDropdown,
     "radio": mformRenderRadio,
     "date": mformsRenderTextWidget,
     "table": mformsRenderEditableTable
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


 // Check widget defenition for missing things like
 // class and set them to reasonable defaults
 function mformFixupWidget(widDef, context) {
     if (!("id" in widDef)) {
         console.log("ERROR: Widget Defenition must contain a Unique ID widDef=" + JSON.stringify(widDef));
     }
     if (!("class" in widDef)) {
         widDef.class = "input_field";
     }
     if (!("type" in widDef)) {
         widDef.type = "text";
     }
     if (!("data_type" in widDef)) {
         widDef.data_type = "text";
     }

     return widDef;
 }

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
     if ("data_context" in custParms) {
         dataPath = custParms.data_context;
     }
     var dataVal = getNested(dataObj, dataPath, null);
     if ((dataVal == null) && (widDef.default != undefined)) {
         dataVal = widDef.default;
         setNested(dataObj, dataPath, dataVal);
     }
     return dataVal;
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

     if (custParms.skip_container != true) {
         b.start("div", {
             "id": widId + "Cont",
             "class": cssClass + "Cont",
         }).nl();
     }

     var labelClass = widDef.class + "Label";
     if (widDef.label_class != undefined) {
         labelClass = widDef.label_class + " " + labelClass;
     }
     if (("label" in widDef) && (widDef.skip_label != true) && (custParms.skip_label != true)) {
         // Add Div with Label
         b.make("label", {
             "class": labelClass,
             "for": widId,
             "id": widId + "Label"
         }, widDef.label);
     }
     return b;
 }

 function mformFinishWidget(widDef, b, context, custParms) {
     b.make("div", {
         "class": "fieldStatusMsg",
         "id": widDef.id + "Status"
     }).nl();
     if (custParms.skip_container != true) {
         b.finish("div").nl();
     }
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



 // --------------------
 // --- Primary Rendering Functions
 // --------------------


 function mformsRenderButton(widDef, b, context, custParms) {
     b.start("div", {
         "class": widDef.class + "contain"
     });
     var attr = mformBasicWidAttr(widDef, context);
     mformCopyAttribs(widDef, attr, mformTextFieldCopyAttr);
     copyOverCustParms(attr, widDef, custParms);
     attr.type = "button";
     attr.onClick = InterpolateStr(widDef.action, [context.dataObj, context, context.form_def, context.gContext]);
     //"saveFormChanges(this)";
     b.make("button", attr, widDef.label);
     b.finish("div");
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
     copyOverCustParms(widAttr, widDef, custParms);
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
     var dataVal = getDataValue(dataObj, widDef, context, custParms);

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
     mformFinishWidget(widDef, b, context, custParms);
     b.nl();
 }



 function mformRenderDropdown(widDef, b, context, custParms) {
     mformFixupWidget(widDef, context);
     var gtx = context.gbl;
     var widId = widDef.id;
     mformStartWidget(widDef, b, context, custParms);
     // Add the actual Text Widget
     var widAttr = mformBasicWidAttr(widDef, context);
     mformCopyAttribs(widDef, widAttr, mformTextFieldCopyAttr);
     copyOverCustParms(widAttr, widDef, custParms);
     delete widAttr.onInput; // We do not need this handler for drop down
     //widAttr["-webkit-appearance"] = "none";
     b.start("select", widAttr);

     var matchOptVal = null;
     var dataVal = getDataValue(context.dataObj, widDef, context, custParms);
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
     mformFinishWidget(widDef, b, context, custParms);
 }

 function copyOverCustParms(widAttr, widDef, custParms) {
     if ("id" in custParms) {
         widAttr.id = custParms.id; // overlay locally computed.
     } else if ("id" in widDef) {
         custParms.id = widDef.id;
         widAttr.id = widDef.id;
     }

     if ("col_Id" in custParms) {
         widAttr.col_id = custParms.colId;
     }
     if ("form_id" in custParms) {
         widAttr.form_id = custParms.form_id;
     }
     if ("table_id" in custParms) {
         widAttr.table_id = custParms.table_id;
     }
     if ("data_arr_path" in custParms) {
         widAttr.data_arr_path = custParms.data_arr_path;
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
     mformFixupWidget(widDef, context);
     var gtx = context.gbl;
     //mformsAdjustCustParms(widDef, b, context, custParms);
     var widId = custParms.widId;
     var colPath = custParms.data_context;
     mformStartWidget(widDef, b, context, custParms);
     // Add the actual Text Widget
     var widAttr = mformBasicWidAttr(widDef, context);

     mformCopyAttribs(widDef, widAttr, mformTextFieldCopyAttr);
     copyOverCustParms(widAttr, widDef, custParms);
     // "rowNdx": rowndx,
     // "dataArr": dataArr,
     //"table": widDef

     var widVal = "";
     if (widDef.isCol == true) {
         widVal = getNested(context.dataObj, custParms.data_context, null);
         widAttr.iscolumn = true;
         widAttr.data_context = colPath;

     } else {
         // Add Initial Field Value from the Data Object
         if ("dataObj" in context) {
             widVal = getDataValue(context.dataObj, widDef, context, custParms);
         }
     }

     // Format with fixed decimal points if requested
     // in the metadata
     var numDec = widDef.num_dec;
     if ((numDec != undefined) && (numDec >= 0) && (numDec <= 20) && (widVal != null)) {
         widVal = parseFloat(widVal).toFixed(numDec);
     }

     // If we have a valid value then save to the widget for rendering
     if (widVal != null) {
         widAttr.value = widVal;
     } else {
         widVal = null;
     }

     var makeEleName = "input";
     if (widDef.type == "date") {
         widAttr.class = "input_date " + widAttr.class;
     }
     if (widDef.type == "textarea") {
         b.make("textarea", widAttr, widVal);
     } else {
         b.make(makeEleName, widAttr);
     }
     mformFinishWidget(widDef, b, context, custParms);
 }

 //-------------
 //-- EDIT TABLE RENDERING
 //-------------
 // Iterate records in the data array
 // build a index by the values of the data field
 // sort them and return the sorted index.  Use the Column
 // specified data types to determine if we should be 
 // converting or padding sort key for proper numeric sort.
 function mformsBuildSortKey(widDef, context, custParms) {

 }

 function mformsCalcArrTotal(dataArr, data_context) {
     var totVal = 0;
     for (rowndx = 0; rowndx < dataArr.length; rowndx++) {
         dataRow = dataArr[rowndx];
         fldVal = getNested(dataRow, data_context, 0);
         fldVal = Number.parseFloat(fldVal);
         totVal += fldVal;
     }
     return totVal;
 }

 function mformsRenderEditableTable(widDef, b, context, custParms) {
     mformFixupWidget(widDef, context);
     var gtx = context.gbl;
     var flds = gtx.widgets;
     var tblId = widDef.id;
     var cols = widDef.columns;
     var dataObj = context.dataObj;
     if (!("data_context" in widDef)) {
         console.log("ERROR  data_context is mandatory for widget: " + JSON.stringify(widDef));
         return;
     }
     var colndx = null;
     var rowndx = null;
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

     // -----
     //--- Render Table Header
     //------
     var colId = null;
     var rendFunc = null;
     var colWidDef = null;
     for (var i = 0; i < cols.length; i++) {
         colId = cols[i];
         if (colId in flds) {
             colWidDef = flds[colId];
             b.start("th", {
                 "id": tblId + colId + "id",
                 "class": colWidDef.cell_class,
                 "table_id": tblId,
                 "col_id": colId,
                 "form_id": context.form_id,
                 "dataObjId": context.dataObjId,
                 "onClick": "mformsColHeadClicked(this)"
             });
             b.b(colWidDef.label);
             b.finish("th");
         }
     }
     b.finish("tr");

     //------------
     //--- Render Table Body
     //------------
     for (rowndx = 0; rowndx < numRowtoRender; rowndx++) {
         // Render the Data rows
         b.start("tr");
         for (colndx = 0; colndx < cols.length; colndx++) {
             colId = cols[colndx];
             if (colId in flds) {
                 colWidDef = flds[colId];
                 b.start("td", {
                     "class": colWidDef.cell_class
                 });
                 mformFixupWidget(colWidDef, context);
                 if (colWidDef.type in widgRenderFuncs) {
                     dataContextCell = colPath = widDef.data_context + ".[" + rowndx + "]." + colWidDef.data_context;
                     try {
                         rendFunc = widgRenderFuncs[colWidDef.type];
                         rendFunc(colWidDef, b, context, {
                             "rowNdx": rowndx,
                             "dataArr": dataArr,
                             "table": widDef,
                             "col_id": colId,
                             "table_id": tblId,
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

     if (widDef.total_line == true) {
         // Add the Total Row 
         b.start("tr", {
             "id": tblId + "tblTotRow",
             "class": widDef.class + "tr" + " " + widDef.class + "totRow"
         });
         var numEmptyCellRendered = 0;
         for (colndx = 0; colndx < cols.length; colndx++) {
             colId = cols[colndx];
             if (colId in flds) {
                 colWidDef = flds[colId];
                 if (colWidDef.total_cell != true) {
                     // just render a empty cell on the total row if not a total cell.
                     var tmpOutStr = "";
                     if (numEmptyCellRendered < 1) {
                         tmpOutStr = "Totals";
                     }
                     b.make("th", {}, tmpOutStr);
                     numEmptyCellRendered++;
                 } else {
                     b.start("th", {
                         "class": colWidDef.cell_class + " " + colWidDef.class + "total",
                         "id": context.form_id + tblId + colId + "total"
                     });
                     var totVal = mformsCalcArrTotal(dataArr, colWidDef.data_context);
                     var numDec = colWidDef.numDec;
                     if (numDec == undefined) {
                         numDec = 2;
                     }
                     // TODO: Add formatting of output field.
                     b.b(totVal.toFixed(numDec));
                     b.finish("td");
                 }
             }
         }
         b.finish("tr");
     }
     b.finish("table");


     //----------
     //--- Render the Table Add Row button
     //----------
     b.start("div", {
         "class": widDef.class + "addRowCont"
     });
     b.make("button", {
         "id": tblId + "-_AddBut",
         "table_id": tblId,
         "form_id": context.form_id,
         "dataObjId": context.dataObjId,
         "class": widDef.class + "AddBut",
         "onClick": "addTableRowButton(this)"
     }, "<b>+</b>Add row");
     b.finish("div");
     mformFinishWidget(widDef, b, context, custParms);
 }

 //-----
 //-- MAIN RENDERING SECTION
 //-----
 function mformsRenderWidgets(parent, widgets, b, context) {
     var gtx = context.gbl;
     var flds = gtx.widgets;
     var parClass = parent.class;
     for (var i = 0; i < widgets.length; i++) {
         var widId = widgets[i];
         if (widId in flds) {
             var widDef = flds[widId];
             mformFixupWidget(widDef, context);
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

 //-------------
 //-- Data Save & Retrieval Funcations
 //-------------
 function saveFormChanges(hwidget) {
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
     var formDef = GTX.forms[formId];
     var dataObjId = gattr(hwidget, "dataObjId");
     var context = GTX.formContexts[formId][dataObjId];
     var dataObj = GTX.dataObj[dataObjId];

     var saveSpec = formDef.save;
     if (saveSpec == undefined) {
         alert("Err: No Save Section defined in metadata");
     }

     // TODO: Insert Logic here to produce a different 
     // form of Post body based on transform spec embedded in 
     // the save spec.
     var postString = JSON.stringify(dataObj);

     // Setup the AJAX CAll
     var parms = {};
     var req_uri = InterpolateStr(saveSpec.uri, [context, dataObj, formDef]);
     console.log("L263: saveFormChanges req_uri=", req_uri);
     parms.req_headers = {
         'Content-Type': "application/json",
         'Authorization': context.gbl.user.accessToken
     };
     parms.req_method = saveSpec.verb;
     parms.context = context;
     parms.form_id = formId;
     parms.form_def = formDef;
     parms.dataObjId = context.dataObjId;
     parms.uri = req_uri;
     context.gbl.filesLoading[req_uri] = true;
     // TODO: Call the user specified save start function so they can change GUI state.
     simplePost(req_uri, postString, mformSaveDataObjOnData, parms, saveSpec.verb);
     toDiv(saveSpec.status_div, "AJAX Sending " + saveSpec.method + " uri=" + req_uri + " body=" + postString);
 }


 // AJAX Event handler to receive data objects requested
 // by the form.   Once data has arrived will also 
 // trigger rendering of the form which had to be delayed
 // until we had data to populate it. 
 function mformSaveDataObjOnData(data, httpObj, parms) {
     if (parms.uri in parms.context.gbl.filesLoading) {
         delete parms.context.gbl.filesLoading[parms.uri];
     }
     var objId = parms.context.dataObjId;
     var gtx = parms.context.gbl;
     var formDef = parms.form_def;
     var statDiv = formDef.save.status_div;
     var basicStatStr = " status=" + httpObj.status + " message=" + httpObj.statusText + " dataObjId=" + parms.dataObjId;
     if (httpObj.status != 200) {
         toDiv(statDiv, "Error Saving " + parms.uri + basicStatStr + " uri" + parms.uri);
         // TODO: Call the user specified save error function to indicate save failed.
         return;
     } else {
         toDiv(statDiv, basicStatStr);
         console.log("uri=" + parms.uri + " " + basicStatStr);

         if (data <= "") {
             console.log("L5: mformSaveDataObjOnData err=" + httpObj);
             toDiv(statDiv, "No Data Recieved from save operation uri=" + parms.uri + " verb=" + req_method)
         } else {
             console.log("L991: mformSaveDataObjOnData get data=", data, " uri=", parms.uri);
             toDiv(statDiv, "Success save " + basicStatStr + " body=" + data);
             // TODO: Call the user specified Wait Notification Function to indicate save sucess

             // TODO: Add in some real logic to handle the results 

             /*
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
             */
         }
     }
 }






 //-------------
 //-- Data & Form Retrieval Event Handlers
 //-------------
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



 //------------------------
 //-- mforms AJAX support for fetching Data Objects
 //------------------------


 // AJAX Event handler to receive data objects requested
 // by the form.   Once data has arrived will also 
 // trigger rendering of the form which had to be delayed
 // until we had data to populate it. 
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



 // AJAX Request to fetch a User Object based on the
 // Fetch specification in the Metadata.  Supports interpolation
 // to fill in the request URI: 
 // TODO:  Need to allow creation of a POST STRING HERE
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


 //--------------
 //-- mforms AJAX support for fetching Form Spec
 //--------------

 // Process the forms spec once received from server
 // or if needed trigger request for an associated
 // data record to render.
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

 // Event handler to Parse Forms data once received from
 // the server. 
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

 // Make Ajax Call to Load script file from server
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

 //----------
 //-- Main Driver for MForms Interface
 //----------
 function display_form(targetDiv, formSpecUri, dataObjId, gContext) {
     //"dataSourceUri": dataSourceUri,
     console.log(" display_form() targetDiv=", targetDiv, " formSpecUri=", formSpecUri, " dataObjId=", dataObjId)

     if (dataObjId == null) {
         // Initialize empty data object with fabricated Id 
         // so we can skip a fetch on the server.  This assumes
         // that all fields have reasonable defaults specified in 
         // their form spec.
         dataObjId = "AUTO" + (0 - curr_time()) + "-" + (Math.floor(Math.random() * 1000)) + "-" + gContext.newObIdCnt;
         var dataObj = {
             "_id": dataObjId,
             "_client_created": true
         };
         gContext.newObIdCnt++;
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