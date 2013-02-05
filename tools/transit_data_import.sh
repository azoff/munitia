#!/bin/bash

if [ -z "$1" ] ; then
	HOST=localhost
else
	HOST=$1
fi

PASS="$2"

if [ -z $DATA ] ; then
	DATA=data
else
	DATA=$3
fi

# download the data
mkdir $DATA
cd data && \
curl -O https://dl.dropbox.com/s/cwmcai0bwxg95mz/google_transit.zip && \
unzip google_transit.zip && \
rm google_transit.zip && \
cd ..

# install pymongo
sudo easy_install pymongo

# Imports transit data into MongoDB.  Default mongo host is localhost
# add -h *host* for most commands
python import_stops.py      -p $PASS -h $HOST -f $DATA/stops.txt
python import_routes.py     -p $PASS -h $HOST -f $DATA/routes.txt
python import_stop_times.py -p $PASS -h $HOST -f $DATA/stop_times.txt
python import_trips.py      -p $PASS -h $HOST -f $DATA/trips.txt
python lines_to_stops.py    $DATA/routes.txt $DATA/trips.txt $DATA/stop_times.txt $HOST $PASS
python push_next_stops.py   $DATA/routes.txt $DATA/trips.txt $DATA/stop_times.txt $HOST $PASS

