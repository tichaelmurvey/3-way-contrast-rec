# All purpose contrast checker

Colors on websites should have good contrast with one another. This helps everyone understand the website.

There are a lot of good tools for when you need to check the contrast of two colors. Some even recommend colours.

Mine is the first that makes recommendations for 3 colors.

[View the live site](https://tichaelmurvey.github.io/contrastrolabe/slider)

## Why do you need three colors

Sometimes websites have more than two colors. I am personally against this frankly insane design philosophy but I am trying to be less judgemental.

Examples of when you need three colors to match include:

* Buttons with a focus outline
* Some weirdo design like a menu with multiple colors
* Links without an underline (but don't do this)

## How it works

The site uses the Chroma.js library for WCAG checking, and a lot of messy JS code in the front end for colour generation.

The main challenge is that often the needle for a 3 way compliance is so narrow, that floating point and rounding errors come into the results.

