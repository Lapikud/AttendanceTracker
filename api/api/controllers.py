from falcon import HTTPInternalServerError, HTTP_201
from .models import *
from .tools import TODOException, gen_password
from mongoengine import DoesNotExist
from websocket import create_connection
import json

class UsersResource():

    def on_get(self, req, resp, user=None):

        if user:
            resp.json = User.objects.get(id=user).to_mongo()
            return

        users = []
        for user in User.objects:
            users.append(user.to_mongo())
        resp.json = users

    def on_post(self, req, resp, user=None):
        user = User(email=req.json['email'], full_name=req.json['full_name'])
        user.save()
        resp.status = HTTP_201


class UserDevicesResource():

    def on_get(self, req, resp, user, device=None):
        user = User.objects.get(id=user)
        results = []
        for device in UserDevice.objects(user=user):
            results.append(device.to_mongo())
        resp.json = results

    def on_post(self, req, resp, user):
        raise NotImplemented

class UserDeviceEnrollResource():

    def on_get(self, req, resp, user):
        requests = []
        user = User.objects.get(id=user)
        try:
            for request in DeviceEnrollmentRequest.objects(user=user):
                requests.append(request.to_mongo())
        except DoesNotExist:
            pass
        resp.json = requests

    def on_post(self, req, resp, user):
        user = User.objects.get(id=user)
        enroll = DeviceEnrollmentRequest(user=user)
        enroll.ssid = user.full_name
        enroll.password = gen_password(length=8)
        enroll.save()
        ws = create_connection("ws://iot.wut.ee/p2p/browser/manage")
        ws.send(json.dumps({"method":"enroll", "params":{"ssid":enroll.ssid, "password":enroll.password, "id":str(enroll.id)}}))
        ws.close()

        resp.json = {
            "_id": enroll.id,
            "ssid": enroll.ssid,
            "password": enroll.password,
            "ctime": enroll.ctime
        }
