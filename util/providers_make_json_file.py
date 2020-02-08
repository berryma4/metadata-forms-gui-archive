# Utility to convert healthcare provider data downloaded
# from medicare.gov into JSON records stored one provider 
# per line prefixed by their unique ID 
# To make multi-threaded tests easy.


import json
import time
from httputil import *

def parseBool(avar):
  if avar == "Y":
    return True
  elif avar == "N":
    return False
  else:
    return None

def loadZips(fiName):
  FPZip = 0
  FPLat = 5
  FPLon = 6
  tout = {}
  fi = open(fiName)
  head = fi.readline()
  buffer = []
  totRecAdd = 0
  while True:
    aline = fi.readline().strip()
    if aline <= "":
      break
    try:
      fvals = aline.split("\t")
      zipcode = "%05d" % int(fvals[FPZip])
      lat = float(fvals[FPLat])
      lon = float(fvals[FPLon])
      tout[zipcode] = { "lat" : lat, "lon" : lon }
    except ValueError:
      pass # Some military zipcodes are known to fail
  return tout


outFi = open("physicians.json.lines.txt", "w")  

zipcodes = loadZips("../data/import/zipcodes-geo.tsv")
start = time.time()    
f = open("../data/import/physicians.tsv")
errFi = open("../data/import/physicians.err.txt", "w")
firstLine = f.readline().strip()
fldNames = firstLine.split("\t")
print "fldNames=", fldNames
useNames = []
fldPos = {}
fldNdx = 0
for aname in fldNames:
  tname = aname.strip().replace("(","_").replace(")","").replace("__","_")
  useNames.append(tname)
  fldPos[tname] = fldNdx
  print "ndx=", fldNdx, tname
  fldNdx = fldNdx + 1
  
numFldHead = len(useNames)
print("colNames=", useNames)

pNPI = fldPos["NPI"]
pPacId = fldPos["PAC ID"]
pProvEnrollId = fldPos["Professional Enrollment ID"]
pNameLast = fldPos["Last Name"]
pNameFirst = fldPos["First Name"]
pNameMiddle = fldPos["Middle Name"]
pNameSuffix = fldPos["Suffix"]
pGender = fldPos["Gender"]
pCredential = fldPos["Credential"]
pMedSchool = fldPos["Medical school name"]
pGradYear = fldPos["Graduation year"]
pSpec1 = fldPos["Primary specialty"]
pSpec2 = fldPos["Secondary specialty 1"]
pSpec3 = fldPos["Secondary specialty 2"]
pSpec4 = fldPos["Secondary specialty 3"]
pSpec5 = fldPos["Secondary specialty 4"]
pSpec6 = fldPos["All secondary specialties"]
pOrgName = fldPos["Organization legal name"]
pPracticPacId = fldPos["Group Practice PAC ID"]
pNumPracticeMemb = fldPos["Number of Group Practice members"]
pAddrStreet = fldPos["Line 1 Street Address"]
pAddrStreet2 = fldPos["Line 2 Street Address"]
pAddrStreet2Supress = fldPos["Marker of address line 2 suppression"]
pAddrCity = fldPos["City"]
pAddrState = fldPos["State"]
pAddrZip = fldPos["Zip Code"]
pPhone = fldPos["Phone Number"]
pccn1 = fldPos["Hospital affiliation CCN 1"]
plbn1 = fldPos["Hospital affiliation LBN 1"]
pccn2 = fldPos["Hospital affiliation CCN 2"]
plbn2 = fldPos["Hospital affiliation LBN 2"]
pccn3 = fldPos["Hospital affiliation CCN 3"]
plbn3 = fldPos["Hospital affiliation LBN 3"]
pccn4 = fldPos["Hospital affiliation CCN 4"]
plbn4 = fldPos["Hospital affiliation LBN 4"]
pccn5 = fldPos["Hospital affiliation CCN 5"]
plbn5 = fldPos["Hospital affiliation LBN 5"]
pAcceptMedicare = fldPos["Professional accepts Medicare Assignment"]
pReportsQuality = fldPos["Reported Quality Measures"]
pEHR = fldPos["Used electronic health records"]
pHeartHealth = fldPos["Committed to heart health through the Million Hearts initiative"]


