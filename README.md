# 
# Meta data driven forms GUI for REST services
###### ***Status: Pre-Alpha-Dev** - Please do not use as basic for your project until it reaches Alpha state.*    

Building forms based GUI to CRUD operations.  Provide a Meta data based system to deliver highly Git Demo functional user interfaces for editing, viewing and updating data in REST based services.   Can dramatically reduce the Labor required to build and maintain custom GUI while retaining sufficient flexibility to deliver a pleasant and efficient user experience.  

* **[simple demo]( https://joeatbayes.github.io/metadata-forms-gui/)** on github pages.  Only allow form display.   If you wish to demonstrate saving data via REST calls then a server capable of processing PUT and POST commands must be available.  See: [httpServer](httpServer)

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



# Files

## Directories 

* **[data](data)** - Contains most data used to drive the demonstration forms.  Also contains forms definition
* **data/forms** - Contains all the sample forms definition files 
* **data/forms/cert-of-need** - contains the sample form and widgets needed to display the certificate of need.
* **data/cert-of-need** - Contains sample data for different certificate of need to provide a live editing experience.  This data was download from a US government site.
* **data/widgets** - different pre-defined widgets that can be re-used across forms. 
* **http-server**
* **[docs](docs)** - root directory for the [github pages site] for this repository.  Some forms can be tested directly on this site.  Files are copied into this directory to prepare publishing a new version of the site by [update-gitpages.sh](update-gitpages.sh)
* **docs/documentation** - design notes,  usage documentation,  actions, roadmap, etc that I did not want to keep in the main directory.
* **http-docs**
* **http-docs/js**
* **http-docs/css**
* **http-docs/js**

## Main mForms Implementation

* [Main Javascript code](http-docs/js)
* [mforms_parse.js](http-docs/js/mforms_parse.js) - Main parser for YAML like syntax used to specify screens
* 



## HTTP Server

* [httpServer.exe](http-server/http-server.exe) A basic HTTP server to allow local testing of forms and data retrieval logic.   Implemented in  [http-server.go](httpSever/http-server.go)  It maps "/data" to the data directory at [../data](data/) and URI "/" is mapped that is expected to contain the main html and javascript is mapped to [../http-docs](http-docs).   All mapping is relative to current directory where executable is ran so it expects the executable to be ran from inside of "http-docs" All examples are written to expect these to be mapped.  This server can be replaced with an appropriate configured http server provided it supports the correct mapping for /data and /http-docs.  The exe extension is only present in windows.  For MAC and linux it is a executable file of same name without the extension.

## Test Files



* [mforms_parse_test.js](http-docs/js/mforms_parse_test.js) - Tests the YAML like parser with sample test test data in node.js run using node.js locally but is also used by the mforms_parse_test.html to test in browser.
* [mforms_parse_test.html](http-docs/js/mforms_parse_test.html) - May be loaded directly in chrome but most tests are ran in the browser via httpServer.



## Support Files

* [update-gitpages.sh](update-gitpages.sh) - Copies selected code and data to the /docs directory where it can be published to the [gitpages site](https://joeatbayes.github.io/metadata-forms-gui/) for this repository.  This is needed to supply a basically working GUI with working forms without requiring any installation or downloading.    Code ran on the [gitpages site](https://joeatbayes.github.io/metadata-forms-gui/) can not save the updated form data because [github pages](https://help.github.com/en/github/working-with-github-pages/about-github-pages) does not support PUT and POST operations.



# Referenced Repositories

* [(Computer Aided Call Response System](https://bitbucket.org/joexdobs/computer-aided-call-response-engine) Provides a advanced YAML like syntax for specifying elements of data in a easily human edited format.   I felt this approach was better than trying to use a native JSON with everything in one huge file because I wanted the ability to load fragments of widgets or widget sets for re-use.  It also uses a version of the same Dynamic HTML generation features used in DForms which is the basis for the widget generator.
* [https://github.com/joeatbayes/CSVTablesInBrowser](https://github.com/joeatbayes/CSVTablesInBrowser)  - Easily display data from CSV tables in HTML tables with nice formatting that can be overridden by Cell.  Includes repeated headers, etc.  
* [Meta Data Server](https://bitbucket.org/joexdobs/meta-data-server/src/master/)  High performance HTTP server with built in highly scalable saving and retrieval of data using HTTP GET & POST.  Designed to support super high performance enrichment of data after a traditional search engine has delivered core data results.  [Go Modules on bitbucket](https://medium.com/rungo/anatomy-of-modules-in-go-c8274d215c16)  [goutil](https://github.com/joeatbayes/goutil) Common functions packaged for reuse in my various GO projects.   [GoPackaging](https://github.com/joeatbayes/GoPackaging) Example I produced showing how to download GO packages direct from Github.   [httptest](https://github.com/joeatbayes/http-stress-test) a http test utility for a command line packaged for direct build using the go get command.





