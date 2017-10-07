"""Main file for the flask web server code and all routes. Controllers are implemented in routes. Views are in corresponding folders."""
import json
from pprint import pprint
from flask import Flask
from flask import render_template, request, Flask, redirect, url_for, flash, Response

from flask_mysqldb import MySQL

app = Flask(__name__)
app.secret_key = 'super secret'
app.config['MYSQL_DB'] = 'ar'
app.config['MYSQL_USER'] = 'ar'
app.config['MYSQL_PASSWORD'] = '1d%1mYBX'
mysql = MySQL(app)


@app.route('/users', methods=['GET', 'POST'])
def main_route():
    """Open up a list of people in the Lapik office

    Return all people we have in the database and their mac. Add people.
    """
    if request.method == 'POST':
        name = request.form['name']
        mac = request.form['mac']
        if name != None and mac != None:
            cur = mysql.connection.cursor()
            cur.execute('INSERT INTO users(name, mac) VALUES (%s, %s);', (name, mac))
            mysql.connection.commit()
            return "Commit successful."

    else:
        cur = mysql.connection.cursor()
        cur.execute('SELECT name, mac FROM users;')
        people = []
        for person in cur.fetchall():
            name = person[0]
            mac = person[1]

            people.append({"name": name, "mac": mac})
        return json.dumps(people)

