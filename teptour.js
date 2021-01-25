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

parser.action.understand("oh/ok", parse => making_mistake("Exactly."));
// spaces between periods because parser treats periods as tokens
parser.action.understand("cd . .", parse => exiting());

parser.action.understand("cd [somewhere x]", parse => going_to(parse.x));
parser.action.understand("pwd/dir", parse => looking());
parser.action.understand("where am i", parse => looking());
parser.action.understand("where am i ?", parse => looking());
parser.action.understand("cd", parse => making_mistake("But you already are home!"));
parser.action.understand("honig", parse => making_mistake("\"Honig!\" you shout.  You can hear vigorous acclamation all around you."));
parser.action.understand("in the name of honig", parse => making_mistake("Amen."));
parser.action.understand("what ?", parse => making_mistake(`You just had to
say that, didn't you.  \"What?\" \"What?\" \"What?\" you hear tEps
everywhere yelling back and forth throughout the house.  Finally, some
tEp figures out what's going on and silences them with \"No one is
peldging, stop it!\"`));
parser.action.understand("i wanna peldge", parse => making_mistake(`This is
virtual tEp.  If you have a bid and you're wanting to peldge, then say
the magic words where real tEp can hear you!`));
parser.action.understand("pray/amen", parse => making_mistake(`A chorus of
angelic voices augment that of the chaplain, who you suddenly find
next to you.  "In the name of Honig, Amen," he ends.  As you turn to
thank him for such a beautiful prayer, you see he has already slipped
away.`));
parser.action.understand("go home", parse => making_mistake("But you already are!"));
parser.action.understand("tep", parse => making_mistake("That's where you are."));
/*parser.action.understand("why/how [text x]", parse => making_mistake(
`[char 91]Sometimes while I wait for my hard drive to rev up I
wistfully contemplate what it would have been like to be able to
answer a question like that.  Alack-a-day, that was not my fate.[char
93]`));*/
parser.action.understand("pickles ?", parse => making_mistake(`"I didn't make this
tour!" [ob 'Irving Q. Tep' Irving] explains, "I just repeat what I'm told."`));

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

def_obj("front garden", "container", {
  is_scenery: true,
  enterable: true,
  description : `[img 1/253/garden.JPG left]This is the front
  garden, in which are [the 'purple tree'] and [a 'park bench'].`
}, {put_in: "253 Commonwealth Ave"});

def_obj("purple tree", "thing", {
  is_scenery : true,
  description : `[img 1/253/tree.JPG left]Looking both ways,
  you see that this is the only purple tree along the entire
  avenue.  It's very purple.  Below it is [the 'front garden'].`
}, {put_in: "253 Commonwealth Ave"});

def_obj("park bench", "supporter", {
  is_scenery : true,
  enterable : true,
  description : `[img 1/253/bench.jpg left]Sitting in [the 'front garden']
  is this handmade park bench wrought from steel, built by a previous tEp.
  After a few years of use, it's been bent quite out of whack.`
}, {put_in: "front garden"});

def_obj("front door", "door", {
  added_words : ["@doors"],
  reported : false,
  lockable : true,
  description : `[img 1/253/doors.JPG left]It's a big, old
  door.  Through the glass, you can make out blinking LED lights
  hanging from the stairwell.`
});
world.connect_rooms("253 Commonwealth Ave", "north", "The Foyer", {via: "front door"});

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
