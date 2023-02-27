import chroma from 'chroma-js';

export default function getRecs(keepColors, changeColors, ratio){
    if(changeColors.length == 2){
        return getThirdColor(keepColors, changeColors, ratio);
    } else if(changeColors.length === 1 && keepColors.length === 1){
        return getSecondColor(keepColors[0], changeColors[0], ratio);
    // } else if(changeColors.length == 1 && keepColors.length == 2){
    //     return getTwoColors(keepColors, changeColors);
    // } else if(keepColors.length == 0){
    //     return changeEverything(keepColors, changeColors);
    }
}

//======================Colour modifiers==============================
//Modify an existing color to meet contrast with another color
function getSecondColor (keepColor, changeColor, ratio) {
    console.log("getting second color for ")
    console.log(keepColor, changeColor, ratio);
    //Check whether ratio is compliant already
    keepColor = chroma(keepColor);
    changeColor = chroma(changeColor);
    if(chroma.contrast(keepColor, changeColor) >= ratio){
        return "compliant";
    }
    //Get WCAG luminance for input color
    let initialLum = keepColor.luminance();
    //Find luminances that are compliant
    let compliantLums = secondLuminance(initialLum, ratio);
    //Modify the new color to meet the requirements
    console.log("Got compliant luminances");
    console.log(compliantLums);
    return adjustColor(changeColor, compliantLums, initialLum, ratio);
}


function getThirdColor(keepColors, changeColors, ratio){
    let keepOne = chroma(keepColors[0]);
    let keepTwo = chroma(keepColors[1]);
    let changeColor = chroma(changeColors[0]);
    let keepOneLum = keepOne.luminance();
    let keepTwoLum = keepTwo.luminance();
    //Find luminances that are compliant
    let compliantLums = thirdLuminance(keepOneLum, keepTwoLum, ratio);
    //Get a color for each of the compliant luminances
    return adjustColor(changeColor, compliantLums, ratio);
}

// LUMINANCE CALCULATIONS

//Find a set of second luminances that work with a given luminance
function secondLuminance (oldLuminance, desired_ratio) {
    let options = {
        darkOption: null,
        lightOption: null
    };
    let darkOption = (oldLuminance + 0.05) / desired_ratio - 0.05;
    if (darkOption > 0 && darkOption < 1) {
        options.darkOption = darkOption;
    }
    let lightOption = desired_ratio * (oldLuminance + 0.05) - 0.05;
    if (lightOption > 0 && lightOption < 1) {
        options.lightOption = lightOption;
    }
    return (options);
}

//Calculate compliant luminance for two other luminances (which don't necessarily contrast) at a given ratio
function thirdLuminance (first_luminance, second_luminance, desired_ratio) {
    var brightest = Math.max(first_luminance, second_luminance);
    var darkest = Math.min(first_luminance, second_luminance);
    console.log("darkest: "+ darkest)
    console.log("brightest: "+ brightest)
    let options = {
        underBoth: null,
        aboveBoth: null,
        middleDarker: null,
        trueMiddle: null,
        middleLighter: null
    };
    //Middle
    if (getRatio(darkest, brightest) > desired_ratio) {
        console.log("space between lums:")
        console.log(getRatio(darkest, brightest))
        console.log("finding middle")
        //Get luminance that is compliant with the darkest stable colour
        let middleDarker = secondLuminance(darkest, desired_ratio).lightOption;
        console.log("middle darker:")
        console.log(middleDarker)

        //Get luminance that is compliant with the lightest stable colour
        let middleLighter = secondLuminance(brightest, desired_ratio).darkOption;
        console.log("middle lighter:")
        console.log(middleLighter)

        //Get luminance that is exactly between the lightest and darkest stable colours
        let trueMiddle = (middleDarker + middleLighter) / 2;

        //Check that new luminances are compliant with both existing stable luminances
        if (getRatio(middleDarker, brightest) >= desired_ratio) {
            options.middleDarker = middleDarker;
            console.log("Darker middle: " + middleDarker);
        } else {
            console.log("failed middleDarker with a contrast of")
            console.log(getRatio(middleDarker, brightest))
        }
        if (getRatio(middleLighter, darkest) >= desired_ratio) {
            options.middleLighter = middleLighter;
            console.log("Lighter middle option: " + middleLighter);
        } else {
            console.log("failed middleLighter with a contrast of")
            console.log(getRatio(middleLighter, darkest))
        }
        if ((getRatio(trueMiddle, darkest) >= desired_ratio) && (getRatio(trueMiddle, brightest) >= desired_ratio)) {
            options.trueMiddle = trueMiddle;
        }
    }

    //Lower
    let lower_option = secondLuminance(darkest, desired_ratio).darkOption;
    if (lower_option > 0 && lower_option < 1) {
        options.underBoth = lower_option;
    }

    //Higher
    let higher_option = secondLuminance(brightest, desired_ratio).lightOption;
    if (higher_option <= 1) {
        options.aboveBoth = higher_option;
    }
    return (options);
}

