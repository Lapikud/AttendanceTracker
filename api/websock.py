import json
import datetime
import websocket
import MySQLdb
db=MySQLdb.connect(passwd="1d%1mYBX", db="ar", user="ar")
ws = websocket.WebSocket()
ws.connect("ws://iot.wut.ee/p2p/chip/browser")
while True:
    msg = json.loads(ws.recv())
    if msg.get('mac') != None:
        c = db.cursor()
        max_price = 5
        c.execute("""SELECT mac, name FROM users WHERE mac=%s;""", (msg['mac'],))

        result = c.fetchone()
        if not result:
            continue
        print(result)
        c.execute("""UPDATE ar
        SET """)
