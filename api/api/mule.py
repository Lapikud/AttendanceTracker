#!/usr/bin/env python3

import websocket
import mongoengine
from .models import *
import json
import datetime
import time


mongoengine.connect('AttendaceTracker', connect=False)

def main():
    ws = websocket.WebSocket()
    while True:
        if not ws.connected:
            print("Connecting WebSocket")
            ws.connect("ws://iot.wut.ee/p2p/browser/manage")

        msg = ws.recv()
        try: msg = json.loads(msg)
        except json.decoder.JSONDecodeError as err:
            print("Msg is invalid json", err)

        if "result" in msg:
            res = msg["result"]
            if "mac" in res and "id" in res:
                print("Enrollment", res["id"], "mac", res["mac"])
                try:
                    enroll_req = DeviceEnrollmentRequest.objects.get(id=res["id"])
                    print("Found enrollment request", enroll_req)
                    device = UserDevice(mac=res['mac'], user=enroll_req.user)
                    device.save()
                    enroll_req.delete()
                except mongoengine.DoesNotExist as e:
                    print()
        print(">", msg)

def enroll_cleanups():
    while True:
        cur_date = datetime.datetime.now()
        for req in DeviceEnrollmentRequest.objects:
            if cur_date - req.ctime > datetime.timedelta(minutes=1, seconds=30):
                print("Delete timed out enrollment id", req.id)
                req.delete()
        time.sleep(30)

def update_device_ctime():
    ws = websocket.WebSocket()
    while True:
        if not ws.connected:
            print("Connecting WebSocket")
            ws.connect("ws://iot.wut.ee/p2p/chip/browser")

        msg = ws.recv()
        try:
            msg = json.loads(msg)
        except json.decoder.JSONDecodeError as err:
            print("Msg is invalid json", err)
        if "mac" not in msg:
            continue
        try:
            device = UserDevice.objects.get(mac=msg["mac"])
            device.mtime = datetime.datetime.now()
            device.save()
        except mongoengine.DoesNotExist:
            pass

def update_user_attending():
    ws = websocket.WebSocket()
    while True:
        if not ws.connected:
            print("Connecting WebSocket")
            ws.connect("ws://iot.wut.ee/p2p/lessonsrc/lessondst")

        lesson = Lesson.objects(start_time__gt=datetime.datetime.now()).order_by('start_time').first()
        if lesson:
            print(lesson.start_time, lesson.name)
            for attender in UserInLesson.objects(lesson=lesson):
                if attender.override:
                    continue
                latest_device = UserDevice.objects(user=attender.user).order_by("mtime").only('mtime').first()
                if not latest_device:
                    continue
                if not latest_device.mtime:
                    continue
                if datetime.datetime.now() - latest_device.mtime < datetime.timedelta(minutes=1):
                    if lesson.started:
                        attender.flag = "late"
                    else:
                        attender.flag = "present"
                else:
                    attender.flag = "absent"
                attender.save()
                print("", latest_device.mtime, attender.flag, attender.user.full_name)

        time.sleep(1)
