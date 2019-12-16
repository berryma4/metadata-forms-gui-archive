# Actions & Roadmap for Metadata Forms Engine

# TODO:

* Demonstrate first with Certificate of Need Data from DFORMS System but converted to Dynamic Form.
* Make a clean way to read a directory of files and return header data to allow rendering a summary table.  EG: If each contact is in a separate file then would want to returns some basic data for each contact to render the initial table prior to the click that drills in to edit each piece of content.
* Map Sample Data  Using FHIR  data structures and URI as much as possible
* Package MDS server to allow import of the MDS feature and local server that defines additional handlers.   Need this to easily  have custom local directories for DOCS and build a handler to aggregate all widgets defined in a directory tree and fed them back as one stream.  I want the MDS server to be added so we have native support for a data directory where we can run GET/PUT/POST commands. 
* Add Native HTTPS functionality to the server so if we have a valid cert it can support HTTPS
* Add sample using a publicly available REST API to source the data.
* Extend the CSV Tables widget to provide custom widgets in the tables.
* Extend the CSV tables widget to provide in table sort functionality by clicking on the headers.
* Extend CSV tables widget to allow a multi-level sort functionality by Shift click on different headers.  Show shift click instruction on hover or some other multi-level sort function
* [Configure custom domain](https://help.github.com/en/github/working-with-github-pages/configuring-a-custom-domain-for-your-github-pages-site) for github pages site





## Requirements 

* Ability to take reasonable defaults when not specified.  EG:  dataType can be assumed to be string unless otherwise specified.    PlaceHolder can be assumed to be Label unless specified.  PlaceHolder can be assumed to be same as Label unless specified. 
* Ability to specified HTML relative to the Div ID the form is created in to allow users to customize to their hearts content.
* Must be able to display a form in a pre-existing DIV structure without taking over the entire pages.
* Ability to parse delimited files with headers
* Ability to parse JSON files 
* Ability to load a form entirely from demo page by naming form and data source on URI like what we do in CSV tables.
* Form loader:
  * Allow YAML like syntax with embededed single line JSON as input.
  * Allow naming a form file to load which contains all widgets.
  * Allow naming a widget that triggers loading for a form.
  * 
* Meta data description
  * Ability to described fields or sets of fields that can be re-used.
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



# DONE:

