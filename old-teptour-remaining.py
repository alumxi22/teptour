# The remains of teptour.py

# As things are ported, delete them from this file to keep track.

#####################
### Fun and games ###
#####################

###
### make DoInstead easier
###

def instead_of(actionsystem, action, do_instead, suppress_message=False) :
    @docstring("Does the action "+repr(do_instead)+" instead. Added by is_mistake")
    @actionsystem.before(action)
    def do_instead_since_mistake(**kwargs) :
        raise DoInstead(do_instead.expand_pattern(kwargs), suppress_message=suppress_message)


###
### Eiting
###

class Eiting(BasicAction) :
    """Eiting(actor, x) for the actor eiting x."""
    verb = "eit"
    gerund = "eiting"
    numargs = 2
parser.understand("eit [something x]", Eiting(actor, X))
parser.understand("eit/eit.", MakingMistake(actor, "Indeed."))
parser.understand("eit !", MakingMistake(actor, "It happens to the best of us."))

require_xobj_accessible(actionsystem, Eiting(actor, X))

@before(Eiting(actor, X))
def before_eiting_default(actor, x, ctxt) :
    raise AbortAction("{Bob} {doesn't} think it would be wise to eit that.", actor=actor)


class EitingWith(BasicAction) :
    """EitingWith(actor, x, y) for the actor eiting x with y."""
    verb = ("eit", "with")
    gerund = ("eiting", "with")
    numargs = 3
parser.understand("eit [something x] with [something y]", EitingWith(actor, X, Y))

require_xobj_accessible(actionsystem, EitingWith(actor, X, Y))
require_xobj_held(actionsystem, EitingWith(actor, Z, X))

@before(EitingWith(actor, X, Y))
def before_eiting_default(actor, x, y, ctxt) :
    raise AbortAction(str_with_objs("{Bob} {doesn't} think it would be wise to eit [the $x] with that.", x=x),
                      actor=actor)

###
### Playing stupidball
###

class PlayingStupidball(BasicAction) :
    verb = "play stupidball"
    gerund = "playing stupidball"
    numargs = 1
parser.understand("play stupidball", PlayingStupidball(actor))
parser.understand("play stupid ball", PlayingStupidball(actor))
parser.understand("kick/throw/bounce [object ex_ball]", PlayingStupidball(actor))

all_are_mistakes(parser, ["kick/throw/bounce"],
                 """{Bob} {needs} to be doing that to something in particular.""")
all_are_mistakes(parser, ["play"],
                 """{Bob} {needs} to be playing something in particular.""")

@before(PlayingStupidball(actor))
def before_stupidball_take_ex_ball(actor, ctxt) :
    if not (actor == ctxt.world[Owner("ex_ball")] and ctxt.world[AccessibleTo("ex_ball", actor)]) :
        ctxt.actionsystem.do_first(Taking(actor, "ex_ball"), ctxt, silently=True)
@before(PlayingStupidball(actor) <= PNot(AccessibleTo(actor, "ex_ball")))
def before_stupidball_need_ball_accessible(actor, ctxt) :
    raise AbortAction("{Bob} {doesn't} see anything around {him} with which {he} can play stupidball.", actor=actor)
@when(PlayingStupidball(actor))
def when_playing_stupidball(actor, ctxt) :
    ctxt.world.activity.put_in("ex_ball", ctxt.world[Location(actor)])
@report(PlayingStupidball(actor))
def report_playing_stupidball(actor, ctxt) :
    ctxt.write("""A couple of teps come out to join you as you kick
    [the ex_ball] around the room, and you nearly break a couple of
    things as the ball whizzes through the air at high velocities.
    After much merriment, you all get bored of the game, and put the
    ball down.""")

###
### Playing ridiculoball
###

class PlayingRidiculoball(BasicAction) :
    verb = "play ridiculoball"
    gerund = "playing ridiculoball"
    numargs = 1
parser.understand("play ridiculoball/ridiculo-ball", MakingMistake(actor, """[ob
Irving Irving's] eyes get nostalgic but a little sad.  "I don't quite
remember the rules of that game.  Please [action <tell irving about
ridiculoball> <tell me about ridiculoball>] to remind me for a future
version of the house tour." """))

###
### Extra directions
###

world.activity.put_in("player", "253 Commonwealth Ave")

parser.understand("upstairs", "up", dest="direction")
parser.understand("up stairs", "up", dest="direction")
parser.understand("up the stairs", "up", dest="direction") # fix if stairs become a door!
parser.understand("downstairs", "down", dest="direction")
parser.understand("down stairs", "down", dest="direction")
parser.understand("down the stairs", "down", dest="direction")
parser.understand("inside", "in", dest="direction")
parser.understand("outside", "out", dest="direction")
parser.understand("away", "out", dest="direction")

# needed for the basement
parser.understand("northnorthwest/nnw", "northnorthwest", dest="direction")
parser.understand("southsoutheast/sse", "southsoutheast", dest="direction")
add_direction_pair("northnorthwest", "southsoutheast")

###
### Echo chamber
###

class Saying(BasicAction) :
    verb = "say"
    gerund = "saying"
    numargs = 2
    dereference_dobj = False
parser.understand("say [text x]", Saying(actor, X))
parser.understand("say", MakingMistake(actor, "{Bob|cap} {has} to say something in particular."))

@when(Saying(actor, X))
def when_saying(actor, x, ctxt) :
    """Add the text to the echo file."""
    x = x.replace(" ,", ",").replace(" ?", "?").replace(" !", "!") # hack because of parser
    if x.startswith('"') or x.startswith("'") :
        x = x[1:]
        if x.endswith('"') or x.endswith("'") :
            x = x[:-1]
    with file(os.path.join(GAME_LOCATION, teptour_echo_file), "a") as f :
        f.write("%s\n" % x)

@report(Saying(actor, X))
def report_saying(actor, x, ctxt) :
    """Find a random string from the echo file which is not what the actor just said."""
    x = x.replace(" ,", ",").replace(" ?", "?").replace(" !", "!") # hack because of parser
    if x.startswith('"') or x.startswith("'") :
        x = x[1:]
        if x.endswith('"') or x.endswith("'") :
            x = x[:-1]
    try :
        with file(os.path.join(GAME_LOCATION, teptour_echo_file), "r") as f :
            lines = [line.strip() for line in f.readlines()]
            lines = [line for line in lines if line and line != x] # line.lower() != x.lower() ?
        if lines :
            from random import choice
            ctxt.write("The echo chamber responds, \"%s\"." % escape_str(choice(lines)))
        else :
            ctxt.write("The echo chamber replies with what you said, \"%s\"." % escape_str(x))
    except Exception :
        ctxt.write("Surprisingly, there is no echo to {his} voice at all. (This is a bug.)")


###
### Ladders
###

@world.define_property
class IsLadder(Property) :
    """Represents whether a door is a ladder (and thus climbable)."""
    numargs = 1

world[IsLadder(X) <= IsA(X, "door")] = False

instead_of(actionsystem,
           Climbing(actor, X) <= IsLadder(X),
           Entering(actor, X), suppress_message=True)

parser.understand("climb/go up/down [something x]", Climbing(actor, X))

###
### Floors
###

class Sitting(BasicAction) :
    verb = "sit"
    gerund = "sitting"
    numargs = 1

parser.understand("sit", Sitting(actor))
parser.understand("sit down", Sitting(actor))

world[Global("are we ok with sitting")] = False
world[Global("are we ok with sitting affirmations")] = 0
world[Global("are we ok with sitting printed message")] = False

from textadv.gamesystem.gamecontexts import SwitchContext, GameContext

