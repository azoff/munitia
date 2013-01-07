#!/usr/bin/python

import getopt
import glob
import os
import pymongo
import sys
import indexer

def push_next_stops(routes_filename, trips_filename, stop_times_filename, mongo_host, mongo_pw):
    """Formats stop sequences by route."""
    connection = pymongo.Connection('mongodb://root:%s@%s:27017'%(mongo_pw, mongo_host))
    db = connection.munitia
    routes = indexer.build_routes_ndx(routes_filename)
    trips = indexer.build_trips_ndx(trips_filename)
    lines_stop_sequence = indexer.build_lines_stop_sequence_ndx(routes, trips, stop_times_filename)

    next_stop_count = 0
    for line_name in lines_stop_sequence.keys():
        line_stops = lines_stop_sequence[line_name]
        # route_stops is a list of route_stop objects
        i = 0
        while i < len(line_stops):
            # NOTE: we assume that stops are in stop_sequence order in stop_times.txt
            line_stop = line_stops[i]
            if i+1 < len(line_stops):
                next_line_stop = line_stops[i+1]
                stop_id = line_stop["stop_id"]
                next_stop_id = '%s:%s'%(line_name, next_line_stop["stop_id"])
                print "pushing,%s:%s,%s:%s"%(stop_id, line_stop["stop_sequence"], next_stop_id, next_line_stop["stop_sequence"])
                db.stops.update({"stop_id": stop_id}, {"$push" : {"next_stop" : next_stop_id }})
                next_stop_count += 1
            i+=1
    print "pushed %d next_stops"%next_stop_count

def usage():
    print 'push_next_stops.py routes.txt trips.txt stop_times.txt mongo_host mongo_pw'

def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "", [""])
    except getopt.GetoptError, err:
        # print help info and exit
        print str(err)
        usage()
        sys.exit(2)

    if len(args) < 4:
        usage()
        sys.exit(3)

    routes_filename = args[0]
    trips_filename = args[1]
    stop_times_filename = args[2]
    mongo_host = args[3]
    mongo_pw = args[4]

    push_next_stops(routes_filename, trips_filename, stop_times_filename, mongo_host, mongo_pw)

    
if __name__ == '__main__':
    main()



