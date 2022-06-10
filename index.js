const chroma = require('chroma-js')
const $ = require('jquery')

//Event handler for Two color recommender (from one given color)
function twoColorRec () {
  console.log("clicked");
  //get the value of the input fields
  const r = Number($("#two-color-red").val());
  const g = Number($("#two-color-green").val());
  const b = Number($("#two-color-blue").val());
  const ratio = $("#ratio").val();
  const colors = getSecondColor(chroma(r, g, b), ratio);
  console.log(colors);
  $("#two-color-result").empty();
  $("#two-color-result").append("<p style=\"border-left: 18px solid rgb(" + chroma(r, g, b).rgb() + ")\" class='color-box'> Initial color: " + chroma(r, g, b).rgb() + "</p>");
  colors.forEach(function (color) {
    $("#two-color-result").append("<p style=\"border-left: 18px solid rgb(" + color.rgb() + ")\" class='color-box'>" + color.rgb() + "</p>");
  });
}

//Event handler for two color recommender (from two given colors)
function twoColorRecFromGivenColor () {
  //Get the value of the input fields
  const r1 = Number($("#two-color-stable-color-red").val());
  const g1 = Number($("#two-color-stable-color-green").val());
  const b1 = Number($("#two-color-stable-color-blue").val());
  const r2 = Number($("#two-color-changeable-color-red").val());
  const g2 = Number($("#two-color-changeable-color-green").val());
  const b2 = Number($("#two-color-changeable-color-blue").val());
  const ratio = $("#ratio").val();
  const stable_color = chroma(r1, g1, b1);
  const changeable_color = chroma(r2, g2, b2);
  const colors = modifyColor(stable_color, changeable_color, ratio);
  console.log(colors);
  $("#two-color-result-from-given").empty();
  $("#two-color-result-from-given").append("<p style=\"border-left: 18px solid rgb(" + stable_color.rgb() + ")\" class='color-box'> Initial color: " + stable_color.rgb() + "</p>");
  $("#two-color-result-from-given").append("<p style=\"border-left: 18px solid rgb(" + changeable_color.rgb() + ")\" class='color-box'> Changed color: " + changeable_color.rgb() + "</p>");
  colors.forEach(function (color) {
    $("#two-color-result-from-given").append("<p style=\"border-left: 18px solid rgb(" + color.rgb() + ")\" class='color-box'>" + color.rgb() + "</p>");
  });
}
//Event handler for three color recommender (from two given colors)
function threeColorRec () {
  console.log("starting threeColorRec");
  //Get the value of the input fields
  const r_one = Number($("#three-color-one-red").val());
  const g_one = Number($("#three-color-one-green").val());
  const b_one = Number($("#three-color-one-blue").val());
  const r_two = Number($("#three-color-two-red").val());
  const g_two = Number($("#three-color-two-green").val());
  const b_two = Number($("#three-color-two-blue").val());
  const ratio = Number($("#ratio").val());
  const color_one = chroma(r_one, g_one, b_one);
  const color_two = chroma(r_two, g_two, b_two);
  const colors = getThirdColor(color_one, color_two, ratio);
  console.log(colors);
  $("#three-color-result").empty();
  $("#three-color-result").append("<p style=\"border-left: 18px solid rgb(" + color_one.rgb() + ")\" class='color-box'> Stable color one: " + color_one.rgb() + "</p>");
  $("#three-color-result").append("<p style=\"border-left: 18px solid rgb(" + color_two.rgb() + ")\" class='color-box'> Stable color two: " + color_two.rgb() + "</p>");
  colors.forEach(function (color) {
    $("#three-color-result").append("<p style=\"border-left: 18px solid rgb(" + color.rgb() + ")\" class='color-box'>" + color.rgb() + "</p>");
  });
}

