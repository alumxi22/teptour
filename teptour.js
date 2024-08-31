// teptour.js
//
// The tEp/Xi virtual house tour!
// (c) 2021 tEp/Xi
// tepxi.mit.edu
//
// Authors: Kyle Miller
//
// Adapted from a version in Python from 2011.
//
// (If you're reading this, we want to hear from you!)

"use strict";

// version numbers should only ever be of form 2.222...
world.global.set("release number", "2.2222 (08/2024)");

world.global.set("game title", "The tEp/Xi Virtual House Tour");
world.global.set("game headline", "A factual fantasy");
world.global.set("game author", "tEp/Xi");
world.global.set("game description", `Although you're still where you
were, you're now where you are since [ob 'Irving Q. Tep'] has brought
you to the Purple Palace, 253 Comm. Ave.`);

///
/// Fun and games
///

//// [img] command

var tobii = null;

HTML_abstract_builder.prototype.img = function (path, align) {
  if (tobii == null) {
    tobii = new Tobii({
      counter: false
    });
  }
  out.with_block("div", () => {
    if (align === "left") {
      out.add_class("desc_img_left");
    } else {
      out.add_class("desc_img");
    }
    const img_url = "images/" + path;
    out.with_block("a", () => {
      out.attr("href", img_url);
      out.add_class("lightbox");
      out.with_block("img", () => {
        let img = out.root;
        img.addEventListener("load", function (e) {
          scroll_output_to_end();
        });
        out.attr("src", img_url);
      });
      tobii.add(out.root);
    });
  });
};

//// [ask] command

HTML_abstract_builder.prototype.ask = function (topic, text) {
  out.wrap_action_link("ask Irving Q. Tep about " + topic, () => {
    if (text) {
      out.write(text);
    } else {
      out.write_text(topic);
    }
  });
};

/* See the section "Consulting Irving Q. Tep..." for how to add things
   that one can ask him about. */

/// [em] command

/* here's something that italicizes just a few words for convenience. */
HTML_abstract_builder.prototype.em = function () {
  out.with_inline("i", () => {
    for (var i = 0; i < arguments.length; i++) {
      out.write(arguments[i]);
    }
  });
};

//// Extra directions

add_direction_pair("northnorthwest", "southsoutheast");
parser.direction.understand("northnorthwest/nnw", parse => "northnorthwest");
parser.direction.understand("southsoutheast/sse", parse => "southsoutheast");

parser.direction.understand(["upstairs", "up stairs", "up the stairs"], parse => "up");
parser.direction.understand(["downstairs", "down stairs", "down the stairs"], parse => "down");

//// Other silly verbs

parser.action.understand("about", parse => asking_about("Irving Q. Tep", "virtual house tour"));
// TODO: make 'quit' have you quit the game, and you end up at a computer in the house
parser.action.understand("quit", parse => making_mistake("{Bobs} should try closing the tab instead."));

all_are_mistakes(["oh/ok"], "Exactly.");
all_are_mistakes(["nice", "nice tour"], `Thanks. Now don't forget to come by real-tEp/Xi\u2122!`);
parser.action.understand("cd ..", parse => exiting());
parser.action.understand("cd [somewhere x]", parse => going_to(parse.x));
parser.action.understand("pwd/dir", parse => looking());
all_are_mistakes(["rm/su/sudo [text x]"], `Nice try, buster.`);
parser.action.understand(["where am i", "where am i ?"], parse => looking());
all_are_mistakes(["cd", "go home"], "But you already are home!");
all_are_mistakes(["honig"], `"Honig!" you shout.  You can hear vigorous acclamation all around you.`);
all_are_mistakes(["in the name of honig"], "Amen.");
all_are_mistakes(["what ?"], `You just had to
say that, didn't you.  "What?" "What?" "What?" you hear xisters
everywhere yelling back and forth throughout the house.  Finally, some
tEp/Xi figures out what's going on and silences them with "No one is
peldging, stop it!"`);
all_are_mistakes(["i wanna peldge"], `This is
virtual tEp/Xi.  If you have a bid and you're wanting to peldge, then say
the magic words where real tEp/Xi can hear you!`);
all_are_mistakes(["pray/amen"], `A chorus of
angelic voices augment that of the chaplain, whom you find suddenly
next to you.  "In the name of Honig, Amen," he ends.  As you turn to
thank him for such a beautiful prayer, you see he has already slipped
away.`);
all_are_mistakes(["tep/xi/tepxi"], "That's where you are.");
all_are_mistakes(["why/how [text x]"], () => {
  out.write_text("[");
  out.write(`Sometimes while I wait for my hard drive to rev up I
wistfully contemplate what it would have been like to be able to
answer a question like that.  Alack-a-day, that was not my fate.`);
  out.write_text("]");
});
all_are_mistakes(["pickles ?"], `"I didn't make this tour!"
[ob 'Irving Q. Tep' Irving] explains, "I just repeat what I'm told."`);

all_are_mistakes(["eit", "eit!"], "Eit indeed!");

var faces = [":)", ":-)", ":(", ":-(", ";-)", ":P", ":-P", ":-D", ";)", ";P"];
faces.forEach(face => { // warning: :-/ will cause an error with 'understand'
  parser.action.understand(face, parse => making_mistake(() => {
    out.write("Oooh! Let me try![para]");
    // This should be replaced by some textadv utility function at some point (once it exists)
    out.write_text(faces[Math.floor(Math.random() * faces.length)]);
  }));
});

parser.action.understand("gruesz [something x]", parse => taking(parse.x));

parser.action.understand("die", parse => attacking(world.actor));

actions.before.add_method({
  when: action => action.verb === "attacking",
  handle: function (action) {
    if (action.dobj === "GRA") {
      throw new abort_action(`The GRA wisely stays away from {us}.
      "Remember the zeroth [ask 'rules of tEp/Xi' 'rule of tEp/Xi']!"
      {we} hear them say from a safe distance, "Don't die!"`);
    } else {
      throw new abort_action(`The GRA comes out of nowhere, preventing
      {us}. "Remember the zeroth [ask 'rules of tEp/Xi' 'rule of tEp/Xi']!"
      they say, "Don't die!"`);
    }
  }
});

all_are_mistakes(["burn down tep"], `The GRA
comes out of nowhere, preventing {us}. "Remember the zeroth
[ask 'rules of tEp/Xi' 'rule of tEp/Xi']!" they say, "Don't die!"`);

all_are_mistakes(["sleep"], `You're too excited about the house tour to sleep right now!`);

// The free willy net says you can't get out even though you can...
all_are_mistakes(
  ["I thought I/you couldn't [text x]",
   "I thought you said [text x]",
   "you said [text x]",
   "but you said [text x]"],
  "Sometimes we make mistakes.");

//// Floors

// Since Avril seems to really want to be able to sit on floors.

def_kind("floor", "supporter");
world.is_scenery.add_method({
  when: x => world.is_a(x, "floor"),
  handle: x => true
});
world.enterable.add_method({
  when: x => world.is_a(x, "floor"),
  handle: x => true
});

actions.report.add_method({
  when: action => action.verb === "entering" && world.is_a(action.dobj, "floor"),
  handle: function (action) {
    out.write("{Bobs} {have} sat down on "); out.the(action.dobj); out.write(".");
  }
});

var floor_templates = {
  "wood": {
    words: ["wood", "@floor"],
    description: `It's a gorgeous old wood floor that has
    possibly been refinished recently.`
  },
  "carpet": {
    name: "carpet",
    words: ["carpet", "@carpet", "@floor"],
    description: `The floor is covered in a fine-knit
    commercial carpet.  Luckily it's a dark blue color,
    otherwise it wouldn't seem nearly as clean.`
  },
  "sidewalk": {
    name: "sidewalk",
    description: `It's a standard concrete sidewalk.  Doubtless
    you've seen one of these before.`
  },
  "tile": {
    name: "tile floor",
    description : `It's a floor made of square tiles which are a
    foot to the side.`
  }
};

var FLOOR_COUNTER = 0;
function add_floor(location, template, name=null) {
  if (name === null) {
    name = ":unique floor: " + (++FLOOR_COUNTER);
  }
  if (typeof template === "string") {
    template = floor_templates[template];
  }
  def_obj(name, "floor", Object.assign({name: "floor"}, template));
  world.put_in(name, location);
}

//// Sitting

function sitting() {
  return {verb: "sitting"};
}
def_verb("sitting", "sit", "sitting");
parser.action.understand(["sit", "sit down"], parse => sitting());

actions.before.add_method({
  name: "sitting find floor or other enterable",
  when: action => action.verb === "sitting",
  handle: function (action) {
    // First try sitting on the floor.
    for (var floor of world.all_of_kind("floor")) {
      if (world.accessible_to(floor, world.actor)) {
        throw new do_instead(entering(floor), true);
      }
    }
    // Next try getting on a supporter.
    for (var thing of world.all_of_king("supporter")) {
      if (world.enterable(thing) && world.accessible_to(thing, world.actor)) {
        throw new do_instead(entering(thing), true);
      }
    }
    throw new abort_action("{We} {don't} want to sit down here.");
  }
});

//// Eiting

function eiting(x) {
  return {verb: "eiting", dobj: x};
}
def_verb("eiting", "eit", "eiting");
parser.action.understand("eit [something x]", parse => eiting(parse.x));

require_dobj_accessible("eiting");

actions.before.add_method({
  name: "eiting default",
  when: action => action.verb === "eiting",
  handle: function (action) {
    throw new abort_action("{Bobs} {don't} think it would be wise to eit that.");
  }
});

function eiting_with(x, y) {
  return {verb: "eiting with", dobj: x, iobj: y};
}
def_verb("eiting with", "eit", "eiting", "with");
parser.action.understand("eit [something x] with [something y]",
                         parse => eiting_with(parse.x, parse.y));

require_dobj_accessible("eiting with");
require_iobj_held("eiting with");

actions.before.add_method({
  name: "eiting with default",
  when: action => action.verb === "eiting with",
  handle: function (action) {
    throw new abort_action("{Bobs} {don't} think it would be wise to eit that.");
  }
});

//// Defilements

// This is carefully set up so that you can ask other people to defile things
// (once textadv supports asking_to).

def_property("defilements", 1, {
  doc: "A list of {actor, method} pairs."
});
world.defilements.add_method({
  name: "default no defilements",
  handle: (x) => []
});

function defiling(x, method) {
  return {verb: "defiling", dobj: x, method: method};
}
def_verb("defiling", "defile", "defiling");

parser.action.understand("felch [something x]", parse => defiling(parse.x, "felched"));
parser.action.understand("pee on [something x]", parse => defiling(parse.x, "peed on"));
parser.action.understand("pee in [something x]", parse => defiling(parse.x, "peed in"));
parser.action.understand("poop on [something x]", parse => defiling(parse.x, "pooped on"));
parser.action.understand("poop in [something x]", parse => defiling(parse.x, "pooped in"));
parser.action.understand("poop down [obj 'center stairwell']",
                         parse => defiling("center stairwell", "pooped down"));

require_dobj_accessible("defiling");

actions.before.add_method({
  name: "defile undefiled",
  when: action => action.verb === "defiling",
  handle: function (action) {
    this.next();
    for (let {actor, method} of world.defilements(action.dobj)) {
      if (actor === world.actor && method === action.method) {
        out.write("{Bobs} {have} already ");
        out.write_text(method); out.write(" ");
        out.the(action.dobj); out.write(".");
        throw new abort_action();
      }
    }
  }
});
actions.before.add_method({
  name: "defiling in containers",
  when: action => action.verb === "defiling" && action.method.endsWith(" in"),
  handle: function (action) {
    this.next();
    if (!world.is_a(action.dobj, "container")) {
      throw new abort_action("That can only be done to containers.");
    }
    if (world.openable(action.dobj) && !world.is_open(action.dobj)) {
      out.write("That can only be done when "); out.the(action.dobj);
      out.write(" is open.");
      throw new abort_action();
    }
  }
});
actions.carry_out.add_method({
  name: "defiling",
  when: action => action.verb === "defiling",
  handle: function (action) {
    world.defilements.set(action.dobj,
                          world.defilements(action.dobj).concat([{actor: world.actor,
                                                                  method: action.method}]));
  }
});
actions.report.add_method({
  name: "defiling",
  when: action => action.verb === "defiling",
  handle: function (action) {
    out.write("The deed has been done.");
  }
});

function describe_object_defilements(o) {
  out.para();
  world.describe_object.described = true;

  let ds = world.defilements(o);
  for (let culprit of new Set(ds.map(d => d.actor))) {
    let methods = ds.filter(d => d.actor === culprit);
    if (culprit !== world.actor) {
      out.The(culprit); out.write(" has ");
      out.serial_comma(methods.map(d => () => out.write_text(d.method)));
      out.write(" "); out.the(o); out.write(".");
    } else {
      out.write("{Bobs} {have} ");
      out.serial_comma(methods.map(d => () => out.write_text(d.method)));
      out.write(" "); out.the(o); out.write(".");
    }
  }
}

world.describe_object.add_method({
  name: "describe defiled",
  when: o => world.defilements(o).length > 0,
  handle: function (o) {
    this.next();
    describe_object_defilements(o);
  }
});

//// Ladders

def_property("is_ladder", 1, {
  doc: "Represents whether something is a ladder.  This means climbing is understood as entering."
});
world.is_ladder.add_method({
  name: "default not ladder",
  handle: (x) => false
});
instead_of(({verb, dobj}) => verb === "climbing" && world.is_ladder(dobj),
           action => entering(action.dobj), true);

parser.action.understand("climb/go up/down [something x]", parse => climbing(parse.x));

///
/// The player
///

def_obj("player", "person", {
  proper_named: false,
  words: ["@player", "@yourself", "@self", "@me"],
  description: "You're figuring stuff out."
}, {put_in: "253 Commonwealth Ave"});

///
/// Irving Q. Tep
///

def_obj("Irving Q. Tep", "person", {
  gender: "male",
  proper_named : true,
  description : `It's Irving Q. Tep, spirit of the house.  He
  is giving you stories and such [enter_inline i]telepathically[leave] using
  images and text.  Quite amazing.

  [para]You can ask Irving Q. Tep about various concepts. For
  instance "[action 'ask about stupidball']" (which is shorthand
  for "[action 'ask Irving about stupidball']"), and for your convenience
  you can click "ask irving" in the lower right corner to get a list of
  everything you can ask about.  If you know something
  that Irving doesn't yet know but should, please let us know!`
  // developers: see [ask ...] for links
}, {make_part_of: "player"});

// Dealing with how there's a period:
parser.anything.understand("irving q. tep", parse => "Irving Q. Tep");

///
/// Objects that are everywhere
///

def_obj("rat", "backdrop", {
  backdrop_locations: "everywhere",
  added_words: ["@rats"],
  description: `It's a big fat rat scurrying around, or so it sounds like (it says well out of view).`,
  no_take_msg: `You make a valiant attempt to locate and get ahold of the rat,
  but it hides under some old psets and when you peer under them it's gone!`
  // what if there is a network of portals the rats use to get to Lake Cujo?
});

def_obj("cat", "backdrop", {
  backdrop_locations: "everywhere",
  added_words: ["@cats"],
  description: `It's a cat! It's also probably why there are so few rats
  around tEp/Xi these days.`,
  no_take_msg: `You manage to grab ahold of the cat for a while, petting it furiously
  and making a wide assortment of "it's a cat!" faces.  But it ultimately worms its
  way out of your arms and scampers away on important cat business.`
});

def_obj("Xis", "person", {
  added_words: ["@xi"],
  is_scenery: true,
  description: `(Please just imagine there are Xis around doing zany things.
The rush budget went into 600 pounds of oobleck rather than implementing NPCs with
more depth than a puddle of spilled milk.)`
});
actions.before.add_method({
  when: action => action.verb === "taking" && action.dobj === "Xis",
  handle: function (action) {
    throw new abort_action("They wouldn't appreciate that.");
  }
});

def_obj("GRA", "person", {
  added_words: ["resident", "@advisor"],
  is_scenery: true,
  description: `Like Spiderman, the GRA can feel when there's trouble,
and they appears when they're needed.  And that time is not now.`
});
actions.before.add_method({
  when: action => action.verb === "taking" && action.dobj === "GRA",
  handle: function (action) {
    throw new abort_action(`Assuming you saw them, the GRA wouldn't appreciate that, but you don't so you can't.`);
  }
});

world.move_backdrops.add_method({
  handle: function () {
    this.next();
    world.put_in("Xis", world.location(world.actor));
    world.put_in("GRA", world.location(world.actor));
  }
});


///
/// In front of tEp/Xi: 253 Commonwealth Ave
///

def_obj("253 Commonwealth Ave", "room", {
  description: `[img 1/253/look.JPG left]You are standing
  outside the illustrious tEp/Xi, the
  veritable purple palace.  It is a hundred-twenty-two-year-old brownstone
  in the middle of Boston's Back Bay.  Outside the building is
  [a 'purple tree'] and [a 'park bench'].

  [para]Just to the north is [ob 'front door' 'the door'] to enter tEp/Xi.

  [para]You can look [look east] and [look west] along the
  street, [look up] at tEp/Xi, and [look south] toward the mall.`
});
// https://backbayhouses.org/253-commonwealth/ shows was built in 1880-1881 and purchased in 1958
// so the house is actually about 144 years old as of 2024.
// (fun fact: Curry College operated out of 253 in the 1940s, named after Haskell Curry's dad)

add_floor("253 Commonwealth Ave", "sidewalk");

world.direction_description.set("253 Commonwealth Ave", "west", `
[img 1/253/look_w.JPG left]Toward the west, you see that the
[ob 'purple tree'] is the only purple tree along the block.`);
world.direction_description.set("253 Commonwealth Ave", "east", `
[img 1/253/look_e.JPG left]Toward the east, you see that the
[ob 'purple tree'] is the only purple tree along the block.`);
world.direction_description.set("253 Commonwealth Ave", "south", `
[img 1/253/look_s.JPG left]Looking southward, you see the mall, that
grassy area between the two streets of Commonwealth Avenue.
Directly in front of tEp/Xi is a monument to historic women of Boston,
erected after some xisters wrote to the city multiple times
about how unfair it was that our block was the only one without any
kind of monument.`);
world.direction_description.set("253 Commonwealth Ave", "up", `
[img 1/253/look_up.JPG left]You look up and see a bit of the
[ob 'purple tree'] along with a few of the five floors of tEp/Xi.`);

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "north"
                             && world.containing_room(world.actor) === "253 Commonwealth Ave"),
           action => looking());
instead_of(({verb, dir}) => (verb === "looking toward" && dir === "down"
                             && world.containing_room(world.actor) === "253 Commonwealth Ave"),
           action => examining("front garden"));

