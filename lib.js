const chroma = require('chroma-js')

function checkCompliant (change_color, stable_color, ratio) {
  return (chroma.contrast(change_color, stable_color) >= ratio ? true : false);
}

//Tweak a color output of a given type be compliant with the ratio
function tweak (change_color, stable_color, ratio, color_type) {
  for (i = 0; i < 5; i++) {
    //Round out the values to their human readable form
    if (color_type == "rgb") {
      change_color = change_color.rgb();
      change_color = chroma(change_color);
    }
    //Check for compliance in human readable form
    if (checkCompliant(change_color, stable_color, ratio)) {
      return (change_color);
    }
    //If it needs to be a little more luminous
    if (change_color.luminance() > stable_color.luminance()) {
      //Try chromacity
      change_color = change_color.lch();
      if (change_color[1] < 132) {
        change_color[1] += 1;
        change_color = chroma(change_color, 'lch');
      }

      //Try lightness
      change_color = change_color.lch();
      if (change_color[0] < 100) {
        change_color[0] += 1;
        change_color = chroma(change_color, 'lch');
      }

    } else { //If it needs to be a little less luminous
      //Try lightness
      change_color = change_color.lch();
      if (change_color[0] > 0) {
        change_color[0] -= 1;
        change_color = chroma(change_color, 'lch');
      }

    }
  }
}

//Calculate compliant luminance above and below input luminance for a given ratio
function secondLuminance (oldLuminance, desired_ratio) {
  options = [];
  darkOption = (oldLuminance + 0.05) / desired_ratio - 0.05;
  if (darkOption > 0 && darkOption < 1) {
    options.push(darkOption);
  }
  lightOption = desired_ratio * (oldLuminance + 0.05) - 0.05;
  if (lightOption > 0 && lightOption < 1) {
    options.push(lightOption);
  }
  return (options);
}

//Produce a list of compliant options for a given color and ratio
function getSecondColor (initial_color, ratio) {
  //Get WCAG luminance for input color
  initial_lum = initial_color.luminance();
  //Find luminances that are compliant
  compliant_lum = secondLuminance(initial_lum, ratio);
  //Get a color for each of the compliant luminances
  colors = [];
  compliant_lum.forEach(function (lum) {
    var new_color = chroma("white").luminance(lum);
    new_color = tweak(new_color, initial_color, ratio, "rgb");
    colors.push(new_color);
  });
  return colors;
}

module.exports = { getSecondColor, tweak }
