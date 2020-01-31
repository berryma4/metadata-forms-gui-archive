# Actions & Roadmap for Metadata Forms Engine

# Rank Ordered Feature Work

* YML Parser

  * Ability to use value from any previously defined data element.  Eg define phone # validator pattern and then re-use with access via get nested.  EG:    

    ```yml
    validators:
      auth_patern: {0.9}8.\s\w\n
    
    widget:
        id: preauthNumber
        data_type: text
        type: text
        label : Preauthorization number
        data_context: claim.insurance.preAuthRef
        class: input_field
        ignore-case-match: true
        valid_pat: <validators.auth_pattern
    
    ```

     Please update programmer guide accordingly.

    

  * Ability to import a base widget Def from another defined widget and only override what changes.  

    ```yaml
    validators:
      auth_patern: {0.9}8.\s\w\n
      phone: ^([0-9]( |-)?)?(\(?[0-9]{3}\)?|[0-9]{3})( |-)?([0-9]{3}( |-)?[0-9]{4}|[a-zA-Z0-9]{7})$
      zip: ^[0-9]{5}(?:-[0-9]{4})?$
    
    - widget: 
      id: basic_phone
      data_type: text
      type: text
      label: phone #
      data_context: empty
      class: input_field
      ignore_case_match: true
      valid_patt: <validators.phone
      
    -widget: <widget.basic_phone
        id: basic_phone
        label: Patient Phone #
        data_context: claim.patient.phoneNum
    
    ```

    **Ability to import arbitrary text for a label or a paragraph from a specified URI**.  Run it through interpolation and then render into the Div.  This allows the system to modify contents of what is normally static text such as an explanation paragraph.  This would be ran through interpolation against the selected object.

    Please update programmer guide accordingly.

    

    

  * Ability to import another widget definition file using a #INCLUDE directive.  Make sure the #Include is relative to the directory containing the file where it occurs.  Included files may contain other files.  This acts just like reading the file and combining the text at the time of the directive.  In reality we make a call do the parse and inject the results into the parse tree.  The included files must  be processed in a blocking fashion because further parsing may use things referenced in them.     I would eventually implement a server side handler that would do this step but also want client side to allow complete operating with simple static file server.   Example syntax below but willing to consider alternatives.   Please update programmer guide accordingly.

    ```yaml
    ----------------------------------
    File data/forms/validators.txt
    ----------------------------------
    validators:
      auth_patern: {0.9}8.\s\w\n
      phone: ^([0-9]( |-)?)?(\(?[0-9]{3}\)?|[0-9]{3})( |-)?([0-9]{3}( |-)?[0-9]{4}|[a-zA-Z0-9]{7})$
      zip: ^[0-9]{5}(?:-[0-9]{4})?$
    
    ----------------------------------
    file data/forms/common/address.txt
    ----------------------------------
    -widget:
        id: basic_addr1
        data_type: text
        type: text
        label :Address 1
        size: 50
        mandatory: true
        data_context: insurer.address1
        class: input_field
        ignore-case-match: true
    
    -widget:
        id: basic_addr2
        data_type: text
        type: text
        label :Address 2
        size: 50
        mandatory: true
        data_context: insurer.address2
        class: input_field    
    
    -widget:
        id: basic_city
        data_type: text
        type: text
        label :City
        size: 35
        mandatory: true
        data_context: insurer.city
        class: input_field
    
    -widget:
        id: basic_state
        data_type: text
        type: text
        label :State
        size: 2
        maxlength: 2
        mandatory: true
        data_context: insurer.state
        class: input_field
        valid_patt: ^[0-9]{5}(?:-[0-9]{4})?$
        valid_fun: validate_zipcode
    
    ----------------------------------
    file data/forms/dental/dental-claim.txt
    ----------------------------------
    #include ../common/address.txt
    #include ../common/validators.txt
    
    -widget: <  basic_city
      id: patCity
      data_context: patient.address.city
      
    -widget: < basic_state
      id: patState
      data_context: patient.address.state
    
    ```

    * Ability to specify file to include in one Yaml to allow re-use of meta data.

    * Ability to use YAML anchors @ extensions  to create template fields and only supply what was missing.   Includes adding a tutorial. 

  * **Support localized labels:** with a flag in the form to specify the URI of a Label generation service where we pass the form.id and widget.id , localization parameter and it passes back the localized label.   Optional pass the actual label text, form id and localization and do the lookup.  Must take the set of these to provide lower network latency.  Provide a sample service that just returns the same labels passed or an empty set.  An empty set of return labels means there is no override.  

    Implement basic support so labels can all be treated as lookup values.  This may be done as a post  processing step after the YML Parse..       In effect anyplace a label was specified it can be replaced with a value looked up.   As shown below we use interpolation values {brand}/{local} to compute the URI where the value will be retrieved.   The lookup is done by Id so the merge is a little smart since when the line in the localization file "basic_addr1: Adresse 1" it has to look through all the widgets and forms an any other item where we may specify a and look for obj.label and replace what is there with "address 1" if the ID matches what is specified.  Please update programmer guide accordingly.    When the form attribute "labels: " is defined the system will automatically attempt to perform localization when the form data is first fetched using the function:  function display_form(targetDiv, formSpecUri, dataObjId, gContext)   This means the lookup values for interpolation must be set before the form is loaded.

    ```
    -------------------------
    -- basic-form.txt -------
    -------------------------
    -widget:
        id: basic_addr1
        data_type: text
        type: text
        label :Address 1
        size: 50
        mandatory: true
        data_context: insurer.address1
        class: input_field
        ignore-case-match: true
    
    -widget:
        id: basic_addr2
        data_type: text
        type: text
        label :Address 2
        size: 50
        mandatory: true
        data_context: insurer.address2
        class: input_field    
    
    
    - form:
       id : basicForm
       class: inputFrm
       label: A Basic Form   
       fetch:
          uri: data/claims/{dataObjId}.JSON
          method: GET
          parse: JSON
       save:
          uri: data/claims/{dataObjId}.JSON
          verb: PUT
          where: body   
       show_data_obj_div: dataObjDiv
       labels: basic_form_localize/{brand}/{local}
       widgets:   
               - topFieldsGroup
               - saveButton
    
    -----------------------------------
    -- basic_form_localize/national/fr.txt
    -----------------------------------
    basic_addr1: Adresse 1
    basic_addr2: Address 2
    basic_city: ville
    ```

    

  * 

  