world.no_go_msg.add_method({
  when: (x, dir) => x === "253 Commonwealth Ave",
  handle: (x, dir) => `You head away from tEp/Xi, but you begin to realize the
rest of the neighborhood is just a dense bank of fog. You've heard this
virtual tEp/Xi is hosted in the cloud, and if you go that way you might fall off!`
});

def_obj("tEp/Xi", "backdrop", {
  proper_named: "tEp/Xi",
  added_words: ["@house"],
  backdrop_locations: ["253 Commonwealth Ave", "The Backlot"]
});
instead_of(({verb, dobj}) => verb === "examining" && dobj === "tEp/Xi",
           action => looking(), true);
instead_of(({verb, dobj}) => (verb === "entering" && dobj === "tEp/Xi"
                              && world.containing_room(world.actor) === "253 Commonwealth Ave"),
           action => going("north"), true);
instead_of(({verb, dobj}) => (verb === "entering" && dobj === "tEp/Xi"
                              && world.containing_room(world.actor) === "The Backlot"),
           action => going("south"), true);
instead_of(({verb, dir}) => (verb === "going" && dir === "in"
                               && world.accessible_to("tEp/Xi", world.actor)),
           action => entering("tEp/Xi"), true);


def_obj("front garden", "container", {
  is_scenery: true,
  enterable: true,
  description: `[img 1/253/garden.JPG left]This is the front
  garden, in which are [the 'purple tree'] and [a 'park bench'].`
}, {put_in: "253 Commonwealth Ave"});

def_obj("purple tree", "thing", {
  is_scenery: true,
  is_ladder: true,
  description: `[img 1/253/tree.JPG left]Looking both ways,
  you see that this is the only purple tree along the entire
  avenue.  It's very purple.  Below it is [the 'front garden'].`,
  no_enter_msg: `You have a merry time sitting in the tree, and then you get down.`
}, {put_in: "253 Commonwealth Ave"});

def_obj("park bench", "supporter", {
  is_scenery: true,
  enterable: true,
  description: `[img 1/253/bench.jpg left]Sitting in [the 'front garden']
  is this handmade park bench wrought from steel, built by a previous tEp/Xi.
  After a few years of use, it's been bent quite out of whack.`
}, {put_in: "front garden"});

actions.report.add_method({
  when: action => action.verb === "entering" && action.dobj === "park bench",
  handle: function (action) {
    out.write(`You sit on [the 'park bench'], while the metal twists and bends under
    the load, it holds you well enough.`);
  }
});

def_obj("front door", "door", {
  added_words: ["@doors"],
  reported: false,
  lockable: true,
  description: `[img 1/253/doors.JPG left]It's a big, old
  door.  Through the glass, you can make out some blinking LED lights
  hanging from the stairwell. Why not [action 'knock']?`,
  is_locked: () => world.containing_room(world.actor) === "253 Commonwealth Ave"
});
world.no_lock_msg.set("front door", "no_open", `It's locked. Perhaps you
should ring [the doorbell].`);
world.connect_rooms("253 Commonwealth Ave", "north", "The Foyer", {via: "front door"});

def_obj("doorbell", "thing", {
  added_words: ["door", "@bell"],
  is_scenery: true,
  description: `[img 1/253/doorbell.jpg left]It's a small,
  black button, and you almost didn't notice it.  The FedEx guy
  has said he enjoys this doorbell.`
}, {put_in: "253 Commonwealth Ave"});
parser.action.understand("ring/push/press [obj doorbell]", parse => using("doorbell"));
parser.action.understand("knock", parse => {
  if (world.containing_room(world.actor) === "253 Commonwealth Ave") {
    return making_mistake(`You knock on the front door, but no one hears you.
    Perhaps you should [action 'ring the doorbell'].`);
  } else {
    return undefined;
  }
});
actions.before.add_method({
  when: action => action.verb === "using" && action.dobj === "doorbell",
  handle: function (action) { }
});
actions.carry_out.add_method({
  when: action => action.verb === "using" && action.dobj === "doorbell",
  handle: function (action) {
    world.put_in("player", "The Foyer");
  }
});
actions.report.add_method({
  when: action => action.verb === "using" && action.dobj === "doorbell",
  handle: function (action) {
    out.write(`You hear a loud subwoofer buzzing at 32 Hz, and,
    after a few moments, footsteps down the stairs.  A young xister opens
    the door for you and leads you in.  "Ah, I see you're getting the
    virtual house tour from [ob 'Irving Q. Tep']," they say.  "Those
    are really good!"  Before running off, they bring you to...`);
  }
});

actions.try_before.add_method({
  when: action => (action.verb === "going" && action.dir === "north"
                   && world.containing_room(world.actor) === "253 Commonwealth Ave"),
  handle: function (action) {
    out.write(`The door is locked.  Looking around the door, you find a
    doorbell, and you ring that instead.[para]`);
    throw new do_instead(using("doorbell"), true);
  }
});

def_obj("car", "thing", {
  is_scenery: true,
  description: `This is one of those cars that the neighbors like to buy.`
}, {put_in: "253 Commonwealth Ave"});

def_obj("front steps", "supporter", {
  added_words: ["@stoop"],
  enterable: true,
  is_scenery: true,
  description: `The front steps are a nice place to sit on when the weather's nice.
  They lead up to [the 'front door'] and into tEp/Xi.`
}, {put_in: "253 Commonwealth Ave"});

/*******************/
/*** First floor ***/
/*******************/

///
/// The Foyer
///

def_obj("The Foyer", "room", {
  description : `[img 1/foyer/look.jpg left]This is the foyer.
  You can keep going [dir northwest] to the center room.  You
  can see [a subwoofer], [ob 'front desk' 'a desk'],
  [ob 'colorful lights'], 
  and [ob 'foyer mirror' 'a large mirror']. Something about
  [the mailboxes] catches your eye.`
});
make_known("The Foyer");
add_floor("The Foyer", "tile");

world.connect_rooms("The Foyer", "northwest", "The Center Room");

world.step_turn.add_method({ /* Close the door behind you. */
  when: () => world.containing_room(world.actor) === "253 Commonwealth Ave",
  handle: function () {
    if (world.is_open("front door")) {
      out.write("On your way out, the front door closes behind you.[para]");
      world.is_open.set("front door", false);
    }
    this.next();
  }
});

instead_of(({verb, dir}) => (verb === "going" && dir === "up"
                             && world.containing_room(world.actor) === "The Foyer"),
           action => going_to("The Second Landing"), true);
instead_of(({verb, dir}) => (verb === "going" && dir === "out"
                             && world.containing_room(world.actor) === "The Foyer"),
           action => going("south"), true);
instead_of(({verb, dir}) => (verb === "going" && dir === "north"
                             && world.containing_room(world.actor) === "The Foyer"),
           action => going("northwest"), true);

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "north"
                             && world.containing_room(world.actor) === "The Foyer"),
           action => examining("colorful lights"));
instead_of(({verb, dir}) => (verb === "looking toward" && (dir === "west" || dir === "east")
                             && world.containing_room(world.actor) === "The Foyer"),
           action => examining("foyer mirror"));

def_obj("subwoofer", "thing", {
  is_scenery: true,
  no_take_msg: "The subwoofer is too heavy to carry with you.",
  description: `[img 1/foyer/subwoofer.JPG left]This is the
  combination subwoofer and frequency generator that emits the
  32 Hz buzz for the doorbell.`
}, {put_in: "The Foyer"});
def_obj("front desk", "thing", {
  is_scenery: true,
  description: `[img 1/foyer/desk.JPG left]This is the front
  desk, upon which is a cheap computer that people use to check
  bus schedules or show people YouTube videos.`
}, {put_in: "The Foyer"});
def_obj("key box", "thing", {
  is_scenery: true,
  description: `[img 1/foyer/keybox.JPG left]This box of car
  keys has a place for every parking spot out back. It helps
  prevent people from getting boxed in.`
}, {put_in: "The Foyer"});
def_obj("colorful lights", "thing", {
  words: ["colorful", "color", "changing", "color-changing", "@lights"],
  is_scenery: true,
  description: `[img 1/foyer/lights.jpg left]These are the
  color-changing lights you could see from out front.`
}, {put_in: "The Foyer"});
def_obj("mailboxes", "container", {
  words: ["mail", "@box", "@boxes", "@mailboxes", "@mailbox"],
  is_scenery: true,
  description: `[img 1/foyer/mailboxes_2024.jpg left]These boxes
  hold mail of current xisters, past tEp/Xis, and summer renters.
  Most of the names seem to blur into nothingness, but [ask 'honig' 'one name
  in particular stands out to you'].`,
  no_take_msg: "That mail is not yours."
}, {put_in: "The Foyer"});
all_are_mistakes(["steal [obj mailboxes]"], `Virtual house tour or not, that is a felony.`);

def_obj("foyer mirror", "thing", {
  name: "large mirror",
  is_scenery: true,
  description: `[img 1/foyer/mirror.JPG left]This is one of
  the two large mirrors in the foyer.  In it you can see the
  other one.`
}, {put_in: "The Foyer"});
def_obj("Op box", "supporter", {
  printed_name: "the Op box",
  added_words: ["out", "@outbox"],
  enterable: true,
  proper_named: true,
  description : `[img 1/foyer/opbox_2024.jpg left]The Op box is
  named after Charles Oppenheimer, the first Captain tEp/Xi.  It is
  the platform upon which the captain stands to greet his
  numerous fans.  Because it sits outside of tEp/Xi during rush, it
  is also known as the outbox.`,
  locale_description : `From atop the Op box, you feel a
  powerful urge to find purple spandex tights and put them on.` // TODO have tights somewhere
}, {put_in: "The Foyer"});

///
/// Center Room
///

def_obj("The Center Room", "room", {
  description: `[img 1/center/look_2024.jpg left]This is the
  center room, which is a common area at tEp/Xi.  Around you are
  composite photos from the past decade, and [a 'chandelier']
  that seems like it has seen better days.  Looking up, you can
  see the [ob 'center stairwell'].

  [para]You can go [dir south] to the front room, [dir north]
  to the dining room, [dir upstairs] to the second floor, [dir
  northeast] to the back stairwell, or [dir southeast] back to
  the foyer, and you can look [look north], [look south],
  [look east], [look west], and [look up].`
});
add_floor("The Center Room", "carpet");
make_known("The Center Room");

world.connect_rooms("The Center Room", "up", "The Second Landing");
world.connect_rooms("The Center Room", "south", "The Front Room");
world.connect_rooms("The Center Room", "north", "The Dining Room");
world.connect_rooms("The Center Room", "northeast", "back_stairwell_1");

world.direction_description.set("The Center Room", "north", `
[img 1/center/look_n_2024.jpg left]You see the comfy couch,
[the king], [the 'floof'], and [the 'bulletin board'].  You
can go [dir north] into the dining room and [dir northeast] into the
back stairwell.`);
world.direction_description.set("The Center Room", "east", `
[img 1/center/look_e_2024.jpg left]You can see
[the 'floof'].  You can go [dir upstairs] to the second landing and
[dir southeast] into the foyer.`);
world.direction_description.set("The Center Room", "south", `
[img 1/center/look_s_2024.jpg left]In the corner is [a 'player piano'].
On the wall is [a 'zombie protection box']. You can go [dir southeast]
into the foyer and [dir south] into the front room.`);
world.direction_description.set("The Center Room", "west", `
[img 1/center/look_w_2024.jpg left]You can see the comfy couch and the
Xi board where xiblings post announcements, jokes, and silly images`);
world.direction_description.set("The Center Room", "up", `
[img 1/center/stairwell.JPG left]Looking up, you see the center
stairwell, which is three flights of stairs capped by a skylight.  The
color-changing lights illuminate it dramatically.`);

def_obj("bulletin board", "thing", {
  is_scenery: true,
  description : `[img 1/center/bulletin_2024.jpg left]This is a
  bulletin board on which tEp/Xis affix funny things they found in
  the mail, cute things prefrosh wrote, pictures, postcards from
  [ask 'druler' drooling] alumni, and other miscellaneous artifacts.`
  // TODO every time you look you see a description of an interesting thing on the board
}, {put_in: "The Center Room"});
def_obj("floof", "supporter", {
  added_words: ["beanbag"],
  is_scenery: true,
  enterable: true,
  description: `[img 1/center/floof_2024.jpg left]This is a nice place to rest
  after a long day of work. It's also a great place to drop things onto from the
  center stairwell. Just make sure to yell "DROP" first!`
}, {put_in: "The Center Room"});

//TODO: closer image of piano
//TODO: capability to play the piano
def_obj("player piano", "thing", {
  added_words: ["piano", "player piano", "player"],
  is_scenery: true,
  description: `[img 1/center/playerpiano_2024.jpg left]An xibling long ago got the house
  a player piano. As things in this house tend to do, it broke. Later xiblings found
  another player piano being donated so we have a piano again. It can be played regularly
  or you can place one of our many scrolls in and have it play by itself.`
}, {put_in: "The Center Room"});

// def_obj("comfy couch", "supporter", {
//   added_words: ["@sofa"],
//   is_scenery: true,
//   enterable: true,
//   description: `[img 1/center/couch.JPG left]This is perhaps
//   the comfiest couch in all of existence.  A neighbor came by
//   one day and said, "hey, you're a fraternity, so you probably
//   like couches.  I have a couch."  With his help, we then
//   brought it to its present location.  True couch aficionados
//   make a pilgrimage to our center room at least twice a year.`
// }, {put_in: "The Center Room"});

// def_obj("foosball table", "container", {
//   added_words: ["foos", "fooz"],
//   is_scenery: true,
//   openable: true,
//   suppress_content_description: (x) => !world.is_open(x),
//   description : `[img 1/center/foosball.JPG left]This is a
//   commercial-quality foosball table which is covered with flecks
//   of colorful paint that, while making it look cool under color
//   changing lights, make it hard to play foosball.  Alumni have
//   looked at it and remininsced to one another, "remember how
//   much the foosball table cost us when we got it?"`
// }, {put_in: "The Center Room"});
// def_obj("human skull", "thing", {
//   description : `This is a human skull, but it's missing its
//   jaw from when some Nokia engineers were playing with it at
//   [ask 'hot cocoa' cocoa] one Monday night.  It's unknown why there is such a
//   thing in the house.`
// }, {put_in: "foosball table"});

// parser.action.understand("play [obj 'foosball table']", action => using("foosball table"));
// actions.before.add_method({
//   when: ({verb,dobj}) => verb === "using" && dobj === "foosball table",
//   handle: () => {}
// });
// actions.report.add_method({
//   when: ({verb,dobj}) => verb === "using" && dobj === "foosball table",
//   handle: function () {
//     out.write(`"Click! Click!" go the volleys as the ball skids
//     across the surface of the foosball table, with some non-negligible
//     interference from all the colorful paint.  It's a close match, but
//     your dexterity at the table is impressive!  The game reaches
//     sudden death, and your feet playing yellow narrowly beat your
//     hands playing black.  The handshake is confusing, and your hands
//     and feet decide to make it brief.  Good show.`);
//   }
// });


def_obj("king", "thing", {
  printed_name : "The King",
  proper_named : true,
  is_scenery : true,
  no_take_msg: `That's always been there.  You shouldn't move it.`, // TODO puzzle to move it?
  description: `[img 1/center/king.JPG left]It's a portrait
  of The King (that is, Elvis Presley to you younger folk on the
  tour), modeled after a ceramic bust that met an explosive end.

  [para]It's always been there.  According to rumors, it appeared sometime
  during the Back Bay reclamation project in this exact position, and, in a move
  prefiguring Frank Lloyd Wright, the architect built the house around it.
  How an image of Presley was produced in the 19th century is uncertain.`
}, {put_in: "The Center Room"});
def_obj("mantle", "supporter", {
  is_scenery: true,
  description : `[img 1/center/mantle.JPG left]The mantle
  contains random things like awards for our GPA, plaques for
  people who won scholarships ten years ago, and a copy of the
  MIT yearbook from the 1970s.`
}, {put_in: "The Center Room"});
def_obj("zombie protection box", "thing", {
  is_scenery: true,
  description: `[img 1/center/zombie.JPG left]This was
  recently installed to bring tEp/Xi up to zombie code.`
}, {put_in: "The Center Room"});

def_obj("chandelier", "thing", {
  is_scenery: true,
  description: `[img 1/center/chandelier.JPG left]This
  chandelier, which is affixed to the center of the ceiling, has
  clearly been [ask eit eited] many times over the years by the
  game of [ask stupidball].  One time, during one particularly
  rousing game, all of the sconces exploded simultaneously in a shower of
  glittering glass.  It was really a sight to see.`
}, {put_in: "The Center Room"});

def_obj("ex_ball", "supporter", {
  name: "large green exercise ball",
  words: ["big", "large", "green", "exercise", "stupid", "@ball", "@stupidball"],
  enterable: true,
  description: `[img 1/center/stupidball.jpg]This is a large
  green exercise ball that is used to play [ask stupidball].`
}, {put_in: "The Center Room"});

parser.action.understand("play/kick/throw/bounce [obj ex_ball]",
                         parse => using("ex_ball"));
actions.before.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "ex_ball",
  handle: () => {}
});
actions.report.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "ex_ball",
  handle: function () {
    out.write(`A couple of teps come out to join playing [ask stupidball]
    you as you kick [the ex_ball] around the room, and you nearly break a
    couple of things as the ball whizzes through the air at high velocities.
    After much merriment, you all get bored of the game, and put the
    ball down.`);
  }
});


actions.report.add_method({
  when: ({verb,dobj}) => verb === "dropping" && dobj === "ex_ball",
  handle: function (action) {
    out.write("It bounces a few times before it settles down.");
  }
});
world.global.set("ex_ball jump", 0);
actions.carry_out.add_method({
  when: action => action.verb === "jumping" && world.location(world.actor) === "ex_ball",
  handle: function (action) {
    var i = world.global("ex_ball jump");
    world.global.set("ex_ball jump", i + 1);
    if (i % 2 === 0) {
      world.put_in(world.actor, world.parent_enterable("ex_ball"));
      action.jump_from = "ex_ball";
    }
  }
});
actions.report.add_method({
  when: action => action.verb === "jumping",
  handle: function (action) {
    out.write(`You hop around on the ball awhile, and you surprise
    yourself with your skill.`);
  }
});
actions.report.add_method({
  when: action => action.verb === "jumping" && action.jump_from === "ex_ball",
  handle: function (action) {
    out.write("You fly through the air with the greatest of whee's before tumbling to the ground.");
  }
});

