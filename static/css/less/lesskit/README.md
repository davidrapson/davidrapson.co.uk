# LESSKit v2.5.0

LESSKit is a set of useful base-styles and LESS mixins.

## Core variables

    // Font sizes (unitless)
    @-lesskit-font-size-unitless: 16;
    @-lesskit-line-height-unitless: 1.5;
    @-lesskit-heading-line-height-unitless: 1.2;

    // Display / Heading font-stack
    @-lesskit-typography-display: "Open Sans", sans-serif;

    // Body / text font-stack
    @-lesskit-typography-body: "Open Sans", sans-serif;

    // Caption / small-print font-stack
    @-lesskit-typography-caption: sans-serif;

    // Monospace
    @-lesskit-typography-monospace: "Menlo", "Bitstream Vera Sans", Monaco, "Andale Mono", "Lucida Console", "Droid Mono", monospace;

## Utilities

* `.box-sizing (@type: border-box)` - Sets box-sizing property
* `.border-box()` - Use border box (.box-sizing shortcut)
* `.box-reset()` - Zeros out margin, padding, and border
* `.reset-layout( @margin: 0 0 1em 0, @width: 100% )` - Clears floats, sets 100% width and bottom margin (default values)
* `.font-size-rems( @px-size )` - rem font with px fallback, depends on `@-lesskit-font-size-unitless`
* `.font-size()` - Alias for `.font-size-rems()`
* `.truncate(@width:100%)` - Truncate text
* `.min-height(@value)` - Min-height helper
* `.min-width(@value)` - Min-width helper
* `.center()` - Centering helper (margin: auto)
* `.clearfix()` - Micro-clearfix
* `.image-replacement()` - Image replacement helper
* `.hidden()` - Hide from both screenreaders and browsers
* `.visually-hidden()` - Hide text from browsers but make it available for screen readers
* `.visually-hidden-but-focusable()` - Hide only visually, but have it available for screenreaders
* `.invisible()` - Hide visually and from screenreaders, but maintain layout
* `.disable-user-select()` - Disable user selectable text, useful fot buttons. Use sparingly.

### Vendor prefixes

**NOTE:** Using mixins for vendor prefixes is error prone as support and specs change rapidly so they are unlikely to be up-to date. We strongly recommending using [Autoprefixer](https://github.com/ai/autoprefixer), vendor prefixes included are deprecated and undocumented.

## Grid

Float based grid helpers

### Configuration:

    @-lesskit-grid-columns: 12;
    @-lesskit-grid-column-width: 6.5%;
    @-lesskit-grid-gutter-width: 2%;

### Mixins:

* `.grid()` - Mark as a grid container
* `.columns( @spanWidth )` - Number of columsn to span
* `.columns( @spanWidth )` - Alias for `.columns()`
* `.last()` - Reset right margin on last element
* `.column-last( @spanWidth )` - Combines `.columns()` with `.last()`

## Buttons

Button mixins:

* `.btn( @buttonColor: @-lesskit-color-btn, @buttonTextColor: @-lesskit-color-btn-text, @size: @-lesskit-font-size-unitless )` - Core button mixin
* `.btn-unstyled()`: Gives the appearance of a text link, but the behaviour of a button

**NOTE: Avoid using directly as mixins on a per-case basis**. Instead, use them to build out common button classes. For example:

    .btn,
    .btn-default {
        .btn( blue, white, 16 );
        border-radius: 3px;
    }
    .btn-primary,
    input[type="submit"] {
        .btn( green, white, 16 );
        border-radius: 3px;
    }
    .btn-warning {
        .btn( red, white, 16 );
        border-radius: 3px;
    }
    .btn-link,
    .btn-unstyled {
        .btn-unstyled();
        border-radius: none;
    }

## Units

Helper mixins for creating unit patterns:

* `.list()` Clearfix a list
* `.reset-list()` - Reset a list (no indent, no list style)
* `.horizontal-menu()` - Create a basic horizontal menu
* `.nested-menu()` - Create a basic nested menu

## Colour

Helper mixins for working with colours:

* `.default-colors` - Default colours, useful for resetting colour overrides
* `.flip-colors()` - Reverse out body, headings and links based on the colours set in the variables
