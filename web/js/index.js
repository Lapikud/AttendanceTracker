"use strict";
var students = {
    "84:c7:ea:3f:7f:42": {name:"Arti Zirk"},
    "40:4e:36:5d:d5:47": {name:"Kertu Pikk"},
    "04:4b:ed:0e:cd:ae": {name:"Sigrid Kirss"},
    "78:00:9e:d1:59:ba": {name:"Silver Valdvee"},
    "d0:87:e2:a1:04:e5": {name:"Artur Salus"},
    "cc:9f:7a:2a:1b:db": {name:"Alo Avi"},
    "40:0e:85:f7:b5:4f": {name:"Kristjan Kool"},
    "2c:f0:a2:c3:af:b8": {name:"Berta Härsing"}
}


class App {

    constructor(serverUrl) {
        this.setupBinding();
        this.setupConnection(serverUrl);
        this.macs = {};
        setInterval(() => {this.updateVisibleMacs()}, 1000);
    }

    setupBinding() {
        this.logEl = document.getElementById("log");
        this.clearEl = document.getElementById("clear");
        this.clearEl.addEventListener("click", event => this.clear(event));
        this.studentsEl = document.getElementById("students");
        for (let mac in students) {
            let student = students[mac];
            let el = document.createElement('div');
            student.el = el;
            el.style.color = 'red';
            let name = document.createTextNode(student.name);
            el.appendChild(name);
            this.studentsEl.appendChild(el);
        }
    }

    setupConnection(serverUrl) {
        // https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
        this.ws = new WebSocket(serverUrl);
        this.ws.onmessage = event => this.onRecv(event);
    }

    clear() {
        this.logEl.value = "";
    }

    onSend(event) {
        // Called to send a message
        var finalMessage = "Nick: Message";  // this.nicknameEl.value
        this.ws.send(finalMessage);
    }

    onRecv(event) {
        // Called when message is received
        var msg = JSON.parse(event.data);
        this.macs[msg.mac] = Date.now();
    }

    updateVisibleMacs() {
        console.log("Update UI");
        let macs = "";
        let date = Date.now();
        for (let mac in this.macs) {
            let lastSeen = (date - this.macs[mac])
            if (lastSeen > 1000 * 60 * 10) {
                delete this.macs[mac];
                if (mac in students){
                    let student = students[mac];
                    student.el.style.color = 'red';
                }
                continue;
            }
            if (mac in students){
                let student = students[mac];
                student.el.style.color = 'green';
            }
            macs += mac + ' ' + ((date - this.macs[mac]) / 1000).toFixed(1) + '\n';
        }
        this.logEl.value = macs;
    }

}
