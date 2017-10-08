import datetime
from uuid import uuid4
from mongoengine import *

__all__ = ['User',
           'UserDevice',
           'DeviceEnrollmentRequest',
           'Session',
           'Lesson',
           'UserInLesson']

def gen_sid():
    return uuid4().hex

class User(Document):
    """A generic user who can login"""

    full_name = StringField()
    email = EmailField()
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

class Lesson(Document):
    name = StringField()
    ctime = DateTimeField(default=datetime.datetime.now)
    start_time = DateTimeField()
    end_time = DateTimeField()
    started = BooleanField(default=False)

class UserInLesson(Document):
    user = ReferenceField(User)
    lesson = ReferenceField(Lesson)
    arrival_time = DateTimeField()
    leave_time = DateTimeField()
    flag = StringField(choices=('present', 'absent', 'accused', 'late'), default='absent')
    override = BooleanField(default=False)