class CheckOkWithSittingContext(GameContext) :
    """This is a context to enter to do some kind of affirmation
    interaction, printing out the messages one at a time from
    "messages", continuing if the player says something like "yes" or
    keeps trying to sit.  The "are we ok with sitting" flag checks
    whether the sitting action enters this context.  The "are we ok
    with sitting affirmations" is a counter which sees how many
    messages we've printed.  The "are we ok with sitting printed
    message" flag determines whether we've printed the final message
    right before actually doing the action."""

    messages = ["""Really?""",
                """Are sure you want to sit on [a $x]?  It's probably fairly dirty!""",
                """This is your last chance: do you really want to sit on [the $x]?"""]
    been_here = [False]
    def __init__(self, parent, floor) :
        self.parent = parent
        self.floor = floor
    def run(self) :
        start = self.parent.world[Global("are we ok with sitting affirmations")]
        self.parent.world[Global("are we ok with sitting affirmations")] += 1
        self.been_here[0] = True
        for msg in self.messages[start:] :
            self.parent.write(str_with_objs(msg, x=self.floor))
            input = self.parent.io.get_input(">>>")
            input = " ".join(input.strip().lower().split())
            if input in ["y", "yes"] or input.startswith("yes") or input.startswith("i do") or input.startswith("i am") :
                self.parent.world[Global("are we ok with sitting affirmations")] += 1
                continue
            elif input in ["n", "no"] or input.startswith("no") :
                self.parent.write("Yeah. Not everyone is cut out to sit on the floor like that.")
                return (self.parent, dict())
            else :
                return (self.parent, {"input" : input})
        self.parent.world[Global("are we ok with sitting")] = True
        return (self.parent, {"input" : "sit"})

@before(Entering(actor, X) <= IsA(X, "floor"))
def before_entering_floor_just_plain_sit_to_print_messages(actor, x, ctxt) :
    if not ctxt.world[Global("are we ok with sitting")] :
        raise SwitchContext(CheckOkWithSittingContext, floor=x)
    elif not world[Global("are we ok with sitting printed message")] :
        world[Global("are we ok with sitting printed message")] = True
        ctxt.write("Who {is} {he}? Avril?")


@before(Sitting(actor))
def before_sitting_find_floor(actor, ctxt) :
    """Look for a floor to sit on, and enter the
    CheckOkWithSittingContext when it's "appropriate" to check whether
    it's ok to sit."""
    for floor in ctxt.world.activity.objects_of_kind("floor") :
        if ctxt.world[AccessibleTo(floor, actor)] :
            raise DoInstead(Entering(actor, floor), suppress_message=True)
    raise AbortAction("{Bob|cap} {doesn't} want to sit down here.")


###
### Finding notable objects
###

class Finding(BasicAction) :
    verb = "find"
    gerund = "finding"
    numargs = 2

parser.understand("find [something x]", Finding(actor, X))
parser.understand("look for [something x]", Finding(actor, X))

@verify(Finding(actor, X))
def verify_finding(actor, x, ctxt) :
    if ctxt.world[VisibleTo(x, actor)] :
        return LogicalOperation() # it's not as logical to try to find objects already present
    location = ctxt.world[Location(x)]
    if not location : # it's not even _in_ the world
        return IllogicalNotVisible("[ob Irving] knows of no such thing.")
    rooms = ctxt.world.activity.objects_of_kind("room")
    is_a_door = ctxt.world[IsA(x, "door")]
    for room in rooms :
        if not ctxt.world[Visited(room)] : continue
        if ((is_a_door and ctxt.world.query_relation(Exit(room, Y, x), var=Y))
             or (not is_a_door and room == ctxt.world[EffectiveContainer(location)])) :
                return VeryLogicalOperation()
    return IllogicalNotVisible("[ob Irving] knows of no such thing.")

instead_of(actionsystem,
           Finding(actor, X) <= VisibleTo(X, actor),
           Examining(actor, X), suppress_message=True)

@report(Finding(actor, X))
def report_finding(actor, x, ctxt) :
    rooms = ctxt.world.activity.objects_of_kind("room")
    is_a_door = ctxt.world[IsA(x, "door")]
    for room in rooms :
        if not ctxt.world[Visited(room)] : continue
        if ((is_a_door and ctxt.world.query_relation(Exit(room, Y, x), var=Y))
            or (not is_a_door and room == ctxt.world[EffectiveContainer(ctxt.world[Location(x)])])) :
            # it might make sense for [the $x] to be [the_ $x], but
            # since failed examining causes finding, I think it's ok
            # this way.
            ctxt.write(str_with_objs("""[ob Irving] thinks for a
            moment.  \"I seem to remember that [the $x] is in [goto
            $room].\"""", x=x, room=room))
            return
    ctxt.write("[ob Irving] doesn't know where that might be.")

# to make [ob ...] links be nicer when the person switches rooms.  We
# replace things which would have failed for Examining with Finding
@verify(Examining(actor, X) <= PNot(VisibleTo(X, actor)))
def verify_examining_by_finding(actor, x, ctxt) :
    res = verify_finding(actor, x, ctxt)
    if res.is_acceptible() :
        raise ActionHandled(BarelyLogicalOperation())
instead_of(actionsystem,
           Examining(actor, X) <= PNot(VisibleTo(X, actor)),
           Finding(actor, X), suppress_message=True)

###
### Other silly verbs
###


@before(Attacking(actor, X))
def before_attacking_anyone(actor, x, ctxt) :
    raise AbortAction("""The RA comes out of nowhere, preventing
                         {him}. "Remember the zeroth [ask <rules of
                         tep> <rule of tep>]!" he says, "Don't die!" """, actor=actor)
@before(Attacking(actor, "RA"))
def before_attacking_anyone(actor, ctxt) :
    raise AbortAction("""The RA wisely stays away from
                         {him}. "Remember the zeroth [ask <rules of
                         tep> <rule of tep>]!" {he} {hears} from a
                         distance, "Don't die!" """, actor=actor)


###
### Handling swearing chains (a fine tEp tradition)
###

# a simple one
parser.understand("curse/curses/drat/rats", MakingMistake(actor, """Eit."""))
parser.understand("loser", MakingMistake(actor, """Ah, cheer up;
there's no way to lose a rousing game of Virtual House Tour!"""))
parser.understand("butt/but", MakingMistake(actor, """[char 91]But what?[char 93]"""))

@parser.add_subparser("action")
def curse_chain(parser, var, input, i, ctxt, actor, next) :
    curse_words = ["darn", "damn", "shit", "ass", "cock", "fucker", "mother", "motherfucker",
                   "cunt", "bitch", "tit", "dick", "fuck", "arse"]
    responses = ["Go get them, tiger!",
                 "Eit.",
                 "Well, eit.",
                 "Well then.",
                 "Well I never.",
                 "So it goes.",
                 "That doesn't even make any sense.",
                 "\"Well same to you,\" Irving says with a smile.",
                 "It happens to the best of us."]
    # first, is this a "fuck you" fight?
    if ((len(input)-i) == 2 and " ".join(input[i:]).lower() == "fuck you"
        or (len(input)-i) == 3 and " ".join(input[i:]).lower() == "fuck you !"
        or (len(input)-i) == 4 and " ".join(input[i:]).lower() == "no , fuck you"
        or (len(input)-i) == 5 and " ".join(input[i:]).lower() == "no , fuck you !"):
        return [[Matched(input[i:], MakingMistake(actor, "No, fuck you!"), 0.6, "action", var)]]
    score = 0
    for j in xrange(i, len(input)) :
        if input[j].lower() in curse_words or "fuck" in input[j].lower() or "cunt" in input[j].lower() : score += 1
    if score > 0 :
        return [[Matched(input[i:], MakingMistake(actor, random.choice(responses)), score/3.0, "action", var)]]
    else :
        return []

@before(InsertingInto(actor, X, Y) <= IsA(Y, "person"))
def before_insertinginto_person(actor, x, y, ctxt) :
    raise AbortAction(str_with_objs("It's unclear whether [he $y] would appreciate that.", y=y), actor=actor)
@before(InsertingInto(actor, X, Y) <= PEquals(actor, Y))
def before_insertinginto_person(actor, x, y, ctxt) :
    raise AbortAction(str_with_objs("Please, not right now...", y=y), actor=actor)

##
# Defilements
##

# note that this is set up so that you can ask other people to defile things!

@world.define_property
class Defilements(Property) :
    """A list of (string,actor) representing the ways the object has
    been defiled and how."""
    numargs = 1
