#!/usr/bin/python
import json
import urllib2
import getopt
import sys

"""
37.774929&lg=-122.419415
"""

def find_stops_near(latitude, longitude):
    """Find the stops near the given point."""
    f = urllib2.urlopen('http://localhost:8080/find_stops_near?lt=%s&lg=%s'%(latitude, longitude))
    x = f.read()
    result = json.loads(x)
    return result

def execute_cmd(cmd_name, args):
    """Execute the specified client command with the specified arguments."""
    if cmd_name == 'find_stops_near':
        result = find_stops_near(args[0], args[1])
        print json.dumps(result)
        

def usage():
    print 'client.py cmd *arg1* *arg2* ...'

def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "", [""])
    except getopt.GetoptError, err:
        # print help info and exit
        print str(err)
        usage()
        sys.exit(2)

    if len(args) < 2:
        usage()
        sys.exit(3)

    cmd_name = args[0]
    args = args[1:]
    execute_cmd(cmd_name, args)

    
if __name__ == '__main__':
    main()
