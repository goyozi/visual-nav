# VisualNav

VisualNav is a Visual Studio code extension providing a "visual navigation" feature, allowing you to quickly jump
between different parts of your code based on their visual location.

In a sense, VisualNav is trying to replace mouse-based navigation, but without requiring you to think *how* to get
to a certain place in the code. You simply "see" where you want to go.

## Features

The navigation mode is toggled by pressing `Alt+A` and provides two features:

* scrolling up and down by pressing `f` and `j` respectively
* jumping to a place in the code by entering the characters shown at desired point

When navigation mode is active, an indicator on the bottom bar shows you the characters you already typed.

## Extension Settings

This extension contributes the following settings:

* `visualNav.minimumGap`: minimum number of characters between navigation points (default: 2)
* `visualNav.scrollStep`: number of lines to scroll up/down in one step (default: 5)

## Known Issues

The extension doesn't work properly when navigation mode is active in one file and you try to edit another.

Since there are no tests in place yet, there's probably way more than that, but I haven't noticed it yet.

## Release Notes

### 0.0.1

Basic idea working.

**Enjoy!**