def_obj("broken chandelier", "thing", {
  is_scenery: true,
  description: `This chandelier, which is affixed to the
  center of the ceiling, has been [ask eited], and now half of
  the lights don't work any more.  Good job.`
});
def_obj("broken sconce", "thing", {
  description: `It's half a sconce that fell from the
  [ask eit eiting] of the [ob chandelier].`
});

actions.before.add_method({
  when: action => action.verb === "eiting" && action.dobj === "chandelier",
  handle: function (action) {
    throw new abort_action(`The chandelier is too high up for you to eit.
    Maybe there's something you could eit it with.`);
  }
});
actions.before.add_method({
  when: action => ((action.verb === "eiting" || action.verb === "eiting with")
                   && action.dobj === "broken chandelier"),
  handle: function (action) {
    throw new abort_action(`That's already well-eited.`);
  }
});

actions.before.add_method({
  when: action => action.verb === "eiting with" && action.dobj === "chandelier",
  handle: function (action) {
    if (action.iobj !== "ex_ball") {
      throw new abort_action(`Experience tells me that the exercise ball
      would be better for that.`);
    }
    // otherwise ok
  }
});

actions.carry_out.add_method({
  when: action => action.verb === "eiting with" && action.dobj === "chandelier",
  handle: function (action) {
    world.remove_obj("chandelier");
    world.put_in("broken chandelier", "The Center Room");
    world.put_in("broken sconce", "The Center Room");
    world.put_in(action.iobj, "The Center Room");
  }
});
actions.report.add_method({
  when: action => (action.verb === "eiting with" && action.dobj === "chandelier"
                   && action.iobj === "ex_ball"),
  handle: function (action) {
    out.write(`Good plan. You kick the large green exercise ball with vim and
    vigor straight into the chandelier.  Half the sconces explode on impact
    in a showering display of broken glass, and the other half are damaged
    when the chain breaks the chandelier's fall.  One of the sconces
    tumbles out onto the floor.  There didn't need to be that much light in
    this room anyway.`);
  }
});

///
/// Center stairwell region
///

// Region that contains the center stairwell
def_obj("r_center_stairs", "region", {
  name: "center stairwell region"
});
world.put_in("The Second Landing", "r_center_stairs");
world.put_in("The Third Landing", "r_center_stairs");
world.put_in("The Fourth Landing", "r_center_stairs");
world.put_in("51", "r_center_stairs");

def_obj("center stairwell", "backdrop", {
  added_words: ["@stairs"],
  backdrop_locations: ["The Center Room", "r_center_stairs"]
});

instead_of(({verb, dobj}) => verb === "examining" && dobj === "center stairwell",
           action => looking_toward("down"), true);
instead_of(({verb, dobj}) => (verb === "examining" && dobj === "center stairwell"
                              && world.containing_room(world.actor) === "The Center Room"),
           action => looking_toward("up"), true);

parser.action.understand("look up [obj 'center stairwell']", action => looking_toward("up"));
parser.action.understand("look down [obj 'center stairwell']", action => looking_toward("down"));

actions.report.add_method({
  when: ({verb, dir}) => (verb === "looking toward" && (dir === "up" || dir === "down")
                          && world.accessible_to("center stairwell", world.actor)),
  handle: function (action) {
    describe_object_defilements("center stairwell");
  }
});

// throwing things down

parser.action.understand("drop/throw [something x] down/into [obj 'center stairwell']",
                         parse => inserting_into(parse.x, "center stairwell"));

actions.try_before.add_method({
  when: action => action.verb === "inserting into" && action.iobj === "center stairwell",
  handle: function (action) {
    if (world.containing_room(world.actor) === "The Center Room") {
      throw new abort_action(`{Bobs} {need} to go to a higher floor to
      drop anything down the center stairwell.`);
    } else if (action.dobj === world.actor) {
      throw new abort_action(`The GRA comes out of nowhere, preventing
      {us}. "Remember the zeroth [ask 'rules of tEp/Xi' 'rule of tEp/Xi']!"
      they say, "Don't die!"`);
    } else if (action.dobj === "GRA") {
      throw new abort_action(`Sensing trouble, the GRA appears, but sensing
      {our} intention, they run off and yell back, "remember the zeroth
      [ask 'rules of tEp/Xi' 'rule of tEp/Xi']! Don't die!"`);
    } else {
      this.next();
    }
  }
});
actions.before.add_method({
  when: action => action.verb === "inserting into" && action.iobj === "center stairwell",
  handle: function (action) { }
});

actions.carry_out.add_method({
  when: action => action.verb === "inserting into" && action.iobj === "center stairwell",
  handle: function (action) {
    world.put_in(action.dobj, "The Center Room");
  }
});

actions.report.add_method({
  when: action => action.verb === "inserting into" && action.iobj === "center stairwell",
  handle: function (action) {
    out.write('"'); out.write(str_util.cap(world.name(action.dobj)));
    out.write(` drop!!!" {we} {yell} as a warning. A moment later {we} {release} `);
    out.write(world.definite_name(action.dobj));
    out.write(` and send `);
    out.write(world.subject_pronoun(action.dobj));
    out.write(` on `);
    out.write(world.possessive_pronoun(action.dobj));
    out.write(` short journey down to the center room, where `);
    out.write(world.subject_pronoun(action.dobj));
    out.write(` bounces around and makes a large ruckus before finally settling down.`);
  }
});

///
/// Front room
///

def_obj("The Front Room", "room", {
  added_words: ["@fridge"],
  description: `[img 1/front/look.JPG left]This is where
  tEp/Xis play Super Smash Bros. after dinner every night.  The
  room is painted a majestic purple, and it's required to remain
  so because the Back Bay Architectual Commission, which cares
  very much about what the Back Bay looks like from the street,
  declared the purple paint to be "historic." There is a
  [ob piano], some [ob boats], and a [ob 'rideable dinosaur']. You
  can go [dir north] to the center room, and look [look south].`
});
make_known("The Front Room");
add_floor("The Front Room", "carpet");

world.direction_description.set("The Front Room", "south", `
[img 1/front/look_s.JPG left]To the south, you see colorful curtains
draping over the windows as well as a [ob 'rideable dinosaur'].`);

def_obj("Super Smash Bros.", "thing", {
  added_words: ["@bros", "bros", "@cartridge", "@smash"],
  is_scenery : true,
  no_take_msg: `That would be cruel to take the house's
  cartridge for Super Smash Bros.`,
  description: `This is a cartridge for the game Super Smash
  Bros., which is used most nights after dinner.`
}, {put_in: "The Front Room"});

parser.action.understand("play [obj 'Super Smash Bros.']", parse => using("Super Smash Bros."));
actions.before.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "Super Smash Bros.",
  handle: () => {}
});
actions.report.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "Super Smash Bros.",
  handle: function () {
    out.write(`You turn on the N64 console, and a couple of tEp/Xis
    immediately appear to join you to play Super Smash Bros.  They beat you with
    their incredibly high-speed reflexes.  Maybe you'll do better next
    time.`);
  }
});

def_obj("vlca", "thing", {
  printed_name: "The VLCA",
  proper_named: true,
  added_words: ["very", "large", "capacitor", "@array"],
  description : `[img 1/front/vlca.JPG left]The Very Large Capacitor Array, commonly
  known as the VLCA, consists of a good number of capacitors in
  parallel with two copper pipes at the ends, such that when
  another pipe with an empty soda can is placed
  across them, it emits bright sparks and a popping sound as the discharging
  capacitors blow a hole through the thin aluminum.`
}, {put_in: "The Front Room"});

def_obj("rideable dinosaur", "supporter", {
  enterable: true,
  is_scenery: true,
  no_take_msg: `It's too heavy to carry around.`,
  description: `[img 1/front/dinosaur.JPG left]This is a
  rideable dinosaur.  It has wheels on the bottom for you to
  scoot around.`
}, {put_in: "The Front Room"});

parser.action.understand("ride/scoot [obj 'rideable dinosaur']", parse => using("rideable dinosaur"));
parser.action.understand("ride/scoot/charge", parse => using("rideable dinosaur"));
parser.action.understand("ride/scoot/charge !", parse => using("rideable dinosaur"));

actions.try_before.add_method({
  when: action => (action.verb === "using" && action.dobj === "rideable dinosaur"
                   && world.location(world.actor) !== action.dobj),
  handle: function (action) {
    actions.do_first(entering(action.dobj), {silently: true});
  }
});
actions.before.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "rideable dinosaur",
  handle: function (action) {
    if (world.location(world.actor) !== action.dobj) {
      throw new abort_action("You need to be on the rideable dinosaur to ride it.");
    }
  }
});
actions.report.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "rideable dinosaur",
  handle: function (action) {
    out.write(`You take the rideable dinosaur out for a spin.
    The wind blows through your hair and you feel alive.  With
    spirits rejuvenated, you park the dinosaur back where you found it.`);
  }
});

def_obj("boats", "thing", {
  words: ["@kayak", "@kayaks", "@boat", "@boats", "@canoe", "@canoes"],
  is_scenery: true,
  no_take_msg: `The boat is attached to the ceiling.`,
  description: `[img 1/front/kayak.JPG left]People regularly take the kayak
  and canoe out and ride them on the Charles River.`
}, {put_in: "The Front Room"});

def_obj("piano", "thing", {
  added_words: ["bicycle", "@bell"],
  is_scenery: true,
  description: `[img 1/front/piano.JPG left]It's a piano that's surprisingly in tune,
  considering how it isn't tuned so often.  It's used
  frequently.  Sitting on the piano is the score for
  Beethoven's Pathetique sonata, and affixed into the wood above the high C is a
  bicycle bell.`
}, {put_in: "The Front Room"});

parser.action.understand("play [obj piano]", parse => using("piano"));
parser.action.understand("ring bell", parse => using("piano"));

actions.before.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "piano",
  handle: () => {}
});
actions.report.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "piano",
  handle: function () {
    out.write(`Despite its intonation, you play a
    beautiful melody on the piano. At the big cadence at the end of
    the passage, you strengthen the resolution with a quick ring of the bicycle bell.`);
  }
});

///
/// Dining room
///

def_obj("The Dining Room", "room", {
  description : `[img 1/dining/look.JPG left]This is the
  dining room, where tEp/Xis eat.  On the ceiling is
  [the 'fork chandelier'], sitting above the fireplace is
  [the 'Tepsi machine'], and covering the west wall is [ob Tepilepsy].
  During rush, this room is used to hold a kiddie pool full of [ask oobleck].

  [para]To the [dir south] is the center room, and to the
  [dir east] is the upstairs kitchen.  You can look [look north]
  and [look east].`
});
make_known("The Dining Room");
add_floor("The Dining Room", "wood");
world.connect_rooms("The Dining Room", "east", "The Upstairs Kitchen");

world.direction_description.set("The Dining Room", "north", `
[img 1/dining/look_n.JPG left]Through the windows to the north, you
get a view of the back lot.`);
world.direction_description.set("The Dining Room", "east", `
[img 1/dining/look_e.JPG left]To the east, you see a big whiteboard
covered in tEp/Xily doodles.  You can go [dir east] into the upstairs
kitchen.`);

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "west"
                             && world.containing_room(world.actor) === "The Dining Room"),
           action => examining("Tepilepsy"));

def_obj("fork chandelier", "thing", {
  is_scenery: true,
  description: `[img 1/dining/chandelier.JPG left]This is a
  chandelier made of forks.  Stuck to it are flecks of dried
  corn starch from [ask oobleck].`
}, {put_in: "The Dining Room"});
def_obj("Tepsi machine", "thing", {
  is_scenery: true,
  description: `[img 1/dining/tepsi.JPG left]This is the
  Tepsi machine which, when it works, is stocked with grape soda.`
}, {put_in: "The Dining Room"});

actions.before.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "Tepsi machine",
  handle: () => {}
});
actions.report.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "Tepsi machine",
  handle: function () {
    out.write(`You press the buttons repeatedly, but nothing comes out.`);
  }
});

def_obj("dining room table", "supporter", {
  added_words: ["@tables"],
  enterable: true,
  is_scenery: true,
  description: `These anodized aluminum tables are durable enough to withstand
  everything they're put through`
}, {put_in: "The Dining Room"});

// TODO food fight after throwing three items of food, and you can't leave the room until you clean it up

// oobleck is a placeholder in case someone types "examine oobleck"
def_obj("oobleck", "thing", {
  is_scenery: true,
  no_take_msg: `The oobleck is very dried to and now very
  much a part of the ceiling.`
}, {put_in: "The Dining Room"});

instead_of(({verb, dobj}) => verb === "examining" && dobj === "oobleck",
           action => asking_about("Irving Q. Tep", "oobleck"));

def_obj("Tepilepsy", "thing", {
  added_words: ["Tepilepsy", "@wall"],
  is_scenery: true,
  description : `[img 1/dining/tepilepsy.jpg left]With almost
  twenty-two-hundred RGB LEDs, the Tepilepsy wall was installed
  with the help of many tEp/Xis, both recent and [ask 'druler' drooling] (thanks Gruesz!),
  and it's a beacon that's very visible from the backlot.  It displays
  visualizations of various mathematical functions as well as of
  relativistic-like distortions of a nearby webcam.  You should
  definitely ask a for a demonstration at real-tEp/Xi\u2122.`
}, {put_in: "The Dining Room"});

///
/// First floor of back stairwell
///

def_obj("back_stairwell_1", "room", {
  name: "First Floor of the Back Stairwell",
  description : `[img 1/bstairs/look_2024.jpg left]You are in the
  back stairwell.  You can go [dir upstairs] to the second
  floor, [dir southwest] to the center room, [dir north] to the
  upstairs kitchen, or [dir downstairs] into the basement. You
  can also look [look up], [look down], [look north], and [look west].`
});
make_known("back_stairwell_1");

world.direction_description.set("back_stairwell_1", "up", `
[img 1/bstairs/look_u.JPG left]You can see the patterns painted on the
walls as well as the stairs that can bring you [dir upstairs].`);
world.direction_description.set("back_stairwell_1", "down", `
[img 1/bstairs/look_d.JPG left]You see the stairs which can bring you
[dir downstairs].`);
world.direction_description.set("back_stairwell_1", "north", `
[img 1/bstairs/look_n.jpg left]To the [dir north], you see the
upstairs kitchen.  The nearby wall has been repaired numerous times
due to the fact that it's always in the way.`);
world.direction_description.set("back_stairwell_1", "west", `
[img 1/bstairs/look_w.JPG left]To the [dir west], you see part of the
center room.`);

world.connect_rooms("back_stairwell_1", "down", "Basement");
world.connect_rooms("back_stairwell_1", "north", "The Upstairs Kitchen");
world.connect_rooms("back_stairwell_1", "up", "back_stairwell_2");

///
/// The upstairs kitchen
///

def_obj("The Upstairs Kitchen", "room", {
  description: `[img 1/kitchen/look.JPG left]This is the
  upstairs kitchen.  It is the home of [ob Hobart].  To the
  [dir west] is the dining room, and to the [dir south] is the back
  stairwell, and you can look [look north] and [look west].`
});
make_known("The Upstairs Kitchen");

world.direction_description.set("The Upstairs Kitchen", "north", `
[img 1/kitchen/look_n.JPG left]Through the window in the kitchen, you
can see the back lot.`);
world.direction_description.set("The Upstairs Kitchen", "west", `
[img 1/kitchen/look_w.JPG left]On the west wall of the kitchen are all
of the dishes at tEp/Xi (minus the ones people steal to their rooms).
The categorization scheme is between bouncers (such as a
[ask Bouncer]) and breakers (such as a tea cup).`);


def_obj("Hobart", "container", {
  proper_named: true,
  is_scenery: true,
  openable: true,
  switchable: true,
  description: `[img 1/kitchen/hobart.jpg left]Hobart is not
  a dishwasher, as is explained in the [ask 'rules of tEp/Xi'].  It
  is a dish sanitizer.  He does a really good job at whatever he
  does as long as food isn't still stuck to the dishes you ask
  him to sanitize.`
}, {put_in: "The Upstairs Kitchen"});

// TODO: using hobart => switching hobart instead

actions.before.add_method({
  when: action => action.verb === "switching on" && action.dobj === "Hobart",
  handle: function () {
    throw new abort_action("Ohhh baby... Now that's sanitization.");
  }
});

// TODO have some dirty dishes in the sink to clean; elsewhere someone wants a clean bouncer?


/********************/
/*** Second floor ***/
/********************/

def_obj("The Second Landing", "room", {
  added_words: ["2nd", "floor"],
  description: `[img 2/landing/look.JPG left]This is the
  second landing.  You can go [dir southeast] to 21, [dir south]
  to 22, [dir north] to 23, [dir northeast] to the back
  stairwell, [dir upstairs], and [dir downstairs].  The
  bathrooms are to the [dir southwest] and [dir west].

  [para]You can also look [look up], [look down], [look north],
  [look east], and [look south].`
});
make_known("The Second Landing");
add_floor("The Second Landing", "carpet");
world.connect_rooms("The Second Landing", "southeast", "21");
world.connect_rooms("The Second Landing", "south", "22");
world.connect_rooms("The Second Landing", "north", "23");
world.connect_rooms("The Second Landing", "northeast", "back_stairwell_2");
world.connect_rooms("The Second Landing", "southwest", "Second Front");
world.connect_rooms("The Second Landing", "west", "Second Back");
world.connect_rooms("The Second Landing", "up", "The Third Landing");

world.direction_description.set("The Second Landing", "up", `
[img 2/landing/look_u.JPG left]Looking up the center stairwell from
the second landing, you see the parabolas traced out by purple rope
clearer.`);
world.direction_description.set("The Second Landing", "down", `
[img 2/landing/look_d.JPG left]You can see part of the center room
from here.`);
world.direction_description.set("The Second Landing", "north", `
[img 2/landing/look_n.JPG left]To the [dir north] is 23, and to the
[dir northeast] is the back stairwell.`);
world.direction_description.set("The Second Landing", "east", `
[img 2/landing/look_e.JPG left]To the east you see a way [dir upstairs].`);
world.direction_description.set("The Second Landing", "south", `
[img 2/landing/look_s.JPG left]Looking south, you see the entrance to
21 to the [dir southeast], and the entance to 22 to the [dir south].`);

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "west"
                             && world.containing_room(world.actor) === "The Second Landing"),
           action => looking());

///
/// 21
///

def_obj("21", "room", {
  description: `In your mind's eye, imagine the following:
  this room is a double, and it has a fish tank.  You can go
  [dir northwest] to the second landing.`
});
make_known("21");

///
/// 22
///

def_obj("22", "room", {
  description: `[img 2/22/look.JPG left]This is 22, which
  houses [a 'purple geodesic ball'], [the 'eit mural'],
  and [the 'liberty sign'].  Above the bay windows are
  [the 22_lights].  You can go [dir north] back to
  the second landing, and you look [look south], [look west],
  and [look north].`
});
make_known("22");
add_floor("22", "wood");

