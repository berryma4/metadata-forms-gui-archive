/* Test mparser.js function using local nodejs.
  intended to make it easier to unit tests javascript
  intended to run in browser.
*/
var mforms=require("./mparser.js");

var testStr = `
- widget: 
    id: projectNum
    widget_type: text
    label:
      text: Project #
      place: left
      align: right
    width: 38
    size: 20
    data_context: cert/con_project_number  
    required: true
    max_len: 25
    class: input_field
    data_type: text
  
- widget:
    id: facilityName
    widget_type: text
    label : Facility Name #
    label_align: left
    size: 30
    data_context: con_project_number  
    required: true
    max_len: 50
    class: input_field
    data_type: text


- form:
  - row:
      col:
        widgets:
         - projectNum
         - FacilityName

`;


var testStr2 = `
- jimmy 
- jack:
    phone : 206-828-2387
    sex: male  
    projectNum : 1983
- lingua:
     phone: 205-686-38383
     yearBorn: 1983
     hourly: 198.24
     taxCred: -1983.21
     hasCar: true
     hasPlane: false
     pets:
       sam:
         living: true
       girtude: 
         living: false
     kids: 
      - jack:  
           living: true
      - nancy:
           living: false
`;

var tres = mforms.mformsParseMeta(testStr, {});
console.log(" tres testStr=", JSON.stringify(tres, null, 2));

var tres = mforms.mformsParseMeta(testStr2, {});
console.log(" tres testStr2=", JSON.stringify(tres, null, 2));
