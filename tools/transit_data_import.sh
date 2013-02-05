#!/bin/bash

# Imports transit data into MongoDB.  Default mongo host is localhost 
# add -h *host* for most commands
python import_stops.py -p zoezilla -h localhost -f ../data/stops.txt 
python import_routes.py -p zoezilla -h localhost -f ../data/routes.txt 
python import_stop_times.py -p zoezilla -h localhost -f ../data/stop_times.txt 
python import_trips.py -p zoezilla -f ../data/trips.txt 
python lines_to_stops.py ../data/routes.txt ../data/trips.txt ../data/stop_times.txt localhost zoezilla
python push_next_stops.py ../data/routes.txt ../data/trips.txt ../data/stop_times.txt localhost zoezilla

