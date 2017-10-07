#!/usr/bin/env python2
from __future__ import print_function
import sys
import subprocess
import random
import string
import tempfile
import time

hostapd_conf_template = """
interface={interface}
driver=nl80211
ssid={ssid}
channel=7
auth_algs=3
max_num_sta=10
wpa=2
wpa_passphrase={password}
wpa_pairwise=TKIP CCMP
rsn_pairwise=CCMP
ctrl_interface=/var/run/hostapd
logger_stdout=-1
logger_stdout_level=2
"""

interface = "wlan1"

def gen_password(length=8):
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(8))

def enroll(ssid, password, interface="wlan1"):

    conf = hostapd_conf_template.format(interface=interface,
                                       ssid=ssid,
                                       password=password)

    hostapd_conf = tempfile.NamedTemporaryFile()
    hostapd_conf.write(conf)
    hostapd_conf.flush()


    hostapd = subprocess.Popen(['hostapd', '-d',hostapd_conf.name])
    running = True
    mac = None
    while running:
        if hostapd.poll() != None:
            running = False
        try:
            stas = subprocess.check_output("hostapd_cli all_sta | grep dot11RSNAStatsSTAAddress", shell=True).strip()
        except subprocess.CalledProcessError:
            stas=''
        if not stas:
            time.sleep(1)
            continue
        for line in stas.split("\n"):
            line = line.strip()
            if not line:
                continue
            mac = line.split("=")[-1]
            status = subprocess.check_output("hostapd_cli sta "+mac+" | grep flags=", shell=True).strip()
            if not status:
                continue
            flags = status.split("=")[-1]
            if "AUTHORIZED" in flags:
                print("connected, killing")
                hostapd.send_signal(2)
                running = False
        time.sleep(1)
    hostapd_conf.close()
    return mac

if __name__ == '__main__':
    password = gen_password()
    ssid = sys.argv[1]

    print("Name:", ssid, "Pass:", password)
    print('Got MAC', enroll(ssid, password))
