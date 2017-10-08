import json

import falcon
import mongoengine
from mongoengine.errors import ValidationError, FieldDoesNotExist

from .tools import JsonRequest, JsonResponse, error_handler
from .controllers import *

class AboutResource():

    def on_get(self, req, resp):
        r = {"about": {
                "name": "Attendace Tracker",
                "version": "1",
                "docs": "TODO"
                }
            }
        r.update({"endpoints":[
                        {"url":"/",
                        "description":"About this API"}
                    ]})

        resp.body = json.dumps(r, indent=4)


class Speed():
    def on_get(self, req, resp):
        resp.body = "9001"

mongoengine.connect('AttendaceTracker', connect=False)

app = application = falcon.API(request_type=JsonRequest, response_type=JsonResponse)
app.add_error_handler(ValidationError, error_handler)
app.add_error_handler(FieldDoesNotExist, error_handler)
app.add_error_handler(ValueError, error_handler)
app.add_route("/", AboutResource())

app.add_route("/speed", Speed())

users_res = UsersResource()
app.add_route("/users", users_res)
app.add_route("/users/{user}", users_res)

user_devices_res = UserDevicesResource()
app.add_route("/users/{user}/devices", user_devices_res)
app.add_route("/users/{user}/devices/{device}", user_devices_res)
app.add_route("/users/{user}/enrollments", UserDeviceEnrollResource())

lessons_res = LessonResource()
app.add_route("/lessons", lessons_res)
app.add_route("/lessons/{lesson}", lessons_res)

attending_res = LessonAttendersResource()
app.add_route("/lessons/{lesson}/attending", attending_res)
app.add_route("/lessons/{lesson}/attending/{attending}", attending_res)
