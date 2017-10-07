"use strict";
var students = {
    "84:c7:ea:3f:7f:42": {name:"Arti Zirk"},
    "40:4e:36:5d:d5:47": {name:"Kertu Pikk"}
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
        this.clearEl.addEventListener("click", event => this.clear(event))
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
            if (lastSeen > 1000 * 20) {
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
