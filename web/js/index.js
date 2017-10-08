"use strict";
var api = 'https://tracker.wut.ee/api/v1';

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
var flagEN= {
  present: "Present",
  absent: "Absent",
  excused: "Excused",
  late: "Late"
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
  return "<label class='btn btn-outline-"+colorCoding[lower_case_choice]+" btn-lg' id='"+lower_case_choice+"'><input type='radio' name='flag' autocomplete='off' >"+flagEN[lower_case_choice]+"</label>"
}

function updateTable(obj){
  for (var i = 0; i < obj.length; i++){
    var container = document.getElementById(String(obj[i].user_id));
    //console.log(container);
    var child;
    child= container.querySelector("#present");
    $(child).removeClass("active");
    child= container.querySelector("#absent");
    $(child).removeClass("active");
    child= container.querySelector("#excused");
    $(child).removeClass("active");
    child= container.querySelector("#late");
    $(child).removeClass("active");
    //console.log(obj);
    //console.log(obj.flag);
    var child= container.querySelector("#"+obj[i].flag);
    $(child).addClass("active");
  }
}

class App {  

    constructor(serverUrl) {
        this.setupBinding();
        setInterval(() => {this.updateButtonState()}, 1000);
        this.getUsers();
    }

    setupBinding() {          
      fetch(api+'/lessons/59d9efb6c25e880b6f026059')
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

            tr += "<td><h4>" + obj[i].full_name + "</h4></td><td><div class='btn-group' data-toggle='buttons' id='"+obj[i].user_id+"' >"+ buttonGroupBuilder() +"</div></td></tr>";

            /* We add the table row to the table body */
            tbody.innerHTML += tr;
        }
        
      }).catch(function(ex) {
        console.log('parsing failed', ex)
      });

      this.user_add_el = document.getElementById('user-add');
      this.user_add_el.addEventListener('submit', ev => {
          ev.preventDefault();
          let form_data = new FormData(this.user_add_el);
          let full_name = form_data.get("full-name");
          fetch(api+'/users',{
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  full_name: full_name
              })
          }).then(resp => {
              this.getUsers();
              this.user_add_el.reset();
          });
          return false;
      })
    }

        
    updateButtonState() {
      console.log("Update UI");
      fetch(api+'/lessons/59d9efb6c25e880b6f026059')
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

    getUsers() {
        let user_list_el = document.getElementById("user-list");
        let user_list_innerhtml = '';
        fetch(api+'/users').then(resp => {
            return resp.json()
        }).then(resp => {
            for (let user of resp) {
                user_list_innerhtml += `
                    <tr>
                      <th scope="row">${user._id}</th>
                      <td>${user.full_name}</td>
                      <td>${user.devices.length}</td>
                      <td>
                        <button class="btn btn-success" onclick="app.startEnroll('${user._id}')">Enroll new device</button>
                      </td>
                    </tr>
                `
            }
            user_list_el.innerHTML = user_list_innerhtml;
        })
    }

    startEnroll(userid) {
        console.log("Enrolling new device");
        fetch(api+'/users/'+userid+'/enrollments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(resp => {
            return resp.json()
        }).then(resp => {
            $("#enrollment-modal").modal('show');
            document.getElementById("enrollment-ssid").innerText = resp.ssid;
            document.getElementById("enrollment-password").innerText = resp.password;
            this._enrollment_countdown = 60;
            this.enrollCountDown(userid);
        })
    }

    enrollCountDown(userid) {
        console.log(this._enrollment_countdown);
        this._enrollment_countdown -= 1;
        if (this._enrollment_countdown <= 0) {
            $("#enrollment-modal").modal('hide');
            return;
        }
        fetch(api+'/users/'+userid+'/enrollments').then(resp => {
            return resp.json()
        }).then(resp => {
            console.log(resp);
            if (resp.length === 0) {
                this._enrollment_countdown = 0;
            }
        });
        document.getElementById("enrollment-countdown").innerText = this._enrollment_countdown;
        setTimeout(() => {this.enrollCountDown(userid)}, 1000);
    }
}
