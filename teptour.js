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
were, you're now where you are since [the 'Irving Q. Tep'] has brought
you to the Purple Palace, 253 Comm. Ave.`);

///
/// Fun and games
///

//// Images

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

  [para]To the [dir north] is [the 'front door' 'the door'] to enter tEp.

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
  avenue.  It's very purple.  Below it is the [ob 'front garden'].`
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
