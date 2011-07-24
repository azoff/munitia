#!/usr/bin/python

#
# Indexes data
#

def build_routes_ndx(routes_filename):
    """Builds an index of routes keyed by route_id."""
    f = file(routes_filename, 'r')
    for line in f.readlines():
        if line.startswith('#'):
            continue
        if line.startswith('route_id'):
            continue
        splitted = line.strip().split(',')
        routes = {}
        if len(splitted) == 9:
            #==> routes.txt <==
            #route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_url,route_color,route_text_color
            #5998,SFMTA,1,CALIFORNIA, ,3, , ,
            (route_id, agency_id, route_short_name, route_long_name, route_desc, route_type, route_url, route_color, route_text_color) = splitted
            routes[route_id] = {"route_id":route_id, "agency_id":agency_id, "route_short_name":route_short_name, "route_long_name":route_long_name}
    f.close()
    return routes

def build_trips_ndx(trips_filename):
    """Builds an index of trips keyed by trip_id."""
    f = file(trips_filename, 'r')
    trips = {}
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
            trips[trip_id] = {"trip_id": trip_id, "route_id": route_id, "service_id": service_id, "trip_headsign":trip_headsign, "direction_id":direction_id}
    f.close()
    return trips

def build_lines_stop_sequence_ndx(routes, trips, stop_times_filename):
    """Builds an index of routes where each entry is a list of stops."""
    f = file(stop_times_filename, 'r')
    count = 0
    all_lines_stops = {}
    seen_stops = {}
    for line in f.readlines():
        if line.startswith('#'):
            continue
        if line.startswith('trip_id'):
            continue
        count += 1
        splitted = line.strip().split(',')
        if len(splitted) == 9:
            #==> stop_times.txt <==
            #trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type,shape_dist_traveled
            #4116466,07:09:00,07:09:00,4015,4, , , , 
            (trip_id, arrival_time, departure_time, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type,shape_dist_traveled) = splitted
            trip = trips.get(trip_id, None)
            if trip != None:
                # print 'trip', trip
                route_id = trip['route_id']
                route = routes.get(trip['route_id'])
                direction_id = trip['direction_id']
                # collapse by the following key.  we want stop_sequence by route_id, not trip_id
                # so de-dupe against route_id based key
                line_stop_name = "%s:%s"%(route_id, direction_id)
                line_stop_stop_id_name = "%s:%s"%(line_stop_name, stop_id)
                existing_line_stops = all_lines_stops.get(line_stop_name, None)
                if existing_line_stops == None:
                    existing_line_stops = []
                # don't add an entry for each time
                if seen_stops.get(line_stop_stop_id_name, None) == None:
                    existing_line_stops.append({"route_id" : route_id, "direction_id": direction_id, "stop_id": stop_id, "stop_sequence": stop_sequence})
                    seen_stops[line_stop_stop_id_name] = line_stop_stop_id_name
                    all_lines_stops[line_stop_name] = existing_line_stops
        elif len(splitted) != 0:
            print 'Badly formatted line, expected 9 fields: %s'%line
    f.close()
    return all_lines_stops

def find_next_stop(route_stops, stop_id):
    """Finds the stop_id after this stop."""
    first_stop_sequence = -1
    for rs in route_stops.values():
        if rs['stop_id'] == stop_id:
            first_stop_sequence = rs['stop_sequence']
            break

    if first_stop_sequence == -1:
        return None

    next_closest_stop = None
    next_closest_stop_sequence = 1000000
    for rs in route_stops.values():
        if next_closest_stop == None or rs['stop_sequence'] < next_closest_stop_sequence:
            next_closest_stop = rs['stop_id']
            next_closest_stop_sequence = rs['stop_sequence']

    return next_closest_stop

