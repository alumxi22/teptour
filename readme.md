# teptour

This repository is for the tEp virtual house tour, an interactive fiction ("text adventure")
simulation of the house.

It uses the [textadv-js](https://github.com/kmill/textadv-js) engine, which was more-or-less
written for teptour.

## Vision

Interactive fiction is unconstrained by geometry.  This means it is possible to fill it
with layers of accreted history.
For example, it's possible to add rooms that are back-in-time-from other rooms in addition
to the usual cardinal directions.

It should also be something like the old point-and-click game The Manhole, where everything can
be interacted with, and you're rewarded for just messing around.

## Getting started

It's all written in pure JavaScript with no dependencies other than your having a web browser.
Just clone the repository and open `index.html` locally.

The raw images are too big for GitHub and GitHub Pages, so they are not hosted in this repository.

## Python version

The file `old-teptour.py` contains the game file for the 2011 version of teptour.
The file `old-teptour-remaining.py` contains things from the old
2011 Python version of teptour that have not been ported (or have been partially
ported but perhaps a feature is still missing).  These do not necessarily need to ever
make it into the JavaScript version.
