import getopt
import glob
import os
import pymongo
import sys

def import_stop_times(filename, mongo_host, mongo_pw):
    """Imports transit stop_times from filename into MongoDB."""
    # z0ezill@
    connection = pymongo.Connection('mongodb://root:%s@%s:27017'%(mongo_pw, mongo_host))
    db = connection.munitia
    print db
    print db.stops
    f = file(filename, 'r')
    count = 0
    for line in f.readlines():
        if line.startswith('#'):
            continue
        if line.startswith('trip_id'):
            continue
        count += 1
        print 'line=%s='%line.strip()
        splitted = line.strip().split(',')
        if len(splitted) == 9:
            #==> stop_times.txt <==
            #trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type,shape_dist_traveled
            #4116466,07:09:00,07:09:00,4015,4, , , , 

            (trip_id, arrival_time, departure_time, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type,shape_dist_traveled) = splitted
            print 'Inserting %s %s %s %s %s'%(trip_id, arrival_time, stop_id, stop_sequence, stop_headsign)
            print db.stop_times.insert({"trip_id" : trip_id, "arrival_time" : arrival_time, "stop_id": stop_id, "stop_sequence": stop_sequence, "stop_headsign" : stop_headsign})
        elif len(splitted) != 0:
            print 'Badly formatted line, expected 9 fields: %s'%line
    print 'inserted %d stop_times'%count

def usage():
    print 'import_stop_times.py -f file-to-import.txt -p password -h mongo_host'

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

    import_stop_times(filename, mongo_host, mongo_pw)

if __name__ == '__main__':
    main()



