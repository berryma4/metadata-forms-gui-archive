# Actions & Roadmap for Metadata Forms Engine

# TODO:

* Demo of contact form that shows changes in the bound JSON as the fields are edited.
* Demo of Patient Intake form
* DONE: JOE: 2019-12-19: Add Dropdown select field
* DONE: JOE:2019-12-19: Add Radio Button List  Supply basic style for horizontal or vertical
* DONE:JOE:2019-12-19:Add support for Date Widget.
* DONE:JOE:2019-12-19: Add support for vertical radio button as a css styling option.
* Add Checkbox
* Implement validation function showing an error message
* Finish code to submit object back to a target URI.
* Add some of new HTML widgets like Date
* DONE:JOE:2019-12-19: Covert vgroup coding to a field group 
* Allows a single form to be rendered with different look and feel. Ability to specify custom style in uri such as abc.com#style=x3 that causes a style sheet to be added to the page.  The list of stylesheets is computed from a spec in the form and if the style parameter is present in the file is interpolated into the style URI from parameters specified in the URI.  
* Ability to source data from two different objects resident in the object graph for interpolation.   EG: If you have a master contact list and are editing a detailed contact then you may want to render fields in the sub form from both records.  This requires the data_context to be enhanced so it can handle branched access where it currently only looks into the active object.    EG:  If the master contact has a ID of 300 and  a field of first_name we want to render in the sub form then the individual contact event has an ID of 18181 and is the active object and it includes an attribute master_contact: 300 then we need to be able to derive a path that goes to the root of the object graph using 300 as the key to retrieve it.   EG:   /objects:{master_contact}.name  which derives to going into the global list at GTX.objects['300'].name  rather than looking at current object.
* Ability to import arbitrary text for a label or a paragraph from a specified URI.  Run it through interpolation and then render into the Div.  This allows the system to modify contents of what is normally static text such as an explanation paragraph.  This would be ran through interpolation against the selected object.
* DONE:JOE:2019-12-18: Add support for TextArea covering several lines.  Change cert of need description to display in this widget.
* Button or Link to show the metadata definition in a separate target window.
* Disable Save Button until the Form is Dirty.
* Show Fields that fail validating in a alternate background color
* Allow some fields to be disabled in metadata spec to prevent editing.
* When updating DOM with record value if the field fails it's validation then display error message at that time in a div that remains hidden until validation validation fails.
* Display currency with formatting showing space at grouping then remove the space prior to conversion.
* Allow label Class to override normal generated class for the label.  Demonstrate shrinking label for state to allow better formatting.    This is to allow easier formatting when we want custom behavior out of a subset of labels.
* Add support for concept of horizontal group that is not allowed to wrap widgets. EG for city, state, zip
* DONE:JOE:2019-12-17: Add support for update of data object when fields change
* DONE:JOE:2019-12-19: When no label is included in Vgroup then suppress generation of label field.
* DONE:JOE:2019-12-17: Properly render multi-line text area field.
* ability to include a leading icon for a field like renderField from old browserutil.
* Ability to specify a class for label independent of class of the widget.
* demonstrate support for fields with labels forced to wrap 
* Implement the List of certs form that drills into the detail for specific cert.  
* Ability to change contents on in a field list for drop down type widgets based on a web service calls by the  time field gains context based on contents in data model based on prior changes.  EG:  When user selects state then the list of cities in drop down list is modified.  Should also allow all child objects to be specified in data context and the select a subset branch using other data fields as a key.
* Demonstrate breadcrumb trail that makes it easy to get back to list view or prior form.
* Modify get nested so if a value is passed with path as  family.children.[3].name.first that is pulls the 3rd child.  Same with updates.
* Add support to PUT or POST data back to server on save button press when all validation rules are good.
* Add support to display form is dirty and unsaved when a field changes from original data.
* Add support to specify form display with data object in URI when driver page is loaded
* Add support for basic validators demonstrate with zipcode and state
* Add support for checkbox widget
* 
* Add support for drop down list widget
* Add support for radio button widget
* Add support to render list of certificates with a  metadata form widget.
* Add support for alternating color Table in list view with custom links to open up next table
* Add support for tabs across top of page rendering sub forms into tab as they are clicked.
* Hide data / JSON view when in  portrait on mobile device.
* Add support to change text size when page is displayed on mobile device.
* Add support for chained forms that display one after another
* Add support for disabled widgets.
* Add support to disable submit button when all mandatory fields are not filled in.
* Ability to fetch contents of dropdown, radio, checkbox lists from remote service rather than embedding in  form.
* DONE:JOE:2019-12-19: Prevent right nav from wrapping when page is shrunk too far.
* Add support to invalidate and remove parent object after edit of child when child views are included in parent fetch.  Or support editing them in place so other forms can properly see the changed fields when sub form edit field is displayed.
* Add support to display edit error messages below the field when validation or edit rules are violated.
* DONE:JOE:2019-12-16: When starting form load need to also trigger retrieval of the data record and defer display until record is loaded.  Need unambiguous way to map user data for a given form rendering to a specific data object when multiple root objects are already cached in RAM.  If the data specific object is already loaded in RAM re-use the one already available to re-render the same form.  
* Add support to allow multiple forms to be defined in a single file and only the one marked master.
* Add support to allow multiple data objects to be rendered and update the form as the data objects are received. 
* DONE:JOE:2019-12-19: Modify form fetch to skip fetch is form is already in memory
* Extend Forms parser to allow include loading additional files which have contents loaded at end of the existing file.    What happens in Yaml if you reload the same key a second time.
* DONE:JOE:2019-12-16: Demonstrate first with Certificate of Need Data from DFORMS System but converted to Dynamic Form.
* Make a clean way to read a directory of files and return header data to allow rendering a summary table.  EG: If each contact is in a separate file then would want to returns some basic data for each contact to render the initial table prior to the click that drills in to edit each piece of content.
* Map Sample Data  Using FHIR  data structures and URI as much as possible
* Package MDS server to allow import of the MDS feature and local server that defines additional handlers.   Need this to easily  have custom local directories for DOCS and build a handler to aggregate all widgets defined in a directory tree and fed them back as one stream.  I want the MDS server to be added so we have native support for a data directory where we can run GET/PUT/POST commands. 
* Add Native HTTPS functionality to the server so if we have a valid cert it can support HTTPS
* Add sample using a publicly available REST API to source the data.
* Extend the CSV Tables widget to provide custom widgets in the tables.
* Extend the CSV tables widget to provide in table sort functionality by clicking on the headers.
* Extend CSV tables widget to allow a multi-level sort functionality by Shift click on different headers.  Show shift click instruction on hover or some other multi-level sort function
* [Configure custom domain](https://help.github.com/en/github/working-with-github-pages/configuring-a-custom-domain-for-your-github-pages-site) for github pages site
* Add support to change context on right hand # of uri at top of browser as user selects different widgets.
* DONE:JOE:2019-12-19: Remove the create input field from browser util since we are using a different approach and it could be confusing to have both approaches in the same library.
* Create a new set of files for cert of need where the facility operator is consolidated to include all certificates for that operator.  Also include ability to get the children with a sub query.
* Add physicians list to the data set for demonstration.
* Increase font sizes when displayed in portrait mode on android browser.
* Add generic support for copying from a given getNested path in document read from server into different setNested path in preparation to send back to update web service.





## Requirements 

* Ability to use YAML anchors @ extensions  to create template fields and only supply what was missing.
* Ability to take reasonable defaults when not specified.  EG:  dataType can be assumed to be string unless otherwise specified.    PlaceHolder can be assumed to be Label unless specified.  PlaceHolder can be assumed to be same as Label unless specified. 
* DONE:JOE:2019-12-17: Ability to specified HTML relative to the Div ID the form is created in to allow users to customize to their hearts content.
* DONE:JOE:2019-12-17: Must be able to display a form in a pre-existing DIV structure without taking over the entire pages.
* Ability to parse delimited files with headers
* Ability to parse JSON files 
* Ability to load a form entirely from demo page by naming form and data source on URI like what we do in CSV tables.
* DONE:JOE:2109-12-19: Ability to support tabbing order through fields in the generated form
* Form loader:
  * Allow YAML like syntax with embededed single line JSON as input.
  * DONE:JOE:2019-12-19: Allow naming a form file to load which contains all widgets.
  * Allow naming a widget that triggers loading for a form.
  * 
* Meta data description
  * DONE:JOE:2019-12-19: Ability to described fields or sets of fields that can be re-used.
  * Ability to re-use the fragments without copy paste
  * Allow fragments to be enhanced with data from local environment using interpolation
  * Server ability to assemble all fragments from a directory tree assemble them and return in one set to reduce round trips wile remaining highly editable.
  * Optional:  Allow some data elements such as arrays to be described as Widgets 
  * Allow Frame sets and Row Sets etc to reference attributes defined in a separate file or inline.
  * Validation failure messages
  * Validation failure refuse to submit messages
  * Mandatory Fields that refuse to submit
  * Ability to list Options for dropdown in the metadata itself.
  * Ability to fetch list of options for dropdown from a file or service on file. 
  * 
* Field rendering system
  * Describe all common widget types in meta data only
  * Ability to name widget rendering agents in a table so they can be over-ridden
  * Ability to pass an environmental widget into the widgets so common data attributes do not have to be described
  * Ability to name common field validation in meta data
  * Ability to name custom JavaScript functions in meta data
  * Ability to call a web service after every key stroke for type as you go validation
  * Ability to Call a web service on field exist for type as you go validation
* Ability to call a web service with parameters sourced from global variables to get data 
* Ability to assemble data from fields modified to 
* Ability to spool changes as they are clicked back to server 
* Demonstrate ability to  handle multi-level nested forms eg:   Plan to list of clients to single client to list of sub clients to list of contacts to single contact with CRUD Add, Edit, Drop.
* Agility to make service call to get a empty new record for new form type.
* Agility to differentiate a new record from update in calls to save 
* Ability to show everything changed in this session in drill in screen 
* Ability to defer rendering inactive TABS until the tab is displayed.  Since content on one tab could change based on actions in another tab then 
* Ability to show TABS that have incomplete work before record can be saved to server.
* Ability to autosave changes in WIP state prior to user pressing SAVE.   Ability to retrieve WIP state.  WIP state would be specific to a user but possibly not consider saving a .WIP file. 
* Support basic filed edit with re-pattern.
* support realtime field edit with javascript callback
* support realtime validation check with ajaj call
* support interpolating values from context into URI  specified in the form.
* Support loading list of values for popdown list from specified URI in form / widget
* Ability to load CSS from file specified in the form rather than requiring it to be loaded in parent html page.
* For fda sample page remove the right navigation payne and enlarge middle payne when  displaying on anything less than 900 px;
* 



# DONE:

