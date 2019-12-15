function mformInterpolate(aStr, parms) {
    // TODO: Copy Interpolate functionality from GOUtil.
}

function isAlphaNumeric(str) {
    var code, i, len, dotCnt;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if ((code != 46) && (code != 45) && ((code < 48) || (code > 58))) {
            return false;
        }
        if (code == 46) {
            dotCnt += 1;
            if (dotCnt > 1) {
                return false;
            }
        }
    }
    // Add check for multiple "." or "-" anywhere except front of string
    var dashPos = str.indexOf("-");
    if (dashPos > 0) {
        return false;
    }
    return true;
}

// REturns true if string contain only contains
// numbers and a "-"
function isStrInt(str) {
    tres = isAlphaNumeric(str);
    if (tres == false) {
        return false;
    } else {
        dotPos = str.indexOf(".");
        if (dotPos > -1) {
            return false;
        }
    }
    // Add check for DOT and reject.
    return true;
}



function countLeadingSpace(astr) {
    return myString.length - myString.trimLeft().length;
}

var pStates = {
    'begin': 0,
    'start_new_def': 1,
    'in_quote': 2,
    'in_json': 3,
    'norm': 4
};

// Convert values to more native types.  EG:
// "true" becomes native true,  "123" becomes
// the integer 123.   "9282.23" becomes the
// float 9282.23
function parseCoerceDataValues(dataVal) {
    if (dataVal == null) {
        return null;
    }
    //console.log("L65: dataVal=" + dataVal);
    trimDataVal = dataVal.trim(dataVal);
    if ((trimDataVal[0] == "{") || (trimDataVal[0] == "[")) {
        // Handle Single line JSON as data value
        return JSON.parse(trimDataVal);
    }

    var lcDataVal = dataVal.toLowerCase();
    if ((lcDataVal == "yes") || (lcDataVal == "true")) {
        return true;
    }

    if (lcDataVal == "no" || (lcDataVal == "false")) {
        return false;
    }

    if (isStrInt(dataVal)) {
        var parsed = parseInt(dataVal);
        if (isNaN(parsed) == false) {
            return parsed;
        }
    }

    if (isAlphaNumeric(dataVal)) {
        var parsed = parseFloat(dataVal);
        if (isNaN(parsed) == false) {
            return parsed;
        }
    }

    // TODO: Add Date Parser 
    // TODO: Add DateTime Parser

    return dataVal;
}

