/* Test mparser.js function using local nodejs.
  intended to make it easier to unit tests javascript
  intended to run in browser.
*/

if (typeof require != "undefined") {
  var mforms = require("./mforms_parse.js");
} else {
  // emulate module variable for browser
  var mforms = {
    "mformsParseMeta": mformsParseMeta
  };
}

var testStrForm1 = `
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

var testStrPeople1 = `
- jack:    
    projectNum : 1983
- lingua:
     hasPlane: false
     pets:
       sam:
         living: true
       girtude: 
         living: false
     kids:
      - hacker:
           living: true
      - nancy:
           living: false
`;

var testStrPeople2 = `
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
     cars: ["ford", "toyota Tacoma", "subaru"]
     label:
       text: I am text
       align: right
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

var testStrPerson3 = `
person:
     id: lingua
     phone: 205-686-38383
     yearBorn: 1983
     hourly: 198.24
     taxCred: -1983.21
     hasCar: true
     hasPlane: false
     cars: ["ford", "toyota Tacoma", "subaru"]
     label:
       text: I am text
       align: right
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

var testStrPerson4 = `
     id: lingua
     phone: 205-686-38383
     yearBorn: 1983
     hourly: 198.24
     taxCred: -1983.21
     hasCar: true
     hasPlane: false
     cars: ["ford", "toyota Tacoma", "subaru"]
     label:
       text: I am text
       align: right
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


function mParserTest(label, dataStr) {
  var tres = mforms.mformsParseMeta(dataStr, {});
  console.log("L77: mParserTest:", label, " Out=", JSON.stringify(tres, null, 2));
  return tres;
}

if (typeof require != "undefined") {
  mParserTest("test 1 form", testStrForm1);
  mParserTest("test 2 people", testStrPeople1);
  mParserTest("test 3 people", testStrPeople2);
  // Tests to see if an outermost object of 
  // type person gets created with the proper 
  // containment eg {" person" : {}}
  mParserTest("test single person dict object", testStrPerson3);
  mParserTest("test single dict at outer level", testStrPerson4);

}