* 

* Easy ability to force label to align to left or above field. 

* Demonstrate a company search using data from cert-of-need or from provider search. 

* Demonstrate a field validator for simple single token all alpha numeric.

* Ensure both the Global and local context are searched during interpolation

* Test / Demo arbitrary creation of variables at top level of Yaml to support re-use.  EG: A float  pattern would be re-usable across many fields. 

* Extend showDiv, hideDiv to use the lastDisplayStyle feature so when re-showing a div we bring back it's original display status rather than block.

* DONE:JOE:2020-01-26: Add userCollapsible feature to group level that renders the group with an icon to collaps with Icon to re-explode.

* DONE:JOE:2020-01-26: Modify arrow when group is contracted to point down to expand and up when contraction is available.

* AutoHideCollapsible feature added at the group level.  Do not render that portion if a data match does not exist eg:    {collapsible: { dataFiter: { src_data_context: person.isbuyer  compareFun: isTrue(), monitor: [persIsBuyer]}}}    Then must set a filter event or watcher so every change to one of a set Id triggers re-evaluation to add that area.  We will need the containter rendered so there is someplace to put it even if we skipped rendering it last time.     This implies we will need a list of rendered ID for the form so we can do global validation of mandatory fields that skips those fields we chose not render.

* Switch over to using Flexbox instead of inline-block for field placement.

