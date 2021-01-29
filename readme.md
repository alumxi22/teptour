# teptour

This repository is for the tEp virtual house tour, an interactive fiction ("text adventure")
simulation of the house.

It uses the [textadv-js](https://github.com/kmill/textadv-js) engine, which was more-or-less
written for teptour.

## Vision

Interactive fiction is unconstrained by geometry, space, and time.
This means it is possible to fill it with layers of accreted history:
for example, it's possible to add rooms that are back-in-time-from
other rooms in addition to the usual cardinal directions.
It means it's also ok if virtual tep doesn't accurately depict tEp
as it currently is.

I imagine thet teptour should also be something like the old
point-and-click game "The Manhole," where everything can be interacted
with, and you're rewarded for just messing around.

## Getting started

It's all written in pure JavaScript with no dependencies other than your having a web browser.
Just clone the repository and open `index.html` locally.

The raw images are too big for GitHub and GitHub Pages, so they are not hosted in this repository.

## How to contribute

Create an issue with an idea of something teptour should cover or a funny mechanic it could have
(did you know you can take the banned words list from 43 with you? that you can add words to it?)
or submit a PR, and something will make it into the virtual tEp.

## Implementation notes

- The frontend UI is a slapdash job to get something visually working.
- Everything is in a giant file because it made developing it easier without having
  to switch between files all the time.
- It'd be nice to have NPCs of some kind to make the place feel less lonely.
  Irving Q. Tep can only do so much.
- The engine is semi-capable of (eventually) supporting a MUD-like
  interaction, but that would complicate things quite a lot.

## The Python version

The file `old-teptour.py` contains the game file for the 2011 version of teptour for reference.
The file `old-teptour-remaining.py` contains things from the old
2011 Python version of teptour that have not been ported (or have been partially
ported but perhaps a feature is still missing).  These do not necessarily need to ever
make it into the JavaScript version.