world.direction_description.set("22", "north", `
[img 2/22/look_n.JPG left]You see the exit [dir north] to the second
landing, as well as a closet to the [dir northwest].`);
world.direction_description.set("22", "west", `
[img 2/22/look_w.JPG left]On the wall to the west is [a 'buro feet'],
as well as the musical ladder, which makes different
out-of-tune pitches when you knock on each rung.`);
world.direction_description.set("22", "south", `
[img 2/22/look_s.JPG left]To the south you see the bay windows and a
window from the Liberty Caf\u00e9, the first Internet caf\u00e9 in
the northeast.`);

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "east"
                             && world.containing_room(world.actor) === "22"),
           action => examining("eit mural"));

def_obj("22_lights", "thing", {
  name: "color-changing lights",
  uncountable: true,
  added_words: ["color", "changing", "@candyland"],
  is_scenery: true,
  description: `[img 2/22/lights.JPG left]Known as
  "candyland," these are ethernet-controlled lights which can
  cycle through colors or follow music for a lightshow.`
}, {put_in: "22"});

def_obj("buro feet", "thing", {
  name: "picture of Buro's feet",
  added_words: ["portrait"],
  is_scenery: true,
  no_take_msg: `You shouldn't take that picture.  It's
  always been there.`,
  description: `[img 2/22/feet.JPG left]This is a portrait of
  the feet of Buro, a tEp/Xi of years past, who used to live in
  this room.  Along with the feet, he left a rather large 10W
  laser under a desk which made a good foot rest.`
}, {put_in: "22"});

def_obj("purple geodesic ball", "thing", {
  is_scenery: true,
  description: `[img 2/22/geodesic.JPG left]This ball was
  used to be twice its size, hanging in the center stairwell.
  It was our dreaded nemesis, the fire inspector, who made us
  take it down: he imagined the ball rolling down the center
  stairwell on fire Indiana Jones style, overrunning tEp/Xis as
  they were futilely trying to run to safety.  Since it was so
  large that you could get inside and use it like a hamster ball,
  the ball was cut down to fit where it hangs now.`
}, {put_in: "22"});

def_obj("eit mural", "thing", {
  is_scenery: true,
  description: `[img 2/22/mural.JPG left]This is a mural
  commemorating the sacrament of [ask eit].  It is modeled after
  the cover of the classic text, the Structure and
  Interpretation of Computer Programs (SICP for short), which
  any good knight of the lambda calculus has read.  The
  assistant demonstrates eit by eiting a metacircular evaluator
  from the wizard's hand.

  [para]Above the mural, you see a [ob 'liberty sign' sign] from the Liberty
  Caf\u00e9.`
}, {put_in: "22"});

def_obj("liberty sign", "thing", {
  printed_name: "Liberty Caf\u00e9 sign",
  added_words: ["cafe", "caf\u00e9"],
  is_scenery: true,
  description: `[img 2/22/sign.JPG left]This is the sign from
  the Liberty Caf\u00e9, the first Internet caf\u00e9 in the
  northeast.  The caf\u00e9 did well, at least until Americans started
  to prefer buying their own personal Internet.`
}, {put_in: "22"});

world.no_switch_msg.set("liberty sign", "no_switch_on", `{Bobs}
{try} switching the sign on, but but it's currently out of order so
{we} turn it off again.`);

def_obj("emergency penguin", "thing", {
  added_words: ["@button"],
  is_scenery: true,
  description: `The emergency penguin is deployable during
  particularly Arctic social conditions or house tours,
  whichever comes first.  Yellow yield signs blink around the
  room, a refrigerator opens pneumatically, and a large,
  inflatable penguin enters the vicinity when an industrial
  button next to [the 'eit mural'] is pressed.  Both spectacular and a possible fire
  hazard.`
}, {put_in: "22"});

world.no_switch_msg.set("emergency penguin", "no_switch_on", `The
social conditions aren't particularly Arctic, and, besides, this is
the kind of thing you want to see in Real Life.`);

/// The closet in 22

def_obj("The Closet in 22", "room", {
  description: `[img 2/22closet/look.jpg left]It's a closet.
  You can go [dir southeast] into 22.`
});
world.direction_description.set("The Closet in 22", "up", `
[img 2/22closet/look_u.JPG left]Looking up, you can see
[a 22_closet_ladder ladder] to a room above this closet.`);
world.direction_description.set("The Closet in 22", "east", `
[img 2/22closet/look_e.jpg left]Looking to the east, you can see a
dowel from the [a 22_closet_ladder ladder] which is going upward.`);

world.connect_rooms("22", "northwest", "The Closet in 22");
world.connect_rooms("The Closet in 22", "up", "The Batcave", {via: "22_closet_ladder"});

world.when_go_msg.set("The Closet in 22", "up", `With some
difficulty, you climb the ladder into...`);

def_obj("22_closet_ladder", "door", {
  name: "ladder",
  is_ladder: true,
  openable: false,
  reported: false,
  description: `It's a ladder made of widely spaced dowels
  that goes between the closet in 22 and the Batcave up above.`
});

///
/// The Batcave
///

def_obj("The Batcave", "room", {
  description: function () {
    out.write(`[img 2/batcave/look.JPG left]This is one of
    the secret rooms of tEp/Xi.  It's a room built into the
    interstitial space between the second and third floors by
    Batman, a tEp/Xi from the 80s.  People have actually lived in
    this room before.  The only things in here are a mattress, a
    [ob 'batcave sign' sign], and some [ob batcave_shelves shelves]`);
    if (world.is_open("batcave_shelves")) {
      out.write(`, which have been opened, revealing the second front
      interstitial space to the [dir north]`);
    }
    out.write(`. You can go [dir up] to the closet in 32 and
    [dir down] to the closet in 22.

    [para]You can also look [look up] and [look down].`);
  }
});
world.connect_rooms("The Batcave", "up", "The Closet in 32");

world.direction_description.set("The Batcave", "up", `
[img 2/batcave/look_u.JPG left]Looking up, you can see a hole in the
ceiling you could squeeze through.`);
world.direction_description.set("The Batcave", "down", `
[img 2/batcave/look_d.JPG left]Looking down, you can see into the
closet in 22.`);

world.when_go_msg.set("The Batcave", "up", `You squeeze through the
hole in the floor and make your way to...`);
world.when_go_msg.set("The Batcave", "down", `You carefully climb
down the ladder into...`);

def_obj("batcave sign", "thing", {
  is_scenery: true,
  description: `[img 2/batcave/sign.JPG left]On the wall is
  affixed a sign warning you of the low headroom in the Batcave.`
}, {put_in: "The Batcave"});

// The complexity here is because I want the door to be different in each
// room, and there's no support for this in the engine.
def_obj("batcave_shelves", "door", {
  name: () => {
    if (world.containing_room(world.actor) === "The Batcave") {
      return "small shelves";
    } else {
      return "small panel";
    }
  },
  indefinite_name: () => {
    if (world.containing_room(world.actor) === "The Batcave") {
      return "some small shelves";
    } else {
      return "a small panel";
    }
  },
  words: ["small", "wooden", "wood", "@shelves", "@panel"],
  reported: false,
  description: (x) => {
    if (world.containing_room(world.actor) === "The Batcave") {
      if (world.is_open(x)) {
        out.write("[img 2/batcave/shelves_open.JPG left]");
      } else {
        out.write("[img 2/batcave/shelves_closed.JPG left]");
      }
      out.write(`These are small shelves next to the bed,
      and nothing is on them.`);
      if (world.is_open(x)) {
        out.write(` The shelves are swung open,
        revealing the second front interstitial space to the [dir
        north].`);
      } else {
        out.write(` The shelves seem to be a bit wobbly.`);
      }
    } else {
      out.write("[img 2/2fint/look_s.JPG left]");
      if (world.is_open(x)) {
        out.write(`The panel is open, revealing the
        Batcave to the [dir south].`);
      } else {
        out.write(`It's a wooden panel that seems
        partly attached to the wall.`);
      }
    }
  }
});
world.connect_rooms("The Batcave", "north", "2f_interstitial", {via: "batcave_shelves"});

actions.before.add_method({
  when: action => ((action.verb === "placing on" || action.verb === "inserting into")
                   && action.iobj === "batcave_shelves"),
  handle: function (action) {
    if (world.containing_room(world.actor) === "The Batcave") {
      throw new abort_action("These small shelves are more decorative.");
    } else {
      this.next();
    }
  }
});

///
/// 23
///

def_obj("23", "room", {
  description: `[img 2/23/look.JPG left]This room is home of
  [the 'hanging couch'] and the computer-controlled [ob leitshow
  'light show'].  You can leave to the [dir south].`
});
make_known("23");
add_floor("23", "wood");

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "up"
                             && world.containing_room(world.actor) === "23"),
           action => examining("leitshow"));
// needs to be try_before because there are methods to get off enterables there
actions.try_before.add_method({
  when: ({verb, dir}) => (verb === "going" && dir === "down"
                          && world.parent_enterable(world.actor) === "hanging couch"),
  handle: function (action) {
    throw new do_instead(climbing("23_ladder"));
  }
});
instead_of(({verb, dir}) => (verb === "going" && dir === "up"
                             && world.location(world.actor) === "23"),
           action => climbing("23_ladder"));


def_obj("hanging couch", "supporter", {
  is_scenery: true,
  enterable: true,
  no_take_msg: `What do you want to do that for? That's
  already been [ask grueszing grueszed]!`,
  description: `[img 2/23/couch.jpg left]The Hanging Couch
  was [ask grueszed] from a Back Bay alley some years ago. It
  was a great couch, with one small problem: it had no legs. The
  natural solution, of course, was to hang the couch from the
  ceiling with several sturdy chains. Install a ladder,
  [enter_inline i]et voil\u00e0[leave]: a comfortable place to park your
  caboose and a great conversation piece.

  [para]Many visitors to tEp/Xi are often apprehensive about sitting
  on the hanging couch. But fear not.  One only needs to think
  forward thoughts to get up the ladder.`,
  locale_description: `[img 2/23/look_couch.JPG left]You get a
  more elevated view of 23 (or maybe of life in general) from the
  couch.`
}, {put_in: "23"});

parser.action.understand("think forward thoughts", parse => {
  if (world.containing_room(world.actor) === "23") {
    return entering("hanging couch");
  } else {
    return undefined;
  }
});

def_obj("23_ladder", "thing", {
  name: "swinging ladder",
  is_scenery: true,
  is_ladder: true,
  description : `It's a ladder going up to [the 'hanging couch']
  that swings back and forth, with hinges at the base.  The advice is to think
  forward thoughts to climb it.`
}, {put_in: "23"});

actions.before.add_method({
  when: action => ((action.verb === "entering" || action.verb === "climbing")
                   && action.dobj === "23_ladder"),
  handle: function (action) {
    if (world.parent_enterable(world.actor) === "hanging couch") {
      // a slight bug: what if someone brings the exercise ball and gets on it from here?
      throw new do_instead(getting_off(), true);
    } else {
      throw new do_instead(entering("hanging couch"), true);
    }
  }
});

def_obj("leitshow", "thing", {
  is_scenery: true,
  words: ["@leitshow", "leit", "@show", "@lightshow", "light", "layzor"],
  description: `[img 2/23/lightshow.jpg left]The tEp/Xi Lazor
  Leit Show began in the early 1990s when an entire [ask peldge] class
  attended the IAP glassblowing course, fashioned their own neon
  tubes and attached them to the ceiling of 23.  Since then, it
  has accumulated dozens more neon lights, LEDs and lasers.
  Custom tEp/Xi software and hardware, continuously refined, takes
  input from recorded music, microphones and live MIDI
  instruments and creates, on the fly, a mind-blowing visual
  experience to accompany them.

  [para]Irving stresses that it's impossible to truly appreciate
  the light show without visiting it in person.`
}, {put_in: "23"});

///
/// Second floor of the back stairwell
///

def_obj("back_stairwell_2", "room", {
  name: "Second Floor of the Back Stairwell",
  added_words: ["2nd"],
  description: `[img 2/bstairs/look.jpg left]You are in the
  back stairwell.  You can go [dir up] the [ob 'piano staircase']
  to the third floor, [dir southwest] to second
  landing, [dir north] to 24, or [dir downstairs] to the first
  floor.  You can also look [look up], [look down], and to the
  [look north].`
});
make_known("back_stairwell_2");

world.direction_description.set("back_stairwell_2", "up", `
[img 2/bstairs/look_u.jpg left]You can see the patterns painted on the
walls along with the [ob 'piano staircase'] that can bring you
[dir upstairs].`);
world.direction_description.set("back_stairwell_2", "down", `
[img 2/bstairs/look_d.jpg left]You see the stairs which can bring you
[dir down] to the first floor.`);
world.direction_description.set("back_stairwell_2", "north", `
[img 2/bstairs/look_n.jpg left]To the [dir north], you see 24.`);

world.connect_rooms("back_stairwell_2", "north", "24");
world.connect_rooms("back_stairwell_2", "up", "back_stairwell_3", {via: "piano staircase"});

def_obj("piano staircase", "door", {
  words: ["piano", "@staircase", "@stairs", "@stairwell"],
  openable: false,
  reported: false,
  description: `[img 2/bstairs/stairs.jpg left]This is the
  piano staircase. Each step has a beam break sensor which is
  connected to an old mini FM synthesizer.  Talented individuals
  with long legs can produce wonderful melodies.`
});

world.when_go_msg.set("back_stairwell_2", "up", `As you skip your way
up [the 'piano staircase'], you trace out, more or less, a whole tone scale.`);

world.when_go_msg.set("back_stairwell_3", "down", `You try for a major scale
on your way down [the 'piano staircase'].`);

///
/// 24
///

def_obj("24", "room", {
  description: `[img 2/24/look.JPG left]This is a single, and
  it has a lofted bed.  You can go [dir south] to the back
  stairwell.`
});
make_known("24");
add_floor("24", "tile");

///
/// Second Front
///
def_obj("Second Front", "room", {
  added_words: ["2nd"],
  description: `[img 2/2f/look.jpg left]This is second front,
  a bathroom named for its presence on the second floor and its
  being closer to the front of the house.  Nothing to see
  here. You can go [dir northeast] to the second landing.`
});

def_obj("2f_ceiling_door", "door", {
  name: "ceiling access hatch",
  is_ladder: true,
  reported: false,
  words: ["ceiling", "access", "@hatch", "@door", "@ladder"],
  description: function (x) {
    if (world.is_open(x)) {
      out.write(`[img 2/2f/hatch_open.JPG left]It's an open ceiling
      access hatch, revealing a ladder going from second front up to the
      interstitial space above it.`);
    } else {
      out.write(`[img 2/2f/hatch_closed.JPG left]It's a ceiling
      access hatch, and it's closed.`);
    }
  }
});
world.connect_rooms("Second Front", "up", "2f_interstitial", {via: "2f_ceiling_door"});

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "up"
                             && world.containing_room(world.actor) === "Second Front"),
           action => examining("2f_ceiling_door"), true);


///
/// The Second Front Interstitial Space
///

def_obj("2f_interstitial", "room", {
  name: "The Second Front Interstitial Space",
  description: function () {
    out.write(`[img 2/2fint/look.JPG left]This is the interstitial space
    above second front.  You can go [dir down] through the
    [ob 2f_ceiling_door 'access hatch'] into second front.`);
    if (world.is_open('batcave_shelves')) {
      out.write(` Through the small wooden panel (which
      is open), you can go [dir south] to the batcave.`);
    }
  }
});

world.direction_description.add_method({
  when: (room, dir) => room === "2f_interstitial" && dir === "down",
  handle: function (room, dir) {
    if (world.is_open("2f_ceiling_door")) {
      out.write(`[img 2/2fint/look_d.JPG left]Looking down, you
      see second front.`);
    } else {
      out.write(`You see that [the 2f_ceiling_door] is closed.`);
    }
  }
});

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "south"
                             && world.containing_room(world.actor) === "2f_interstitial"),
           action => examining("batcave_shelves"), true);

def_obj("safe", "container", {
  fixed_in_place: true,
  openable: true,
  is_open: false,
  lockable: true,
  is_locked: true,
  description: `[img 2/2fint/safe.JPG left]It's a safe whose
  combination has long been forgotten.  It was used to store the
  house chocolate chips to prevent xisters from eating them.`
}, {put_in: "2f_interstitial"});

parser.action.understand("enter [text x]", parse => {
  if (world.accessible_to("safe", world.actor) && parse.x.match(/^[0-9 ]*$/)) {
    var parts = parse.x.split(' ').filter(s => s.length > 0);
    if (!(parts.length === 3 && parts.every(s => s === "22"))) {
      return making_mistake(`That seems like an implausible combination.  You
      quickly try it anyway, and, as expected, it doesn't do the trick.`);
    }
  }
  return undefined;
});

parser.action.understand("enter 22 22 22", parse => {
  if (world.accessible_to("safe", world.actor)) {
    return making_mistake(`Like a true safe cracker, you put your ear against
    the safe to hear its internal mechanism at work.  After a couple full revolutions
    counterclockwise, you stop at '22'.  So far so good.  You turn it the other way.
    Sweat starts to build on your forehead, but you concentrate. '22'.  Ok, last number.
    Your delicate fingers gracefully turn the dial counterclockwise one last time, parking
    it at '22'.  Trembling, you reach forward to pull open the door, then meet resistance.
    It doesn't budge.

    [para]The combination really must be forgotten.`);
  } else {
    return undefined;
  }
});

// TODO open safe by dropping it down the center stairwell

actions.before.add_method({
  when: ({verb, dobj}) => verb === "unlocking" && dobj === "safe",
  handle: function (action) {
    throw new abort_action(`The combination for that safe has long been
    forgotten. You can't unlock it.`);
  }
});

all_are_mistakes(["pick [obj safe]"],
                 `Brilliant.  And into what part of the safe do you plan
                 to stick the picks?`);

///
/// Second Back
///
def_obj("Second Back", "room", {
  words: ["2nd", "Second", "@Back"],
  description: `[img 2/2b/look.JPG left]This is second back.
  It's a bathroom with a disco ball, an icosahedron, and a
  strobe light.`
});


/*******************/
/*** Third floor ***/
/*******************/

