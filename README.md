 C# CPGC_map :earth_americas:
An interactive map of previous CPGC funded internships  
Currently hosted here: http://ds-web.haverford.edu/cpgc/map.html#

---
## CSV to JSON Converter

The file `converter.py` has code to convert a csv file to a json file that the .js can read to make the map. It is assumed that this csv file is downloaded from the google sheet that contains all CPGC locations.  The script can be run from the command line as follows:
```
$ python convert.py -i <path_to_inputfile> -o <path_to_outputfile> -f <dump/pretty> '
```      
If no *-f* parameter is given then *dump* will be chosen. Dump should always be used for this project unless one is debugging something in the json structure.   
The code for this script was largely taken from [here](http://www.idiotinside.com/2015/09/18/csv-json-pretty-print-python/) and was modified to accommodate the GeoJSON structure.

##### GeoJSON Structure
Since this map is generated with [Mapbox](https://www.mapbox.com/mapbox-gl-js/api) (similar to this [example](https://www.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/)) it requires that the data be stored as a GeoJSON. **GeoJSON** is a format for encoding a variety of geographic data structures.  
Consider the following example:

| name | Latitude | Longitude |
|------|----------|-----------|
|Dinagat Islands| 125.6| 10.1 |

Would become the following GeoJSON *Feature* object.
```
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [125.6, 10.1]
  },
  "properties": {
    "name": "Dinagat Islands"
  }
}
```
###### <right> ([source](http://geojson.org/)) </right>
Moreover, the scripts in this repo assume every location will have the geometry type of *Point*.  
Each location becomes a *Feature* object and all of these objects are stored in a list that creates a *FeatureCollection* in this fashion:  

```
{
  "type": "FeatureCollection",
  "features":[
  ... ,
  ... ,
  ... ]
}
```

This *FeatureCollection* is stored in the specified json as follows
```
data = '[FeatureCollection]';
```
So, in a sense, the geoJSON is being stored as a json object and saved to a json file ( note not a geojson file !)  


##### Note on CSV structure
Since the map relies on a GeoJSON structure, there are two main assumptions of the csv that is being read by the .py file - there exists two columns "Latitude" and "Longitude". **Without these features in the csv the script will throw an error.**
Additionally, there are features that are used in the .js function such as "Organization_Information_Website" that should remain the same in the csv for the .js code to be able to function. It is recommended that one review the .js before making changes to the csv field names to thoroughly check this dependency.  

##### Connecting to the Javascript
Ultimately the .js file is what is reading the GeoJSON to populate the map. However, the GeoJSON file does not have to be saved as a consistent file name ( currently data.json ) , but it is highly recommend that it remains consistent.  
In the html header the json file is loaded with `<script type="text/javascript" src="data.json"></script>`. **It is critical that this is stated before the .js link.**

Since , within the json file, the geoJSON is always stored in the variable *data*, it can be loaded in the .js file with the line: `var mydata = JSON.parse(data);` ( note the omission of the '.json' because this is not data.json but rather the variable *data* that is declared within it. )


## Updating the map with [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts)

I followed this [python tutorial](https://www.twilio.com/blog/2017/02/an-easy-way-to-read-and-write-to-a-google-spreadsheet-in-python.html) and created the script `spreadsheet.py` which pulls from the google spread sheet owned by the CPGC. In the spreadsheet, the first sheet should contain the data to populate the map and its important that the name of the google sheet remains 'CESR Partner Map'. Essentially with the use of Google APIs, I have created credentials ( looks like an email ) and then gave that email/credential r/w rights on the spreadsheet just as you would give any user access. The one caveat is that since I ( Maddy Hodges ) have created the credential, once I graduate :sob: ,  my Haverford account will be deactivated and this credential will be deleted.  

Currently the script `convert.py` can take 'sheet' as the input file and then pull from the google sheet instead of a local csv. The command is as follows:

```
$ python convert.py -i 'sheet' -o <path_to_outputfile> -f <dump/pretty> '
```



## Contributors :tada:
:octocat: [Maddy Hodges](https://github.com/Mfhodges)