world[Defilements(X) <= IsA(X, "thing")] = []

class Defiling(BasicAction) :
    """Defiling(actor, X, method)"""
    numargs = 3
    def gerund_form(self, ctxt) :
        return "defiling " + str_with_objs("[the $x]", x=self.args[1])
    def infinitive_form(self, ctxt) :
        return "defile " + str_with_objs("[the $x]", x=self.args[1])

parser.understand("felch [something x]", Defiling(actor, X, "felched"))
parser.understand("pee on [something x]", Defiling(actor, X, "peed on"))
parser.understand("pee in [something x]", Defiling(actor, X, "peed in"))
parser.understand("poop on [something x]", Defiling(actor, X, "pooped on"))
parser.understand("poop in [something x]", Defiling(actor, X, "pooped in"))
parser.understand("poop down [object center stairwell]", Defiling(actor, "center stairwell", "pooped down"))

require_xobj_accessible(actionsystem, Defiling(actor, X, Y))

@before(Defiling(actor, X, Y))
def before_defiling(actor, x, y, ctxt) :
    if (y, actor) in ctxt.world[Defilements(x)] :
        raise AbortAction(str_with_objs("{Bob} {has} already %s [the $x]." % y, x=x), actor=actor)
@before(Defiling(actor, X, Y))
def before_defiling_container(actor, x, y, ctxt) :
    if not y.endswith(" in") :
        return # we assume anything ending with "in" needs to be done to a container.
    if not ctxt.world[IsA(x, "container")] :
        raise AbortAction("That can only be done to containers.")
    if ctxt.world[Openable(x)] and not ctxt.world[IsOpen(x)] :
        raise AbortAction(str_with_objs("That can only be done when [the $x] is open.", x=x), actor=actor)
@when(Defiling(actor, X, Y))
def when_defiling(actor, x, y, ctxt) :
    ctxt.world[Defilements(x)] = ctxt.world[Defilements(x)] + [(y, actor)]
@report(Defiling(actor, X, Y))
def report_defiling(actor, x, y, ctxt) :
    ctxt.write("The deed has been done.", actor=actor)

@actoractivities.to("describe_object")
def describe_object_defilements(actor, o, ctxt) :
    ds = ctxt.world[Defilements(o)]
    if ds :
        if ctxt.world[Global("describe_object_described")] : # print a newline if needed.
            ctxt.write("[newline]")
        ctxt.world[Global("describe_object_described")] = True
        
        culprits = set(a for (m,a) in ds)
        byyou = None

        for culprit in culprits :
            defs = serial_comma([m for (m,a) in ds if a==culprit])
            if culprit != actor :
                ctxt.write(str_with_objs("[The $c] has %s [the $o]." % defs, c=culprit, o=o),
                           actor=actor)
            else :
                byyou = str_with_objs("{Bob} {has} %s [the $o]." % defs, o=o)
        if byyou :
            ctxt.write(byyou, actor=actor)

####################
### The basement ###
####################


###
### The Basement Hallway
###

quickdef(world, "Basement", "room", {
        Name : "The Basement Hallway",
        Visited : True,
        Description : """[img b/basement/look.jpg left]You have
        reached the basement of tEp, which, from the base of the
        stairs, appears to be a long hallway running north to south.
        
        [newline]There are a multitude of rooms along this hallway:
        you can go [dir northwest] to the bikeroom, [dir west] to the
        tool closet, [dir southwest] to the downstairs kitchen, [dir
        south] into milk crate land, [dir southeast] to the poop
        closet, [dir east] to the paint closet, [dir down] into the
        cave, [dir north] to the backlot, and [dir northnorthwest] to
        the Tep-o-phone closet.  You can also go back [dir upstairs].

        [newline]You can look [look north], [look west], [look south],
        and [look up]."""
        })
world.activity.connect_rooms("Basement", "southwest", "The Kitchen")
world.activity.connect_rooms("Basement", "northwest", "The Bike Room")
world.activity.connect_rooms("Basement", "north", "The Backlot")
world.activity.connect_rooms("Basement", "northnorthwest", "tepophone closet")
world.activity.connect_rooms("Basement", "west", "The Tool Closet")
world.activity.connect_rooms("Basement", "east", "The Paint Closet")
world.activity.connect_rooms("Basement", "southeast", "The Poop Closet")
world.activity.connect_rooms("Basement", "south", "heavy metal door")
world.activity.connect_rooms("Basement", "down", "The Cave")

world[DirectionDescription("Basement", "north")] = """
[img b/basement/look_n.jpg left]To the [dir north], you see the door
to the backlot, and to the [dir northwest] you see the entrance to the
bikeroom.  There's also a [ob <liquid nitrogen cylinder>] sitting in
the hallway."""
world[DirectionDescription("Basement", "west")] = """
[img b/basement/look_w.JPG left]Spraypainted in large letters is a
credo attesting the existence of magnetic monopoles."""
world[DirectionDescription("Basement", "south")] = """
[img b/basement/look_s.jpg left]At the end of the hallway to the [dir
south] is milk crate land, and near that, but out of sight, is the
kitchen to the [dir southwest].  You can also see the entrance to the
tool closet to the [dir west] and the way [dir down] to the cave."""
world[DirectionDescription("Basement", "up")] = """
[img b/basement/look_u.jpg left]You see the way back [dir
upstairs] to the first floor."""


quickdef(world, "liquid nitrogen cylinder", "thing", {
        Scenery : True,
        NoTakeMessage : """The cylinder is very large, and therefore
        too hard for you to take.""",
        AddedWords : ["of", "@nitrogen", "ln2", "@ln2"],
        Description : """[img b/basement/cylinder.jpg left]This is a
        large cylinder for liquid nitrogen.  It is one of those things
        which is good to have on hand.  It turns out liquid nitrogen
        is cheaper than milk per gallon."""
        }, put_in="Basement")

quickdef(world, "dewar", "thing", {
        Description : """[img b/basement/dewar.jpg left]This is a
        portable dewar for liquid nitrogen.  It's basically a large
        thermos for handling very cold liquids.""",
        Openable : True,
        IsOpen : False
        }, put_in="Basement")

# until there's a model for this...
parser.understand("fill [object dewar]",
                  MakingMistake(actor, """There's no more liquid
                  nitrogen with which to fill the dewar; the LN2
                  cylinder is empty.""") <= AccessibleTo("dewar", actor))
parser.understand("fill [object dewar]",
                  MakingMistake(actor, """You can see no such
                  thing.""") <= PNot(AccessibleTo("dewar", actor)))

###
### The Paint Closet
###

quickdef(world, "The Paint Closet", "room", {
        Description : """[img b/paintcloset/look.JPG left]There are a
        lot of colors, and therefore a lot of paint.  Thus, this
        closet.  You can go [dir west] back to the basement
        hallway."""
        })

###
### The Poop Closet
###

quickdef(world, "The Poop Closet", "room", {
        Description : """[img b/poopcloset/look.JPG left]It's a place
        to keep the toilet paper, paper towels, and garbage bags.  You
        can go [dir northwest] to the basement hallway."""
        })

###
### The Kitchen
###

quickdef(world, "The Kitchen", "room", {
        Name : """The Downstairs Kitchen""",
        Description : """[img b/kitchen/look.jpg left]This is a
        commercial-grade kitchen.  All residents of the house may use
        it, but it's mainly used by the haus f&uuml;d program, for
        which tEps cook dinner for each other every school night.  You
        can go [dir northeast] back to the basement, and you can look
        [look north], [look west], [look south], and [look east]."""
        })

world[DirectionDescription("The Kitchen", "north")] = """
[img b/kitchen/look_n.JPG left]To the north are some fridges."""
world[DirectionDescription("The Kitchen", "west")] = """
[img b/kitchen/look_w.JPG left]Along the western wall is a gas
stovetop."""
world[DirectionDescription("The Kitchen", "south")] = """
[img b/kitchen/look_s.JPG left]You look south, getting a good view of
the main work areas in the kitchen."""
world[DirectionDescription("The Kitchen", "east")] = """
[img b/kitchen/look_e.JPG left]The kitchen even has a sink."""

