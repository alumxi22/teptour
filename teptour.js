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
angelic voices augment that of the chaplain, whom you find suddenly
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

add_floor("253 Commonwealth Ave", "sidewalk");

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
  hanging from the stairwell.`,
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
parser.action.understand("ring/push [obj doorbell]", parse => using("doorbell"));
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
  [ob 'colorful lights'], [the mailboxes],
  and [ob 'foyer mirror' 'large mirror'].`
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
  description: `[img 1/foyer/mailboxes.JPG left]These boxes
  hold mail of current tEps, past tEps, and summer renters.
  Some of the slots are quite stuffed.`,
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
  description : `[img 1/foyer/outbox.jpg left]The Op box is
  named after Charles Oppenheimer, the first Captain tEp.  It is
  the platform upon which the captain stands to greet his
  numerous fans.  Because it sits outside of tEp during rush, it
  is also known as the outbox.`,
  locale_description : `From atop the Op box, you feel a
  powerful urge to find purple spandex tights and put them on.` // TODO have tights somewhere
}, {put_in: "The Foyer"});

///
/// Center Room
///

def_obj("The Center Room", "room", {
  description: `[img 1/center/look.JPG left]This is the
  center room, which is a common area at tEp.  Around you are
  composite photos from the past decade, and [a chandelier]
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

//world.connect_rooms("The Center Room", "up", "The Second Landing");
world.connect_rooms("The Center Room", "south", "The Front Room");
world.connect_rooms("The Center Room", "north", "The Dining Room");
world.connect_rooms("The Center Room", "northeast", "back_stairwell_1");

world.direction_description.set("The Center Room", "north", `
[img 1/center/look_n.JPG left]You see [the 'comfy couch'],
[the king], [the 'foosball table'], and [the 'bulletin board'].  You
can go [dir north] into the dining room and [dir northeast] into the
back stairwell.`);
world.direction_description.set("The Center Room", "east", `
[img 1/center/look_e.JPG left]You can barely make out
[a 'foosball table'].  You can go [dir upstairs] to the second landing and
[dir southeast] into the foyer.`);
world.direction_description.set("The Center Room", "south", `
[img 1/center/look_s.JPG left]On the wall is [a 'zombie protection box'].
You can go [dir southeast] into the foyer and [dir south] into
the front room.`);
world.direction_description.set("The Center Room", "west", `
[img 1/center/look_w.JPG left]You can see [the 'comfy couch'] and
[the mantle].`);
world.direction_description.set("The Center Room", "up", `
[img 1/center/stairwell.JPG left]Looking up, you see the center
stairwell, which is three flights of stairs capped by a skylight.  The
color-changing lights illuminate it dramatically.`);

def_obj("bulletin board", "thing", {
  is_scenery: true,
  description : `[img 1/center/bulletin.JPG left]This is a
  bulletin board on which tEps affix funny things they found in
  the mail, cute things prefrosh wrote, pictures, postcards from
  drooling alumni, and other miscellaneous artifacts.`
  // TODO every time you look you see a description of an interesting thing on the board
}, {put_in: "The Center Room"});
def_obj("comfy couch", "supporter", {
  is_scenery: true,
  enterable: true,
  description: `[img 1/center/couch.JPG left]This is perhaps
  the comfiest couch in all of existence.  A neighbor came by
  one day and said, "hey, you're a fraternity, so you probably
  like couches.  I have a couch."  With his help, we then
  brought it to its present location.  True couch aficionados
  make a pilgrimage to our center room at least twice a year.`
}, {put_in: "The Center Room"});

def_obj("foosball table", "container", {
  added_words: ["foos", "fooz"],
  is_scenery: true,
  openable: true,
  suppress_content_description: (x) => !world.is_open(x),
  description : `[img 1/center/foosball.JPG left]This is a
  commercial-quality foosball table which is covered with flecks
  of colorful paint that, while making it look cool under color
  changing lights, make it hard to play foosball.  Alumni have
  looked at it and remininsced to one another, "remember how
  much the foosball table cost us when we got it?"`
}, {put_in: "The Center Room"});
def_obj("human skull", "thing", {
  description : `This is a human skull, but it's missing its
  jaw from when some Nokia engineers were playing with it at
  cocoa one Monday night.  It's unknown why there is such a
  thing in the house.`
}, {put_in: "foosball table"});

