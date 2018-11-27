# VisualNav

VisualNav is a Visual Studio code extension providing a "visual navigation" feature, allowing you to quickly jump
between different parts of your code based on their visual location.

In a sense, VisualNav is trying to replace mouse-based navigation, but without requiring you to think *how* to get
to a certain place in the code. You simply "see" where you want to go.

## Features

The navigation mode is toggled by pressing `Alt+A` and provides two features:

* jumping to a place in the code by entering the characters shown at desired point:
![](navigation.gif)
* scrolling up and down by pressing `f` and `j` respectively
![](scrolling.gif)


When navigation mode is active, an indicator on the bottom bar shows you the characters you already typed.
![](status.png)

## Extension Settings

This extension contributes the following settings:

* `visualNav.minimumGap`: minimum number of characters between navigation points (default: 2)
* `visualNav.scrollStep`: number of lines to scroll up/down in one step (default: 5)

## Known Issues

There are no tests in place yet, so there probably are issues, but I haven't noticed (and not fixed) them yet.

## Release Notes

### 0.0.1

Basic idea working.

**Enjoy!**