###
### The Bike Room
###

quickdef(world, "The Bike Room", "room", {
        Visited : True,
        Description : """[img b/bikeroom/look.JPG left]The bikeroom is
        where tEps keep their bikes.  You can go [dir southeast] back
        to the basement hallway or [dir south] to the server room."""
        })
world.activity.connect_rooms("The Bike Room", "south", "The Server Room")

###
### The Server Room
###

quickdef(world, "The Server Room", "room", {
        Visited : True,
        Description : """[img b/servers/look.jpg left]Since this is
        where the Internet comes into the house, people's server
        machines have flocked to the area despite the lack of air
        conditioning. Notably, this room is probably a fixed point of
        the game.  You can go [dir north] to the bike room or [dir
        east] into the laundry room."""
        })
world.activity.connect_rooms("The Server Room", "east", "The Laundry Room")

###
### The Laundry Room
###

quickdef(world, "The Laundry Room", "room", {
        Visited : True,
        Description : """[img b/laundry/look.JPG left]This is the room
        that makes all tEps smell the same: free laundry, including
        detergent, is part of the deal of living at tEp.  You see a
        [ob <washing machine>], a [ob <dryer>], a [ob sink], and some
        [ob shelves].  You can go [dir west]."""
        })

quickdef(world, "washer", "container", {
        Words : ["@washer", "clothes", "washing", "@machine"],
        Scenery : True,
        Openable : True,
        IsOpen : False,
        Switchable : True,
        Description : """[img b/laundry/washer.JPG left]This is one of
        the two trusty washers."""
        }, put_in="The Laundry Room")

quickdef(world, "dryer", "container", {
        Words : ["clothes", "@dryer"],
        Scenery : True,
        Openable : True,
        IsOpen : False,
        Switchable : True,
        Description : """[img b/laundry/dryer.JPG left]This is one of
        the two trusty washers."""
        }, put_in="The Laundry Room")

quickdef(world, "laundry shelves", "supporter", {
        DefiniteName : "the shelves",
        IndefiniteName : "some shelves",
        Scenery : True,
        Description : """[img b/laundry/shelves.JPG left]When a tEp
        comes across a dryer they want to use that has someone else's
        clothes, they dutifully put them in a plastic bag and set them
        on these shelves."""
        }, put_in="The Laundry Room")

quickdef(world, "laundry sink", "container", {
        PrintedName : "sink",
        Scenery : True,
        Description : """[img b/laundry/sink.JPG left]This sink
        contains paint stains as well as bottles of detergent."""
        }, put_in="The Laundry Room")

quickdef(world, "detergent", "thing", {
        IndefiniteName : "some detergent",
        Description : """This is a bottle of detergent of the
        clothes-cleansing variety."""
        }, put_in="laundry sink")


###
### The Tool Closet
###

quickdef(world, "The Tool Closet", "room", {
        Description : """[img b/toolroom/look.JPG left]Since tEp is a
        do-it-yourself kind of place, there is a room devoted to
        keeping tools.  This is that room.  You can look [look
        northwest] or go [dir east] back to the basement hallway."""
        })

world[DirectionDescription("The Tool Closet", "northwest")] = """
[img b/toolroom/look_nw.JPG left]Look at all those fine tools."""

###
### Milk Crate Land
###

quickdef(world, "heavy metal door", "door", {
        Scenery : True,
        Description : """[img b/milkcrate/door.jpg left]This is the
        door to milk crate land."""
        })

world.activity.connect_rooms("heavy metal door", "south", "Milk Crate Land")

quickdef(world, "Milk Crate Land", "room", {
        Visited : True,
        Description : """[img b/milkcrate/look.jpg left]When tEp gets
        milk from distributors, it comes in milk crates.  However,
        it's never been clear what one does with the milk crates after
        they arrive.  After some time, milk crate land has become a
        wonderous place of milk crates and wonder."""
        })

quickdef(world, "milk crate", "container", {
        AddedWords : ["@milkcrate"],
        Description : """[img b/milkcrate/milkcrate.JPG left]This is a
        standard-issue milk crate."""
        }, put_in="Milk Crate Land")

###
### The Tep-o-phone Closet
###

quickdef(world, "tepophone closet", "room", {
        Name : "The Tep-o-phone Closet",
        AddedWords : ["tepophone"],
        Description : """[img b/tepophone/look.jpg left]Built from
        relays that fell out of a Bell telephone truck by [ask <Fred
        Fenning>] while he was failing his telephony class,
        Tep-o-phone was a state-of-the-art telephone switching system
        that let the outside world dial individual rooms.  It also let
        people call the laundry room to see if there were free
        machines.  Sadly, Tep-o-phone has since fallen into disrepair
        with the now-widespread use of cell phones.  You can go [dir
        southsoutheast] back to the basement hallway."""
        })

###
### The Backlot
###

quickdef(world, "The Backlot", "room", {
        AddedWords : ["back", "@lot"],
        Description : """[img b/backlot/look.JPG left]This is where
        people park their cars or come into the house with their
        bikes.  It is also home of the [ob <oobleck drain>].  You can
        go [dir south] back into the house, and you can look [look
        north], [look west], [look south], [look east], and [look up]."""
        })

world[DirectionDescription("The Backlot", "north")] = """
[img b/backlot/look_n.JPG left]To the north, you can see dumpsters and
neighbors along the back alley."""
world[DirectionDescription("The Backlot", "west")] = """
[img b/backlot/look_w.JPG left]You look west down the back alley."""
world[DirectionDescription("The Backlot", "south")] = """
[img b/backlot/look_s.JPG left]To the [dir south], you can see the
door to the basement of tEp."""
world[DirectionDescription("The Backlot", "east")] = """
[img b/backlot/look_e.JPG left]You look east down the back alley."""
world[DirectionDescription("The Backlot", "up")] = """
[img b/backlot/look_u.JPG left]Rising above you, the purple palace
looks surprisingly ordinary from the backlot. Irving notes that
there's a really good view of lights back here at night, though."""

world[NoGoMessage("The Backlot", X)] = """Nah, you don't need
to leave that way!  This is a virtual tour: just close your web
browser if you want to quit."""

quickdef(world, "oobleck drain", "supporter", {
        IsEnterable : True,
        Scenery : True,
        Description : """[img b/backlot/drain.JPG left]The oobleck
        drain is a big square of cement with a hole, through which
        tEps dump a kiddie pool of [ask oobleck] every year.  With the
        oobleck drain, cleanup is a breeze!"""
        }, put_in="The Backlot")

###
### The Cave
###

quickdef(world, "The Cave", "room", {
        Visited : True,
        AddedWords : ["boiler", "@room"],
        Description : """[img b/cave/look.JPG left]This is the machine
        room of tEp, containing the [ob boiler] and [ob <water
        heater>].  You can look [look south], [look east], and [look
        up], and you can go [dir upstairs] back to the basement
        hallway or [dir south] into the deep cave."""
        })

world[DirectionDescription("The Cave", "south")] = """
[img b/cave/look_s.jpg left]To the [dir south] is a dimly lit
corridor."""
world[DirectionDescription("The Cave", "east")] = """
[img b/cave/look_e.JPG left]You see the stairs that lead [dir
upstairs] to the basement hallway."""
world[DirectionDescription("The Cave", "up")] = """
[img b/cave/look_u.JPG left]Above you are a tangle of pipes and ducts
going who knows where."""

world.activity.connect_rooms("The Cave", "south", "Dark Corridor")
world.activity.connect_rooms("Dark Corridor", "south", "The Deep Cave")

quickdef(world, "boiler", "thing", {
        Scenery : True,
        Description : """[img b/cave/boiler.jpg left]This is a
        100-year-old boiler which powers the radiators on back side of
        the house.  It has no pump; it instead relies on the hot water
        rising due to convection.  The boiler has been retrofitted to
        use oil rather than coal, and the method is some nozzles set
        up to spray burning oil at a pipe.  tEp has a million dollar
        boiler insurance policy in the event it takes out part of the
        block."""
        }, put_in="The Cave")

