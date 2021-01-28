# The remains of teptour.py

# As things are ported, delete them from this file to keep track.

#####################
### Fun and games ###
#####################


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
### Floors
###


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




###################
### First floor ###
###################






###################################
### Consulting Irving Q. Tep... ###
###################################


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


