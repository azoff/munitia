import getopt
import glob
import os
import pymongo
import sys

def generate_lines(filename):
    """Generates lines stop_times from filename into MongoDB."""
    connection = pymongo.Connection('mongodb://root:lcKkmyqBup1aZrTKSHYX@149f8b26.dotcloud.com:9072')
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
    print 'import_stop_times.py -f file-to-import.txt'

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

    import_stop_times(filename)

if __name__ == '__main__':
    main()



