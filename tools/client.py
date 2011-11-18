#!/usr/bin/python
import json
import urllib2
import getopt
import sys

"""
37.774929&lg=-122.419415
"""

dry_run = False

def hit_url(url):
    if dry_run:
        print url
        return None
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
        return hit_url(self.build_url('find_stops_near?lt=%s&lg=%s'%(args[0], args[1])))

    def find_round(self, args):
        return hit_url(self.build_url('find_round?stretch_id=%s&lt=%s&lg=%s'%(args[0], args[1], args[2])))

    def add_to_round(self, args):
        return hit_url(self.build_url('add_to_round?stretch_id=%s&lt=%s&lg=%s&user_id=%s'%(args[0], args[1], args[2], args[3])))
    
    def find_stretch(self, args):
        return hit_url(self.build_url('find_stretch?start_stop_id=%s&end_stop_id=%s&line_id=%s'%(args[0], args[1], args[2])));
    
    def create_stretch(self, args):
        return hit_url(self.build_url('create_stretch?stretch_id=%s&start_stop_id=%s&end_stop_id=%s&line_id=%s'%(args[0], args[1], args[2], args[3])))

    def add_round_score_to_stretch(self, args):
        return hit_url(self.build_url('add_round_score_to_stretch?stretch_id=%s&round_id=%s&score=%s'%(args[0], args[1], args[2])))


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
        opts, args = getopt.getopt(sys.argv[1:], "d", [""])
    except getopt.GetoptError, err:
        # print help info and exit
        print str(err)
        usage()
        sys.exit(2)

    for o, a in opts:
        if o in ("-d"):
            dry_run = True

    if len(args) < 2:
        usage()
        sys.exit(3)

    cmd_name = args[0]
    args = args[1:]
    execute_cmd(cmd_name, args)

    
if __name__ == '__main__':
    main()
