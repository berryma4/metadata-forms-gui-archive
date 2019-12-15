# 
# Meta data driven forms GUI for REST services
***Status: Pre-Alpha-Dev** - Please do not use as basic for your project until it reaches Alpha state.*    

Building forms based GUI to CRUD operations.  Provide a Meta data based system to deliver highly Git Demo functional user interfaces for editing, viewing and updating data in REST based services.   Can dramatically reduce the Labor required to build and maintain custom GUI while retaining sufficient flexibility to deliver a pleasant and efficient user experience.  
[simple demo on github pages]( https://joeatbayes.github.io/metadata-forms-gui/)

Please file a Issue to request enhancements.  You can also reach me on Linked-in [Contact](https://www.linkedin.com/in/joe-ellsworth-68222/)   main Git Repo URI:   [metadata-forms-gui](https://github.com/joeatbayes/metadata-forms-gui) 


# Sample Screen

# Sample Script

# Sample Data

# Getting Started

#Build and install

## Basic HTTP REST server

### Why do we need a custom server:

We do not really need a custom server but we do need a HTTP listener to demonstrate features of the system because the system uses AJAX calls to fetch data needed to render the forms.  It also uses AJAX calls to fetch data from the underlying system and save data back to the server.  The build in HTTP server provides this function with some mapped virtual directories.  It could easily be replaced with any HTTP server such as Apache,  HAProxy,  Tomcat etc provided the same directories are mapped to the underlying forms data.

One feature this server provides is a custom handler which if passed a directory will walk that directory assemble all the data elements defined to build a set of screens and passes back the fully assembled text as a single service call.  This reduces the back and forth AJAX calls and can improve overall response time. 

#### Why do we need the MDS server:

We do not really need the MDS server but we do need REST server that can save data with HTTP PUT and fetch data with HTTP GET and HTTP POST operations.     In normal operation a set of custom REST services would be provided that could deliver this functionality.  For example rather than storing data in the MDS server you may use a Azure FHIR storage service.

# Basic Design Elements to Work Through

* Ability to parse delimited files with headers

* Ability to parse JSON files 

* Ability to load a form entirely from demo page by naming form and data source on URI like what we do in CSV tables.

  

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





# Referenced Repositories

* [(Computer Aided Call Response System](https://bitbucket.org/joexdobs/computer-aided-call-response-engine) Provides a advanced YAML like syntax for specifying elements of data in a easily human edited format.   I felt this approach was better than trying to use a native JSON with everything in one huge file because I wanted the ability to load fragments of widgets or widget sets for re-use.  It also uses a version of the same Dynamic HTML generation features used in DForms which is the basis for the widget generator.
* [https://github.com/joeatbayes/CSVTablesInBrowser](https://github.com/joeatbayes/CSVTablesInBrowser)  - Easily display data from CSV tables in HTML tables with nice formatting that can be overridden by Cell.  Includes repeated headers, etc.  
* [Meta Data Server](https://bitbucket.org/joexdobs/meta-data-server/src/master/)  High performance HTTP server with built in highly scalable saving and retrieval of data using HTTP GET & POST.  Designed to support super high performance enrichment of data after a traditional search engine has delivered core data results.  [Go Modules on bitbucket](https://medium.com/rungo/anatomy-of-modules-in-go-c8274d215c16)  [goutil](https://github.com/joeatbayes/goutil) Common functions packaged for reuse in my various GO projects.   [GoPackaging](https://github.com/joeatbayes/GoPackaging) Example I produced showing how to download GO packages direct from Github.   [httptest](https://github.com/joeatbayes/http-stress-test) a http test utility for a command line packaged for direct build using the go get command.





# Links & Reference



## FHIR

* [FHIR  Resource Index](https://www.hl7.org/fhir/resourcelist.html) -  A good starting point when trying to map a private domain model into FHI
* [Insurance Plan](https://www.hl7.org/fhir/insuranceplan.html) - Details of an insurance plan.  Includes Network.  Product Admin, Etc.  
* [Plan Administrator](https://www.hl7.org/fhir/insuranceplan-definitions.html#InsurancePlan.administeredBy)  See Also  [Organization](https://www.hl7.org/fhir/organization.html) since an administrator is a form of an organization
* [Organization](https://www.hl7.org/fhir/organization.html)  Organization is base for any company or legal unit involved in care, billing, administration.  It is used to define the organization once and reference it from other entities based on the type.  Eg:  An [Insurance Plan](https://www.hl7.org/fhir/insuranceplan.html)  includes a [Plan Administrator](https://www.hl7.org/fhir/insuranceplan-definitions.html#InsurancePlan.administeredBy)  which is a link to an organization.  Note: Organization can refer to each other in a arbitrarily deep fashion to describe any type of company hierarchy.



## Technical

* [Yaml syntax](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)
* 