//Event handler for three color recommender (with two stable colors, modifying one)
function threeColorRecFromGivenColor () {
  const r_stable_one = $("#three-color-stable-color-one-red").val();
  const g_stable_one = $("#three-color-stable-color-one-green").val();
  const b_stable_one = $("#three-color-stable-color-one-blue").val();
  const r_stable_two = $("#three-color-stable-color-two-red").val();
  const g_stable_two = $("#three-color-stable-color-two-green").val();
  const b_stable_two = $("#three-color-stable-color-two-blue").val();
  const r_change = $("#three-color-changeable-color-red").val();
  const g_change = $("#three-color-changeable-color-green").val();
  const b_change = $("#three-color-changeable-color-blue").val();
  const ratio = $("#ratio").val();
  const colors = modifyThreeColor([r_stable_one, g_stable_one, b_stable_one], [r_stable_two, g_stable_two, b_stable_two], [r_change, g_change, b_change], ratio);
}

//Check contrast ratio compliance for two chroma colors
function checkCompliant (change_color, stable_color, ratio) {
  return (chroma.contrast(change_color, stable_color) >= ratio ? true : false);
}

//Produce a list of compliant options for a given color and ratio
function getSecondColor (initial_color, ratio) {
  //Get WCAG luminance for input color
  const initial_lum = initial_color.luminance();
  //Find luminances that are compliant
  const compliant_lum = secondLuminance(initial_lum, ratio);
  //Get a color for each of the compliant luminances
  const colors = [];
  compliant_lum.forEach(function (lum) {
    let new_color = chroma("white").luminance(lum);
    new_color = tweak(new_color, initial_color, ratio, "rgb");
    colors.push(new_color);
  });
  return colors;
}

function getThirdColor (color_one, color_two, ratio) {
  //Get WCAG luminance for input color
  const color_one_lum = color_one.luminance();
  const color_two_lum = color_two.luminance();
  //Find luminances that are compliant
  const compliant_lum = thirdLuminance(color_one_lum, color_two_lum, ratio);
  //Get a color for each of the compliant luminances
  const colors = [];
  compliant_lum.forEach(function (lum) {
    let new_color = chroma("white").luminance(lum);
    new_color = TwoWayTweak(new_color, color_one, color_two, ratio, "rgb");
    colors.push(new_color);
  });
  return colors;
}

//Modify an existing color to meet contrast with another color
function modifyColor (initial_color, change_color, ratio) {
  //Get WCAG luminance for input color
  const initial_lum = initial_color.luminance();
  //Find luminances that are compliant
  const compliant_lum = secondLuminance(initial_lum, ratio);
  console.log("compliant lums:" + compliant_lum);
  //Modify the new color to meet the requirements
  const colors = [];
  compliant_lum.forEach(function (lum) {
    let new_color = chroma(change_color).luminance(lum);
    new_color = tweak(new_color, initial_color, ratio, "rgb");
    colors.push(new_color);
  });
  return colors;
}