def_obj("The Third Landing", "room", {
  added_words: ["3rd", "floor"],
  description: `[img 3/landing/look.JPG left]This is the
  third landing.  You can go [dir southeast] to 31, [dir south]
  to 32, [dir north] to 33, [dir northeast] to the back
  stairwell, [dir upstairs], and [dir downstairs]. The bathrooms
  are to the [dir southwest] and [dir west].

  [para]You can also look [look up], [look down], [look north],
  [look east], [look south], and [look west].`
});
make_known("The Third Landing");
add_floor("The Third Landing", "carpet");
world.connect_rooms("The Third Landing", "southeast", "31", {via: "door to 31"});
world.connect_rooms("The Third Landing", "south", "32");
world.connect_rooms("The Third Landing", "north", "33");
world.connect_rooms("The Third Landing", "northeast", "back_stairwell_3");
world.connect_rooms("The Third Landing", "up", "The Fourth Landing");
world.connect_rooms("The Third Landing", "southwest", "Third Front");
world.connect_rooms("The Third Landing", "west", "Third Back");

world.direction_description.set("The Third Landing", "north", `
[img 3/landing/look_n.JPG left]To the [dir north] is the entrance to
33, and to the [dir northeast] is the back stairwell.`);
world.direction_description.set("The Third Landing", "south", `
[img 3/landing/look_s.JPG left]To the [dir south] is 32, and to the
[dir southwest] is 31 (which is the GRA's room and locked).`);
world.direction_description.set("The Third Landing", "east", `
[img 3/landing/look_e.JPG left]To the east you see the stairwell that
goes [dir upstairs].`);
world.direction_description.set("The Third Landing", "west", `
[img 3/landing/look_w.JPG left]To the west, you see a bulletin board
with writings of the "third back writing club."  You can go into third
front and third back to the [dir southwest] and [dir west],
respectively.`);
world.direction_description.set("The Third Landing", "up", `
[img 3/landing/look_u.JPG left]Looking up, you see you're getting much
closer to the top of the center stairwell.`);
world.direction_description.set("The Third Landing", "down", `
[img 3/landing/look_d.JPG left]Below you, you see some ropes whose
envelope traces out some parabolas.  The center room is getting very
small from here.`);

///
/// 31
///

def_obj("door to 31", "door", {
  lockable: true,
  is_locked: true,
  reported: false,
  description: `The door to 31 is locked.  Who knows what
  mysteries might lie within the GRA's room?`
});

world.no_lock_msg.set("door to 31", "no_open", `You shouldn't go
in since it's the [ob GRA]'s room.  You try anyway, but the door to 31 is
locked, so you can't get in.`);

def_obj("31", "room", {
});
make_known("31");

///
/// 32
///

def_obj("32", "room", {
  description: `[img 3/32/look.JPG left]This is the hanging
  room, named for its many hanging things such as [the hammock],
  [the 'hanging desk'], and a yellow sign that says
  "caution, wet ceiling."  To the [dir northwest] is a closet,
  and you can go [dir north] to the third landing.  You can look
  [look south].`
});
make_known("32");
add_floor("32", "wood");

world.direction_description.set("32", "south", `
[img 3/32/look_s.JPG left]To the south, you see through the bay
windows [a flagpole].`);

def_obj("hanging desk", "supporter", {
  added_words: ["@chair"],
  is_scenery: true,
  enterable: true,
  description: `[img 3/32/desk.JPG left]Some problems need a
  new point of view to be able to finally solve.  If the point
  of view needed is one of greater elevation, then the hanging
  desk is perfect.  The cousin to the hanging desk is the
  hanging couch in [action 'go to 23' 23].`
}, {put_in: "32"});

def_obj("hammock", "container", {
  is_scenery: true,
  enterable: true,
  description: `[img 3/32/hammock.JPG left]The hammock, which
  is the younger sibling of the Free Willy net in
  [action 'go to 33' 33], is a comfortable place to lounge
  when in the hanging room.`
}, {put_in: "32"});

def_obj("flagpole", "thing", {
  added_words: ["@flag"],
  is_scenery: true,
  description: `[img 3/32/flagpole.JPG left]This flagpole has
  held numerous flags, such as the current, tattered pirate
  flag, a birthday flag, and a giant [ask 22] flag.`
}, {put_in: "32"});

def_obj("The Closet in 32", "room", {
  description: `[img 3/32closet_l/look.JPG left]It's a
  closet, in which is a bed, on which someone sleeps.  You can
  go [dir southeast] into 32.`
});

world.connect_rooms("32", "northwest", "The Closet in 32");

world.direction_description.set("The Closet in 32", "down", `
[img 3/32closet_l/look_d.JPG left]Looking down, you can see a
passageway into a room below this closet.`);

world.when_go_msg.set("The Closet in 32", "down", `You squeeze
through a small opening in the floor to get into...`); // goes to batcave

///
/// 33
///

def_obj("33", "room", {
  description: `[img 3/33/look_2024.jpg left]This room is home of
  [the 'cargo net'] as well as a collection of
  [ob 'bad tie collection' 'bad ties'].
  To the [dir southwest] is the cockpit, and to the
  [dir south] is the third landing.`
});
make_known("33");
add_floor("33", "wood");
world.connect_rooms("33", "southwest", "The Cockpit");

// TODO make "enter cockpit" work (possibly by adding this command to textadv)

def_obj("cargo net", "container", {
  added_words: ["large", "blue", "purple"],
  enterable: true,
  is_scenery: true,
  description: `[img 3/33/net_2024.jpg left] This military cargo net has been
  proven through robust scientific testing to be limited by volume and not 
  weight; it has held over thirty people simultaneously!  There may be secrets
  on the net, but it's been said that once you [action 'enter net' 'enter the net'],
  you'll never want to leave, so be careful.`,
  locale_description: `[img 3/33/look_net_2024.jpg left]Hanging
  near you right outside the net is a collection of [ob 'bad tie collection' 'bad ties'],
  and [action 'look ceiling' 'on the ceiling'] is a geometric mural that may harbor dark secrets.
  Although you really don't want to, since you're quite
  comfortable where you are, you can also [action 'get out'] of the
  net.`
}, {put_in: "33"});

def_obj("mural", "thing", {
  added_words: ["ceiling"],
  is_scenery: true,
  description: `[img 3/33/mural_2024.jpg left]You see the beautiful ceiling mural in all its glory.`
}, {put_in: "33"});

// world.direction_description.set("33", "up", `
//   [img 3/33/mural_2024.jpg left]You see the beautiful mural in all its glory.`); // TODO redirect to examine net instead
instead_of(({verb, dir}) => (verb === "looking toward" && dir === "up"
    && world.containing_room(world.actor) === "33"),
    action => examining("cargo net"));

// def_obj("Free Willy net", "container", {
//   added_words: ["large", "red", "purple", "authentic", "fishing"],
//   enterable: true,
//   is_scenery: true,
//   description: `[img 3/33/net.JPG left]This large fishing net
//   is from the movie Free Willy.  It was purchased on eBay with a
//   bid of exactly two-hundred twenty-two dollars and forty-seven
//   cents some time ago from a stagehand who took the net home as
//   a collectable (likely overestimating its eventual value).
//   There was a failed attempt to dye the net purple, and it ended
//   up being a reddish color instead.

//   [para]The net has been proven through robust scientifical
//   testing to be limited by volume and not weight; it has held
//   over thirty people simultaneously!  It's been said that once you enter the net,
//   you never want to leave, so be careful.`,
//   locale_description: `[img 3/33/look_net.JPG left]Hanging
//   near you right outside the net is a collection of [ob 'bad tie collection' 'bad ties'].
//   Although you really don't want to, since you're quite
//   comfortable where you are, you can [action 'get out'] of the
//   net.`
// }, {put_in: "33"});

// middle paragraph
//         [newline]While this net was from the production of Free Willy,
//         it never actually touched the whale; rather, it was the
//         spare. When the idea of buying the net came up at a house
//         meeting, the house vegans were outraged at the idea of
//         installing a net that had imprisoned an animal, shouting
//         "Immanentize the eschaton!" (we're still not sure what they
//         meant). That and the fact that the spare net was much cheaper
//         than the primary net led to the net now hanging in 33.


// alternative middle paragraph:
//  While this net was from the production of Free Willy,
//        it never actually touched the whale; rather, it was the spare.
//        When the idea of buying a net that touched a whale came up at
//        a house meeting, the house vegans were outraged.  That, and
//        the fact that the spare net was much cheaper than the primary
//        net led to this net hanging in 33.

def_obj("bad tie collection", "thing", {
  added_words: ["ties"],
  is_scenery: true,
  description: `[img 3/33/ties.JPG left]This is a collection
  of many remarkably bad ties.  They've been successfully used by a
  few tEp/Xis to land jobs at Google.`
}, {put_in: "33"});

///
/// The cockpit
///

def_obj("The Cockpit", "room", {
  description: `[img 3/cockpit/look.JPG left]This is the
  cockpit, which is a small closet, a bed, and a really cool
  mural.  Usually there are color-changing lights in this room,
  making the mural even cooler.

  [para]You can leave to the [dir northeast].`
});
make_known("The Cockpit");

instead_of(({verb, dir}) => (verb === "going" && dir === "out"
                             && world.containing_room(world.actor) === "The Cockpit"),
           action => going("northeast"));

///
/// Third front
///

def_obj("Third Front", "room", {
  added_words: ["3rd"],
  description: `[img 3/3f/look.JPG left]This is a bathroom,
  in which is [the 'Royal Throne'] and [ob diplomas 'some diplomas'].
  You can go [dir northeast] to the third landing, and you can
  look [look up] at the ceiling.`
});

world.direction_description.set("Third Front", "up", `
[img 3/3f/look_u.JPG left]Looking up, you see an Escherian tesselation
of lizards on the ceiling tiles.`);

def_obj("Royal Throne", "supporter", {
  added_words: ["@toilet"],
  enterable: true,
  is_scenery: true,
  description: `[img 3/3f/throne.JPG left]On the toilet, it
  says "The Royal Throne."`
}, {put_in: "Third Front"});

def_obj("diplomas", "thing", {
  added_words: ["@diploma", "toilet", "paper", "@roll"],
  indefinite_name: "some diplomas",
  is_scenery: true,
  no_take_msg: `You can get one of those from your own house.`,
  description: `[img 3/3f/diplomas.JPG left]On the toilet
  paper roll dispenser are the words "Harvard Diplomas."`
}, {put_in: "Third Front"});

///
/// Third back
///

def_obj("Third Back", "room", {
  added_words: ["3rd"],
  description: `[img 3/3b/look.JPG left]This is a bathroom
  with color-changing lights.  You can leave to the [dir east].`
});


///
/// Third floor of the back stairwell
///

def_obj("back_stairwell_3", "room", {
  name: "Third Floor of the Back Stairwell",
  added_words: ["3rd"],
  description: `[img 3/bstairs/look.jpg left]You are in the
  back stairwell.  You can go [dir upstairs] to the fourth
  floor, [dir southwest] to third landing, [dir north] to 34, or
  [dir downstairs] to the second floor.  You can also look
  [look up], [look down], [look north], and [look west].`
});
make_known("back_stairwell_3");

world.connect_rooms("back_stairwell_3", "north", "34");
world.connect_rooms("back_stairwell_3", "up", "back_stairwell_4");

world.direction_description.set("back_stairwell_3", "up", `
[img 3/bstairs/look_u.jpg left]You can see the patterns painted on the
walls and a passage [dir upstairs].`);
world.direction_description.set("back_stairwell_3", "down", `
[img 3/bstairs/look_d.jpg left]You see [the 'piano staircase'],
which can bring you [dir down] to the second floor.`);
world.direction_description.set("back_stairwell_3", "north", `
[img 3/bstairs/look_n.jpg left]To the [dir north], you see 34.`);
world.direction_description.set("back_stairwell_3", "west", `
[img 3/bstairs/look_w.jpg left]To the [dir southwest], you see the
third landing.`);
world.direction_description.set("back_stairwell_3", "east", `Looking
[dir east], you see the [ob 'closet door' door] of a closet.`);

///
/// 34
///

def_obj("34", "room", {
  description: `[img 3/34/look.JPG left]The room was cleared out for [ask 'work week']
  to refinish the floor, but usually there's a desk in here underneath the lofted bed.

  [para]You can go [dir south] to the back stairwell.`
});
make_known("34");
add_floor("34", "wood");

///
/// Porn closet
///

def_obj("porn_closet_door", "door", {
  name: "closet door",
  reported: false,
  description : () => {
    out.write(`[img 3/porn/door.jpg left]It's a wooden door,
    around which are dinosaur figures possibly depicting various
    sexual positions.  It is currently `, world.is_open_msg("porn_closet_door"), ".");
  }
});
world.connect_rooms("back_stairwell_3", "east", "The Porn Closet", {via: "porn_closet_door"});

def_obj("The Porn Closet", "room", {
  description: `[img 3/porn/look.jpg left]This is a closet
  full of study materials for introductory classes at MIT.
  There is surprisingly little porn in this closet.`
});
world.direction_description.set("The Porn Closet", "up", `
[img 3/porn/look_u.JPG left]There's a [ob porn_closet_ladder ladder] going up.`);
world.direction_description.set("The Porn Closet", "north", `
[img 3/porn/look_n.jpg left]You see a [ob porn_closet_ladder ladder] here going up.`);

def_obj("porn_closet_ladder", "door", {
  name: "wood ladder",
  is_ladder: true,
  reported: false,
  openable: false,
  description: `[img 3/porn/ladder.JPG left]This is a ladder
  going from the porn closet [dir up] into the reading room.`
});

def_obj("imagination capturer", "container", {
  description: `[img 3/porn/catcher.JPG left]It's an
  imagination capturer.  It captures your imagination.`
}, {put_in: "The Porn Closet"});

///
/// The Reading Room
///
def_obj("The Reading Room", "room", {
  description: `[img 3/reading/look.JPG left]This is the
  reading room, a secret room of tEp/Xi.  You can go back [dir down]
  [ob porn_closet_ladder 'the ladder'] to the porn closet.  You can also look
  [look up] and [look down].`
});
world.connect_rooms("The Porn Closet", "up", "The Reading Room", {via: "porn_closet_ladder"});

world.direction_description.set("The Reading Room", "up", `
[img 3/reading/look_u.JPG left]Looking up, you see a lamp.`);
world.direction_description.set("The Reading Room", "down", `
[img 3/reading/look_d.JPG left]Below you, you see [ob porn_closet_ladder 'the ladder']
which can bring you back to the porn closet.`);



/********************/
/*** Fourth floor ***/
/********************/

def_obj("The Fourth Landing", "room", {
  added_words: ["4th", "floor"],
  description: `[img 4/landing/look.JPG left]This is the
  fourth landing.  You can go [dir southeast] to 41, [dir south]
  to 42, [dir north] to 43, [dir northeast] to the back
  stairwell, [dir east] to the mac closet, [dir northwest] to
  the network closet, and [dir downstairs].  The bathrooms are
  to the [dir southwest] and [dir west].

  [para]You can also look [look up], [look down], [look north],
  [look east], and [look south].`});
make_known("The Fourth Landing");
add_floor("The Fourth Landing", "carpet");
world.connect_rooms("The Fourth Landing", "southeast", "41");
world.connect_rooms("The Fourth Landing", "south", "42");
world.connect_rooms("The Fourth Landing", "north", "43");
world.connect_rooms("The Fourth Landing", "northeast", "back_stairwell_4");
world.connect_rooms("The Fourth Landing", "southwest", "Fourth Front");
world.connect_rooms("The Fourth Landing", "west", "Fourth Back");
world.connect_rooms("The Fourth Landing", "east", "The Mac Closet");
world.connect_rooms("The Fourth Landing", "northwest", "The Network Closet");
world.no_go_msg.set("The Fourth Landing", "up", `There aren't any
more stairs up from here.  You'll have to first go [dir northeast] to
the back stairwell.`);

world.direction_description.set("The Fourth Landing", "up", `
[img 4/landing/look_u.JPG left]Looking up, you see the skylight and
the traveling salesman door, through which tEp/Xis lead traveling
salesmen.`);
world.direction_description.set("The Fourth Landing", "down", `
[img 4/landing/look_d.JPG left]This looks like the perfect spot from
which to drop something down the center stairwell.`);
world.direction_description.set("The Fourth Landing", "north", `
[img 4/landing/look_n.JPG left]To the [dir north] is 43, and to the
[dir northeast] is the back stairwell.`);
world.direction_description.set("The Fourth Landing", "east", `
[img 4/landing/look_e.JPG left]To the east you see a way [dir downstairs].`);
world.direction_description.set("The Fourth Landing", "south", `
[img 4/landing/look_s.JPG left]Looking south, you see the entrance to
the mac closet to the [dir east], the entrance to 41 to the
[dir southeast], and the entance to 42 to the [dir south].`);

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "west"
                             && world.containing_room(world.actor) === "The Fourth Landing"),
           action => looking());


///
/// 41
///

def_obj("41", "room", {
  description: `[img 4/41/look.JPG left]This is a double with
  a lofted and a non-lofted bed. You note that the room is very
  yellow. You can go [dir northwest] back to the fourth landing.`
});
make_known("41");

///
/// 42
///
def_obj("42", "room", {
  description: `[img 4/42/look.JPG left]This is a triple
  containing [the 'Eye of Gorlack'] and [the 'Eyebrow of Gorlack'].
  You can go [dir north] back to the fourth landing.
  You can also look [look south].`
});
make_known("42");
add_floor("42", "wood");

world.direction_description.set("42", "south", `
[img 4/42/look_s.JPG left]To the south, you can see part of the Boston
skyline, including the Prudential Center.`);

def_obj("Eye of Gorlack", "thing", {
  is_scenery: true,
  description: `[img 4/42/eye.JPG left]The Eye of Gorlack
  is over a thousand three-color LEDs mounted on a hemisphere.
  It was built by David Greenberg in 2009.`
}, {put_in: "42"});

def_obj("Eyebrow of Gorlack", "thing", {
  is_scenery: true,
  description: `[img 4/42/brow.JPG left]The Eyebrow of
  Gorlack is lighting that was left over after a project that
  was part of the MIT 150th Anniversary arts festival, which was
  LED lighting spanning most of the length of the Harvard
  Bridge.`
}, {put_in: "42"});

///
/// 43
///

def_obj("43", "room", {
  description: `[img 4/43/look.JPG left]This is a room with a
  [ob 'mural chalkboard' mural] on a chalkboard.  On the wall
  you see [the Roscoe].  To the [dir south] is the
  fourth landing, and you can look [look east].`
});
make_known("43");
add_floor("43", "wood");

world.direction_description.set("43", "east", `
[img 4/43/look_e.JPG left]On the east wall, you see a blackboard with
the words "Taylor Swift--Genius" and [the Roscoe].`);

def_obj("mural chalkboard", "thing", {
  is_scenery: true,
  description: `[img 4/43/chalkboard.JPG left]This is a
  chalkboard with a large portrait of someone who one lived here
  a few years ago.`
}, {put_in: "43"});