* Switch over to using Label-for instad of manual label div specification.

* Modify Date parser to accept alternative input form and reform to desired format to support date picker.

* Warn programmer if form specification can not be loaded.

* Warn programmer if Requested data object can not be located.

* Horizontal Div blocks are not properly wrapping.

* comments trailing the data value on the line are not properly detected and removed after parsing YML

* DONE:JOE:2020-01-26: Move Demo-page layout to separate CSS so only that CSS germane to general forms remains in meta-forms. css also move cert-of-need.css specific styling to an external file and dental specific styling to adaform.css.

* Demo of Implement 

  * Convert CDT to CSV for rapid file transfer.
  * Create basic ADA For Fields.
  * Fast search filter widget to make search by codes easy.
  * Feature to set a random / timestamp data object Id after an empty object is loaded. Support rendering blank form when source object can not be located.
  * Download sample CDT Codes to populate drop down.
  * Download category of service
  * Map Category of service to CDT codes as column 
  * Change display of category of service to show based on selected CDT
  * Filter dropdown list of CDT codes as user types the code.
  * Filter dropdown list based on keyword.  EG: User types period and List filters to only show those codes containing that keyword.
  * Deliver data from server matching [FHIR standard ](https://www.hl7.org/fhir/valueset-c80-practice-codes.json.html)
  * Support pop-up search form so when user enters field to Name a User pop up search field to find users.   If user types "mand den" the filter should find "D5751"
  * Support to validate field value with Ajax Call.  EG once a user enters a policy number attempt to validate on server.  Requires  3 validation states.  unchecked,  valid, invalid, validation in process.
  * Generic Delimited parser where delimiter and presence of header is specified. 
  * Need to Allow update or refresh of a given form field based on actions taken in other form fields.  EG: A search set a member identity field based on the results of a search field. 
  * Form field which Sums other fields on the form.
  * Support display only field. 
  * Support hidden fields that will create the default value at a given path to fill out a valid structure.
  * Will have to create a Potential claim ID so we have something to save can probably use timestamp.
  * set city and state from zip when the zip is not set to None.
  * Validate Zip from list of valid zipcodes.
  * 

* Claim Form Deferable Enhancements

  * Support rendering array of procedure codes and editing inline.   Better yet always render a blank line when they start filling in a line then add another blank line.
  * Validate zipcode against presence of a zipcode file show error message when no match.
  * Default quantity to 1
  * Validate Tooth numbers
  *  Validate Tooth surface
  * Default date to last date entered or current date if no date entered.
  * When user enters company name provide search dropdown list
  * When user enters name of poly holder do search for select
  * When procedure code is entered support rapid search that pops up when they enter.  Or add a search popup that allows search and then sets the code.
  * When procedure code is entered then populate description if description does not have text in it.
  * On claim form support adding new blank lines with a +

* Demo of Patient Intake form

* Demo of Implement sample Client / sub client forms.

* 

* 

* Add support for HGroup.   Horizontal Group ideally using CSS to allow same row flex placement but with a min-width  to force wrapping as the screen shrinks.  horizontal group that is not allowed to wrap widgets. EG for city, state, zip

* Add support for a Widget Icon that is added in addition to the label field Widget Icon that is rendered before the actual Widget when specified.

* Add support for basic validators demonstrate with zipcode and state

* Add support for checkbox widget

* Add support for drop down list widget

* Add support for radio button widget

* respect data type specifier in widget rather than keeping as text

* Add Checkbox Widget

* Display edit error messages below the field when validation or edit rules are violated.  Implement validation function showing an error message

* Implement Top Menu Bar Widget where the menu could be display a different form  could be separate page.

* When updating DOM with record value if the field fails it's validation then display error message at that time in a div that remains hidden until validation validation fails.

* Switch to using HTML label-for tag rather than old approach.

* Finish code to submit object back to a target URI.

  * Disable Save Button until the Form is Dirty.
  * Detect forms that contain unsaved data.   Warn user if they are leaving page context when there are  unsaved changes on the form. 
  * 

* Demonstrate creating a POST string for send when fetching the object.

* Implement TAB bar widget which is very similar to top menu bar except is supports a change of visualization for the TAB that is currently open.

  * Ability to defer rendering inactive TABS until the tab is displayed.  Since content on one tab could change based on actions in another tab then 
  * Ability to show TABS that have incomplete work before record can be saved to server.

* 

* Support Generic Notion of a hideable sub form where the system can open sub form on entry or hover to parent div reflow to make fit.   Should use html detail view if feasible. Should support manual save hide.   Show status when mandatory fields are empty or hidden fields contain fields failing validation widgets. 

* Support a Table for Array Element Display 

  * Table Row Widget with includes Columns which support 1 or more widgets where the data binding includes the row index.   
  * Modify get nested so if a value is passed with path as  family.children.[3].name.first that is pulls the 3rd child.  Same with updates.
  * Demonstrate alternating color bands in table widget.
  * Demonstrate repeated headers in a table widget
  * Support client side sort,  
  * Support client side scroll through a larger list, 
  * Expand larger page to fit and return to server paging. 
  * Add support for alternating color Table in list view with custom links to open up next table
  * Show Fields that fail validating in a alternate background color
  * Hide rest of fields for other insurance when it does not apply
  * When other insurance does apply then those fields should be mandatory.
  * 

* Allow clicking on +- to show hide Div group sections make rendering the collapse functions optional.

* Add support to render list of certificates with a  metadata form widget.

* Tutorial showing custom rendering agent

* **Allow form display without custom HTML** - Ability to specify form display and data object in URI when driver page is loaded.  This allows demonstrating new forms without requiring any code changes.

* Display indicator that form when  dirty and unsaved when a field changes from original data.

* Date Widget Support

  * Add some of new HTML widgets like Date
  * Allow parsing of dates in common text formats into form required for the date widget. Also allow reformat into desired format for sending back to service.

* Audit Widget that shows each data change that has occurred for the current data object.   Optionally show forms displayed.

* Allow some fields to be disabled in metadata spec to prevent editing.

* Allow some fields to be disabled for editing until a rule becomes true.  

* Detect portrait mode on phone and change font size or try different font specifications such as 12px to see what shows up most consistently readable across the largest number of devices.

* Support for deep linking which would load and render a stack of form along with data object in background.  To allow page to be re-displayed on a new device.

* Support to feed incremental changes back to server so user can switch devices even before they submit using the deep link features. 

* Ability to chain forms together into a series where all the mandatory fields in the series must be filled in before the form is saved to server.

* Add support for tabs across top of page rendering sub forms into tab as they are clicked.

* Hide data / JSON view when in  portrait on mobile device.

* Add support to change text size when page is displayed on mobile device.

* Add support for chained forms that display one after another

* Add support for disabled widgets.

* Add support to disable submit button when all mandatory fields are not filled in.

* Ability to fetch contents of dropdown, radio, checkbox lists from remote service rather than embedding in  form.

* Add Horizontal slider widget.

* **Save Data back to server:** Add support to PUT or POST data back to server on save button press when all validation rules are good.   

  * Generic support for copying from a given getNested path in document read from server into different setNested path in preparation to send back to update web service.
  * Ability to Re-try save in to server after failure of function call.
  * Show Saving Message in browser when save Ajax Call is in process.
  * Simple semantic to allow sendBackToServer or  saveDataContext which defaults to main data context but if set to NONE will omit field from data sent back to server.

* Image Display Widget

* Image Upload Widget

* Simple Server that can save updates for Demo purposes.

  * Add SSL to Simple Server
  * Save basic changes to objects in a data directory
  * Apply basic security for these objects based on JSession
  * Add basic OIDC support for the server 
  * Add Native HTTPS functionality to the server so if we have a valid cert it can support HTTPS
  * Utility to convert arbitrary TSV file into a searchable permuted index one file per column with optional specification to combine columns such as first, last middle name.
    * File bisect server utility to find object identity from matching tokens 
    * Think about how to make this useful for publishing on a static server where I do not have server side functionality so it can be demonstrated on git.io. EG produce a list of Object ID  for each token and keep in one file per toke then the client can match.  Then create edge ngram files showing the tokens that are contained in each edge prefix to allow fast match retrieval by client.   

* Utility to convert sample people to JSON and save in fireBase on google.  Also modify sample to query firebase.

* **Support stylesheets specified in the form metadata**.  These are  are added at runtime by naming in the form specification.  Must support interpolation. 

* **Support Alternative Style sheets by Brand**.   Ideally show that as a interpolation parameter.  Allows a single form to be rendered with different look and feel. Ability to specify custom style in uri such as abc.com#style=x3 that causes a style sheet to be added to the page.  The list of stylesheets is computed from a spec in the form and if the style parameter is present in the file is interpolated into the style URI from parameters specified in the URI.  

* Display Rather than Edit Mode for Form - Support display mode which either renders the widget without the edit components or which changes the CSS selector to hide the edit field,  disables the field for editing changes the spacing to a tighter space.    Should support transition to display mode rather than edit mode as simple function call. 

* Basic Tutorial - Shows how different features work. 

  * Demonstrate multiple image selector widget.
  * Demonstrate support for fields with labels forced to wrap 

* Extend Forms parser to allow include loading additional files which have contents loaded at end of the existing file.    What happens in Yaml if you reload the same key a second time.
* 
* 
* Ability to transform data to entirely different structure for output.   Use a Output Path in data context. 
* Support a expanding Detail Widget where it shows some basic text then when user clicks on a expansion icon it expands that row and allows editing and adding to an array of items.
* Demonstrate ability to  handle multi-level nested forms eg:   Plan to list of clients to single client to list of sub clients to list of contacts to single contact with CRUD Add, Edit, Drop.
* Demo of simple Drag and Drop Editor that changes form in realtime.
* XRay viewer Widget with Zoom,  pan, brightness, crop and edit saves as metadata.
* Color Picker Widget.
* Ability to source data from two different objects resident in the object graph for interpolation.   EG: If you have a master contact list and are editing a detailed contact then you may want to render fields in the sub form from both records.  This requires the data_context to be enhanced so it can handle branched access where it currently only looks into the active object.    EG:  If the master contact has a ID of 300 and  a field of first_name we want to render in the sub form then the individual contact event has an ID of 18181 and is the active object and it includes an attribute master_contact: 300 then we need to be able to derive a path that goes to the root of the object graph using 300 as the key to retrieve it.   EG:   /objects:{master_contact}.name  which derives to going into the global list at GTX.objects['300'].name  rather than looking at current object.
* Ability to specify a class for label independent of class of the widget.
* Button or Link to show the metadata definition in a separate target window.
* Display currency with formatting showing space at grouping then remove the space prior to conversion.
* Allow label Class to override normal generated class for the label.  Demonstrate shrinking label for state to allow better formatting.    This is to allow easier formatting when we want custom behavior out of a subset of labels.

* Support streaming local changes to browser local storage so can restore if user leaves page and returns.   
* Implement the List of certs form that drills into the detail for specific cert.  
* Ability to change contents on in a field list for drop down type widgets based results from on a web service calls by the  time field gains context based on contents in data model based on prior changes.  EG:  When user selects state then the list of cities in drop down list is modified.  Should also allow all child objects to be specified in data context and the select a subset branch using other data fields as a key.
* Demonstrate breadcrumb trail that makes it easy to get back to list view or prior form.
* Display error popup / alert when form spec can not be located on the server.
* Add support to invalidate and remove parent object after edit of child when child views are included in parent fetch.  Or support editing them in place so other forms can properly see the changed fields when sub form edit field is displayed.
* **Server side meta data combiner** that reads the field include features and builds the total meta data server side rather than requiring multiple round trips.  This improves performance in marginal networks.
* Add support to allow multiple forms to be defined in a single file and only the one marked master.
* Add support to allow multiple data objects to be rendered and update the form as the data objects are received. 
* Make a clean way to read a directory of files and return header data to allow rendering a summary table.  EG: If each contact is in a separate file then would want to returns some basic data for each contact to render the initial table prior to the click that drills in to edit each piece of content.
* Map Sample Data  Using FHIR  data structures and URI as much as possible
* Package MDS server to allow import of the MDS feature and local server that defines additional handlers.   Need this to easily  have custom local directories for DOCS and build a handler to aggregate all widgets defined in a directory tree and fed them back as one stream.  I want the MDS server to be added so we have native support for a data directory where we can run GET/PUT/POST commands. 
* Demonstrate server with save functionality using serverless agent.   [Most likely using Google Firestore with Python server less functions](https://cloud.google.com/firestore/docs/quickstart-servers) [basic serverless tutorial](https://read.iopipe.com/the-right-way-to-do-serverless-in-python-e99535574454)  [googles managed container](https://cloud.google.com/run/docs/quickstarts/build-and-deploy)  [google serverless cloud functions](https://cloud.google.com/functions/) [google cloud function quick start](https://cloud.google.com/functions/docs/quickstart-console) [google cloud functions with data storage](https://cloud.google.com/functions/docs/tutorials/storage)  [streaming data from cloud storage into cloud functions using BigQuery](https://cloud.google.com/solutions/streaming-data-from-cloud-storage-into-bigquery-using-cloud-functions)  [Cloud functions for Firebase](https://firebase.google.com/docs/functions)  [google bigtable getting started](https://cloud.google.com/bigtable/docs/samples) [Google simple function to use Bigtable](https://github.com/GoogleCloudPlatform/golang-samples/tree/master/bigtable/helloworld)  [google firestore](https://cloud.google.com/firestore/) [google firestore getting started](https://cloud.google.com/firestore/docs/quickstart-servers)
* Demonstrate displaying data from a FHIR service.
* Add sample using a publicly available REST API to source the data.
* Extend the Tables widget to provide custom widgets in the tables.
* Extend the tables widget to provide in table sort functionality by clicking on the headers.
* Extend tables widget to allow a multi-level sort functionality by Shift click on different headers.  Show shift click instruction on hover or some other multi-level sort function
* **DEMO** [Configure custom domain](https://help.github.com/en/github/working-with-github-pages/configuring-a-custom-domain-for-your-github-pages-site) for github pages site
* Add support to change context on right hand # of uri at top of browser as user selects different widgets.
* Create a new set of files for cert of need where the facility operator is consolidated to include all certificates for that operator.  Also include ability to get the children with a sub query.
* Add physicians list to the data set for demonstration.
* Increase font sizes when displayed in portrait mode on android browser.
* Add fallback of manually built date picker widget for older browsers .   Support Native Date picker on modern browsers fall back to rendered. 
* 

* Ability to take reasonable defaults when not specified.  EG:  dataType can be assumed to be string unless otherwise specified.    PlaceHolder can be assumed to be Label unless specified.  PlaceHolder can be assumed to be same as Label unless specified. 
* Ability to parse delimited files with headers
* Ability to parse JSON files 
* Ability to load a form entirely from demo page by naming form and data source on URI like what we do in CSV tables.
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
* Agility to make service call to get a empty new record for new form type.
* Agility to differentiate a new record from update in calls to save 
* Ability to show everything changed in this session in drill in screen 
* Ability to autosave changes in WIP state prior to user pressing SAVE.   Ability to retrieve WIP state.  WIP state would be specific to a user but possibly not consider saving a .WIP file. 
* Support basic filed edit with re-pattern.
* support realtime field edit with javascript callback
* support realtime validation check with ajaj call
* support interpolating values from context into URI  specified in the form.
* Support loading list of values for popdown list from specified URI in form / widget
* Ability to load CSS from file specified in the form rather than requiring it to be loaded in parent html page.
* For fda sample page remove the right navigation payne and enlarge middle payne when  displaying on anything less than 900 px;
* Implement toots / test  screen which validates contents of one field based on contents of another field using RegEx.  Must make it easy for developers to test regex patterns before they specify them in metadata.



# DONE:

* Done:JOE:2020-01-25 warn programmer if data context can not be located.
* DONE:JOE:2020-01-25: Add Default Values for Form fields when no value is supplied in the JSON
* DONE:JOE:2020-01-25: Support null for data Obj Id which will create a object with time + random generated id.
* DONE:JOE:2020-01-25:Groups should render even when label is omitted.
* DONE:JOE:2020-01-25: Ability to show additional descriptive text when user enters a widget for editing also displays when they hover over that field.
* DONE:JOE:2020-01-25: Add Force Wrap directive to widgets that converts the inline-block to display:block for it's containing div.
* DONE:JOE:2020-01-25: Make the group containers directly addressable in Css with different classname.
* DONE:JOE:2020-01-25: Make Field set object directly addressable in css with different classname
* DONE:JOE:2020-02-25: Group Container that can suppress field set generation so it can just be used to help control layout.DONE:JOE:2020-01-25: Find sample claim forms and sample claim screens document in reference links. 
* DONE:JOE:2020-01-25: Find sample claims in FHIR form including a general example and a Dental example.
* DONE: JOE:2020-01-25: Produce a CDT file to populate the CDT search button. 
* DONE:JOE:2020-01-25: Download sample zipcode file to validate zipcode lookup with web service.
* DONE:JOE:2020-01-25: Gather a large list of fake people names to use to drive simple search behavior
* DONE:JOE:2019-12-19: Remove the create input field from browser util since we are using a different approach and it could be confusing to have both approaches in the same library.
* DONE:JOE:2019-12-17: Ability to specified HTML relative to the Div ID the form is created in to allow users to customize to their hearts content.
* DONE:JOE:2019-12-17: Must be able to display a form in a pre-existing DIV structure without taking over the entire pages.
* DONE:JOE:2109-12-19: Ability to support tabbing order through fields in the generated form
* DONE:JOE:2019-12-16: Demonstrate first with Certificate of Need Data from DFORMS System but converted to Dynamic Form.
* DONE:JOE:2019-12-19: Prevent right nav from wrapping when page is shrunk too far.
* DONE:JOE:2019-12-16: When starting form load need to also trigger retrieval of the data record and defer display until record is loaded.  Need unambiguous way to map user data for a given form rendering to a specific data object when multiple root objects are already cached in RAM.  If the data specific object is already loaded in RAM re-use the one already available to re-render the same form.  
* DONE:JOE:2019-12-19: Modify form fetch to skip fetch is form is already in memory
* DONE:JOE:2019-12-19: Demo of contact form that shows changes in the bound JSON as the fields are edited.
* DONE: JOE: 2019-12-19: Add Dropdown select field
* DONE: JOE:2019-12-19: Add Radio Button List  Supply basic style for horizontal or vertical
* DONE:JOE:2019-12-19:Add support for Date Widget.
* DONE:JOE:2019-12-19: Add support for vertical radio button as a css styling option.
* DONE:JOE:2019-12-19: Covert vgroup coding to a field group 
* DONE:JOE:2019-12-18: Add support for TextArea covering several lines.  Change cert of need description to display in this widget.
* DONE:JOE:2019-12-17: Add support for update of data object when fields change
* DONE:JOE:2019-12-19: When no label is included in Vgroup then suppress generation of label field.
* DONE:JOE:2019-12-17: Properly render multi-line text area field.