quickdef(world, "hot water heater", "thing", {
        Scenery : True,
        Description : """[img b/cave/heater.jpg left]Unlike [the
        boiler], this water heater is fairly new.  When some tEps were
        working on the valve of a fifth-floor shower, the old heater
        shot hot, black sludge at them through almost a hundred feet
        of pipe as they wondered what they possibly could have done to
        deserve that.  Because the water heater was grandfathered into
        some tEp insurance policy, it was replaced at no charge.
        Except for the fact we had a full month of cold showers."""
        }, put_in="The Cave")

###
### Dark Corridor
###

quickdef(world, "Dark Corridor", "room", {
        Visited : True,
        Description : """[img b/cavehall/look.jpg left]You're in the
        middle of a dimly lit corridor which continues to the [dir
        south].  You can both look [look north] and go [dir north]."""
        })

world[DirectionDescription("Dark Corridor", "north")] = """
[img b/cavehall/look_n.jpg left]You can see the way back [dir north]
to the cave."""

instead_of(actionsystem, 
           LookingToward(actor, "south") <= PEquals("Dark Corridor", ContainingRoom(actor)),
           Looking(actor))

###
### The Deep Cave
###

quickdef(world, "The Deep Cave", "room", {
        Visited : True,
        Description : """[img b/deepcave/look.JPG left]This room lies
        directly underneath the front garden and is the perfect place
        to keep a big pile of junk.  You can leave to the [dir
        north]."""
        })

###################
### First floor ###
###################

###
### In front of tep (253 Commonwealth Ave)
###

instead_of(actionsystem,
           LookingToward(actor, "north") <= PEquals("253 Commonwealth Ave", ContainingRoom(actor)),
           Looking(actor))
instead_of(actionsystem,
           LookingToward(actor, "down") <= PEquals("253 Commonwealth Ave", ContainingRoom(actor)),
           Examining(actor, "front garden"))


quickdef(world, "tEp", "backdrop", {
        ProperNamed : "tEp",
        AddedWords : ["@house"],
        BackdropLocations : ["253 Commonwealth Ave", "The Backlot"],
        })
instead_of(actionsystem, Examining(actor, "tEp"), Looking(actor))
instead_of(actionsystem, Entering(actor, "tEp") <= PEquals("253 Commonwealth Ave", ContainingRoom(actor)),
           Going(actor, "north"), suppress_message=True)
instead_of(actionsystem, Entering(actor, "tEp") <= PEquals("The Backlot", ContainingRoom(actor)),
           Going(actor, "south"), suppress_message=True)
parser.understand("go in", Entering(actor, "tEp") <= AccessibleTo("tEp", actor))


@before(Climbing(actor, "purple tree"))
def climbing_purple_tree(actor, ctxt) :
    raise AbortAction("""You have a merry time climbing the tree.
    Then you remember you have a house to tour, and you stop.""")

instead_of(actionsystem,
           Going(actor, "in") <= PEquals(ContainingRoom(actor), "253 Commonwealth Ave"),
           Going(actor, "north"), suppress_message=True)



###
### The Foyer
###



instead_of(actionsystem,
           Going(actor, "up") <= PEquals(ContainingRoom(actor), "The Foyer"),
           GoingTo(actor, "The Second Landing"), suppress_message=True)

instead_of(actionsystem,
           Going(actor, "out") <= PEquals(ContainingRoom(actor), "The Foyer"),
           Going(actor, "south"), suppress_message=True)
instead_of(actionsystem,
           Going(actor, "north") <= PEquals(ContainingRoom(actor), "The Foyer"),
           Going(actor, "northwest"))

instead_of(actionsystem,
           LookingToward(actor, "north") <= PEquals("The Foyer", ContainingRoom(actor)),
           Examining(actor, "foyer lights"))
instead_of(actionsystem,
           LookingToward(actor, "west") <= PEquals("The Foyer", ContainingRoom(actor)),
           Examining(actor, "foyer mirror"))
instead_of(actionsystem,
           LookingToward(actor, "east") <= PEquals("The Foyer", ContainingRoom(actor)),
           Examining(actor, "foyer mirror"))


###
### Center Room
###



quickdef(world, "broken chandelier", "thing", {
        Scenery : True,
        Description : """This chandelier, which is affixed to the
        center of the ceiling, has been [ask eited], and now half of
        the lights don't work any more.  Good job."""
        })
quickdef(world, "broken sconce", "thing", {
        Description : """It's half a sconce that fell from the [ask
        eit eiting] of the [ob chandelier]."""
        })

@before(Eiting(actor, "chandelier"))
def before_eiting_chandelier(actor, ctxt) :
    raise AbortAction("The chandelier is too high up for you to eit.  Maybe there's something you could eit it with.")
@before(Eiting(actor, "broken chandelier"))
def before_eiting_brokenchandelier(actor, ctxt) :
    raise AbortAction("The chandelier looks well eited already.")


@before(EitingWith(actor, "chandelier", "ex_ball"))
def before_eiting_chandelier_with_stupidball(actor, ctxt) :
    raise ActionHandled()
@when(EitingWith(actor, "chandelier", "ex_ball"))
def when_eiting_chandelier_with_stupidball(actor, ctxt) :
    ctxt.world.activity.remove_obj("chandelier")
    ctxt.world.activity.put_in("broken chandelier", "The Center Room")
    ctxt.world.activity.put_in("broken sconce", "The Center Room")
    ctxt.world.activity.put_in("ex_ball", "The Center Room")
@report(EitingWith(actor, "chandelier", "ex_ball"))
def report_eiting_chandelier(actor, ctxt) :
    ctxt.write("""Good plan.  You kick the large green exercise ball
    at high velocity into the chandelier, and half the sconces explode
    in a showering display of broken glass, one of which falls to the
    ground.  There didn't need to be that much light in this room,
    anyway.""")
@before(EitingWith(actor, "broken chandelier", Y))
def before_eitingwith_brokenchandelier(actor, y, ctxt) :
    raise AbortAction("The chandelier looks well eited already.")

parser.understand("drop/throw [something x] down/into [object center stairwell]", InsertingInto(actor, X, "center stairwell"))

# override trybefore to prevent trying to take self.
reset_action_handler(trybefore, InsertingInto(actor, X, "center stairwell") <= PEquals(actor, X))
# override trybefore to prevent trying to take the RA.
reset_action_handler(trybefore, InsertingInto(actor, X, "center stairwell") <= PEquals("RA", X))

@before(InsertingInto(actor, X, "center stairwell") <= AccessibleTo("center stairwell", actor))
def before_insertinginto_stairwell(actor, x, ctxt) :
    if ctxt.world[Contains("r_center_stairs", ctxt.world[ContainingRoom(actor)])] :
        if x == actor :
            raise AbortAction("The RA comes out and stops {bob},\
            \"remember the zeroth [ask <rules of tep> <rule of tep>]! Don't die!\"", actor=actor)
        elif x == "RA" :
            raise AbortAction("""Sensing trouble, the RA appears, but,
            sensing {his} intention, runs off, yelling back, "remember
            the zeroth [ask <rules of tep> <rule of tep>]! Don't die!" """, actor=actor)
        else :
            raise ActionHandled()
    else :
        raise AbortAction("""{Bob} {needs} to go to a higher floor to
        drop anything down the center stairwell.""", actor=actor)
@when(InsertingInto(actor, X, "center stairwell"))
def when_insertinginto_stairwell(actor, x, ctxt) :
    ctxt.world.activity.put_in(x, "The Center Room")
    raise ActionHandled()
@report(InsertingInto(actor, X, "center stairwell"))
def report_dropping_down_stairwell(actor, x, ctxt) :
    ctxt.write(str_with_objs("\"[cap [get Name $x]] drop!!!\" {bob} {yells} down\
    the stairwell, as {he} {drops} [the $x] down into the center room, where [he $x] then\
    bounces and makes a large ruckus before finally settling down.", x=x), actor=actor)
    raise ActionHandled()

