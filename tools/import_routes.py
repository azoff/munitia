import getopt
import glob
import os
import pymongo
import sys

def import_routes(filename, mongo_host, mongo_pw):
    """Imports transit routes from filename into MongoDB."""
    connection = pymongo.Connection('mongodb://root:%s@%s:27017'%(mongo_pw, mongo_host))
    db = connection.munitia
    print db
    print db.stops
    f = file(filename, 'r')
    count = 0
    for line in f.readlines():
        if line.startswith('#'):
            continue
        if line.startswith('route_id'):
            continue
        count += 1
        print 'line=%s='%line.strip()
        splitted = line.strip().split(',')
        if len(splitted) == 9:
            #==> routes.txt <==
            #route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_url,route_color,route_text_color
            #5998,SFMTA,1,CALIFORNIA, ,3, , ,

            (route_id, agency_id, route_short_name, route_long_name, route_desc, route_type, route_url, route_color, route_text_color) = splitted
            print 'Inserting %s %s %s'%(route_id, route_short_name, route_long_name)
            #print db.stops.find_one({"stop_id" : 98})
            print db.routes.insert({"route_id" : route_id, "route_short_name" : route_short_name, "route_long_name": route_long_name})
        elif len(splitted) != 0:
            print 'Badly formatted line, expected 7 fields: %s'%line
    print 'inserted %d routes'%count

def usage():
    print 'import_routes.py -f file-to-import.txt -p mongopw'

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

    import_routes(filename, mongo_host, mongo_pw)

if __name__ == '__main__':
    main()



