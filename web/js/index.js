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
var studentJSON = [
    {id: "1", name: "Arti Zirk", flag: "L"},
    {id: "2", name: "Kertu Pikk", flag: "A"},
    {id: "3", name: "Sigrid Kirss", flag: "A"},
    {id: "4", name: "Silver Valdvee", flag: "E"},
    {id: "5", name: "Artur Salus", flag: "A"},
    {id: "6", name: "Alo Avi", flag: "A"},
    {id: "7", name: "Kristjan Kool", flag: "A"},
    {id: "8", name: "Berta Härsing", flag: "L"}
]

var colorCoding= {
  present: "success",
  absent: "danger",
  excused: "secondary",
  late: "warning"
}

var flagEST= {
  present: "Kohal",
  absent: "Puudub",
  excused: "Põhjendatud",
  late: "Hilnenud"
}

var flags=["P", "A", "E", "L"];
var flagsToString={"P": "Present", "A": "Absent", "E": "Excused", "L": "Late"};
var flagsToLong={"P": "present", "A": "absent", "E": "excused", "L": "late"};

function isActive(bool){
  if(bool){ 
          return "active";
       }else{ 
         return "";
       }
}

function buttonGroupBuilder(){
  var buttons = "";
  for(var i=0; i< flags.length; i++)
    buttons += buttonBuilder(flagsToString[flags[i]])
  return buttons;
}

function buttonBuilder(choice){
  var lower_case_choice = choice.toLowerCase();
  return "<label class='btn btn-outline-"+colorCoding[lower_case_choice]+" id='"+lower_case_choice+"' ><input type='radio' name='flag' value='"+lower_case_choice+"' autocomplete='off' >"+flagEST[lower_case_choice]+"</label>"
}

function updateTable(obj){
  for (var i = 0; i < obj.length; i++){
        var container = document.getElementById(String(obj[i]._id));     
        var child = container.querySelector("#absent");
        $(child).button("toggle");
  }
}

class App {
  

    constructor(serverUrl) {
        this.setupBinding();
        this.setupConnection(serverUrl);
        this.macs = {};
        //setInterval(() => {this.updateVisibleMacs()}, 1000);
        
        setInterval(() => {this.updateButtonState()}, 10000);
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
      
      
      
      fetch('https://tracker.wut.ee/api/v1/users')
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        console.log('parsed json', json);
        var obj= json;
        var globalCounter = 0;
        var tbody = document.getElementById('tbody');

        for (var i = 0; i < obj.length; i++) {
            var tr = "<tr>";

            tr += "<td>" + obj[i].full_name + "</td><td><div class='btn-group' data-toggle='buttons' id='"+obj[i]._id+"'>"+ buttonGroupBuilder() +"</div></td></tr>";

            /* We add the table row to the table body */
            tbody.innerHTML += tr;
        }
        
      }).catch(function(ex) {
        console.log('parsing failed', ex)
      });

    

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
    
    updateButtonState() {
      console.log("Update UI");
      fetch('https://tracker.wut.ee/api/v1/users')
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        //console.log('parsed json', json);
        var obj= json;
        updateTable(obj);
      }).catch(function(ex) {
        console.log('parsing failed', ex)
      });

    }
}