// teptour.js
//
// The tEp virtual house tour!
// (c) 2021 tEp, Xi Chapter
//
// Authors: Kyle Miller
//
// Adapted from a version in Python from 2011.

world.global.set("release number", "0.22 (January 2021)");

world.global.set("game title", "The tEp Virtual House Tour");
world.global.set("game headline", "A factual fantasy");
world.global.set("game author", "tEp, Xi chapter");
world.global.set("game description", `Although you're still where you
were, you're now where you are since [ob 'Irving Q. Tep'] has brought
you to the Purple Palace, 253 Comm. Ave.`);

///
/// Fun and games
///

//// [img] command

HTML_abstract_builder.prototype.img = function (path, align) {
  out.with_block("div", () => {
    if (align === "left") {
      out.add_class("desc_img_left");
    } else {
      out.add_class("desc_img");
    }
    out.with_block("img", () => {
      out.attr("src", "images/" + path);
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

//// Other silly verbs

parser.action.understand("about", parse => asking_about("Irving Q. Tep", "virtual house tour"));
// idea: make 'quit' have you quit the game, and you end up at a computer in the house
parser.action.understand("quit", parse => making_mistake("{Bobs} should try closing the tab instead."));

all_are_mistakes(["oh/ok"], "Exactly.");
all_are_mistakes(["nice", "nice tour"], `Thanks. Now don't forget to come by real-tEp\u2122!`);
parser.action.understand("cd ..", parse => exiting());
parser.action.understand("cd [somewhere x]", parse => going_to(parse.x));
parser.action.understand("pwd/dir", parse => looking());
all_are_mistakes(["rm/su/sudo [text x]"], `Nice try, buster.`);
parser.action.understand("where am i", parse => looking());
parser.action.understand("where am i ?", parse => looking());
all_are_mistakes(["cd", "go home"], "But you already are home!");
all_are_mistakes(["honig"], `"Honig!" you shout.  You can hear vigorous acclamation all around you.`);
all_are_mistakes(["in the name of honig"], "Amen.");
all_are_mistakes(["what ?"], `You just had to
say that, didn't you.  "What?" "What?" "What?" you hear tEps
everywhere yelling back and forth throughout the house.  Finally, some
tEp figures out what's going on and silences them with "No one is
peldging, stop it!"`);
all_are_mistakes(["i wanna peldge"], `This is
virtual tEp.  If you have a bid and you're wanting to peldge, then say
the magic words where real tEp can hear you!`);
all_are_mistakes(["pray/amen"], `A chorus of
angelic voices augment that of the chaplain, who you suddenly find
next to you.  "In the name of Honig, Amen," he ends.  As you turn to
thank him for such a beautiful prayer, you see he has already slipped
away.`);
all_are_mistakes(["tep"], "That's where you are.");
all_are_mistakes(["why/how [text x]"], () => {
  out.write_text("[");
  out.write(`Sometimes while I wait for my hard drive to rev up I
wistfully contemplate what it would have been like to be able to
answer a question like that.  Alack-a-day, that was not my fate.`);
  out.write_text("]");
});
all_are_mistakes(["pickles ?"], `"I didn't make this tour!"
[ob 'Irving Q. Tep' Irving] explains, "I just repeat what I'm told."`);

all_are_mistakes(["eit"], "Eit indeed!");

var faces = [":)", ":-)", ":(", ":-(", ";-)", ":P", ":-P", ":-D"];
faces.forEach(face => { // warning: :-/ will cause an error with 'understand'
  parser.action.understand(face, parse => making_mistake(() => {
    out.write("Oooh! Let me try![para]");
    // This should be replaced by some textadv utility function at some point (once it exists)
    out.write_text(faces[Math.floor(Math.random() * faces.length)]);
  }));
});

parser.action.understand("gruesz [something x]", parse => taking(parse.x));

parser.action.understand("die", parse => attacking(world.actor));

all_are_mistakes(["burn down tep"], `The RA
comes out of nowhere, preventing {us}. "Remember the zeroth
[ask 'rules of tep' 'rule of tep']!" he says, "Don't die!"`);

all_are_mistakes(["sleep"], `You're too excited about the house tour to sleep right now!`);

// The free willy net says you can't get out even though you can...
all_are_mistakes(
  ["I thought I/you couldn't [text x]",
   "I thought you said [text x]",
   "you said [text x]",
   "but you said [text x]"],
  "Sometimes we make mistakes.");

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
  for "[action 'ask Irving about stupidball']").  You can also
  [action 'tell Irving'] about things he doesn't already know
  about.`
  // developers: see [ask ...] for links
}, {make_part_of: "player"});

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
  around tEp these days.`,
  no_take_msg: `You manage to grab ahold of the cat for a while, petting it furiously
  and making a wide assortment of "it's a cat!" faces.  But it ultimately worms its
  way out of your arms and scampers away on important cat business.`
});

def_obj("tEps", "person", {
  added_words: ["@tep"],
  is_scenery: true,
  description: `(Please just imagine there are tEps around doing zany things.
The rush budget went into 600 pounds of oobleck rather than implementing NPCs with
more depth than a puddle of spilled milk.)`
});
actions.before.add_method({
  when: action => action.verb === "taking" && action.dobj === "tEps",
  handle: function (action) {
    throw new abort_action("They wouldn't appreciate that.");
  }
});

def_obj("RA", "person", {
  added_words: ["resident", "@advisor"],
  is_scenery: true,
  description: `Like Spiderman, the RA can feel when there's trouble,
and he appears when he's needed.  And that time is not now.`
});
actions.before.add_method({
  when: action => action.verb === "taking" && action.dobj === "RA",
  handle: function (action) {
    throw new abort_action(`Assuming you saw him, the RA wouldn't appreciate that, but you don't so you can't.`);
  }
});

world.move_backdrops.add_method({
  handle: function () {
    this.next();
    world.put_in("tEps", world.location(world.actor));
    world.put_in("RA", world.location(world.actor));
  }
});


///
/// In front of tEp: 253 Commonwealth Ave
///

def_obj("253 Commonwealth Ave", "room", {
  description: `[img 1/253/look.JPG left]You are standing
  outside the illustrious Tau Epsilon Phi (Xi chapter), the
  veritable purple palace.  It is a hundred-year-old brownstone
  in the middle of Boston's Back Bay.  Outside the building is
  [a 'purple tree'] and [a 'park bench'].

  [para]Just to the [dir north] is [ob 'front door' 'the door'] to enter tEp.

  [para]You can look [look east] and [look west] along the
  street, [look up] at tEp, and [look south] toward the mall.`
});

world.direction_description.set("253 Commonwealth Ave", "west", `
[img 1/253/look_w.JPG left]Toward the west, you see that the
[ob 'purple tree'] is the only purple tree along the block.`);
world.direction_description.set("253 Commonwealth Ave", "east", `
[img 1/253/look_e.JPG left]Toward the west, you see that the
[ob 'purple tree'] is the only purple tree along the block.`);
world.direction_description.set("253 Commonwealth Ave", "south", `
[img 1/253/look_s.JPG left]Looking southward, you see the mall, which
is the grassy area between the the two streets of Commonwealth Avenue.
Directly in front of tEp is a monument to historic women of Boston,
which was erected after some brothers wrote to the city multiple times
about how unfair it was that our block was the only one without any
kind of monument.`);
world.direction_description.set("253 Commonwealth Ave", "up", `
[img 1/253/look_up.JPG left]You look up and see a bit of the
[ob 'purple tree'] along with a few of the five floors of tEp.`);

world.no_go_msg.add_method({
  when: (x, dir) => x === "253 Commonwealth Ave",
  handle: (x, dir) => `Nah, you don't need
to leave that way!  This is a virtual tour: just close your web
browser if you want to quit.`
});

def_obj("front garden", "container", {
  is_scenery: true,
  enterable: true,
  description: `[img 1/253/garden.JPG left]This is the front
  garden, in which are [the 'purple tree'] and [a 'park bench'].`
}, {put_in: "253 Commonwealth Ave"});

def_obj("purple tree", "thing", {
  is_scenery: true,
  description: `[img 1/253/tree.JPG left]Looking both ways,
  you see that this is the only purple tree along the entire
  avenue.  It's very purple.  Below it is [the 'front garden'].`,
  no_enter_msg: `You have a merry time sitting in the tree, and then you get down.`
}, {put_in: "253 Commonwealth Ave"});

def_obj("park bench", "supporter", {
  is_scenery: true,
  enterable: true,
  description: `[img 1/253/bench.jpg left]Sitting in [the 'front garden']
  is this handmade park bench wrought from steel, built by a previous tEp.
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
  hanging from the stairwell.`
});
world.connect_rooms("253 Commonwealth Ave", "north", "The Foyer", {via: "front door"});

def_obj("doorbell", "thing", {
  added_words: ["door", "@bell"],
  is_scenery: true,
  description: `[img 1/253/doorbell.jpg left]It's a small,
  black button, and you almost didn't notice it.  The FedEx guy
  has said he enjoys this doorbell.`
}, {put_in: "253 Commonwealth Ave"});
parser.action.understand("ring/push [obj doorbell]", parse => {
  if (world.containing_room(world.actor) === "253 Commonwealth Ave") {
    return using("doorbell");
  } else {
    return undefined;
  }
});
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
    after a few moments, footsteps down the stairs.  A young tEp opens
    the door for you and leads you in.  "Ah, I see you're getting the
    virtual house tour from [ob 'Irving Q. Tep']," he says.  "Those
    are really good!"  Before running off, he brings you to...`);
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
  They lead up to [the 'front door'] and into tEp.`
}, {put_in: "253 Commonwealth Ave"});

///
/// The Foyer
///

def_obj("The Foyer", "room", {
  description : `[img 1/foyer/look.jpg left]This is the foyer.
  You can keep going [dir northwest] to the center room.  You
  can see [a subwoofer], [a desk], [a 'colorful lights'], [the mailboxes],
  and [a 'large mirror'].`
});


///
/// Start the game
///

window.addEventListener("load", () => {
  init_output("output");
  start_game_loop();
});
