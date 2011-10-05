#!/usr/bin/python
import json
import urllib2
import getopt
import sys

"""
37.774929&lg=-122.419415
"""

def hit_url(url):
    f = urllib2.urlopen(url)
    x = f.read()
    result = json.loads(x)
    return result


class MunitiaClient():
    def __init__(self):
        self.host = 'localhost'
        self.port = 8080
        pass

    def build_url(self, cmd):
        return 'http://%s:%d/%s'%(self.host, self.port, cmd)

    def find_stops_near(self, args):
        """Find the stops near the given point."""
        return hit_url(self.build_url('find_stops_near?lt=%s&lg=%s'%(args[0], args[1])))

    def find_round(self, args):
        """Finds the nearest round."""
        return hit_url(self.build_url('find_round?lt=%s&lg=%s'%(args[0], args[1])))

def execute_cmd(cmd_name, args):
    """Execute the specified client command with the specified arguments."""
    method = getattr(MunitiaClient, cmd_name, None)
    m = MunitiaClient()
    if method != None:
        print json.dumps(method(m, args))

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