/* Parse a YAML like script returning a nested object 
  expand any interpolated values found from parms.
..Note this parser does not attempt to provide full
..full Yaml capabilities but it's data set would 
..likely suceed to be parsed by a YAML parser.

  Design Note:  Internally manipulate stack for descent unwiding 
    to avoid overhead of recursive javascript calls.
*/
function mformsParseMeta(aStr, parms) {
    var outObj = null; // leave as null until we know what kind of object we are parsing
    var state = pStates.begin;
    var objStack = [];
    var tarr = aStr.split("\n");
    var lastObj = null;
    var lastKey = "";
    var currObj = null;
    var currSpaceCnt = 0;
    var currKey = null;
    var stackObj = {};

    for (var i = 0; i < tarr.length; i++) {
        var tline = tarr[i].trimRight();
        if (tline.length < 1) {
            continue;
        }
        var tleft = tline.trimLeft();
        if (tleft.length < 1) {
            continue; // empty line detected
        }
        if (tleft[0] == "#") {
            continue; // comment line detected
        }

        var leadSpace = tline.length - tleft.length;
        var firstChar = tleft[0];
        var lastChar = tleft[tleft.length - 1];
        var varName = null;
        var dataVal = null;
        var firstColon = tleft.indexOf(":");
        if (lastChar == ':') {
            varName = tleft.slice(0, -1);
        } else if (firstColon != -1) {
            varName = tleft.slice(0, firstColon).trim();
            dataVal = tleft.slice(firstColon + 1).trim();
        } else {
            if (tleft[0] == '-') {
                dataVal = tleft.slice(1).trim();
            } else {
                dataVal = tleft.trim();
            }
        }
        if ((varName != null) && (varName[0] == "-")) {
            varName = varName.slice(1).trim();
        }
        dataVal = parseCoerceDataValues(dataVal);
        //console.log("L149: tline=", tline, "leadSpace=", leadSpace, 'firstChar=', firstChar, 'lastChar=', lastChar, "varName=", varName, "dataVal=", dataVal);

        // unwind the stack until we find a object
        // at equal level of indent.
        while (leadSpace <= currSpaceCnt) {
            if ((objStack.length == 0) || (currSpaceCnt <= 0)) {
                currSpaceCnt = 0;
                currObj = outObj;
                currKey = varName;
                break;
            } else {
                //console.log("L158: dedent prePop leadSpace=", leadSpace, " currSpaceCnt=", currSpaceCnt, "currKey=", currKey, "currObj=", JSON.stringify(currObj), "objStack=", JSON.stringify(objStack));
                stackObj = objStack.pop();
                currObj = stackObj.obj;
                currKey = stackObj.key;
                currSpaceCnt = stackObj.indent;
                //console.log("L165: dedent popped stackObj=", JSON.stringify(stackObj));
            }
        }
        //console.log("L174: leadSpace=", leadSpace, " currSpaceCnt=", currSpaceCnt, "currKey=", currKey, "currObj=", JSON.stringify(currObj), "objStack=", JSON.stringify(objStack));

        // If currObj is null it is because we do not yet know the type of the 
        // current object because it is either as the first of the file
        // the last item encountered was a object defenition.
        // At this point we are essentially looking at the next line 
        // and can properly assign it based on whether it is declared
        // as an array. 
        if (currObj == null) {
            var tmpObj = {};
            if (firstChar == "-") {
                tmpObj = [];
            }
            // Set the main output object if it has not already been         
            if (outObj == null) {
                outObj = tmpObj;
                stackObj = {
                    'obj': outObj,
                    'key': currKey,
                    "indent": currSpaceCnt
                };
                //--NNobjStack.push(stackObj);
                //--NNconsole.log("L185: indent set mainObj objStack=", JSON.stringify(objStack));
            }
            //console.log("L95: lastObj=", lastObj, "lastKey=", lastKey, "tmpObj=", tmpObj);

            currObj = tmpObj;
            // Add Current Object to Last Object
            if (lastObj != null) {
                // Add current content to the existing object 
                // either as an array element or as a hash element
                if (Array.isArray(lastObj)) {
                    if (lastKey != null) {
                        // when adding a named object to an array must
                        // nest it to retain the name
                        xx = {}
                        xx[lastKey] = tmpObj;
                        lastObj.push(xx);
                        //tmpObj = xx;
                    } else {
                        // Adding an array element to an existing object
                        lastObj.push(tmpObj);
                    }
                } else {
                    // Adding named element to current object hash
                    lastObj[lastKey] = tmpObj;
                }
            }
            //console.log("L103: currObj=", JSON.stringify(currObj) + " lastObj=", JSON.stringify(lastObj), " lastKey=", lastKey);
        }



        if (lastChar == ":") {
            // Starting a new defenition so 
            // need to setup conditions so the next line
            // when we find out what kind of object we are 
            // defining we can detect the need.
            stackObj = {
                'obj': currObj,
                'key': varName,
                "indent": currSpaceCnt
            };
            objStack.push(stackObj);
            //console.log("L221: indent needed stackObj=", JSON.stringify(stackObj), " objStack=", JSON.stringify(objStack));
            lastObj = currObj;
            lastKey = varName;
            // Setup next object for the index.
            currObj = null;
            currKey = null;
            currSpaceCnt = leadSpace;
            state = pStates.start_new_def;
            //console.log("L119: lastObj=", JSON.stringify(lastObj), "lastKey=", lastKey, "stackObj=", JSON.stringify(stackObj));
            continue;
        }

        // Save values at current level
        if (Array.isArray(currObj)) {
            currObj.push(dataVal);
        } else {
            currObj[varName] = dataVal;
        }
        // }

        // TODO: Add Variable Subsitution from previously parsed values or passed in context.
        //     Note Interpolation is a function already avaialble in cacre
        //  TODO: Add support for escaping in quoted values.
        //  TODO: Adding Removing string to right of # when outside of quoted string
        //  TODO: Parsing JSON as data value when string starts with "[" or "{"
        //  TODO: Parsing Quoted String
        //  Parsing a Space consolidate multi-line String
        //  Parsing a Space retained multi-line string.
        // TODO: Add support for flow sytle format which is not exactly JSON
        // TODO: Handle multi-line constants that contain JSON.  Current version only
        //   processes JSON if it is single line. 

        //console.log(" tout=", JSON.stringify(outObj, null, 2));
    } // for lines

    return outObj;
} // func

if (typeof module != "undefined") {
    // more node.js to allow local testing but doesn't hurt anything when 
    // ran in browser
    module.exports = {
        'mformsParseMeta': mformsParseMeta
    };
}