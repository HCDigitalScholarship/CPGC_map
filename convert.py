#!/usr/bin/python
# coding=utf-8

import sys, getopt
import csv
import json
import spreadsheet


###
#
# need to edit to take out apostrophes
#
###


#Get Command Line Arguments
# use dump pretty if you want to debug the json being created .
def main(argv):
    input_file = ''
    output_file = ''
    format = ''
    try:
        opts, args = getopt.getopt(argv,"hi:o:f:",["ifile=","ofile=","format="])
    except getopt.GetoptError:
        print 'convert.py -i <path to inputfile or '+ '\'sheet\''+'> -o <path to outputfile> -f <dump/pretty> '
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print 'convert.py -i <path to inputfile or '+ '\'sheet\''+'> -o <path to outputfile> -f <dump/pretty>'
            sys.exit()
        elif opt in ("-i", "--ifile"):
            input_file = arg
        elif opt in ("-o", "--ofile"):
            output_file = arg
        elif opt in ("-f", "--format"):
            format = arg

    if input_file == 'sheet':
        read_sheet(output_file, format)
    else:
        read_csv(input_file, output_file, format)


"""
var places = {
"type": "FeatureCollection",
"features": [
{
"type": "Feature",
"geometry": {
  "type": "Point",
  "coordinates":  [ -75.171022,39.944101 ]
  },
"properties": {
    ...
    ...
}
...
... ]
}
"""


#Read CSV File
def read_csv(file, json_file, format):
    csv_rows = []
    with open(file) as csvfile:
        reader = csv.DictReader(csvfile)
        title = reader.fieldnames # should remove lat and long from this because they have no use as properties
        for row in reader:
            #print row
            lat = row["Latitude"]
            lon = row["Longitude"]
            if lat =="" or lon == "": # no coordinates ... dont add to map!
                continue
            else:
                #''.join(title[i].split()) is to ensure that no key has any spaces in it.
                csv_rows.extend([{"type": "Feature", "geometry": { "type": "Point", "coordinates": [ lon,lat ] },"properties":{''.join(title[i].split()):row[title[i]] for i in range(len(title))}}])
#        print csv_rows[0]

        write_json(csv_rows, json_file, format)

#Reading from googlesheet file
def read_sheet(json_file, format):
    #Get spreadsheet!
    input_data = spreadsheet.pullsheet()
    #print(input_data) # this variable is stored properly
    sheet_rows = []

    fieldnames = list(input_data[0].keys()) # should remove lat and long from this because they have no use as properties
#    print("fieldnames= ", fieldnames)  # this variable is stored properly
    for row in input_data:
        #print row
        lat = row["Latitude"]
        lon = row["Longitude"]
        if lat =="" or lon == "": # no coordinates... dont add to map!
            continue
        else:
            #''.join(fieldnames[i].split()) is to ensure that no key has any spaces in it.
            sheet_rows.extend([{"type": "Feature", "geometry": { "type": "Point", "coordinates": [ lon,lat ] },"properties":{''.join(fieldnames[i].split()):row[fieldnames[i]] for i in range(len(fieldnames))}}])

#    print "first Feature obj",sheet_rows[0]
#    print json.dumps(sheet_rows)
#    write_json(sheet_rows, json_file, format)
    #print(json.dumps(sheet_rows).replace("""'""","\'"))


    with open(json_file, "w") as f:
        f.write("data ='[{\"type\": \"FeatureCollection\",\"features\":")
        f.write(json.dumps(sheet_rows,encoding="utf-8",ensure_ascii=True).replace("'",'\u2019'))
        f.write("}]';")


#Convert data into json and write it  -- for some unknown reason this must be used as a function for googlesheet
def write_json(data, json_file, format):
#    print "in write_json"
    print data
    with open(json_file, "w") as f:
        f.write("data ='[{\"type\": \"FeatureCollection\",\"features\":")
        if format == "pretty":
            f.write(json.dumps(data, sort_keys=False, indent=4, separators=(',', ': '),encoding="utf-8",ensure_ascii=True).replace("'",'\u2019'))
        else:
           # f.write(data)
            f.write(json.dumps(data,encoding="utf-8",ensure_ascii=True).replace("'",'\u2019'))
        f.write("}]';")

if __name__ == "__main__":
   main(sys.argv[1:])