###
### Center stairwell region
###

instead_of(actionsystem,
           Examining(actor, "center stairwell"),
           LookingToward(actor, "down"))
instead_of(actionsystem,
           Examining(actor, "center stairwell") <= PEquals("The Center Room", ContainingRoom(actor)),
           LookingToward(actor, "up"))

parser.understand("look up [object center stairwell]", LookingToward(actor, "up") <= PEquals("The Center Room", ContainingRoom(actor)))
parser.understand("look up [object center stairwell]", LookingToward(actor, "up") <= Contains("r_center_stairs", ContainingRoom(actor)))
parser.understand("look down [object center stairwell]", LookingToward(actor, "down") <= Contains("r_center_stairs", ContainingRoom(actor)))

@report(LookingToward(actor, X) <= AccessibleTo("center stairwell", actor))
def report_lookingtoword_with_stairwell(actor, x, ctxt) :
    if x in ["up", "down"] :
        ctxt.world[Global("describe_object_described")] = True
        describe_object_defilements(actor, "center stairwell", ctxt)


###
### Dining room
###


instead_of(actionsystem,
           LookingToward(actor, "west") <= PEquals("The Dining Room", ContainingRoom(actor)),
           Examining(actor, "Tepilepsy"))


instead_of(actionsystem,
           Examining(actor, "oobleck"),
           AskingAbout(actor, "Irving Q. Tep", "oobleck"))



#quickdef(world, "dining room table", "supporter", {
#        Scenery : True,
#        Description : """These are 


####################
### Second floor ###
####################


instead_of(actionsystem,
           LookingToward(actor, "west") <= PEquals("The Second Landing", ContainingRoom(actor)),
           Looking(actor))



###
### 22
###

instead_of(actionsystem,
           LookingToward(actor, "east") <= PEquals("22", ContainingRoom(actor)),
           Examining(actor, "eit mural"))



##
## The Closet in 22
##
quickdef(world, "The Closet in 22", "room", {
        Description : """[img 2/22closet/look.jpg left]It's a closet.
        You can go [dir southeast] into 22."""
        })
world[DirectionDescription("The Closet in 22", "up")] = """
[img 2/22closet/look_u.JPG left]Looking up, you can see a [ob ladder]
to a room above this closet."""
world[DirectionDescription("The Closet in 22", "east")] = """
[img 2/22closet/look_e.jpg left]Looking to the east, you can see a
dowel from the [ob ladder] which is going upward."""

world.activity.connect_rooms("22", "northwest", "The Closet in 22")
world.activity.connect_rooms("The Closet in 22", "up", "22_closet_ladder")
world.activity.connect_rooms("22_closet_ladder", "up", "The Batcave")

world[WhenGoMessage("The Closet in 22", "up")] = """With some
difficulty, you climb the ladder into..."""

quickdef(world, "22_closet_ladder", "door", {
        Name : "ladder",
        IsLadder : True,
        Openable : False,
        Reported : False,
        Description : """It's a ladder made of widely spaced dowels
        that goes between the closet in 22 and the Batcave up above."""
        })

###
### The Batcave
###
quickdef(world, "The Batcave", "room", {
        Description : """[img 2/batcave/look.JPG left]This is one of
        the secret rooms of tEp.  It's a room built into the
        interstitial space between the second and third floors by
        Batman, a tEp from the 80s.  People have actually lived in
        this room before.  The only things in here are a mattress, a
        [ob sign], and some [ob shelves][if [get IsOpen
        batcave_shelves]], which have been opened, revealing the
        second front interstitial space to the [dir north][endif].
        You can go [dir down] to the closet in 22 or [dir up] to the
        closet in 32."""
        })
world.activity.connect_rooms("The Batcave", "up", "The Closet in 32")

world[DirectionDescription("The Batcave", "up")] = """
[img 2/batcave/look_u.JPG left]Looking up, you can see a hole in the
ceiling you could squeeze through."""
world[DirectionDescription("The Batcave", "down")] = """
[img 2/batcave/look_d.JPG left]Looking down, you can see into the
closet in 22."""

world[WhenGoMessage("The Batcave", "up")] = """You squeeze through the
hole in the floor and make your way to..."""
world[WhenGoMessage("The Batcave", "down")] = """You carefully climb
down the ladder into..."""

quickdef(world, "batcave sign", "thing", {
        Scenery : True,
        Description : """[img 2/batcave/sign.JPG left]On the wall is
        affixed a sign warning you of the low headroom in the
        Batcave."""
        }, put_in="The Batcave")


# the complexity is because I want the door to be different in each
# room, and there's no support for this in the engine, yet.
quickdef(world, "batcave_shelves", "door", {
        Name : """[if [== [get Location [current_actor_is]] <The
        Batcave>]]small shelves[else]small panel[endif]""",
        IndefiniteName : """[if [== [get Location [current_actor_is]]
        <The Batcave>]]some small shelves[else]a small panel[endif]""",
        Words : ["small", "wooden", "wood", "@shelves", "@panel"],
        Reported : False,
        Description : """[if [== [get Location [current_actor_is]]
        <The Batcave>]][if [get IsOpen batcave_shelves]][img
        2/batcave/shelves_open.JPG left][else][img
        2/batcave/shelves_closed.JPG left][endif]These are small
        shelves next to the [ob bed], and nothing is on them.  [if
        [get IsOpen batcave_shelves]]The shelves are swung open,
        revealing the second front interstitial space to the [dir
        north][else]The shelves seem to be a bit wobbly.[endif]

        [else][img 2/2fint/look_s.JPG left][if
        [get IsOpen batcave_shelves]]The panel is open, revealing the
        Batcave to the [dir south][else]It's a wooden panel that seems
        partly attached to the wall.[endif][endif]"""
        })
world.activity.connect_rooms("The Batcave", "north", "batcave_shelves")
world.activity.connect_rooms("batcave_shelves", "north", "2f_interstitial")

###
### 23
###

instead_of(actionsystem,
           LookingToward(actor, "up") <= PEquals("23", ContainingRoom(actor)),
           Examining(actor, "leitshow"))



instead_of(actionsystem,
           Going(actor, "down") <= PEquals("hanging couch", ParentEnterable(actor)),
           GettingOff(actor), suppress_message=True)




###
### Second front
###

instead_of(actionsystem,
           LookingToward(actor, "up") <= PEquals("Second Front", ContainingRoom(actor)),
           Examining(actor, "2f_ceiling_door"))

quickdef(world, "2f_ceiling_door", "door", {
        Name : "ceiling access hatch",
        IsLadder : True,
        Reported : False,
        Words : ["ceiling", "access", "@hatch", "@door", "@ladder"],
        Description : """[if [get IsOpen 2f_ceiling_door]][img
        2/2f/hatch_open.JPG left]It's an open ceiling access hatch,
        revealing a ladder going from second front up to the
        interstitial space above it.[else][img 2/2f/hatch_closed.JPG
        left]It's a ceiling access hatch, and it's closed.[endif]"""
        })
world.activity.connect_rooms("Second Front", "up", "2f_ceiling_door")
world.activity.connect_rooms("2f_ceiling_door", "up", "2f_interstitial")


###
### The Second Front Interstitial Space
###
quickdef(world, "2f_interstitial", "room", {
        Name : "The Second Front Interstitial Space",
        Description : """[img 2/2fint/look.JPG left]This is the
        interstitial space above second front.  You can go [dir down]
        through the [ob <access hatch>] into second front.[if [get
        IsOpen batcave_shelves]] Through the small wooden panel (which
        is open), you can go [dir south] to the batcave.[endif]"""
        })
instead_of(actionsystem,
           LookingToward(actor, "south") <= PEquals("2f_interstitial", ContainingRoom(actor)),
           Examining(actor, "batcave_shelves"))
world[DirectionDescription("2f_interstitial", "down")] = """[if [get
IsOpen 2f_ceiling_door]][img 2/2fint/look_d.JPG left]Looking down, you
see second front.[else]You see that [the 2f_ceiling_door] is
closed.[endif]."""

