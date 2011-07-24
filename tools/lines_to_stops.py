import getopt
import glob
import os
import pymongo
import sys

def lines_to_stops(routes_filename, trips_filename, stop_times_filename):
    """Adds route/trip information to stops."""
    connection = pymongo.Connection('mongodb://root:lcKkmyqBup1aZrTKSHYX@149f8b26.dotcloud.com:9072')
    db = connection.munitia
    routes = {}
    trips = {}
    f = file(routes_filename, 'r')
    for line in f.readlines():
        if line.startswith('#'):
            continue
        if line.startswith('route_id'):
            continue
        splitted = line.strip().split(',')
        if len(splitted) == 9:
            #==> routes.txt <==
            #route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_url,route_color,route_text_color
            #5998,SFMTA,1,CALIFORNIA, ,3, , ,
            (route_id, agency_id, route_short_name, route_long_name, route_desc, route_type, route_url, route_color, route_text_color) = splitted
            if route_id == "1105":
                print "OK"
            routes[route_id] = {"route_id":route_id, "agency_id":agency_id, "route_short_name":route_short_name, "route_long_name":route_long_name}
    f.close()

    f = file(trips_filename, 'r')
    for line in f.readlines():
        if line.startswith('#'):
            continue
        if line.startswith('route_id'):
            continue
        splitted = line.strip().split(',')
        if len(splitted) == 7:
            # ==> trips.txt <==
            # route_id,service_id,trip_id,trip_headsign,direction_id,block_id,shape_id
            # 5998,3,4117187,Geary & 33rd Ave,0,311094,66621
            (route_id, service_id, trip_id, trip_headsign, direction_id, block_id, shape_id) = splitted
            if route_id == "1105":
                print "OK"
            trips[trip_id] = {"trip_id": trip_id, "route_id": route_id, "service_id": service_id, "trip_headsign":trip_headsign, "direction_id":direction_id}
    f.close()

    print db
    print db.stops
    f = file(stop_times_filename, 'r')
    count = 0
    line_stops = {}
    for line in f.readlines():
        if line.startswith('#'):
            continue
        if line.startswith('trip_id'):
            continue
        count += 1
        #print 'line=%s='%line.strip()
        splitted = line.strip().split(',')
        if len(splitted) == 9:
            #==> stop_times.txt <==
            #trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type,shape_dist_traveled
            #4116466,07:09:00,07:09:00,4015,4, , , , 
            (trip_id, arrival_time, departure_time, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type,shape_dist_traveled) = splitted
            # print 'trip_id', trip_id
            if trip_id == '4148627':
                print 'found tripid'
            if stop_id == '98':
                print 'found stopid'
            trip = trips.get(trip_id, None)
            if trip != None:
                # print 'trip', trip
                route_id = trip['route_id']
                if route_id == "1105":
                    print "OK found route id"
                route = routes.get(trip['route_id'])
                if route != None:
                    if route_id == "1105":
                        print "ok, found route object."

                    line_name = "%s:%s:%s:%s"%(route_id, route['route_short_name'], route['route_long_name'], trip["direction_id"])
                    lines = line_stops.get(stop_id, None)
                    if lines == None:
                        lines = {}
                    lines[line_name] = line_name
                    line_stops[stop_id] = lines
        elif len(splitted) != 0:
            print 'Badly formatted line, expected 9 fields: %s'%line
    count=0
    for stop_id in line_stops.keys():
        for line in line_stops[stop_id].keys():
            print '%s,%s'%(stop_id, line)
            print db.stops.update({"stop_id" : stop_id}, {"$push": {"lines": line}})
            count += 1

    print 'inserted %d lines'%count

def usage():
    print 'lines_to_stops.py routes.txt trips.txt stop_times.txt'

def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "", [""])
    except getopt.GetoptError, err:
        # print help info and exit
        print str(err)
        usage()
        sys.exit(2)

    if len(args) < 3:
        usage()
        sys.exit(3)

    routes_filename = args[0]
    trips_filename = args[1]
    stop_times_filename = args[2]

    lines_to_stops(routes_filename, trips_filename, stop_times_filename)

    
if __name__ == '__main__':
    main()