//Calculate two luminances which match a given luminance, and each other
function twoMoreLuminances(oldLuminance, desired_ratio){
    let options = {
        bothBelow: null,
        bothAbove: null,
        around: null,
    };
    let second_luminance = secondLuminance(oldLuminance, desired_ratio);
    if(second_luminance.darkOption){
        thirdLuminance = thirdLuminance(oldLuminance, second_luminance.darkOption, desired_ratio);
        if(thirdLuminance.underBoth){
            options.bothBelow = {middle: second_luminance.darkOption, bottom: thirdLuminance.underBoth};
        }
        if(thirdLuminance.aboveBoth){
            options.around = {bottom: second_luminance.darkOption, top: thirdLuminance.aboveBoth};
        }
    }
    if(second_luminance.lightOption){
        thirdLuminance = thirdLuminance(oldLuminance, second_luminance.lightOption, desired_ratio);
        if(thirdLuminance.aboveBoth){
            options.bothAbove = {middle: second_luminance.lightOption, top: thirdLuminance.aboveBoth};
        }
    }
    return(options);
}

//Gets contrast ratio between two relative luminosities
function getRatio (lum1, lum2) {
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

// COLOR ADJUSTMENT

//Alter a given color so that it matches a luminance. Includes provisions to ensure if it needs to beat a certain ratio, it overshoots/undershoots the luminosity accordingly. This helps avoid rounding errors.
function adjustColor (baseColor, compliantLums, ratio) {
    let colors = [];
    //Basic white interpolation option
    for (var lum in compliantLums) {
        if(compliantLums[lum]) {
            let newColor = {changeMethod: "interpolation", color: baseColor.luminance(compliantLums[lum]).hex()};
            //newColor = tweak(newColor, baseColor, ratio, "rgb");
            colors.push(newColor);
        }
    }
    //Simple light or dark
    for (var lumtype in compliantLums) {
        if(compliantLums[lumtype]) {
            if(lumtype === 'darkOption' || lumtype === 'underBoth'){
                colors.push({type: "lch lightness decreased", color: adjustLightnessDown(baseColor, compliantLums[lumtype]).hex()});
            }
            if(lumtype === 'lightOption' || lumtype === 'aboveBoth'){
                colors.push({changeMethod: "lch lightness increased", color: adjustLightnessUp(baseColor, compliantLums[lumtype]).hex()});
            }
        }
    }
    //Middle options
    if(compliantLums.trueMiddle){
        let newColor = adjustLightnessBetween(baseColor, compliantLums.trueMiddle, compliantLums.middleDarker, compliantLums.middleLighter);
        colors.push({changeMethod: 'lch true middle', color: newColor.hex()});
    }
    
    if(compliantLums.middleDarker){
        let newColor = adjustLightnessBetween(baseColor.chroma_value, compliantLums.middleDarker, compliantLums.middleDarker, compliantLums.trueMiddle);
        colors.push({type: 'lch middle darker', color: newColor.hex()});
    }

    if(compliantLums.middleLighter){
        let newColor = adjustLightnessBetween(baseColor.chroma_value, compliantLums.middleLighter, compliantLums.trueMiddle, compliantLums.middleLighter);
        colors.push({type: 'lch middle lighter', color: newColor.hex()});
    }
    return colors;
}


//======================Colour adjustment calculators===========================
//Adjust the lch lightness of a colour until it meets the required luminance
function adjustLightnessUp(initial_color, target_luminance){
    //Check colour for compliance
    let working_color = initial_color.lch();
    working_color[1] = 130;
    for(let i = 0;i<100;i++){
        let test_color = chroma(working_color, 'lch');
        if(test_color.luminance() >= target_luminance){
            return(test_color);
        }
        working_color[0] += 1;
    }
    return 'no color found';
}

function adjustLightnessDown(initial_color, target_luminance){
    //Check colour for compliance
    let working_color = initial_color.lch();
    //working_color[1] = 130;
    for(let i = 0;i<100;i++){
        let test_color = chroma(working_color, 'lch');
        if(test_color.luminance() <= target_luminance){
            return(test_color);
        }
        working_color[0] -= 1;
    }
    return 'no color found';
}

function adjustLightnessBetween(initial_color, target_luminance, lower_luminance, upper_luminance) {
    let working_color = initial_color.lch();
    console.log(working_color);
    console.log("target lum: "+target_luminance);
    console.log("lower lum: "+lower_luminance);
    console.log("upper lum: "+upper_luminance);
    
    //Generate all possible colours across the lightness spectrum with a granularity of 0.01
    let spectrum = Array.from(Array(1010).keys())
    spectrum = spectrum.map(function(pos){
        return [pos/10, working_color[1], working_color[2]]
    });
    //Filter to just those with a luminosity within bounds
    let within_bounds = spectrum.filter( function(colour){
        let test_color = chroma(colour, 'lch');
        // console.log(test_color);
        // console.log(test_color.luminance());
        // console.log(test_color.luminance() >= lower_luminance && test_color.luminance() <= upper_luminance);
        return test_color.luminance() >= lower_luminance && test_color.luminance() <= upper_luminance;

    });
    console.log("within bounds:")
    console.log(within_bounds);

    //Find the colour closest to the target
    let final_colour = within_bounds[0]
    let old_distance = Math.abs(chroma(within_bounds[0], 'lch').luminance(), target_luminance);
    within_bounds.forEach(function(colour){
        let distance = Math.abs(target_luminance - chroma(colour, 'lch').luminance());
        if(distance < old_distance){
            old_distance = distance;
            final_colour = colour;
        }
    });
    console.log("final colour:")
    console.log(final_colour);
    return chroma(final_colour, 'lch');
}