quickdef(world, "safe", "container", {
        FixedInPlace : True,
        Openable : True,
        IsOpen : False,
        Lockable : True,
        IsLocked : True,
        Description : """[img 2/2fint/safe.JPG left]It's a safe whose
        combination has long been forgotten.  It was used to store the
        house chocolate chips to prevent tEps from eating them."""
        }, put_in="2f_interstitial")
@before(Unlocking(actor, "safe"))
def cant_unlock_safe_even_with_key(actor, ctxt) :
    raise AbortAction("""The combination for that safe has long been
    forgotten.  You can't unlock it.""")

parser.understand("pick [object safe]",
                  MakingMistake(actor, """Brilliant. And into what
                  part of the safe do you plan to stick the picks?""") <= AccessibleTo("safe", actor))


###################
### Third floor ###
###################





###
### The cockpit
###

instead_of(actionsystem,
           Going(actor, "out") <= PEquals("The Cockpit", ContainingRoom(actor)),
           Going(actor, "northeast"), suppress_message=True)







####################
### Fourth floor ###
####################




instead_of(actionsystem,
           LookingToward(actor, "west") <= PEquals("The Fourth Landing", ContainingRoom(actor)),
           Looking(actor))



###################
### Fifth floor ###
###################


################
### The roof ###
################


instead_of(actionsystem, Taking(actor, "bathtub"),
           Using(actor, "bathtub"), suppress_message=True)

###################################
### Consulting Irving Q. Tep... ###
###################################

# We define a new kind to the game called "lore" which represents
# stories which Irving Q. Tep can talk about.  Lore acts just like
# things in that they have a Name, their Words, and a Description.  We
# also modify the parser to have a somelore subparser.  To know what
# is and what is not a word in the game, we must add an object class
# "somelore" so that init_current_objects pulls in anything which has
# kind "lore."  The definition of the subparser is the basic
# definition used by something and somewhere (at the end of
# parser.py).

world.add_relation(KindOf("lore", "kind"))

parser.define_subparser("somelore", "A parser to match against lore in the game.")
parser.add_object_class("somelore", "lore")

@parser.add_subparser("somelore")
def default_somelore(parser, var, input, i, ctxt, actor, next) :
    """Tries to parse as if the following input were a room."""
    return list_append([parser.parse_thing.notify([parser, "somelore", var, name, words,input,i,ctxt,next],{})
                        for name,words in zip(parser.current_objects["somelore"], parser.current_words["somelore"])])

# Finally, we modify the parser to add some synonyms for asking Irving about things.