all_are_mistakes(["erase/wash [obj 'mural chalkboard']"],
                 `Considering that the mural has been there for years,
                  you wisely decide not to erase it.`);

def_obj("Roscoe", "thing", {
  proper_named: true,
  is_scenery: true,
  description: `[img 4/43/roscoe.JPG left]This is a picture
  of Roscoe taking a ride around the block.`
}, {put_in: "43"});

def_obj("banned words list", "thing", {
  indefinite_name: "the banned words list",
  description: () => {
    out.write(`[img 4/43/banned.jpg left]This is a list of
    words that are banned in this room.  The list includes`);
    // assume it has at least three words
    let words = world.global("banned words");
    for (let i = 0; i < words.length; i++) {
      if (i + 1 === words.length) {
        out.write(` and "${words[i]}."`);
      } else {
        out.write(` "${words[i]},"`);
      }
    }
  }
}, {put_in: "43"});

world.global.set("banned words", ["isomorphic", "supposedly", "epistemology"]);

function handle_banned_word(parse) {
  if (!world.global("banned words").includes(parse.x.toLowerCase())) {
    return undefined;
  }
  if (world.containing_room(world.actor) === world.containing_room("banned words list")) {
    return making_mistake("Watch your tongue! That word is on the banned words list.");
  } else {
    return making_mistake(`You say the word and furtively look around the room.  Good,
    it's not banned here.`);
  }
}

parser.action.understand("[text x]", handle_banned_word);
parser.action.understand("say [text x]", handle_banned_word);
parser.action.understand('say "[text x]"', handle_banned_word);

function adding_to(word, iobj) {
  return {verb: "adding to", text: word, iobj: iobj};
}
actions.write_gerund_form.add_method({
  when: (action) => action.verb === "adding to",
  handle: function (action) {
    out.write(`adding "`); out.write_text(action.text);
    out.write(`" to `, world.definite_name(action.iobj));
  }
});
actions.write_infinitive_form.add_method({
  when: (action) => action.verb === "adding to",
  handle: function (action) {
    out.write(`add "`); out.write_text(action.text);
    out.write(`" to `, world.definite_name(action.iobj));
  }
});

parser.action.understand("add [text x] to [something y]", parse => adding_to(parse.x, parse.y));
parser.action.understand("write [text x] on [something y]", parse => adding_to(parse.x, parse.y));

require_iobj_accessible("adding to");

actions.before.add_method({
  name: "adding to default",
  when: action => action.verb === "adding to",
  handle: function (action) {
    throw new abort_action("You can't add anything to that.");
  }
});
actions.before.add_method({
  name: "adding to banned words list",
  when: action => action.verb === "adding to" && action.iobj === "banned words list",
  handle: function (action) {
    if (action.text.includes(" ")) {
      throw new abort_action("It's the banned [enter_inline i]words[leave] list.");
    } else if (world.global("banned words").includes(action.text.toLowerCase())) {
      throw new abort_action("That's already on the list.");
    }
  }
});
actions.carry_out.add_method({
  name: "adding to banned words list",
  when: action => action.verb === "adding to" && action.iobj === "banned words list",
  handle: function (action) {
    var words = world.global("banned words");
    words.push(action.text.toLowerCase());
  }
});
actions.report.add_method({
  name: "adding to banned words list",
  when: action => action.verb === "adding to" && action.iobj === "banned words list",
  handle: function (action) {
    out.write("Added.");
  }
});

//// Shakespeare's spleen usage

var spleen_uses = [
  `Henry VIII Act: 2 Scene: 4. "I have no spleen against you; nor injustice"`,
  `Henry VIII Act: 2 Scene: 4. "Is cramm'd with arrogancy, spleen, and pride"`,
  `Timon of Athens Act: 3 Scene: 5. "It is a cause worthy my spleen and fury"`,
  `As You Like It Act: 4 Scene: 1. "of thought, conceived of spleen and born of madness"`,
  `Love's Labours Lost Act: 5 Scene: 2. "That in this spleen ridiculous appears"`,
  `Henry VI, part 1 Act: 4 Scene: 6. "Quicken'd with youthful spleen and warlike rage"`,
  `Henry VIII Act: 1 Scene: 2. "You charge not in your spleen a noble person"`,
  `Richard III Act: 5 Scene: 3. "Inspire us with the spleen of fiery dragons!"`,
  `King John Act: 2 Scene: 1. "With swifter spleen than powder can enforce"`,
  `King John Act: 4 Scene: 3. "Or teach thy hasty spleen to do me shame"`,
  `King John Act: 5 Scene: 7. "And spleen of speed to see your majesty!"`,
  `The Tragedy of King Lear Act: 1 Scene: 4. "Create her child of spleen; that it may live"`,
  `Romeo and Juliet Act: 3 Scene: 1. "Could not take truce with the unruly spleen"`,
  `Coriolanus Act: 4 Scene: 5. "Against my canker'd country with the spleen"`,
  `Othello Act: 4 Scene: 1. "Or I shall say you are all in all in spleen"`,
  `Julius Caesar Act: 4 Scene: 3. "You shall digest the venom of your spleen"`,
  `A Midsummer Night's Dream Act: 1 Scene: 1. "That, in a spleen, unfolds both heaven and earth"`,
  `Love's Labours Lost Act: 3 Scene: 1. "thought my spleen; the heaving of my lungs provokes"`,
  `Taming of the Shrew Act: 3 Scene: 2. "Unto a mad-brain rudesby full of spleen"`,
  `Troilus and Cressida Act: 1 Scene: 3. "In pleasure of my spleen.' And in this fashion"`,
  `Troilus and Cressida Act: 2 Scene: 2. "Such things as might offend the weakest spleen"`,
  `Twelfth Night Act: 3 Scene: 2. "If you desire the spleen, and will laugh yourself"`,
  `Henry VI, part 3 Act: 2 Scene: 1. "That robb'd my soldiers of their heated spleen"`,
  `Henry IV, part 1 Act: 2 Scene: 3. "A weasel hath not such a deal of spleen"`,
  `Henry IV, part 1 Act: 3 Scene: 2. "Base inclination and the start of spleen"`,
  `Henry IV, part 1 Act: 5 Scene: 2. "A hair-brain'd Hotspur, govern'd by a spleen"`,
  `Richard III Act: 2 Scene: 4. "And frantic outrage, end thy damned spleen"`
];

def_obj("spleen usage book", "thing", {
  name: "book on the spleen and Shakespeare",
  description: function (x) {
    out.write(`This is Irving Q. Tep's scholarly study on Shakespeare's use
    of the spleen.  You open it up to a random passage:[para]`);
    out.write_text(spleen_uses[Math.floor(Math.random() * spleen_uses.length)]);
    out.write("[para][action 'examine book on the spleen and Shakespeare' 'Read another passage.']");
  }
}, {put_in: "43"});

///
/// Fourth front
///

def_obj("Fourth Front", "room", {
  description: `[img 4/4f/look.JPG left]This is another fine
  tEp/Xi bathroom. You can go [dir northeast] back to the fourth
  landing or look [look up].`
});

world.direction_description.set("Fourth Front", "up", `
[img 4/4f/look_u.JPG left]Above you, the tiles have been painted in a
checkerboard pattern.`);

///
/// Fourth back
///

def_obj("Fourth Back", "room", {
  description: `[img 4/4b/look.jpg left]This bathroom doesn't
  have any special properties.  You can go [dir east] back to
  the fourth landing.`
});

world.direction_description.set("Fourth Back", "up", `
[img 4/4b/look_u.JPG left]The're a hole in the ceiling, exposing the
plumbing for the floor above.`);

///
/// The Mac Closet
///

def_obj("The Mac Closet", "room", {
  description: `[img 4/mac/look.jpg left]This is the mac
  closet, named for the Macintosh computer that used to be set
  up in here.  The fourth landing is back to the [dir west].`
});

///
/// The Network Closet
///

def_obj("The Network Closet", "room", {
  description: `[img 4/network/look.jpg left]This is the
  network closet, in which is the Internet and a fridge.
  Interestingly, the use of the microwave disrupts network
  traffic. The fourth landing is back to the [dir southeast].`
});

///
/// Fourth floor of the back stairwell
///

def_obj("back_stairwell_4", "room", {
  name: "Fourth Floor of the Back Stairwell",
  added_words: ["4th"],
  description: `[img 4/bstairs/look.jpg left]You are in the
  back stairwell.  You can go [dir up] the black light stairwell
  to the fifth floor, [dir southwest] to fourth landing, [dir north]
  to 44, or [dir downstairs] to the third floor.

  [para]You can look [look upstairs], [look downstairs],
  [look north], [look west], [look south], and [look east].`
});
make_known("back_stairwell_4");

world.connect_rooms("back_stairwell_4", "north", "44");
world.connect_rooms("back_stairwell_4", "up", "The Fifth Landing");

world.direction_description.set("back_stairwell_4", "up", `
[img 4/bstairs/look_u.jpg left]You can see more fluorescent paintings
and a passage [dir upstairs].`);
world.direction_description.set("back_stairwell_4", "down", `
[img 4/bstairs/look_d.jpg left]You see a way [dir downstairs] to the
third floor.`);
world.direction_description.set("back_stairwell_4", "north", `
[img 4/bstairs/look_n.jpg left]To the [dir north], you see 44.`);
world.direction_description.set("back_stairwell_4", "west", `
[img 4/bstairs/look_w.jpg left]To the [dir southwest], you see the
fourth landing.`);
world.direction_description.set("back_stairwell_4", "east", `
[img 4/bstairs/look_e.JPG left]Looking east, you see the beginning of
the black light stairwell, which you can look [look up].`);
world.direction_description.set("back_stairwell_4", "south", `
[img 4/bstairs/look_s.JPG left]You see fluorescent paintings on the
south wall.`);

///
/// 44
///

def_obj("44", "room", {
  description: `This single is very messy.  You can go [dir south]
  to the back stairwell.`
});
make_known("44");

/*******************/
/*** Fifth floor ***/
/*******************/

def_obj("The Fifth Landing", "room", {
  added_words: ["5th", "floor"],
  description: `[img 5/landing/look.jpg left]This is the
  fifth landing.  You can go [dir southeast] to 51, [dir south]
  to the study room, [dir northwest] to 53, [dir north] to 54,
  [dir northeast] to 55, and [dir downstairs].

  [para]You can also look [look north], [look southwest], and
  [look southeast].`
});
make_known("The Fifth Landing");
add_floor("The Fifth Landing", "carpet");
world.connect_rooms("The Fifth Landing", "southeast", "51");
world.connect_rooms("The Fifth Landing", "south", "The Study Room");
world.connect_rooms("The Fifth Landing", "northwest", "53");
world.connect_rooms("The Fifth Landing", "north", "54");
world.connect_rooms("The Fifth Landing", "northeast", "55");

world.direction_description.set("The Fifth Landing", "north", `
[img 5/landing/look_n.JPG left]On the north wall, you see a mural and
the door into 54.`);
world.direction_description.set("The Fifth Landing", "southwest", `
[img 5/landing/look_sw.JPG left]To the southwest, you see a wall with
a mural.`);
world.direction_description.set("The Fifth Landing", "southeast", `
[img 5/landing/look_se.JPG left]To the southeast, you see a wall with
a mural and the entrance into 51.`);

///
/// 51
///

def_obj("51", "room", {
  description: `This is a single.  It has the traveling
  salesman door and a window to the center stairwell, which you
  can look [look down]. You can go [dir northwest] to the
  landing.`
});
make_known("51");

world.direction_description.set("51", "down", `
[img 5/51/look_d.JPG left]You're looking out the window into the space
between the stairs.`);

///
/// 53
///

def_obj("53", "room", {
  description : `This is a skinny single.  You can go [dir southeast]
  to the fifth landing.`
});
make_known("53");

///
/// 54
///

def_obj("54", "room", {
  description: `This is a skinny single.  You can go [dir south]
  to the fifth landing.`
});
make_known("54");

///
/// 55
///

def_obj("55", "room", {
  description: `[img 5/55/look_2024.jpg left]This is the smallest single in the house, and
  at one point was painted a very happy orange.  Now it is decorated
  like a fairy home in the forest. You can can [look north] or go [dir southwest]
  to the fifth landing.`
});
make_known("55");

world.direction_description.set("55", "north", `
[img 5/55/look_n_2024.jpg left]You see a bed and a glimse out the window into
the back alley.`);

///
/// The Study Room
///

def_obj("The Study Room", "room", {
  added_words: ["chapter", "@52"],
  description: `[img 5/study/look.JPG left]This is the study
  room (also known as 52, keeping up with the
  clockwise-enumeration convention), which was painted by a tEp/Xi
  who once stared at the sun and could only see green for a
  month.  You can go [dir north] to the rest of the fifth floor,
  or [dir south] through [the 'xiohazard door'] to the poop
  deck.

  [para]You can also look [look east], [look north], and [look west].`
});
make_known("The Study Room");
add_floor("The Study Room", "wood");
world.connect_rooms("The Study Room", "south", "The Poop Deck", {via: "xiohazard door"});

world.direction_description.set("The Study Room", "east", `
[img 5/study/look_e.JPG left]To the east, you see a chalkboard and a
tiny mural which was inadvertently painted with MIT colors.`);
world.direction_description.set("The Study Room", "north", `
[img 5/study/look_n.JPG left]To the north, you see a bookshelf.`);
world.direction_description.set("The Study Room", "west", `
[img 5/study/look_w.JPG left]To the west, you see the study room
computer.`);

def_obj("xiohazard door", "door", {
  reported: false,
  description: `[img 5/study/door.JPG left]The door between
  the study room and the poopdeck is handsomly ornamented with a
  large xiohazard, the logo for tEp/Xi.`
});

///
/// The Poop Deck
///

def_obj("The Poop Deck", "room", {
  description: `[img 5/poop/look.JPG left]This is the roof
  deck immediately outside the study room of [ask 'the U.S.S. Birthday Ship'].
  From here you can see a nice view of
  the mall to the [look south] (which is the grassy area along
  Commonwealth Ave).  You can go [dir north] back into the study
  room, or [dir up] to the roof.  You can also look [look north]
  and [look down].`
});
make_known("The Poop Deck");
world.connect_rooms("The Poop Deck", "up", "The Roof");

world.direction_description.set("The Poop Deck", "down", `
[img 5/poop/look_d.JPG left]You peer over the handrail at Commonwealth
Ave, below.`);
world.direction_description.set("The Poop Deck", "south", `
[img 5/poop/look_s.JPG left]To the south, you get a view of the Boston
skyline, and below the treeline is the mall.`);
world.direction_description.set("The Poop Deck", "north", `
[img 5/poop/look_n.JPG left]You see [the 'xiohazard door'] into the
study room to the [dir north] and the stairs leading [dir up] to the roof.`);


/****************/
/*** The Roof ***/
/****************/

def_obj("The Roof", "room", {
  description: `[img 5/roof/look.JPG left]This is the roof of
  tEp/Xi.  To the [look north] is a view of the MIT campus, and to
  the [look south] is the Boston skyline.  You can go back
  [dir down] to the poopdeck. You can also look [look down].`
});
make_known("The Roof");

world.direction_description.set("The Roof", "north", `
[img 5/roof/look_n.JPG left]You see the Green Building and the Great
Dome across the river at MIT.  It's nice having a little distance.`);
world.direction_description.set("The Roof", "south", `
[img 5/roof/look_s.JPG left]To the south is a view of the Boston
skyline.`);
world.direction_description.set("The Roof", "down", `
[img 5/roof/look_d.JPG left]Down below, you see the alley the backlot, which
has six parking spots and the rear entrance.`);

world.no_go_msg.set("The Roof", "east", `It is not worth the wrath
of the neighbors to go onto their roof.`);
world.no_go_msg.set("The Roof", "west", `It is not worth the wrath
of the neighbors to go onto their roof.`);

def_obj("hot tub", "container", {
  printed_name: "the hot tub",
  added_words: ["kiddie", "@pool", "@hottub"],
  enterable: true,
  proper_named: true,
  description: `An inflatable hot tub is kept on the roof for
  relaxing on quiet nights, especially during IAP and the
  summer.  The maximum size supportable by the roof has been
  carefully calculated by Course 2 xisters.`
}, {put_in: "The Roof"});

def_obj("The Etruscan Bathhouse", "container", {
  proper_named: true,
  enterable: true,
  description: `[img 5/roof/bathhouse.JPG left]This is the
  Etruscan bathhouse.  Many years ago it was the machine room
  for the elevator shaft in the back stairwell, but now it has a
  tub.  You can [action 'enter Etruscan Bathhouse' enter] it.`,
  locale_description: `[img 5/roof/look_bath.JPG left]You are
  in the Etruscan bathhouse, complete with an authentic
  reproduction of Etruscan art, courtesy of a postcard from a
  tEp/Xi alumnus.  You can [action leave] when you're ready.`
}, {put_in: "The Roof"});

def_obj("bathtub", "container", {
  added_words: ["bath", "@tub"],
  enterable: true,
  is_scenery: true,
  description: `[img 5/roof/bathtub.JPG left]This bathtub
  used to be on the poop deck before its present location in the
  Etruscan bathhouse.  However, observers from the Prudential
  Center noticed naked bathers and, for whatever reason,
  complained.`
}, {put_in: "The Etruscan Bathhouse"});

// for "draw a bath"
parser.action.understand("draw [obj bathtub]", action => using("bathtub"));

instead_of(({verb, dobj}) => verb === "taking" && dobj === "bathtub",
           action => using("bathtub"), true);

parser.action.understand("bathe", function (action) {
  if (world.accessible_to("bathtub", world.actor)) {
    return using("bathtub");
  } else {
    return undefined;
  }
});

actions.before.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "bathtub",
  handle: () => {}
});
actions.report.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "bathtub",
  handle: function () {
    out.write(`You fill the tub with hot water from the garden hose
    plumbing before getting in.  It's just you, the water, the
    bathtub, and the large Etruscan mural.  Once satisfied, you then
    drain the bath.`);
  }
});

function handle_jump_off_roof(parse) {
  if (["The Roof", "The Poop Deck"].includes(world.containing_room(world.actor))) {
    return making_mistake(`The GRA comes out and stops you, "remember the
    zeroth [ask 'rules of tEp/Xi' 'rule of tEp/Xi']! Don't die!"`);
  } else {
    return undefined;
  }
}

parser.action.understand("jump off", handle_jump_off_roof);
parser.action.understand("jump off roof", handle_jump_off_roof);
parser.action.understand("jump off the roof", handle_jump_off_roof);

/****************/
/*** Basement ***/
/****************/

