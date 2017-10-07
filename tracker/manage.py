#!/usr/bin/env python

import websocket
import subprocess
import json
import enroll
import time

ws = websocket.WebSocket()
running = True
state = 'wifispy'
while running:
    try:
        if not ws.connected:
            ws.connect('ws://iot.wut.ee/p2p/manage/browser')
            ws.send('{"status":"Manage script has connected"}')
        if subprocess.call(['systemctl', 'status', 'wifispy']) != 0 and state == 'wifispy':
            print("Starting wifi spy")
            subprocess.call(['systemctl', 'start', 'wifispy'])
        msg = ws.recv().strip()
        if not msg:
            continue
        print(msg)
        msg = json.loads(msg)
        print("Method", msg.get('method'))
        if msg.get('method') == 'enroll':
            params = msg.get('params', {})
            ssid = params.get('ssid')
            password = params.get('password')
            if not ssid or not password:
                ws.send(json.dumps({"status":"ssid or password not given"}))
            else:
                print("Staring enroll")
                state = 'enroll'
                subprocess.call(['systemctl', 'stop', 'wifispy'])
                time.sleep(3)
                subprocess.call(['systemctl', 'kill', 'wifispy'])
                mac = enroll.enroll(ssid, password)
                if mac:
                    r = {"result":{"ssid":ssid, "password":password,"mac":mac}}
                else:
                    r = {"error": "Enroll timeout"}
                ws.send(json.dumps(r))
                state = 'wifispy'
        else:
            state = 'wifispy'
    except IOError as e:
        print("Websocket has died! Reconnecting")
        try:
            ws.close()
        except Exception as e:
            print("Close failed")
            print(e)
