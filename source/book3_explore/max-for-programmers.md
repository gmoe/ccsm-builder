---
title: You Think You Know Max?
---

# You Think You Know Max?

The initial process of learning how to patch in Max is often frustrating.
Trying to draw patch cords between two objects with tiny inlets and outlets can
be much slower than the typing out the equivalent code in a non-dataflow
language like C++. Finding the right object to perform a particular piece of
logic can be like trying to obtain important information from someone only capable
of speaking through jokes you're not in on. (i.e. naming an object that sends
multiple bangs `uzi`. *Why?*)

This chapter can't address these issues, they are natural drawbacks of dataflow
languages and the Max legacy. However, Max at its best can be self-documenting
and reminiscent of the signal block diagrams that it is meant to emulate.

This is a brief guide into Max, particularly things the author wished they knew
starting out. There is an assumption familiarity with Max, so if a particular
term or concept is unclear then check out the [Max documentation][docs].

[docs]: https://docs.cycling74.com/max7/

## Object Shortcuts

Whenever your window focus is on Max and you do not have another object selected,
you can use single-button keyboard shortcuts to add new objects to your patch.

| Shortcut | Object                | Shortcut | Object                |
|:--------:|:---------------------:|:--------:|:---------------------:|
| `n`      | Object                | `s`      | Slider                |
| `m`      | Message               | `a`      | `attrui`              |
| `c`      | Comment               | `p`      | Object (presentation) |
| `i`      | Integer               | `j`      | Jitter object         |
| `f`      | Float                 | `l`      | Live UI object        |
| `b`      | Button                | `x`      | Shortcut menu         |
| `t`      | Toggle                | `z` / `Z`| Zoom in / out         |

--------------------------------------------------------------------------------------

## Good Design Practices

When you reach a certain level of comfort with Max, patching can often feel
like painting, where there are no wrong answers and problems are solved
organically. There is value in the creative problem solving that Max enables,
but this is not how good software is made. 

It can be helpful to approach problems the way a software engineer might:
  
  * Don't Repeat Yourself (DRY)
  * Single Responsibility Principle
  * Encapsulation

### Subpatches

Subpatches encapsulate other Max objects, and can have inlets and outlets just
like a normal object. New subpatches can be made using the `patcher` object and
its shorthand alias `p`. While subpatches do not have any required attributes,
it's good practice to provide a name symbol that is descriptive of the
subpatch. For example, a subpatch that accepts an integer value for beats per
minute and returns the time between beats in milliseconds might first be
instantiated by typing `p bpm-calc`.

Subpatches only exist within the master patch file, so use subpatches to
encapsulate complex or related logic that is specific to the function of this
particular program. If the function of a subpatch could potentially be useful
in other patches, you will want to use an abstraction.

### Abstractions

Abstractions also encapsulate other Max objects, but they analogous to source
code files such that they exist as a separate file outside of the main patch.
These are useful for creating generalized patches that can be used in other
programs. Max will first search for abstractions within its path, followed by a
recursive search within the directory of the currently opened patch. This means
that commonly used abstractions can be placed within the path for global usage,
or related program patches can be kept within the same directory.

To create an instance of an abstraction inside your master patch, simply type
its name into a new object. Sometimes Max will auto-complete the abstraction
name as you type, but generally you need to have typed the full name out at
least once.

#### Good Practices for Abstractions

* Annotate with comments! (Everywhere, but especially in abstractions)
* Add hints to each inlet and outlet, it will change the message you see when
  you place your mouse over the port in the parent patcher.
* Put number boxes, buttons, etc. immediately after every inlet to sanitize input
  and if necessary apply minimum and maximum values.
* Create an interface in Presentation mode for use in `bpatchers`!

### bpatcher

The `bpatcher` object exposes the logic of an abstraction by providing a
viewport. If the abstraction opens up in Presentation view by default, you can
create a consistent user interface for your abstraction in every context that
it is used in. An abstraction prepared in this way can still be loaded as a
regular object, so it does not hurt to add a nice visual interface or even a
basic value display so your abstraction is useful in other contexts.  A
`bpatcher` will also create the same inlets and outlets that you would expect
using a `patcher`.
