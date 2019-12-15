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
*/
function mformsParseMeta(aStr, parms) {
    var outObj = null; // leave as null until we know what kind of object we are parsing
    var state = pStates.begin;
    var spaceStack = [];
    var objStack = [];
    var keyStack = [];
    var tarr = aStr.split("\n");
    var lastObj = null;
    var lastKey = "";
    var currObj = null;
    var currSpaceCnt = 0;
    var currKey = null;

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

        // If encountering Dedent then must pop off the stack.
        // to work back up the containment stack.
        while ((currSpaceCnt >= 0) && (leadSpace <= currSpaceCnt)) {
            if (objStack.length == 0) {
                currSpaceCnt = 0;
                break;
            }
            //console.log("L168: leadSpace=", leadSpace, " currSpaceCnt=", currSpaceCnt, "currKey=", currKey, "currObj=", currObj);
            currObj = objStack.pop();
            currKey = keyStack.pop();
            currSpaceCnt = spaceStack.pop();
        }
        //console.log("L174: leadSpace=", leadSpace, " currSpaceCnt=", currSpaceCnt, "currKey=", currKey, "currObj=", currObj);

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
            }
            //console.log("L95: lastObj=", lastObj, "lastKey=", lastKey, "tmpObj=", tmpObj);

            if (lastObj != null) {
                if (Array.isArray(lastObj)) {
                    if (lastKey != null) {
                        // when adding a named object to an array must
                        // nest it to retain the name
                        xx = {}
                        xx[lastKey] = tmpObj;
                        lastObj.push(xx);
                    } else {
                        lastObj.push(tmpObj);
                    }
                } else {
                    lastObj[lastKey] = tmpObj;
                }
            }
            //console.log("L103: lastObj=", lastObj, "lastKey=", lastKey, "tmpObj=", tmpObj);
            currObj = tmpObj;
        }



        if (lastChar == ":") {
            objStack.push(currObj);
            keyStack.push(varName);
            spaceStack.push(leadSpace);
            lastObj = currObj;
            lastKey = varName;
            currObj = null;
            currKey = null;
            currSpaceCnt = leadSpace;
            state = pStates.start_new_def;
            //console.log("L119: lastObj=", lastObj, "lastKey=", lastKey, "objStack=", objStack, "keystack=", keyStack, " spaceStack=", spaceStack);
            continue;
        }

        // Save values at current level
        if (Array.isArray(currObj)) {
            currObj.push(dataVal);
        } else {
            currObj[varName] = dataVal;
        }
        // }


        // State:  Seeking Children
        // seeking first child
        //  Adding simple string as array element
        //  Adding Removing string to right of # when outside of quoted string
        //  Parsing JSON
        //  Parsing Quoted String
        //  Parsing a Space consolidate String
        //  Parsing a Space retained string.

        //console.log(" tout=", JSON.stringify(outObj, null, 2));
    } // for lines

    return outObj;
} // func


// more node.js to allow local testing but doesn't hurt anything when 
// ran in browser
module.exports = {
    'mformsParseMeta': mformsParseMeta
};