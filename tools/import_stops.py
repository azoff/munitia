import getopt
import glob
import os
import pymongo
import sys

def import_stops(filename):
    """Imports transit stops from filename into MongoDB."""
    connection = pymongo.Connection('mongodb://root:PFdca3bsiNMI0rWMN8Xq@05032e89.dotcloud.com:7509')
    db = connection.munitia
    print db
    print db.stops
    f = file(filename, 'r')
    count = 0
    for line in f.readlines():
        if line.startswith('#'):
            continue
        if line.startswith('stop_id'):
            continue
        count += 1
        print 'line=%s='%line.strip()
        splitted = line.strip().split(',')
        if len(splitted) == 7:
            # stop_id,stop_name,stop_desc,stop_lat,stop_lon,zone_id,stop_url
            # 98,2ND ST & MARKET ST, ,37.789255,-122.401225, , 

            (stop_id, name, unused, lat, long, unused2, unused3) = splitted
            print 'Inserting %s %s %s %s'%(stop_id, name, long, lat)
            #print db.stops.find_one({"stop_id" : 98})
            print db.stops.insert({"stop_id" : stop_id, "name" : name, "loc" : [float(long), float(lat)]})
        elif len(splitted) != 0:
            print 'Badly formatted line, expected 7 fields: %s'%line
    print 'inserted %d stops'%count

def usage():
    print 'import_stops.py -f file-to-import.txt'

def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "f:", ["filename="])
    except getopt.GetoptError, err:
        # print help info and exit
        print str(err)
        usage()
        sys.exit(2)

    filename = None
    for o, a in opts:
        if o in ("-f", "--filename"):
            filename = a

    if filename == None:
        usage()
        sys.exit(3)

    import_stops(filename)

if __name__ == '__main__':
    main()