//Tweak a color output of a given type be compliant with the ratio
function tweak (change_color, stable_color, ratio, color_type) {
  for (let i = 0; i < 5; i++) {
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

function TwoWayTweak (change_color, stable_color_one, stable_color_two, ratio, color_type) {
  for (let i = 0; i < 5; i++) {
    //Round out the values to their human readable form
    if (color_type == "rgb") {
      change_color = change_color.rgb();
      change_color = chroma(change_color);
    }
    //Check for compliance in human readable form
    if (checkCompliant(change_color, stable_color_one, ratio) && checkCompliant(change_color, stable_color_two, ratio)) {
      return (change_color);
    }
    //If the first color is the issue
    if (checkCompliant(change_color, stable_color_one, ratio)) {
      //If it needs to be a little more luminous
      if (change_color.luminance() > stable_color_two.luminance()) {
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

      } else { //If the second color is the issue
        //Try lightness
        change_color = change_color.lch();
        if (change_color[0] > 0) {
          change_color[0] -= 1;
          change_color = chroma(change_color, 'lch');
        }

      }
    } else {
      //If it needs to be a little more luminous
      if (change_color.luminance() > stable_color_one.luminance()) {
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

      } else { //If the second color is the issue
        //Try lightness
        change_color = change_color.lch();
        if (change_color[0] > 0) {
          change_color[0] -= 1;
          change_color = chroma(change_color, 'lch');
        }

      }
    }
  }
  return ("No good tweak");
}

//Calculate compliant luminance above and below input luminance for a given ratio
function secondLuminance (oldLuminance, desired_ratio) {
  const options = [];
  const darkOption = (oldLuminance + 0.05) / desired_ratio - 0.05;
  if (darkOption > 0 && darkOption < 1) {
    options.push(darkOption);
  }
  const lightOption = desired_ratio * (oldLuminance + 0.05) - 0.05;
  if (lightOption > 0 && lightOption < 1) {
    options.push(lightOption);
  }
  return (options);
}

//Calculate compliant luminance for two other luminances (which don't necessarily contrast) at a given ratio
function thirdLuminance (first_luminance, second_luminance, desired_ratio) {
  const brightest = Math.max(first_luminance, second_luminance);
  const darkest = Math.min(first_luminance, second_luminance);
  const options = [];
  //Middle
  if (getRatio(darkest, brightest) > desired_ratio) {
    const middle_option_one = secondLuminance(darkest, desired_ratio)[0];
    const middle_option_two = secondLuminance(brightest, desired_ratio)[0];
    if (getRatio(middle_option_one, brightest) >= desired_ratio) {
      options.push(middle_option_one);
      console.log("middle option one: " + middle_option_one);
    }
    if (getRatio(middle_option_two, darkest) >= desired_ratio) {
      options.push(middle_option_two);
      console.log("middle option two: " + middle_option_two);
    }
    if ((getRatio(middle_option_two, darkest) >= desired_ratio) && (getRatio(middle_option_one, brightest) >= desired_ratio)) {
      const rue_middle = (middle_option_one + middle_option_two) / 2;
      options.push(true_middle);
      console.log("true middle: " + true_middle);
    }
  }

  //Lower
  const lower_option = (darkest + 0.05) / desired_ratio - 0.05;
  if (lower_option > 0 && lower_option < 1) {
    options.push(lower_option);
    console.log("lower option: " + darkOption);
  }

  //Higher
  let higher_option = desired_ratio * (brightest + 0.05) - 0.05;
  if (higher_option > 0 && higher_option < 1) {
    options.push(higher_option);
  }
  higher_option = secondLuminance(brightest, desired_ratio)[1];
  if (higher_option <= 1) {
    options.push(higher_option);
    console.log("higher option: " + higher_option);
  }
  return (options);
}

//Gets contrast ratio between two relative luminosities
function getRatio (lum1, lum2) {
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// // Calculate linear RBG from sRGB values
// function RGBtoLinear(rgb) {
//     const r = rgb[0];
//     const g = rgb[1];
//     const b = rgb[2];
//     r /= 255;
//     g /= 255;
//     b /= 255;
//     r = (r <= 0.03928) ? r / 12.92 : Math.pow(((r + 0.055) / 1.055), 2.4);
//     g = (g <= 0.03928) ? g / 12.92 : Math.pow(((g + 0.055) / 1.055), 2.4);
//     b = (b <= 0.03928) ? b / 12.92 : Math.pow(((b + 0.055) / 1.055), 2.4);
//     return [r, g, b];
// }

// //Convert linear RGB to sRGB
// function linearToSRGB(linear){
//     const srgb = [];
//     const srgb_low = [];
//     for(const i = 0; i < linear.length; i++){
//         if(linear[i] <= 0.003035269835488375){
//             srgb[i] = Math.round(255*(linear[i] * 12.92));
//         }
//         else{
//             srgb[i] = Math.round((255*(Math.pow(linear[i], 1/2.4)*1.055 - 0.055)));
//         }
//     }
//     return(srgb)
// }




// //Return a set of colors which are complient with the supplied color
// function getSecondColor(rgb, desired_ratio){
//     const lum = getLuminance(rgb);
//     const options = secondLuminance(lum, desired_ratio);
//     colors = [];
//     options.forEach(function(option){
//         colors.push(makeColors(option))
//     });
//     return(colors);
// }

// //Return a set of colors which are complient with both supplied colors
// function getThirdColor(rgb1, rgb2, desired_ratio){
//     console.log("Starting getThirdColor");
//     const lum1 = getLuminance(rgb1);
//     console.log("lum1: " + lum1);
//     const lum2 = getLuminance(rgb2);
//     console.log("lum2: " + lum2);
//     const options = thirdLuminance(lum1, lum2, desired_ratio);
//     colors = [];
//     options.forEach(function(option){
//         colors.push(makeColors(option));
//     });
//     console.log("colors: " + colors);
//     return(colors);
// }

// //Find the luminance value which meets the ratio with the stable color, and is closest to the luminance of the changing color
// function modifyTwoColor(stable_color, color_to_modify, desired_ratio){
//     const stable_luminance = getLuminance(stable_color);
//     const new_lum_options = secondLuminance(stable_luminance, desired_ratio);
//     const luminance_to_modify = getLuminance(color_to_modify);
//     const contrastOps = [];
//     new_lum_options.forEach(function(new_lum){
//         contrastOps.push(getRatio(new_lum, luminance_to_modify));
//     });
//     console.log("contrast options: " + contrastOps);
//     const best_option = new_lum_options[contrastOps.indexOf(Math.min(...contrastOps))];
//     console.log("best option: " + best_option);
//     colors = modifyColors(best_option);
//     return(colors);
// }

// //Find the luminance value which meets the ratio with the two stable colors, and is closest to the luminance of the changing color
// function modifyThreeColor(stable_color_one, stable_color_two, color_to_modify, desired_ratio){
//     const stable_luminance_one = getLuminance(stable_color_one);
//     const stable_luminance_two = getLuminance(stable_color_two);
//     const luminance_to_modify = getLuminance(color_to_modify);
//     const contrastOps = [];
//     const new_lum_options = thirdLuminance(stable_luminance_one, stable_luminance_two, desired_ratio);
//     new_lum_options.forEach(function(new_lum){
//         contrastOps.push(getRatio(new_lum, luminance_to_modify));
//     });
//     const best_option = new_lum_options[contrastOps.indexOf(Math.min(...contrastOps))];
//     console.log("best option: " + best_option);
//     colors = modifyColors(color_to_modify, best_option);
//     return(colors);
// }

// //Generate colors from relative luminance
// function makeColors(luminance){
//     console.log("making colors for "+ luminance);
//     const colors = [];
//     const coefficients = [0.2126, 0.7152, 0.0722];
//     //check for single color options
//     for(i=0; i<3; i++){
//         if(luminance/coefficients[i] <= 1 && luminance/coefficients[i] >= 0){
//             const single_color_linear = luminance/coefficients[i];
//             linearRGB = [0, 0, 0];
//             linearRGB[i] = single_color_linear;
//             colors.push(linearToSRGB(linearRGB));
//         }
//     }
//     console.log("colors from makeColors: " + colors);
//     return colors;
// }

// //Generate colors from relative luminance and an existing color by modifying HSL attributes
// function modifyColors(color, target_luminance){
//     make_darker = (target_luminance < getLuminance(color)) ? true : false;
//     console.log("original luminance: " + getLuminance(color));
//     console.log("target luminance: " + target_luminance);
//     console.log("make darker: " + make_darker);
//     hsl_color = rgbToHSL(color);
//     console.log("hsl color: " + hsl_color);
//     //Test HSL values to find a compliant one
//     const hsl_options = [];
//     //Modify hue
//     const current_option = [...hsl_color];
//     const test_color = [...hsl_color];
//     const recExists = false;
//     test_color[0] = 0;
//     for(i=0; i<=360; i++){
//         test_color[0] = i;
//         if(make_darker && getLuminance(hslToRGB(test_color)) <= target_luminance){
//             if(getRatio(target_luminance, getLuminance(hslToRGB(test_color))) < getRatio(target_luminance, getLuminance(hslToRGB(current_option)))){
//                 current_option[0] = test_color[0];
//                 recExists = true;
//             }
//         } else if(!make_darker && getLuminance(hslToRGB(test_color)) >= target_luminance){
//             if(getRatio(target_luminance, getLuminance(hslToRGB(test_color))) < getRatio(target_luminance, getLuminance(hslToRGB(current_option)))){
//                 current_option[0] = test_color[0];
//                 recExists = true;
//             }
//         }
//     }
//     if(recExists){
//         console.log("hue option: " + current_option);
//         hsl_options.push(current_option);
//     } else {
//         console.log("no hue option");
//     }
//     //Modify saturation
//     const current_option = [...hsl_color];
//     const test_color = [...hsl_color];
//     const recExists = false;
//     test_color[1] = 0;
//     for(i=0; i<=100; i++){
//         test_color[1] = i;
//         if(make_darker && getLuminance(hslToRGB(test_color)) <= target_luminance){
//             if(getRatio(target_luminance, getLuminance(hslToRGB(test_color))) < getRatio(target_luminance, getLuminance(hslToRGB(current_option)))){
//                 current_option[1] = test_color[1];
//                 recExists = true;
//             }
//         } else if(!make_darker && getLuminance(hslToRGB(test_color)) >= target_luminance){
//             if(getRatio(target_luminance, getLuminance(hslToRGB(test_color))) < getRatio(target_luminance, getLuminance(hslToRGB(current_option)))){
//                 current_option[1] = test_color[1];
//                 recExists = true;
//             }
//         }
//     }
//     if(recExists){
//         console.log("saturation option: " + current_option);
//         hsl_options.push(current_option);
//     } else {
//         console.log("no saturation option");
//     }
//     //Modify lightness
//     const current_option = [...hsl_color];
//     const test_color = [...hsl_color];
//     const recExists = false;
//     test_color[2] = 0;
//     for(i=0; i<=100; i++){
//         test_color[2] = i;
//         console.log(test_color);
//         if(make_darker && getLuminance(hslToRGB(test_color)) <= target_luminance){
//             if(getRatio(target_luminance, getLuminance(hslToRGB(test_color))) < getRatio(target_luminance, getLuminance(hslToRGB(current_option)))){
//                 current_option[2] = test_color[2];
//                 recExists = true;
//             }
//         } else if(!make_darker && getLuminance(hslToRGB(test_color)) >= target_luminance){
//             if(getRatio(target_luminance, getLuminance(hslToRGB(test_color))) < getRatio(target_luminance, getLuminance(hslToRGB(current_option)))){
//                 current_option[2] = test_color[2];
//                 recExists = true;
//             }
//         }
//     }
//     if(recExists){
//         console.log("lightness option: " + current_option);
//         hsl_options.push(current_option);
//     } else {
//         console.log("no lightness option");
//     }
//     return hsl_options;
// }

// //Convert RGB to HSL in degrees and percentages
// function rgbToHSL(rgb) {
//     const r = rgb[0] / 255;
//     const g = rgb[1] / 255;
//     const b = rgb[2] / 255;
//     const max = Math.max(r, g, b);
//     const min = Math.min(r, g, b);
//     const h, s, l = (max + min) / 2;
//     if(max == min){
//         h = s = 0; // achromatic
//     } else {
//         const d = max - min;
//         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//         switch(max){
//             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//             case g: h = (b - r) / d + 2; break;
//             case b: h = (r - g) / d + 4; break;
//         }
//         h /= 6;
//     }
//     return [h*360, s*100, l*100];
// }

// //Convert HSL to RGB in degrees and percentages
// function hslToRGB(hsl) {
//     const h = hsl[0] / 360;
//     const s = hsl[1] / 100;
//     const l = hsl[2] / 100;
//     const r, g, b;
//     if(s == 0){
//         r = g = b = l; // achromatic
//     } else {
//         const hue2rgb = function hue2rgb(p, q, t){
//             if(t < 0) t += 1;
//             if(t > 1) t -= 1;
//             if(t < 1/6) return p + (q - p) * 6 * t;
//             if(t < 1/2) return q;
//             if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
//             return p;
//         }
//         const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//         const p = 2 * l - q;
//         r = hue2rgb(p, q, h + 1/3);
//         g = hue2rgb(p, q, h);
//         b = hue2rgb(p, q, h - 1/3);
//     }
//     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
// }

module.exports = { getSecondColor, twoColorRec, twoColorRecFromGivenColor, threeColorRec, threeColorRecFromGivenColor }
