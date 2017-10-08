#!/usr/bin/env python3

import mongoengine
from api.models import *

students = {
    "84:c7:ea:3f:7f:42": {'name':"Arti Zirk"},
    "40:4e:36:5d:d5:47": {'name':"Kertu Pikk"},
    "04:4b:ed:0e:cd:ae": {'name':"Sigrid Kirss"},
    "78:00:9e:d1:59:ba": {'name':"Silver Valdvee"},
    "d0:87:e2:a1:04:e5": {'name':"Artur Salus"},
    "cc:9f:7a:2a:1b:db": {'name':"Alo Avi"},
    "40:0e:85:f7:b5:4f": {'name':"Kristjan Kool"},
    "2c:f0:a2:c3:af:b8": {'name':"Berta Härsing"},
    "74:23:44:4e:c9:7a": {'name':"Karl Martin Teras"}
}

for mac, name in students.items():
    name = name['name']
    print(mac, name)
    try:
        user = User.objects.get(full_name=name)
    except mongoengine.DoesNotExist:
        continue
    user = User(full_name=name)
    user.save()
    device = UserDevice(user=user, mac=mac)
    device.save()
