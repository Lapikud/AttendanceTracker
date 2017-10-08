from falcon import HTTPInternalServerError, HTTP_CREATED, HTTP_BAD_REQUEST
from .models import *
from .tools import TODOException, gen_password
from mongoengine import DoesNotExist
from websocket import create_connection
import json

class UsersResource():

    def on_get(self, req, resp, user=None):

        if user:
            user = User.objects.get(id=user)
            devices = []
            for device in UserDevice.objects(user=user):
                devices.append(device.mac)
            user = user.to_mongo()
            user['devices'] = devices
            resp.json = user
            return

        users = []
        for user in User.objects:
            devices = []
            for device in UserDevice.objects(user=user):
                devices.append(device.mac)
            user = user.to_mongo()
            user['devices'] = devices
            users.append(user)
        resp.json = users

    def on_post(self, req, resp, user=None):
        user = User(email=req.json.get('email'), full_name=req.json['full_name'])
        user.save()
        lesson = Lesson.objects.get(id='59d9efb6c25e880b6f026059')
        attend = UserInLesson(user=user, lesson=lesson)
        attend.save()
        resp.status = HTTP_CREATED


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
        enroll.password = "12345678"#gen_password(length=8)
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

class LessonResource():

    def on_get(self, req, resp, lesson=None):
        if lesson:
            lesson = Lesson.objects.get(id=lesson)
            users_in_lesson = []
            for attending in UserInLesson.objects(lesson=lesson):
                users_in_lesson.append({
                    "_id":attending.id,
                    "user_id": attending.user.id,
                    "full_name": attending.user.full_name,
                    "arrival_time": attending.arrival_time,
                    "flag": attending.flag
                })
            lesson = lesson.to_mongo()
            lesson["attendees"] = users_in_lesson
            resp.json = lesson
            return

        lessons = []
        for lesson in Lesson.objects:
            lessons.append(lesson.to_mongo())
        resp.json = lessons
        return

    def on_post(self, req, resp):
        if 'name' in req.json:
            lesson = Lesson(name=req.json['name'])
            lesson.save()
            resp.json = lesson.to_mongo()
        else:
            resp.json = {'error':'missing name key in request'}
            resp.status = HTTP_BAD_REQUEST

class LessonAttendersResource():

    def on_post(self, req, resp, lesson, attending=None):
        lesson = Lesson.objects.get(id=lesson)
        if attending:
            attending = UserInLesson.objects.get(id=attending)
            if "flag" in req.json:
                attending.flag = req.json["flag"]
                attending.save()
                return
            else:
                resp.json = {'error': 'missing flag key in request'}
                resp.status = HTTP_BAD_REQUEST
        else:
            if "user" in req.json:
                user = User.objects.get(id=req.json["user"])
                attend = UserInLesson(user=user, lesson=lesson)
                attend.save()
                resp.json = attend.to_mongo()
            else:
                resp.json = {'error': 'missing user key in request'}
                resp.status = HTTP_BAD_REQUEST