parser.action.understand("play [obj 'foosball table']", action => using("foosball table"));
actions.before.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "foosball table",
  handle: () => {}
});
actions.report.add_method({
  when: ({verb,dobj}) => verb === "using" && dobj === "foosball table",
  handle: function () {
    out.write(`"Click! Click!" go the volleys as the ball skids
    across the surface of the foosball table, with some non-negligible
    interference from all the colorful paint.  It's a close match, but
    your dexterity at the table is impressive!  The game reaches
    sudden death, and your feet playing yellow narrowly beat your
    hands playing black.  The handshake is confusing, and your hands
    and feet decide to make it brief.  Good show.`);
  }
});


def_obj("king", "thing", {
  printed_name : "The King",
  proper_named : true,
  is_scenery : true,
  no_take_msg: `That's always been there.  You shouldn't move it.`, // TODO puzzle to move it?
  description: `[img 1/center/king.JPG left]It's a portrait
  of The King (that is, Elvis Presley to you younger folk on the
  tour).  It's always been here.`
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
  recently installed to bring tEp up to zombie code.`
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
  words: ["big", "large", "green", "exercise", "@ball", "@stupidball"],
  enterable: true,
  description: `[img 1/center/stupidball.jpg]This is a large
  green exercise ball that is used to play [ask stupidball].`
}, {put_in: "The Center Room"});

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
  backdrop_locations: ["The Center Room", "r_center_stairs"]
});

///
/// Front room
///

def_obj("The Front Room", "room", {
  added_words: ["@fridge"],
  description: `[img 1/front/look.JPG left]This is where
  tEps play Super Smash Bros. after dinner every night.  The
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
    out.write(`You turn on the N64 console, and a couple of tEps
    immediately appear to join you to play Super Smash Bros.  They beat you with
    their incredibly high-speed reflexes.  Maybe you'll do better next
    time.`);
  }
});

def_obj("vlca", "thing", {
  printed_name: "The VLCA",
  proper_named: true,
  added_words: ["very", "large", "capacitor", "@array"],
  description : `The Very Large Capacitor Array, commonly
  known as the VLCA, consists of a good number of capacitors in
  parallel with two copper pipes at the ends, such that when
  another pipe with an empty soda can is placed
  across them, it emits bright sparks and a popping sound as the
  capacitors discharge.`
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
  dining room, where tEps eat.  On the ceiling is
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
covered in tEply doodles.  You can go [dir east] into the upstairs
kitchen.`);

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

// oobleck is a placeholder in case someone types "examine oobleck"
def_obj("oobleck", "thing", {
  is_scenery: true,
  no_take_msg: `The oobleck is very dried to and now very
  much a part of the ceiling.`
}, {put_in: "The Dining Room"});

// TODO instead of examining oobleck => asking about oobleck

def_obj("Tepilepsy", "thing", {
  added_words: ["Tepilepsy", "@wall"],
  is_scenery: true,
  description : `[img 1/dining/tepilepsy.jpg left]With almost
  twenty-two-hundred RGB LEDs, the Tepilepsy wall was installed
  with the help of many tEps, both recent and drooling (thanks Gruesz!),
  and it's a beacon that's very visible from the backlot.  It displays
  visualizations of various mathematical functions as well as of
  relativistic-like distortions of a nearby webcam.  You should
  definitely ask a for a demonstration at real-tEp\u2122.`
}, {put_in: "The Dining Room"});

///
/// First floor of back stairwell
///

def_obj("back_stairwell_1", "room", {
  name: "First Floor of the Back Stairwell",
  description : `[img 1/bstairs/look.jpg left]You are in the
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

//world.connect_rooms("back_stairwell_1", "down", "Basement")
world.connect_rooms("back_stairwell_1", "north", "The Upstairs Kitchen");
//world.connect_rooms("back_stairwell_1", "up", "back_stairwell_2")

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
of the dishes at tEp (minus the ones people steal to their rooms).
The categorization scheme is between bouncers (such as a
[ask Bouncer]) and breakers (such as a tea cup).`);


def_obj("Hobart", "container", {
  proper_named: true,
  is_scenery: true,
  openable: true,
  switchable: true,
  description: `[img 1/kitchen/hobart.jpg left]Hobart is not
  a dishwasher, as is explained in the [ask 'rules of tep'].  It
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

def_obj("The Second Landing", "room");

/*******************/
/*** Third floor ***/
/*******************/

def_obj("The Third Landing", "room");

/********************/
/*** Fourth floor ***/
/********************/

def_obj("The Fourth Landing", "room");

/*******************/
/*** Fifth floor ***/
/*******************/

def_obj("The Fifth Landing", "room");

def_obj("51", "room");

/****************/
/*** The Roof ***/
/****************/


/****************/
/*** Basement ***/
/****************/


///
/// Start the game
///

window.addEventListener("load", () => {
  init_output("output");
  start_game_loop();
});
