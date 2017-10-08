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
  return "<label class='btn btn-outline-"+colorCoding[lower_case_choice]+"' id='"+lower_case_choice+"'><input type='radio' name='flag' autocomplete='off' >"+flagEST[lower_case_choice]+"</label>"
}

function updateTable(obj){
  for (var i = 0; i < obj.length; i++){
    var container = document.getElementById(String(obj[i].user_id));
    console.log(container);
    var child;
    child= container.querySelector("#present");
    $(child).removeClass("active");
    child= container.querySelector("#absent");
    $(child).removeClass("active");
    child= container.querySelector("#excused");
    $(child).removeClass("active");
    child= container.querySelector("#late");
    $(child).removeClass("active");
    console.log(obj);
    console.log(obj.flag);
    var child= container.querySelector("#"+obj[i].flag);
    $(child).addClass("active");
  }
}

class App {  

    constructor(serverUrl) {
        this.setupBinding();
        this.setupConnection(serverUrl);
        this.macs = {};
        //setInterval(() => {this.updateVisibleMacs()}, 1000);
        
        setInterval(() => {this.updateButtonState()}, 1000);
    }

    setupBinding() {          
      fetch('https://tracker.wut.ee/api/v1/lessons/59d9efb6c25e880b6f026059')
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        //console.log('parsed json', json);
        var obj= json.attendees;
        //console.log(obj);
        var globalCounter = 0;
        var tbody = document.getElementById('tbody');

        for (var i = 0; i < obj.length; i++) {
            var tr = "<tr>";

            tr += "<td>" + obj[i].full_name + "</td><td><div class='btn-group' data-toggle='buttons' id='"+obj[i].user_id+"' >"+ buttonGroupBuilder() +"</div></td></tr>";

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
        
    updateButtonState() {
      console.log("Update UI");
      fetch('https://tracker.wut.ee/api/v1/lessons/59d9efb6c25e880b6f026059')
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        //console.log('parsed json', json);
        var obj= json.attendees;
        //console.log(obj);
        updateTable(obj);
      }).catch(function(ex) {
        console.log('parsing failed', ex)
      });

    }
}