def_obj("Basement", "room", {
  name: "The Basement Hallway",
  description: `[img b/basement/look.jpg left]You have
  reached the basement of tEp/Xi, which, from the base of the
  stairs, appears to be a long hallway running north to south.

  [para]There are a multitude of rooms along this hallway:
  you can go [dir northwest] to the bikeroom, [dir west] to the
  tool closet, [dir southwest] to the downstairs kitchen,
  [dir south] into milk crate land, [dir southeast] to the poop
  closet, [dir east] to the paint closet, [dir down] into the
  cave, [dir north] to the backlot, and [dir northnorthwest] to
  the Tep-o-phone closet.  You can also go back [dir upstairs].

  [para]You can look [look north], [look west], [look south],
  and [look up].`
});
make_known("Basement");
world.connect_rooms("Basement", "southwest", "The Kitchen");
world.connect_rooms("Basement", "northwest", "The Bike Room");
world.connect_rooms("Basement", "north", "The Backlot");
world.connect_rooms("Basement", "northnorthwest", "tepophone closet");
world.connect_rooms("Basement", "west", "The Tool Closet");
world.connect_rooms("Basement", "east", "The Paint Closet", {via: "Paint Closet door"});
world.connect_rooms("Basement", "southeast", "The Poop Closet", {via: "Poop Closet door"});
world.connect_rooms("Basement", "south", "Milk Crate Land", {via: "heavy metal door"});
world.connect_rooms("Basement", "down", "The Cave");

world.direction_description.set("Basement", "north", `
[img b/basement/look_n.jpg left]To the [dir north], you see the door
to the backlot, and to the [dir northwest] you see the entrance to the
bikeroom.  There's also [a 'liquid nitrogen cylinder'] sitting in
the hallway.`);
world.direction_description.set("Basement", "west", `
[img b/basement/look_w.JPG left]Spraypainted in large letters is a
credo attesting the existence of magnetic monopoles.`);
world.direction_description.set("Basement", "south", `
[img b/basement/look_s_2024.jpg left]At the end of the hallway to the
[dir south] is milk crate land, and near that, but out of sight, is the
kitchen to the [dir southwest].  You can also see the entrance to the
tool closet to the [dir west] and the way [dir down] to the cave.

[para] On the floor you can see [the 'Gate to Hell'], a shoddily painted
light purple panel on the floor.`);
world.direction_description.set("Basement", "up", `
[img b/basement/look_u.jpg left]You see the way back [dir upstairs]
to the first floor.`);

def_obj("Gate to Hell", "thing", {
  is_scenery: true,
  no_take_msg: `The panel is screwed into the floor, and also important
  for making there not be a hole in the floor.`,
  description: `This is the Gate to Hell. It has been opened, closed, reopened,
  expaned, and reclosed, several times to access leaking pipes in the 
  subbasement and to accomodate plumbers too large to fit in the original 
  hole.`
}, {put_in: "Basement"});

// TODO: allow navigation into Hell -- requires another direction
def_obj("hell", "thing", {
  is_scenery: true,
  no_take_msg: `It would be pretty hard to take Hell with you, don't you think?.`,
  description: `The Gate to Hell leads to the subbasement which leads to Hell and
  all of the monsters and creatures within. Fortunately the Gate to Hell is currently
  sealed, but it was a bit dicey for a bit. We kept having to send xiblings down to
  fend off the invading hoards.`
}, {put_in: "Basement"});

def_obj("liquid nitrogen cylinder", "thing", {
  added_words: ["of", "@nitrogen", "ln2", "@ln2"],
  is_scenery: true,
  no_take_msg: `The cylinder is very large, and therefore
  too hard for you to take.`,
  description: `[img b/basement/cylinder.jpg left]This is a
  large cylinder for liquid nitrogen.  It is one of those things
  which is good to have on hand.  Fun fact: liquid nitrogen
  is cheaper than milk per gallon.`
}, {put_in: "Basement"});

def_obj("dewar", "thing", {
  description: `[img b/basement/dewar.jpg left]This is a
  portable dewar for liquid nitrogen.  It's basically a large
  thermos for handling very cold liquids.`,
  openable: true,
  is_open: false
}, {put_in: "Basement"});

// TODO make a model for filling the dewar
all_are_mistakes(["fill [obj dewar]"], `There's no more liquid nitrogen to
fill the dewar with; the LN2 cylinder is empty.`);

///
/// The Paint Closet
///

def_obj("Paint Closet door", "door", {
  is_scenery: true,
  description: `[img b/paintcloset/door_2024.jpg left]This is the
  door to the paint closet. It has very clear instructions on how to
  properly use the paint supplies.`
});

def_obj("The Paint Closet", "room", {
  description: `[img b/paintcloset/look_2024.jpg left]There are a
  lot of colors, and therefore a lot of paint.  Thus, this
  closet.  You can go [dir west] back to the basement
  hallway.`
});

///
/// The Poop Closet
///

def_obj("Poop Closet door", "door", {
  is_scenery: true,
  description: `[img b/poopcloset/door_2024.jpg left]This is the
  door to the poop closet. It has a list of the items you can expect to find.`
});

def_obj("The Poop Closet", "room", {
  description: `[img b/poopcloset/look_2024.jpg left]It's a place
  to keep the toilet paper, paper towels, and garbage bags.  You
  can go [dir northwest] to the basement hallway.`
});

///
/// The Kitchen
///

def_obj("The Kitchen", "room", {
  name: "The Downstairs Kitchen",
  description: `[img b/kitchen/look.jpg left]This is a
  commercial-grade kitchen.  All residents of the house may use
  it, but it's mainly used by the haus f\u00fcd program:
  xisters cook dinner for each other every school night.  You
  can go [dir northeast] back to the basement, and you can look
  [look north], [look west], [look south], and [look east].`
});
make_known("The Kitchen");

world.direction_description.set("The Kitchen", "north", `
[img b/kitchen/look_n.JPG left]To the north are some fridges.`);
world.direction_description.set("The Kitchen", "west", `
[img b/kitchen/look_w.JPG left]Along the western wall is a gas
stovetop.`);
world.direction_description.set("The Kitchen", "south", `
[img b/kitchen/look_s.JPG left]You look south, getting a good view of
the main work areas in the kitchen.`);
world.direction_description.set("The Kitchen", "east", `
[img b/kitchen/look_e.JPG left]The kitchen even has a sink.`);

///
/// The Bike Room
///

def_obj("The Bike Room", "room", {
  description: `[img b/bikeroom/look_2024.jpg left]The bikeroom is
  where tEp/Xis keep their bikes. You can go [dir southeast] back
  to the basement hallway or [dir south] to the server room and you 
  can look [dir north] or [dir northeast].`
});
make_known("The Bike Room");

world.direction_description.set("The Bike Room", "north", `
[img b/bikeroom/look_n_2024.jpg left]To the north is Stockland where we
store wood scraps for personal and house projects.`);
world.direction_description.set("The Bike Room", "northeast", `
[img b/bikeroom/look_ne_2024.jpg left]In the northeast corner is the weight "room"
which contains a variety of exercise equipment.

[para]Behind that you can see some paneling where the old dumbwaiter used to be. Originally
this room was the kitchen and only many years after being rennovated was the
dumwaiter finally closed.`);

world.connect_rooms("The Bike Room", "south", "The Server Room");

def_obj("The Server Room", "room", {
  description: `[img b/servers/look.jpg left]Since this is
  where the Internet comes into the house, people's server
  machines have flocked to the area despite the lack of air
  conditioning. Before "the cloud", this room was a fixed point of
  this virtual house tour.  You can go [dir north] to the bike room or [dir east]
  into the laundry room.`
});
make_known("The Server Room");
world.connect_rooms("The Server Room", "east", "The Laundry Room");

///
/// The Laundry Room
///

def_obj("The Laundry Room", "room", {
  description : `[img b/laundry/look.JPG left]This is the room
  that makes all tEp/Xis smell the same: free laundry, including
  detergent, is part of the deal of living at tEp/Xi.  You see
  [ob washer 'a washing machine'], [a 'dryer'], [ob 'laundry sink' 'a sink'],
  and [ob 'laundry shelves' 'some shelves'].  You can go [dir west].`
});
make_known("The Laundry Room");

def_obj("washer", "container", {
  words: ["@washer", "clothes", "washing", "@machine"],
  is_scenery: true,
  openable: true,
  is_open: false,
  switchable: true,
  description: `[img b/laundry/washer.JPG left]This is one of
  the two trusty washers.`
}, {put_in: "The Laundry Room"});

def_obj("dryer", "container", {
  words: ["clothes", "@dryer"],
  is_scenery: true,
  openable: true,
  is_open: false,
  switchable: true,
  description: `[img b/laundry/dryer.JPG left]This is one of
  the two trusty dryers.`
}, {put_in: "The Laundry Room"});

def_obj("laundry shelves", "supporter", {
  definite_name: "the shelves",
  indefinite_name: "some shelves",
  is_scenery: true,
  description: `[img b/laundry/shelves.JPG left]When a xister
  comes across a dryer they want to use that has someone else's
  clothes, they dutifully put them in a plastic bag and set them
  on these shelves.`
}, {put_in: "The Laundry Room"});

def_obj("laundry sink", "container", {
  printed_name: "sink",
  is_scenery: true,
  description: `[img b/laundry/sink.JPG left]This sink
  contains paint stains as well as bottles of detergent.`
}, {put_in: "The Laundry Room"});

def_obj("detergent", "thing", {
  indefinite_name: "some detergent",
  description: `This is a bottle of detergent of the
  clothes-cleansing variety.`
}, {put_in: "laundry sink"});

///
/// The Tool Closet
///

//TODO: internal tool room directions are correct but basement room navigation is outdated
def_obj("The Tool Closet", "room", {
  description: `[img b/toolroom/look_2024.jpg left]Since tEp/Xi is a
  do-it-yourself kind of place, there is a room devoted to
  keeping tools.  This is that room.  You can look [look southwest] or [look southeast]
  or go [dir east] back to the basement hallway.`
});

world.direction_description.set("The Tool Closet", "southwest", `
[img b/toolroom/look_sw_2024.jpg left]Observe the utility sink which does not drain.`);

world.direction_description.set("The Tool Closet", "southeast", `
[img b/toolroom/look_se_2024.jpg left]Look at all those fine tools.`);

///
/// Milk Crate Land
///

def_obj("heavy metal door", "door", {
  is_scenery: true,
  description: `[img b/milkcrate/door.jpg left]This is the
  door to milk crate land.`
});

def_obj("Milk Crate Land", "room", {
  description: `[img b/milkcrate/look.jpg left]When tEp/Xi gets
  milk from distributors, it comes in milk crates.  However,
  it's never been clear what one does with the milk crates after
  they arrive.  After some time, milk crate land has become a
  wonderous place of milk crates and wonder.`
});
make_known("Milk Crate Land");

def_obj("milk crate", "container", {
  added_words: ["@milkcrate"],
  description: `[img b/milkcrate/milkcrate.JPG left]This is a
  standard-issue milk crate.`
}, {put_in: "Milk Crate Land"});

///
/// The Tep-o-phone Closet
///

def_obj("tepophone closet", "room", {
  name: "The Tep-o-phone Closet",
  added_words: ["tepophone"],
  description: `[img b/tepophone/look.jpg left]Built from
  relays that fell out of a Bell telephone truck by [ask 'Fred Fenning']
  while he was failing his telephony class, Tep-o-phone was a state-of-the-art
  telephone switching system that let the outside world dial individual rooms, switching tEp/Xi's six external lines.
  It also let people call the laundry room (Mr. Washer and Ms. Dryers) to see if there were free
  machines.  Sadly, Tep-o-phone has since fallen into disrepair
  with the now-widespread use of cell phones, but every once in a while it tries
  to connect a call for old time's sake.

  [para]You can go [dir southsoutheast] back to the basement hallway.`
});
make_known("tepophone closet");

///
/// The Backlot
///

def_obj("The Backlot", "room", {
  added_words: ["back", "@lot"],
  description: `[img b/backlot/look.JPG left]This is where
  people park their cars or come into the house with their
  bikes.  It is also home of [the 'oobleck drain'].  You can
  go [dir south] back into the house, and you can look
  [look north], [look west], [look south], [look east], and [look up].`
});
make_known("The Backlot");

world.direction_description.set("The Backlot", "north", `
[img b/backlot/look_n.JPG left]To the north, you can see dumpsters and
neighbors along the back alley.`);
world.direction_description.set("The Backlot", "west", `
[img b/backlot/look_w.JPG left]You look west down the back alley.`);
world.direction_description.set("The Backlot", "south", `
[img b/backlot/look_s.JPG left]To the [dir south], you can see the
door to the basement of tEp/Xi.`);
world.direction_description.set("The Backlot", "east", `
[img b/backlot/look_e.JPG left]You look east down the back alley.`);
world.direction_description.set("The Backlot", "up", `
[img b/backlot/look_u.JPG left]Rising above you, the purple palace
looks surprisingly ordinary from the backlot. Irving notes that
there's a really good view of the colorful lights at night from here.`);

world.no_go_msg.add_method({
  when: (x, dir) => x === "The Backlot",
  handle: (x, dir) => `Nah, you don't need
to leave that way!  This is a virtual tour: just close your web
browser if you want to quit.`
});

def_obj("oobleck drain", "supporter", {
  enterable: true,
  is_scenery: true,
  description: `[img b/backlot/drain.JPG left]The oobleck
  drain is a big square of cement with a hole, through which
  tEp/Xis dump a kiddie pool of [ask oobleck] every year.  With the
  oobleck drain, cleanup is a breeze!`
}, {put_in: "The Backlot"});

///
/// The Cave
///

def_obj("The Cave", "room", {
  added_words: ["boiler", "@room"],
  description: `[img b/cave/look.JPG left]This is the machine
  room of tEp/Xi, containing [the boiler] and [ob 'hot water heater' 'the water heater'].
  You can look [look south], [look east], and [look up], and you can go
  [dir upstairs] back to the basement hallway or [dir south] into the deep cave.`
});
make_known("The Cave");

world.direction_description.set("The Cave", "south", `
[img b/cave/look_s.jpg left]To the [dir south] is a dimly lit
corridor.`);
world.direction_description.set("The Cave", "east", `
[img b/cave/look_e.JPG left]You see the stairs that lead
[dir upstairs] to the basement hallway.`);
world.direction_description.set("The Cave", "up", `
[img b/cave/look_u.JPG left]Above you are a tangle of pipes and ducts
going who knows where.`);

world.connect_rooms("The Cave", "south", "Dark Corridor");
world.connect_rooms("Dark Corridor", "south", "The Deep Cave");

def_obj("boiler", "thing", {
  added_words: ["old", "@ironsides"],
  is_scenery: true,
  description: `[img b/cave/boiler.jpg left]This is Old Ironsides, the
  100-year-old boiler that powers the radiators on the back side of
  the house.  It has no pump; it instead relies on the hot water
  rising due to convection.  The boiler has been retrofitted to
  use oil rather than coal, where there are some nozzles set
  up to spray burning oil in the general direction of the water pipe.
  tEp/Xi has a million dollar boiler insurance policy in the event it takes
  out part of the block.`
}, {put_in: "The Cave"});

def_obj("hot water heater", "thing", {
  is_scenery: true,
  description: `[img b/cave/heater.jpg left]Unlike [the boiler],
  this water heater is fairly new.  When some xisters were
  working on the valve of a fifth-floor shower, the old heater
  shot hot, black sludge at them through almost a hundred feet
  of pipe as they wondered what they possibly could have done to
  deserve that.  Because the water heater was grandfathered into
  some tEp/Xi insurance policy, it was replaced at no charge,
  though we had a full month of cold showers.`
}, {put_in: "The Cave"});

def_obj("Dark Corridor", "room", {
  description: `[img b/cavehall/look.jpg left]You're in the
  middle of a dimly lit corridor which continues to the [dir south].
  You can both look [look north] and go [dir north].`
});
make_known("Dark Corridor");

instead_of(({verb, dir}) => (verb === "looking toward" && dir === "south"
                             && world.containing_room(world.actor) === "Dark Corridor"),
           action => looking());

world.direction_description.set("Dark Corridor", "north", `
[img b/cavehall/look_n.jpg left]You can see the way back [dir north]
to the cave.`);


///
/// The Deep Cave
///

def_obj("The Deep Cave", "room", {
  description: `[img b/deepcave/look.JPG left]This room lies
  directly underneath the front garden and is the perfect place
  to keep a big pile of junk.  You can leave to the [dir north].`
});
make_known("The Deep Cave");

/***********************************/
/*** Consulting Irving Q. Tep... ***/
/***********************************/

/*
We define a new kind called "lore" that represents stories that Irving Q. Tep can
talk about.  Lore acts just like things in that they have a name, words, and a
description.  We also add a lore parser.
*/

def_kind("lore", null);

def_parser("lore", {
  doc: "Parse lore"
});
parser.lore.add_method({
  name: "main parser",
  handle: function* (cache, s, toks, i) {
    yield* this.next();
    for (var m of make_parse_kind("lore")(cache, s, toks, i)) {
      if (m.end === toks.length) {
        yield m;
      }
    }
  }
});

// A bunch of synonyms for asking Irving about something

parser.action.understand("ask about [text y]", parse => asking_about("Irving Q. Tep", parse.y));
parser.action.understand("tell me about [text y]", parse => asking_about("Irving Q. Tep", parse.y));
parser.action.understand("what's/who's/whois [text y]", parse => asking_about("Irving Q. Tep", parse.y));
parser.action.understand("what/who is/are [text y]", parse => asking_about("Irving Q. Tep", parse.y));
parser.action.understand("what does [text y] mean ?", parse => asking_about("Irving Q. Tep", parse.y));
parser.action.understand("what does [text y] mean", parse => asking_about("Irving Q. Tep", parse.y));
parser.action.understand("ask [something x] what/who [text y] is",
                         parse => asking_about(parse.x, parse.y));

actions.report.add_method({
  name: "ask irving",
  when: action => action.verb === "asking about" && action.dobj === "Irving Q. Tep",
  handle: function (action) {
    let s = action.text;
    if (s[s.length - 1] === "?") {
      s = s.slice(0, s.length - 1);
    }
    var matches = Array.from(parser.lore({}, s, tokenize(s), 0));
    // sort by decreasing order
    matches.sort((m1, m2) => m2.score - m1.score);
    if (matches.length > 0) {
      let best_score = matches[0].score;
      matches = matches.filter(m => m.score === best_score);
      if (matches.length === 1) {
        // success!
        out.write(world.description(matches[0].value));
        return;
      } else {
        out.write(`Irving Q. Tep says "There are a few things that come to mind.
        Did you want to hear about `);
        out.serial_comma(matches.map(m => () => out.ask(world.name(m.value))), {conj: "or"});
        out.write(`?"`);
      }
    } else {
      out.write(`Irving Q. Tep isn't sure what to say about that.  It's
      possible you mean to `);

      out.wrap_action_link("examine " + s, () => {
        out.write_text("examine " + s);
      });
      out.write(".");
    }
  }
});

