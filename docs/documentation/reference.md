# Links & Reference

## Referenced Repositories

* [Computer Aided Call Response System](https://bitbucket.org/joexdobs/computer-aided-call-response-engine) Provides a advanced YAML like syntax for specifying elements of data in a easily human edited format.   I felt this approach was better than trying to use a native JSON with everything in one huge file because I wanted the ability to load fragments of widgets or widget sets for re-use.  It also uses a version of the same Dynamic HTML generation features used in DForms which is the basis for the widget generator.
* [https://github.com/joeatbayes/CSVTablesInBrowser](https://github.com/joeatbayes/CSVTablesInBrowser)  - Easily display data from CSV tables in HTML tables with nice formatting that can be overridden by Cell.  Includes repeated headers, etc.  
* [Meta Data Server](https://bitbucket.org/joexdobs/meta-data-server/src/master/)  High performance HTTP server with built in highly scalable saving and retrieval of data using HTTP GET & POST.  Designed to support super high performance enrichment of data after a traditional search engine has delivered core data results.  [Go Modules on bitbucket](https://medium.com/rungo/anatomy-of-modules-in-go-c8274d215c16)  [goutil](https://github.com/joeatbayes/goutil) Common functions packaged for reuse in my various GO projects.   [GoPackaging](https://github.com/joeatbayes/GoPackaging) Example I produced showing how to download GO packages direct from Github.   [httptest](https://github.com/joeatbayes/http-stress-test) a http test utility for a command line packaged for direct build using the go get command.



## FHIR

* [FHIR  Resource Index](https://www.hl7.org/fhir/resourcelist.html) -  A good starting point when trying to map a private domain model into FHI
* [Insurance Plan](https://www.hl7.org/fhir/insuranceplan.html) - Details of an insurance plan.  Includes Network.  Product Admin, Etc.  
* [Plan Administrator](https://www.hl7.org/fhir/insuranceplan-definitions.html#InsurancePlan.administeredBy)  See Also  [Organization](https://www.hl7.org/fhir/organization.html) since an administrator is a form of an organization
* [Organization](https://www.hl7.org/fhir/organization.html)  Organization is base for any company or legal unit involved in care, billing, administration.  It is used to define the organization once and reference it from other entities based on the type.  Eg:  An [Insurance Plan](https://www.hl7.org/fhir/insuranceplan.html)  includes a [Plan Administrator](https://www.hl7.org/fhir/insuranceplan-definitions.html#InsurancePlan.administeredBy)  which is a link to an organization.  Note: Organization can refer to each other in a arbitrarily deep fashion to describe any type of company hierarchy.



## Technical

* ### **YAML**

  * [Yaml syntax](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)
  * [online YAML validator](https://codebeautify.org/yaml-validator)
  * [online YAML to JSON converter](https://codebeautify.org/yaml-to-json-xml-csv)
  * [online YAML lint](http://www.yamllint.com/)

* ### **Javascript**

  * [dynamically adding a css file](http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml)
  * [dynamically removing and read javascript file](http://www.javascriptkit.com/javatutors/loadjavascriptcss2.shtml)

* ### **CSS**

  * [Use Media Queries to change browser behavior on small devices](https://www.smashingmagazine.com/2010/07/how-to-use-css3-media-queries-to-create-a-mobile-version-of-your-website/)
  * [tool to show page in different viewports](https://app.protofluid.com/#https://joeatbayes.github.io/metadata-forms-gui/)
  * [stylizing checkboxes](https://cssnewbie.com/stylize-checkboxes-and-text-fields-using-css/#.XfcRdmTYq0o)
  * 

* ### **GO**

  * 



* [CDT Codes with Descriptions](https://ca.healthnetadvantage.com/content/dam/centene/healthnet/pdfs/medicare/2019/CA/2019-CA-HNTCD-MA-MAPD-DSNP.pdf)  Used to source some example data
* [Fake Name Generator with fake attributes like address, Id, Etc](https://www.fakenamegenerator.com/thanks.php)
* 