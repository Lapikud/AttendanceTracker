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


mongoengine.connect('AttendaceTracker', connect=False)

app = application = falcon.API(request_type=JsonRequest, response_type=JsonResponse)
app.add_error_handler(ValidationError, error_handler)
app.add_error_handler(FieldDoesNotExist, error_handler)
app.add_error_handler(ValueError, error_handler)
app.add_route("/", AboutResource())

users_res = UsersResource()
app.add_route("/users", users_res)
app.add_route("/users/{user}", users_res)

user_devices_res = UserDevicesResource()
app.add_route("/users/{user}/devices", user_devices_res)
app.add_route("/users/{user}/devices/{device}", user_devices_res)
app.add_route("/users/{user}/enrollments", UserDeviceEnrollResource())