///
/// Lore
///

/*
These are basically short entries for a wiki-like system of things about the
house and tEp/Xi that you couldn't learn just by looking at objects.

Links are created by [ask x] for a link to x, or [ask x text] for a link to
x with specific link text.

The naming scheme is to have the object id be "lore: unique name" (it doesn't
really matter), and then putting the actual link name in the name field. This
way if there actually is a sawzall lying around (which there shouldn't), the
description of the sawzall lore won't eit it.
*/

def_obj("lore: stupidball", "lore", {
  name: "stupidball",
  description: `Stupidball is a fine game in which
  contestants take a large exercise ball and throw it around the
  center room at high energy.  This game has [ask eit eited]
  many things, such as the chandelier in the center room.`
});

def_obj("lore: eit", "lore", {
  name: "eit",
  words: ["@eit", "@eited"],
  description: `Rhymes with 'fight,' eit is an exclamation of
  a Bad Thing.  As a verb, it means to knock an object out of
  a person's hands, to cause a Bad Thing to happen, often followed
  by the exclamation "eit!"

  [para]Proper eitiquette is subtle.  Eit means never having to say you're sorry:
  discretion is necessary when eiting, but do not needlessly detract from a
  beautiful eit with platitudes such as "Hubert, I am sorry I eited your toast,
  jelly side down, onto tEp/Xi's unswept kitchen floor." Savor the moment.

  [para]It is proper to recognize eitful misfortune.  If you told me you didn't
  do well on an exam, I might say "eit, man!" But if your family just
  got eaten by a pack of wolves? Not an eit!

  [para]There is a mural in [action 'go to 22' 22]
  commemorating the sacrament of eit.`
});

def_obj("lore: rules of tEp/Xi", "lore", {
  name: "rules of tEp/Xi",
  words: ["rule", "rules", "of", "tep", "xi", "@rules"],
  description: `The rules of tEp/Xi are threefold:
  [enter_block ol][attr start 0]
  [enter_block li]Don't die;[leave]
  [enter_block li]Hobart is not a dishwasher;[leave]
  [enter_block li]Do not Hobart the cat;[leave]
  [enter_block li]All explosions must be videotaped;[leave]
  [leave]
  Amendment 1. No [ask Sawzalls] without the express permission of
  the [ask 'house mangler']; and
  [para]Amendment 2. The house mangler must not permit the use of Sawzalls.`
});

def_obj("lore: sawzall", "lore", {
  name: "sawzall",
  words: ["@sawzall", "@sawzalls"],
  description: `A Sawzall is a hand-held reciprocating saw
  that can basically cut through anything.  Their prohibition
  was made into one of the [ask 'rules of tEp/Xi'] after one
  xister repeatedly cut down the wall between 51 and 52 during
  the summer months to make a mega room, where it was the duty
  of the [ask 'house mangler'] to mend the wall at the end of
  each summer for [ask 'work week'].`
});

def_obj("lore: work week", "lore", {
  name: "work week",
  description: `Work week occurs once at the end of the
  summer and once during winter break, and it's a time where
  tEp/Xis try to repair the house.`
});

def_obj("lore: house mangler", "lore", {
  name: "house mangler",
  words: ["house", "@mangler", "@manager"],
  description: `The house mangler has one of the most important
  jobs in the house: to make sure the house doesn't fall down.
  The house mangler accomplishes this by getting xisters
  to do their work assignments and to schedule [ask 'work week'].`
});

def_obj("lore: 22", "lore", {
  name: "22",
  words: ["@22", "@twenty-two", "twenty", "@two"],
  description: `[enter_inline i]myst. num.[leave] Twenty-two is a number of
  cosmic significance.  Showing up everywhere, signifying everything.`
});

def_obj("lore: oobleck", "lore", {
  name: "oobleck",
  description: `Oobleck is a non-newtonion fluid consisting
  of corn starch and water.  The interesting property of oobleck
  is that, while it normally a liquid, it solidifies as soon as
  you put any pressure on it.  During rush every year, 600
  lbs. of corn starch are acquired for the purpose of filling a
  kiddie pool in the dining room with oobleck.`
});

def_obj("lore: bouncers", "lore", {
  name: "Bouncers",
  words: ["@bouncer", "@bouncers"],
  description: `A Bouncer\u2122 is a now-discontinued durable
  plastic cup by Rubbermaid.  It's like a tall mug (useful for
  [ask 'hot cocoa' cocoa]), and it is a sky diver's beverage container of choice since it
  can be dropped from the Green Building without
  sustaining any damage.  Bouncers bounce.

  [para]The Bouncer is the standard unit of volumetric measurement.`
});

def_obj("lore: gruesz", "lore", {
  name: "Gruesz",
  words: ["@gruesz", "@grueszer", "@grueszed", "@grueszing"],
  description: `1. [enter_inline i]name[leave]. Carl Gruesz, an alumnus of Xi
  Chapter. 2. [enter_inline i]v[leave]. To scavange useful stuff that others
  have thrown away from the alleys of the Back Bay or corridors
  of MIT. Named after Carl, the Master Grueszer. Homeophony
  between "Gruesz" and "re-use" is apparently coincidental.`
});

def_obj("lore: U.S.S. Birthday Ship", "lore", {
  name: "U.S.S. Birthday Ship",
  added_words: ["uss"],
  description: `This is one of the one-hundred names of tEp/Xi,
  referring to how, at tEp/Xi, it's always your birthday.`
});
parser.lore.understand("U.S.S. Birthday Ship", parse => "lore: U.S.S. Birthday Ship");

def_obj("lore: squids", "lore", {
  name: "squids",
  added_words: ["@squidz"],
  description: `A social gathering in memory of the Squids
  [ask peldge] class, who enjoyed being antisocial by listening to
  Philip Glass, wearing black turtlenecks, and sipping on
  G&Ts.`
});

def_obj("lore: grape soda", "lore", {
  name: "grape soda",
  added_words: ["@soder", "@s\u00f6der"],
  description: `1. [enter_inline i]n[leave]. The official beverage product of
  tEp/Xi. Servered in a frosty [ask Bouncer] or
  straight from the can. Grape S\u00f6der has been used in the
  ancient [enter_inline i]velkomin' d\u00fcr froshinperzons[leave] ritual since
  time immemorial:

  [para]Welcome to TEP, where we like to schlep Grape S\u00f6der! //
  Welcome to XI, it's frosty and wet, and it's caffeine free!

  [para]Other uses of Grape S\u00f6der include:
  [enter_block ul]
  [enter_block li]Replacement for sulfuric acid in car batteries.[leave]
  [enter_block li]Antimicrobial solution for open sores and wounds.[leave]
  [enter_block li]Head and body delousing shampoo.[leave]
  [enter_block li]All-purpose oven cleaner.[leave]
  [enter_block li]Pressurized nuclear reactor cooling fluid.[leave]
  [enter_block li]Alumni.[leave]
  [leave]`
});

def_obj("lore: honig", "lore", {
  added_words: ["david", "dah", "andrew"],
  name: "David Andrew Honig",
  description: `Honig. 1. [enter_inline i]excl[leave]. A greeting, often as an
  identifier in a large crowd. 2. [enter_inline i]prop. n.[leave] A former
  xister and famous Objectivist, David Andrew Honig, although
  looked upon as antisocial, has become the mascot of tEp/Xi.`
});

def_obj("lore: fenning", "lore", {
  name: "Fred Fenning",
  description: `The renowned and illustrious Fred Fenning was
  the founding member of the present incarnation of Xi chapter,
  which was [ask recolonization recolonized] in 1971.`
});

def_obj("lore: recolonization", "lore", {
  name: "recolonization",
  description: `While Xi chapter was founded in 1918, its
  existence ceased in the late 60s when the brothers decided to
  stop doing things like paying dues and taxes.  A couple of
  years later, [ask 'Fred Fenning'] hung out at The Coffeehouse and
  got a new group together to recolonize.`
});

def_obj("lore: batcave", "lore", {
  name: "batcave",
  added_words: ["bat", "@cave"],
  description: `Maybe you should go find it for yourself!`
});

def_obj("lore: virtual house tour", "lore", {
  name: "virtual house tour",
  added_words: ["@teptour"],
  description: `The virtual house tour in its interactive fiction form
  was originally written by Kyle Miller at the end of Summer
  2011 and then rewritten in 2021.`
});

def_obj("lore: foosball", "lore", {
  name: "foosball",
  description: `Foosball condenses human obsession with
  balls, lines, and goals to a cosmic game for 2-4 entities
  capable of turning and translating arbitrary handles.`
});

def_obj("lore: angst", "lore", {
  name: "angst",
  description: `A feeling of anxiety, especially that your
  life and that of everyone else sucks and that you can't do anything about
  it. Commonly found at tEp/Xi under trash cans, behind doors, and often out in the open.

  [para]The SI unit of Angst is the [ask Stovall].`
});

def_obj("lore: angst wall", "lore", {
  name: "Angst Wall",
  description: `A section of wall at tEp/Xi on the second floor on which it is
  socially acceptable to record feelings of angst. The Angst Wall was started by
  [ask 'druler' drooling] alumnus Julio Freedman, who lived in Room 24 adjacent to the Angst Wall,
  and created it by writing ANGST in four-foot high letters with colored chalk. While
  this raised the angst of anal-retentive xisters who did not approve of defacing
  the pristine walls of tEp/Xi, it brought much relief to others and has therefore been
  continued to the present day. When the angst gets too extreme or dense, the wall is repainted.

  [para]Recently, tepeological studies have begun to search for the Original Angst by peeling
  away the many layers of paint. The material removed is Concentrated Angst and must be handled
  with extreme care.`
});

def_obj("lore: banister of blasphemy", "lore", {
  name: "Banister of Blasphemy",
  description: `You'll have to come over and find this one for yourself.`
});

def_obj("lore: blooter", "lore", {
  name: "blooter",
  description: `1. [em 'adj.'] Incredibly huge. 2. [em 'n. (rare)'] A person
  matching said physical characteristics. 3. [em 'n. (most common usage today)'] The
  16 oz coffees sold by the SCC 24 Hour Coffeehouse. These were named by Bo, a
  tEp who worked a lot of shifts at the time that the new cups were introduced.`
});

def_obj("lore: coffee hour", "lore", {
  name: "Coffee Hour",
  description: `A fine tEp/Xi social tradition. On Sunday, we come down in
  bathrobes to the front room, partake in delicious donuts and bagels, drink coffee,
  and fight over the comics.`
});

def_obj("lore: Crock Opera", "lore", {
  name: "Crock Opera",
  description: `The Comic Rock Opera, or Crock Opera, is a musical comedy put on
  every year by the [ask 'druler' 'Drooling Alums'] of tEp/Xi. It is performed at tEp/Xi on the Sunday
  night of Rush Week.  A fine tEp/Xi social tradition.`
});

def_obj("lore: druler", "lore", {
  name: "druler",
  added_words: ["@drool", "drooling"],
  description: `An old, decrepit, drooling tEp/Xi. Usually graduated.
  Likes to say things like "when I was a freshman" and "did you say...tuition?"`
});

def_obj("lore: felch", "lore", {
  name: "felch",
  description: `1. [em v]. An act of love. (Don't look it up.)`
});

def_obj("lore: fire extinguisher pudding", "lore", {
  name: "fire extinguisher pudding",
  description: `Place instant pudding and water in a fire extinguisher.  Shake. Spray. Run away fast.`
});

def_obj("lore: foam room", "lore", {
  name: "foam room",
  description: `1. A great place to escape to. 2. A great place to use the phone. 3. A great place to be
  buried alive in foam chunks.`
});

def_obj("lore: fust", "lore", {
  name: "fust",
  description: `The nasty stuff you find in your belly button, under the bed, in the corners
  of showers, etc.`
});

def_obj("lore: gleet", "lore", {
  name: "gleet",
  description: `1. [em n]. The food of gods.`
});

def_obj("lore: hanging couch", "lore", {
  name: "hanging couch",
  description: `It's what it sounds like! Go see it in [action 'go to 23' 23].`
});

def_obj("lore: hot cocoa", "lore", {
  name: "hot cocoa",
  description: `1. [em n]. A soothing beverage made from hot, fresh milk, real chocolate
  cocoa powder, and a buttload of sugar. 2. [em n]. One of tEp/Xi's oldest social
  institutions; at midnight on the first Tooling day of the week (nominally a Monday),
  tEp/Xi hosts Hot Cocoa. Many of our friends from Cambridge perambulate across the Charles
  (or take SafeRide) to eat sugary stuff, imbibe the chocolate nectar, and hang out.
  A good time to play [ask Ridiculo-Ball] and other silly games.`
});

def_obj("lore: musical stairwell", "lore", {
  name: "musical stairwell",
  description: `1. [em n]. Found between the second and third floors of tEp/Xi on the
  back stairwell, the musical stairwell uses infrared triggers to sense footfall
  and plays a cheesy synthesizer. Songs can be played on the stairwell by those with
  skill and long legs.

  [para]Go see it in [action 'go to second floor of back stairwell' 'the back stairwell'].`
});

def_obj("lore: peldge", "lore", {
  name: "peldge",
  added_words: ["@pledge"],
  description: `Peldge is a replacement for the word "pledge."`
});

def_obj("lore: pickles", "lore", {
  name: "pickles",
  description: `Pickles is an indication of veracity added after any sentence.
  Its use began when TEP Alum Chris "Swifty" Hohmann so frequently imparted
  the world with his creative reinterpretations of reality that his xisters
  began to doubt that at any time he was telling the truth. Andrea Born Benco
  evetually found out from Swifty that a Swifty-statement could be tested with
  the one-word question--"Pickles?" the reply to which would also be pickles
  if he was indeed telling the truth.

  [para]The use of this word has caught on with other Xis. However, its usability
  depends on a continued respect for the eternal sanctity of the word pickles.`
});

def_obj("lore: powerball", "lore", {
  name: "PowerBall",
  description: `Similar to [ask Ridiculo-Ball] but more violent and difficult.  It
  uses the same cheap Star Market type ball as Ridiculo-Ball.

  [para]The rules are as follows:
  [enter_block ul]
  [enter_block li]The Server takes the ball and hits it up with his or her knee.
    A valid serve is one which hits the ceiling of the Front Room.[leave]
  [enter_block li]The Receiver allows the ball to bounce off of the floor, and
    then whacks the stuffing out of it down into the carpet. A valid return goes
    down into the carpet, then up and touches the ceiling, then back down to the
    floor (this part is not hard) where the other player must continue the volley.[leave]
  [enter_block li]If the Reciever ever fails to return a volley, the Server
    gains a point. If the Server fails to return a volley, the serve passes to
    the other player.[leave]
  [enter_block li]There are no out of bounds. Play off of walls, windows, pianos,
    and furniture is encouraged.[leave]
  [enter_block li]Play continues until one player acquires [ask 22] points, or dies
    of exhaustion. In this case the surviving player wins. Both doubles and
    tag team play are allowed.[leave]
  [leave]`
});

def_obj("lore: punt", "lore", {
  name: "punt",
  description: `1. [em v]. To kick a football. 2. [em v]. To blow off one's
  required tooling. In general use Institvte-wide.`
});

def_obj("lore: Ridiculo-Ball", "lore", {
  name: "Ridiculo-Ball",
  description: `Ridiculo-Ball is one of the many silly center room games played
  at tEp/Xi. Rules change constantly, but a rough synopsis is as follows:
  [enter_block ul]
  [enter_block li]Players encircle a low trash can and wield a large, inexpensive,
    soft, and, well "ridiculo ball." They try to get the ball into the trash can by
    bouncing it off the floor and into the can.[leave]
  [enter_block li]"It" has the softball glove. "It" tries to prevent the ball from
    going into the trash can by hurling the glove at high velocity.[leave]
  [enter_block li]If a player gets the ball into the trash can, there is much joy, and
    they become "It."[leave]
  [enter_block li]The game ends when we get bored.[leave]
  [leave]
  See also, [ask PowerBall].`
});

def_obj("lore: schmedley", "lore", {
  name: "Schmedley",
  description: `Schmedleys are the small finger-puppet monsters made out of rubber.
  Each [ask peldge] at tEp/Xi is given a Schmedley. Losing your Schmedley is bad.
  Stealing someone else's Schmedley is good.`
});

def_obj("lore: spleen", "lore", {
  name: "Spleen",
  description: `The Spleen is a tEp/Xi's most important organ.  While the brain is
  occasionally useful for passing final examinations, surviving job interviews,
  etc., the Spleen provides round-the-clock protection from unexpected illness.
  At MIT, this vital organ allows one to:
  [enter_block ul]
  [enter_block li]Come within 22 feet of Charles River water.[leave]
  [enter_block li]Smell Lobdell food and suffer only temporary disorientation.[leave]
  [enter_block li]Watch William Shatner try to act for more than 15 continuous minutes.[leave]
  [leave]
  We find we cannot praise the Spleen too highly. See, for example, the 1993 [ask 'Crock Opera']
  Radical Splenectomy or Irving Q. Tep's scholarly study (in [action 'go to 43']) of Shakespeare's
  use of the Spleen.`
});

def_obj("lore: Stovall", "lore", {
  name: "Stovall",
  description: `1. [em 'proper n']. TEP Alum Jeff Stovall, a.k.a. "Captain Angst."
  2. [em n]. The SI unit of [ask Angst]. Like the farad, the stovall is an unwieldy unit;
  the intensity of the Angst field around a regular "bad day" is in the range of
  microstovalls. Most human beings can only stand Angst on the order of 10 to 20
  millistovalls for a few minutes before expiring. For unknown reasons, MIT students
  seem to be capable of surviving for up to 4 months in Angst fields as high
  as 300 to 400 millistovalls.`
});

def_obj("lore: Tep-O-Phone", "lore", {
  name: "Tep-O-Phone",
  description: `tEp/Xi's former internal phone system.  Go visit [action 'go to The Tep-o-phone Closet' 'the Tep-O-Phone closet'].`
});

def_obj("lore: whumph bag", "lore", {
  name: "whumph bag",
  description: `1. [em n]. Large rubber bladder, with person A standing on it.
  Person B jumps onto the bag. Person A is propelled into the air with the greatest of whees.`
});

/**********************/
/*** Start the game ***/
/**********************/

window.addEventListener("load", () => {
  init_output("output");
  start_game_loop();
});
