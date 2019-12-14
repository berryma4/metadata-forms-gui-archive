# 
# Meta data driven forms GUI for REST services
(metadata-forms-gui) Building forms based GUI to CRUD operations.  Provide a Meta data based system to deliver highly functional 
user interfaces for editing, viewing and updating data in REST based services. 


# Sample Screen

# Sample Script

# Sample Data

# Getting Started

#$ Build and install

## Basic HTTP REST server

### Why do we need a custom server:

We do not really need a custom server but we do need a HTTP listener to demonstrate features of the system because the system uses AJAX calls to fetch data needed to render the forms.  It also uses AJAX calls to fetch data from the underlying system and save data back to the server.  The build in HTTP server provides this function with some mapped virtual directories.  It could easily be replaced with any HTTP server such as Apache,  HAProxy,  Tomcat etc provided the same directories are mapped to the underlying forms data.

One feature this server provides is a custom handler which if passed a directory will walk that directory assemble all the data elements defined to build a set of screens and passes back the fully assembled text as a single service call.  This reduces the back and forth AJAX calls and can improve overall response time. 

#### Why do we need the MDS server:

We do not really need the MDS server but we do need REST server that can save data with HTTP PUT and fetch data with HTTP GET and HTTP POST operations.     In normal operation a set of custom REST services would be provided that could deliver this functionality.  For example rather than storing data in the MDS server you may use a Azure FHIR storage service.

# Basic Design Elements to Work Through

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

# TODO:

* Demonstrate first with Certificate of Need Data from DFORMS System but converted to Dynamic Form.
* Map Sample Data  Using FHIR  data structures and URI as much as possible
* 
* Add Native HTTPS functionality to the server so if we have a valid cert it can support HTTPS
* Add sample using a publicly available REST API to source the data.
* Extend the CSV Tables widget to provide custom widgets in the tables.
* Extend the CSV tables widget to provide in table sort functionality by clicking on the headers.
* Extend CSV tables widget to allow a multi-level sort functionality by Shift click on different headers.  Show shift click instruction on hover or some other multi-level sort function





# Referenced Repositories

* [(Computer Aided Call Response System](https://bitbucket.org/joexdobs/computer-aided-call-response-engine) Provides a advanced YAML like syntax for specifying elements of data in a easily human edited format.   I felt this approach was better than trying to use a native JSON with everything in one huge file because I wanted the ability to load fragments of widgets or widget sets for re-use.  It also uses a version of the same Dynamic HTML generation features used in DForms which is the basis for the widget generator.
* [https://github.com/joeatbayes/CSVTablesInBrowser](https://github.com/joeatbayes/CSVTablesInBrowser)