parser.understand("consult [object Irving Q. Tep] about [text y]", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("ask about [text y]", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("tell me about [text y]", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("what's/who's/whois [text y] ?", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("what's/who's/whois [text y]", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("what/who is/are [text y] ?", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("what/who is/are [text y]", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("what does [text y] mean ?", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("what does [text y] mean", AskingAbout(actor, "Irving Q. Tep", Y))
parser.understand("ask [object Irving Q. Tep] what/who [text y] is", AskingAbout(actor, "Irving Q. Tep", Y))

@report(AskingAbout(actor, "Irving Q. Tep", Y))
def asking_irving(actor, y, ctxt) :
    """Irving Q. Tep knows about various abstract ideas ("lore") and
    can talk about them.  But, if he doesn't know about a topic, it's
    assumed that the player is asking about an object in the room, and
    we turn it into an Examining action.  Otherwise, if there's no
    relevant object, Irving 'has nothing to say about that.'"""

    nothing_to_say = """Irving Q. Tep has nothing to say about
    that. You can [action <tell Irving about %s>] to inform him.""" % escape_str(y)
    # current words have already been init'd since we're parsing
    res = ctxt.parser.run_parser("somelore",
                                 ctxt.parser.transform_text_to_words(y),
                                 ctxt)
    if len(res) == 1 :
        desc = ctxt.world[Description(res[0][0].value)]
        if desc :
            ctxt.write(desc)
        else : # just in case, for debugging
            ctxt.write(nothing_to_say)
    elif len(res) > 1 :
        raise Ambiguous(AskingAbout(actor, "Irving Q. Tep", X), {X : [r[0].value for r in res]}, {X : "somelore"})
    else :
        res = ctxt.parser.run_parser("something",
                                     ctxt.parser.transform_text_to_words(y),
                                     ctxt)
        res2 = [(r, ctxt.actionsystem.verify_action(Finding(actor, r[0].value), ctxt)) for r in res]
        res = [r for r,v in res2 if type(v) is not IllogicalNotVisible]
        if not res :
            ctxt.write(nothing_to_say)
        elif len(res) == 1 :
            ctxt.actionsystem.run_action(Finding(actor, res[0][0].value), ctxt)
        else :
            raise Ambiguous(Finding(actor, X), {'x' : [r[0].value for r in res]}, {'x' : "something"})
    raise ActionHandled()

# add a way to tell Irving about things he doesn't know about (and
# then report them to us)

class TellingIrvingAbout(BasicAction) :
    """TellingIrvingAbout(actor, text)"""
    verb = "tell Irving"
    gerund = "telling Irving"
    numargs = 2
    dereference_dobj = False

#parser.understand("tell/inform [object Irving Q. Tep] about/of [text x]", TellingIrvingAbout(actor, X))
parser.understand("tell/inform [object Irving Q. Tep] [text x]", TellingIrvingAbout(actor, X))
parser.understand("tell/inform about [text x]", TellingIrvingAbout(actor, X))

parser.understand("tell [object Irving Q. Tep]", MakingMistake(actor, """You
should try telling Irving about something in particular. "I'll tell
whoever maintains the virtual house tour about it!" He adds, "you can
also e-mail %s directly.\"""" % teptour_maintainer_email))

@when(TellingIrvingAbout(actor, X))
def when_telling_irving_about(actor, x, ctxt) :
    words_to_strip_from_front = ["of", "about"]
    for word in words_to_strip_from_front :
        if x.startswith(word) :
            x = x[len(word):].strip()
            break
    ctxt.write(""""Please tell me everything you know about '%s'!"
    Irving excitedly explains, "we'll use this information to expand
    this virtual house tour in a future release."[newline]"Just hit
    enter by itself if you want to get out of this." """ % (escape_str(x)))
    response = ctxt.io.get_input(">>>").strip()
    while not response :
        ctxt.write("\"Are you sure you don't want to say anything about '%s'?\"" % escape_str(x))
        check = ctxt.io.get_input(">>>")
        if check.strip() not in ["n", "no"] :
            ctxt.write("""\"Ok, I'll take that to mean you don't want
            to say anything about that.  You can send an e-mail to %s
            directly, too.\"""" % teptour_maintainer_email)
            with open(os.path.join(GAME_LOCATION, teptour_suggestion_file), "a") as f :
                f.write("\n\n----\n\n> tell Irving about %s\n\n(canceled)" % x)
            return
        ctxt.write("\"Ok, I'll take that to mean you actually want to say something.  Please, what can you say about '%s'?\"" % escape_str(x))
        response = ctxt.io.get_input(">>>").strip()
    ctxt.write(""" "\"Hit enter by itself to finish writing, otherwise
    please just keep writing.  I'll say 'got it' to let you know I'm
    still listening.\" """)
    next = ctxt.io.get_input(">>>").strip()
    while next :
        ctxt.write("\"Got it. (Remember, hit enter by itself to finish writing.)\"")
        response += "\n\n" + next
        next = ctxt.io.get_input(">>>").strip()
    try :
        with open(os.path.join(GAME_LOCATION, teptour_suggestion_file), "a") as f :
            f.write("\n\n----\n\n> tell Irving about %s\n\n%s" % (x, response))
    except Exception as x :
        pass # eh, everything they wrote will be in the log file anyway
    ctxt.write("""\"Thanks! I've sent that along to whoever is
    maintaining the virtual house tour.  You can send an e-mail to
    %s directly, too.\"""" % teptour_maintainer_email)

###
### Lore
###

# These are basically short entries for a wiki-like system of things
# about the house that you couldn't learn about by just looking at
# objects.
#
# Links are created by [ask x] for a link to x, ore [ask x text] for a
# link to x with prettier link text.
#
# The naming scheme is to have the id be "lore: unique name" (it
# doesn't really matter), and then put the actual name in the name
# field.  This way if there actually a sawzall lying around (which
# there shouldn't), the description of the sawzall lore won't eit it.

quickdef(world, "lore: stupidball", "lore", {
        Name : "stupidball",
        Description : """Stupidball is a fine game in which
        contestants take a large exercise ball and throw it around the
        center room at high energy.  This game has [ask eit eited]
        many things, such as the chandelier in the center room."""
        })

quickdef(world, "lore: eit", "lore", {
        Name : "eit",
        Words : ["@eit", "@eited"],
        Description : """'Eit,' in short, means never having to say
        you're sorry.  For instance, let's say you're holding a cup of
        water.  I can then come up to you and knock the cup out of
        your hand whilst saying "eit!" (of course, I should help clean
        up).  The word can also be used when someone recognizes
        something eitful.  For instance, if you told me you didn't do
        well on an exam, I could say "eit, man."  However, what's not
        acceptible is to say 'eit' to the following: "My family just
        got eaten by a pack of wolves."  Remember, this is not an eit!

        [newline]There is a mural in [action <go to 22> 22]
        commemorating the sacrament of eit."""
        })

quickdef(world, "lore: rules of tep", "lore", {
        Name : "rules of tEp",
        Words : ["rule", "rules", "of", "tep", "@rules"],
        Description : """The rules of tEp are threefold:[break]
        0. Don't die;[break]
        1. Hobart is not a dishwasher;[break]
        2. Don't date Pikans;[break]
        3. All explosions must be videotaped;[break]
        Amendment 1. No [ask Sawzalls] without the express permission of
        the [ask <house mangler>]; and[break]
        Amendment 2. The house mangler must not permit the use of Sawzalls."""
        })

quickdef(world, "lore: sawzall", "lore", {
        Name : "sawzall",
        Words : ["@sawzall", "@sawzalls"],
        Description : """A Sawzall is a hand-held reciprocating saw
        which can basically cut through anything.  Their prohibition
        was made into one of the [ask <rules of tep>] after one
        brother repeatedly cut down the wall between 51 and 52 during
        the summer months to make a mega room, where it was the duty
        of the [ask <house mangler>] to mend the wall at the end of
        each summer for [ask <work week>]."""
        })

quickdef(world, "lore: work week", "lore", {
        Name : "work week",
        Description : """Work week occurs once at the end of the
        summer and once during winter break, and it's a time where
        tEps try to repair the house."""
        })

quickdef(world, "lore: house mangler", "lore", {
        Name : "house mangler",
        Words : ["house", "@mangler", "@manager"],
        Description : """The house mangler has one of the most important
        jobs in the house: to make sure the house doesn't fall down.
        The house mangler accomplishes this by attempting to get tEps
        to do their work assignments and to schedule [ask <work
        week>]."""
        })

quickdef(world, "lore: 22", "lore", {
        Name : "22",
        Words : ["@22", "@twenty-two", "twenty", "@two"],
        Description : """<i>myst. num.</i> Twenty-two is a number of
        cosmic significance.  Showing up everywhere, signifying
        everything."""
        })

quickdef(world, "lore: oobleck", "lore", {
        Name : "oobleck",
        Description : """Oobleck is a non-newtonion fluid consisting
        of corn starch and water.  The interesting property of oobleck
        is that, while it normally a liquid, it solidifies as soon as
        you put any pressure on it.  During rush every year, 600
        lbs. of corn starch are acquired for the purpose of filling a
        kiddie pool in the dining room with oobleck."""
        })

quickdef(world, "lore: bouncers", "lore", {
        Name : "Bouncers",
        Words : ["@bouncer", "@bouncers"],
        Description : """A Bouncer(TM) is a now-discontinued durable
        plastic cup by Rubbermaid.  It's like a tall mug (useful for
        cocoa), and could be dropped from the Green Building without
        sustaining any damage.  Living up to their name, bouncers
        really can bounce."""
        })

quickdef(world, "lore: gruesz", "lore", {
        Name : "Gruesz",
        Words : ["@Gruesz", "@Grueszer", "@Grueszed", "@Grueszing"],
        Description : """1. <i>name</i>. Carl Gruesz, an alumnus of Xi
        Chapter. 2. <i>v</i>. To scavange useful stuff that others
        have thrown away from the alleys of the Back Bay or corridors
        of MIT. Named after Carl, the Master Grueszer. Homeophony
        between "Gruesz" and "re-use" is apparently coincidental."""
        })

quickdef(world, "lore: U.S.S. Birthday Ship", "lore", {
        Name : "U.S.S. Birthday Ship",
        AddedWords : ["uss"],
        Description : """This is one of the one-hundred names of tEp,
        referring to how, at tEp, it's always your birthday."""
        })

quickdef(world, "lore: squids", "lore", {
        Name : "squids",
        AddedWords : ["@squidz"],
        Description : """A social gathering in memory of the Squids
        peldge class, who enjoyed being antisocial by listening to
        Philip Glass, wearing black turtlenecks, and sipping on
        G&Ts."""
        })

quickdef(world, "lore: grape soda", "lore", {
        Name : "grape soda",
        AddedWords : ["@soder"],
        Description : """1. <i>n</i>. The official beverage product of
        Tau Epsilon Phi. Servered in a frosty [ask Bouncer] or
        straight from the can. Grape S&ouml;der has been used in the
        ancient <i>velkomin' d&uuml;lr froshinperzons</i> ritual since
        time immemorial:
        
        [newline]Welcome to TEP, where we like to schlep Grape S&ouml;der!
        [break]Welcome to TEP, it's frosty and wet, and it's caffeine free!

        [newline]Other uses of Grape S&ouml;der include:
        [break]- Replacement for sulfuric acid in car batteries.
        [break]- Antimicrobial solution for open sores and wounds.
        [break]- Head and body delousing shampoo.
        [break]- All-purpose oven cleaner.
        [break]- Pressurized nuclear reactor cooling fluid.
        [break]- Alumni."""
        })

quickdef(world, "lore: honig", "lore", {
        Name : "David Andrew Honig",
        Description : """1. <i>exlc</i>. A greeting, often as an
        identifier in a large crowd. 2. <i>prop. n.</i> A former
        brother and famous Objectivist, David Andrew Honig, although
        looked upon as antisocial, has become the mascot of TEP."""
        })

quickdef(world, "lore: fenning", "lore", {
        Name : "Fred Fenning",
        Description : """The renowned and illustrious Fred Fenning was
        the founding member of the present incarnation of Xi chapter,
        which was [ask recolonization recolonized] in 1971."""
        })


quickdef(world, "lore: recolonization", "lore", {
        Name : "recolonization",
        Description : """While Xi chapter was founded in 1918, its
        existence ceased in the late 60s when the brothers decided to
        stop doing things like paying dues and taxes.  A couple of
        years later, [ask <Fred Fenning>] effected a recolonization."""
        })

quickdef(world, "lore: batcave", "lore", {
        Name : "batcave",
        AddedWords : ["bat", "@cave"],
        Description : """Maybe you should go find it for yourself."""
        })

quickdef(world, "lore: kyle", "lore", {
        Name : "Kyle Miller",
        Description : """Kyle wrote a good amount of this virtual
        house tour.  You can e-mail him at kmill@alum.mit.edu"""
        })

quickdef(world, "lore: virtual house tour", "lore", {
        Name : "virtual house tour",
        Description : """The virtual house tour in its current form
        was written mainly by [ask <Kyle Miller>] at the end of Summer
        2011.  It is written in Python using the textadv package,
        available on github (username kmill)."""
        })

quickdef(world, "lore: foosball", "lore", {
        Name : "foosball",
        Description : """Foosball condenses human obsession with
        balls, lines, and goals to a cosmic game for 2-4 entities
        capable of turning and translating arbitrary handles."""
        })
