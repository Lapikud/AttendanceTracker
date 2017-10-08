import datetime
from uuid import uuid4
from mongoengine import *

__all__ = ['User',
           'UserDevice',
           'DeviceEnrollmentRequest',
           'Session']

def gen_sid():
    return uuid4().hex

class User(Document):
    """A generic user who can login"""

    full_name = StringField()
    email = EmailField(required=True, unique=True)
    auth = StringField()

    ctime = DateTimeField(default=datetime.datetime.now)

    admin = BooleanField(default=False)


class UserDevice(Document):
    """A device that a user owns"""
    user = ReferenceField(User)
    mac = StringField(primary_key=True, max_length=17, min_length=17)
    ctime = DateTimeField(default=datetime.datetime.now)
    mtime = DateTimeField()


class DeviceEnrollmentRequest(Document):

    user = ReferenceField(User)
    ssid = StringField()
    password = StringField()
    ctime = DateTimeField(default=datetime.datetime.now)
    state = StringField(choices=("created", "waiting", "error", "done"), default="created")


class Session(Document):

    user = ReferenceField(User)
    sid = StringField(default=gen_sid, primary_key=True)
    ctime = DateTimeField(default=datetime.datetime.now)

