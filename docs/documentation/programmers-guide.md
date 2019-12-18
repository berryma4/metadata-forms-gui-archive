## Metadata Form GUI - Programmer Guide



### 

* ## Define a Widget

* 

* ## Define a form using the Widget

* 

* ## Display the form

* 

* ## Modifying CSS to control form look & Feel

* 

* ## Example JSON Sample Data

* 

* ## Specifying Data Path in the Sample Data

* 

* ## Specifying  URI to Fetch Data for the form

* 

* ## Interpolating Data into URI

* ## Redisplaying data from domain objects that have been modified but not saved.

  * By default the system keeps each object in the system with a unique identifier.   If the same object is requested for rendering again then it is rendered from the locally cached object.   This means that it is possible to modify an object switch to editing another and when you switch back the locally modified object will be re-displayed including any edits.  The cached object will remain available in this fashion until the page is refreshed or the browser is restarted.   You can clear an object from cache and force a reload.   
  * One option in the form specification is to clear domain objects after saving to force reload just in case it has changed on the server.   To clear on save  set   clearAfterSave=true in the form level attributes.
  * 

* ## Modifying Content of Dropdown based on prior form selections  

  * Example:  When user selects state then change the set of available zipcodes based on the state selected.  This can be done from subsetting data supplied at the time the form was loaded or by calling a  web service and modifying the affected fields widgets.   Introduces the notion of dependent fields or fields that are affected by actions of other fields.   As a general concept we prefer including the field ID for fields that could affect the operating of the current field. 

  

## Using Custom CSS 

Changing label wrapping behavior

Forcing some fields to render on same line without wrapping

Hide right nav when dispalyed on portrait mode on a phone.

## Injecting forms into Existing Pages



## Parsing Delimited Data



## Rendering Tables 



## Define Master Detail Forms



## Using YML Anchors to reduce repetitive Definition



## Changing Label Size for a subset of fields

Useful for example when State follows city on the same line.

