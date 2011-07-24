import getopt
import glob
import os
import pymongo
import sys

def import_trips(filename):
    """Imports transit trips from filename into MongoDB."""
    connection = pymongo.Connection('mongodb://root:lcKkmyqBup1aZrTKSHYX@149f8b26.dotcloud.com:9072')
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
        if len(splitted) == 7:
            # ==> trips.txt <==
            # route_id,service_id,trip_id,trip_headsign,direction_id,block_id,shape_id
            # 5998,3,4117187,Geary & 33rd Ave,0,311094,66621

            (route_id, service_id, trip_id, trip_headsign, direction_id, block_id, shape_id) = splitted
            print 'Inserting %s %s %s %s %s'%(route_id, service_id, trip_id, trip_headsign, direction_id)
            #print db.stops.find_one({"stop_id" : 98})
            print db.trips.insert({"trip_id" : trip_id, "service_id" : service_id, "route_id": route_id, "trip_headsign" : trip_headsign, "direction_id": direction_id, "block_id": block_id, "direction_id": direction_id})
        elif len(splitted) != 0:
            print 'Badly formatted line, expected 7 fields: %s'%line
    print 'inserted %d trips'%count

def usage():
    print 'import_trips.py -f file-to-import.txt'

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

    import_trips(filename)

if __name__ == '__main__':
    main()



