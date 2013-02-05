import getopt
import glob
import os
import pymongo
import sys

def import_stops(filename, mongo_host, mongo_pw):
    """Imports transit stops from filename into MongoDB."""
    connection = pymongo.Connection('mongodb://root:%s@%s:27017'%(mongo_pw, mongo_host))
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
    db.stops.ensureIndex({loc:"2d"})
    db.questions.ensureIndex({loc:"2d"})
    print 'inserted %d stops'%count

def usage():
    print 'import_stops.py -f file-to-import.txt'

def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "f:p:h:", ["filename="])
    except getopt.GetoptError, err:
        # print help info and exit
        print str(err)
        usage()
        sys.exit(2)

    filename = None
    mongo_pw = ''
    mongo_host = 'localhost'
    for o, a in opts:
        if o in ("-f", "--filename"):
            filename = a
        if o in ("-p"):
            mongo_pw = a
        if o in ("-h"):
            mongo_host = a

    if filename == None:
        usage()
        sys.exit(3)

    import_stops(filename, mongo_host, mongo_pw)

if __name__ == '__main__':
    main()



