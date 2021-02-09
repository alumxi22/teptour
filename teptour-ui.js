var command_history = [];
var command_index = 0;
var current_command = "";

function history_add(command) {
  if (command !== command_history[command_history.length - 1]) {
    command_history.push(command);
  }
  command_index = command_history.length;
  current_command = "";
};

function history_up() {
  if(command_index > 0) {
    if(command_index == command_history.length) {
      current_command = document.getElementById("command").value;
    }
    command_index -= 1;
    document.getElementById("command").value = command_history[command_index];
  }
};

function history_down() {
  if(command_index < command_history.length) {
    command_index += 1;
    if(command_index === command_history.length) {
      document.getElementById("command").value = current_command;
    } else {
      document.getElementById("command").value = command_history[command_index];
    }
  }
}

function enter_command() {
  var command = document.getElementById("command").value;
  run_action(command);
}

var run_action_callback = null;
function run_action(command) {
  hide_irving_list();
  history_add(command);
  out.with_block("p", () => {
    out.add_class("user_input");
    out.write_text("> " + command);
  });
  document.getElementById("command").value = "";
  var callback = run_action_callback;
  run_action_callback = null;
  callback(command);
  return false;
}

function scroll_output_to_end() {
  var end = document.getElementById("output-end");
  document.getElementById("main-window").scrollTop = end.offsetTop;
}

function update_map_location() {
  var loc = world.name(world.location(world.actor));
  console.log(loc);
  for (let el of document.querySelectorAll(`[room]`)) {
    el.classList.remove("visiting");
  }
  for (let el of document.querySelectorAll(`[room="${loc}"]`)) {
    console.log("found");
    el.classList.add("visiting");
  }
}

/** Create an index of things you can ask Irving about. */
function build_ask_irving() {
  document.getElementById("irving").style.display = "block";
  let $list = document.getElementById("irving-list");
  $list.innerHTML = '';
  let lore = world.all_of_kind("lore").map(o => world.name(o));
  lore.sort((n1, n2) => n1.toLowerCase().localeCompare(n2.toLowerCase()));
  for (let name of lore) {
    var $a = document.createElement("a");
    $a.classList.add("action");
    $a.href = "#";
    $a.setAttribute("data-action", "ask Irving Q. Tep about " + name);
    $a.appendChild(document.createTextNode(name));
    var $li = document.createElement("li");
    $li.appendChild($a);
    $list.appendChild($li);
  }
  return false;
}

function hide_irving_list() {
  document.getElementById("irving").style.display = "none";
}

window.addEventListener("load", () => {
  document.getElementById("user_response").addEventListener("click", (e) => {
//    if (e.target === document.body) {
      document.getElementById("command").focus();
//    }
  });

  document.getElementById("command").focus();
  document.getElementById("command").addEventListener("keydown", (e) => {
    if(e.keyCode == 38) {
      e.preventDefault();
      history_up();
    } else if(e.keyCode == 40) {
      e.preventDefault();
      history_down();
    }
  });

  document.body.addEventListener("click", function (e) {
    var node = e.target;
    var attr;
    while (node) {
      attr = node.getAttribute("data-action");
      if (attr) break;
      node = node.parentElement;
    }
    if (attr) {
      e.stopPropagation();
      e.preventDefault();
      run_action(attr);
    }
  });

  document.getElementById("irving").addEventListener("click", function (e) {
    var div = document.getElementById("irving");
    if (e.target === div) {
      e.stopPropagation();
      hide_irving_list();
    }
  });
  document.getElementById("irving-cancel").addEventListener("click", function (e) {
    hide_irving_list();
  });

  add_game_listener("input", (callback) => {
    update_map_location();
    scroll_output_to_end();
    var cmd = document.getElementById("command");
    cmd.focus();
    run_action_callback = callback;
  });
});