errCnt = 0
outNames = []
recNum = -1
buffer = []
totRecAdd = 0
while True:
  recNum = recNum + 1
  aline = f.readline().strip()
  if aline <= "":
    break
  try:
    fvals = aline.split("\t")    
    numFld = min(len(fvals), numFldHead)
    trec = {}
    if fvals[4] > " ":
      trec["medicadeId"] = fvals[pPracticPacId]
    
    zipcode = fvals[pAddrZip]
    zip5 = zipcode[0:5]
    trec["email"] = "NA"
    trec["fax"] = "NA"
    if zip5 in zipcodes:
      trec["loc"] = zipcodes[zip5]

    trec["gender"] = fvals[pGender]
    trec["languages"] = "NA"    
    trec["OfficeHours"] = "NA"
    trec["patientAgeRange"] = "NA"
    trec["primaryLocation"] = "NA"
    trec["credentials"] = fvals[pCredential]
    trec["medSchool"] = fvals[pMedSchool]
    trec["gradYear"] = fvals[pGradYear]
    
    trec["specialty"] = [ fvals[pSpec1]]
    if fvals[pSpec2] > " ":
      trec["specialty"].append(fvals[pSpec2])
    if fvals[pSpec3] > " ":
      trec["specialty"].append(fvals[pSpec3])
    if fvals[pSpec4] > " ":
      trec["specialty"].append(fvals[pSpec4])
    if fvals[pSpec5] > " ":
      trec["specialty"].append(fvals[pSpec5])

    cda = {}    
    trec["addr"] = cda
    cda["county"] = "NA"
    cda["street"] = fvals[pAddrStreet]
    if fvals[pAddrStreet2] > " ":
      cda["street2"] = fvals[pAddrStreet2]
    cda["city"] = fvals[pAddrCity]
    cda["state"] = fvals[pAddrState]
    cda["zip"] = zipcode
    cda["zipPlus4"] = "NA"
    trec["phone"] = fvals[pPhone]

    stn = {}                   
    trec["drName"] = stn
    stn["last"] = fvals[pNameLast].strip()
    stn["middle"] = fvals[pNameMiddle].strip()
    stn["first"] = fvals[pNameFirst].strip()
    stn["suffix"] = fvals[pNameSuffix].strip()
    trec["orgName"] = fvals[pOrgName].strip()
    trec["combName"] = stn["last"] + ", " + stn["first"] + " " + stn["middle"]
    trec["combName"] = trec["combName"].replace("  ", " ").strip()
    if trec["orgName"] < " ":
      trec["orgName"] = trec["combName"]

    trec["exclude"] = False
    trec["npi"] = fvals[pNPI]

    treats = {}
    treats["disabledChildren"] = "NA"
    treats["disabledAdults"] = "NA"        
    trec["publicTransitAccess"] = "NA"
    trec["handicapAccess"] = "NA"      
    trec["product"] = "NA"
    trec["acceptMedicaid"] = parseBool(pAcceptMedicare)      
    trec["uniqueLocKey"] = trec["orgName"] + ".." + trec["addr"]["street"] + ".." + trec["addr"]["zip"]

    tlocs =  []
    trec["locations"] = tlocs
    if fvals[pccn1] > " ":
      tlocs.append( { "ccn" : fvals[pccn1], "lbn" : fvals[plbn1] });
    if fvals[pccn2] > " ":
      tlocs.append( { "ccn" : fvals[pccn2], "lbn" : fvals[plbn2] });
    if fvals[pccn3] > " ":
      tlocs.append( { "ccn" : fvals[pccn3], "lbn" : fvals[plbn3] });
    if fvals[pccn4] > " ":
      tlocs.append( { "ccn" : fvals[pccn4], "lbn" : fvals[plbn4] });
    if fvals[pccn5] > " ":
      tlocs.append( { "ccn" : fvals[pccn5], "lbn" : fvals[plbn5] });

    aStr = json.dumps(trec)
    #print recNum, " asJSON=", aStr

    outFi.write(trec["npi"] + "=" + aStr + "\n")
    totRecAdd += 1
          

          
  except ValueError:
    errCnt += 1
    errFi.write("errCnt=" + str(errCnt) + " parse error aLine=" +  aline + "\tfvals=" + str(fvals) + "\n")
  
errFi.close()
curr = time.time()
elap = curr - start
print "totTime=", elap,  "totRecAdd=", totRecAdd, " recsPerSec=", totRecAdd / elap, " errCnt=", str(errCnt)
 
      
    
   

