import { within } from '@testing-library/react';
import chroma from 'chroma-js';

export default function getRecs(changeColors, keepColors, ratio, numRecs){
    ratio = ratio+0.02;
    console.log("Running function getRecs");
    console.log(changeColors, keepColors, ratio);
    let recOutput = recSorter(changeColors, keepColors, ratio);
    let filterThreshold = 40;
    while(recOutput >= numRecs){
        let recOutput = filterSimilarColorsets(recOutput, filterThreshold);
        filterThreshold -=1;
    }
    return recOutput;
}

function recSorter(changeColors, keepColors, ratio){
    if(changeColors.length == 0){
        return("No change color selected");
    } else if(keepColors.length == 2){
        return getThirdColor(keepColors, changeColors, ratio);
    } else if(changeColors.length === 1 && keepColors.length === 1){
        return getSecondColor(keepColors[0], changeColors[0], ratio);
    } else if(keepColors.length == 1 && changeColors.length == 2){
        return getTwoColors(keepColors, changeColors, ratio);
    } else if(keepColors.length == 0 && changeColors.length == 2){
        return changeEverythingTwo(changeColors, ratio);
    } else if(keepColors.length == 0 && changeColors.length == 3){
        return changeEverythingThree(changeColors, ratio);
    }
    else {
        return "No colours found";
    }
}

//======================Colour modifiers==============================
//Modify an existing color to meet contrast with another color
function getSecondColor(keepColor, changeColor, ratio){
    keepColor.color = chroma(keepColor.color);
    changeColor.color = chroma(changeColor.color);
    if(chroma.contrast(keepColor.color, changeColor.color) >= ratio){
        return "compliant";
    }
    
    //Get WCAG luminance for input color
    let initialLum = keepColor.color.luminance();
    
    //Find luminances that are compliant
    let compliantLums = Object.values(secondLuminance(initialLum, ratio)).filter(n => n);
    
    //Modify the new color to meet the requirements
    let newColors = changeOneColor(changeColor.color, compliantLums)
    newColors = newColors.map(newColor =>{
        return {color: newColor.hex(), index: changeColor.index}
    });;
    keepColor.color = keepColor.color.hex();
    //TODO: Check if any colours are the same
    return newColors.map(color => {return [color,keepColor]});
}

function getThirdColor(keepColors, changeColors, ratio){
    let keepOne = {color: keepColors[0].color, index: keepColors[0].index};
    let keepTwo = {color: keepColors[1].color, index: keepColors[1].index};
    let changeColor = {color: changeColors[0].color, index: changeColors[0].index};
    keepOne.color = chroma(keepOne.color);
    keepTwo.color = chroma(keepTwo.color);
    changeColor.color = chroma(changeColor.color);
    if(ThreeWayChecker(keepOne.color, keepTwo.color, changeColor.color, ratio)){
        return "Compliant";
    }
    if(chroma.contrast(keepOne.color, keepTwo.color) < ratio){
        return "No possible result, other two colors are not compliant";
    }
    let keepOneLum = keepOne.color.luminance();
    let keepTwoLum = keepTwo.color.luminance();
    //Find luminances that are compliant
    let compliantLums = Object.values(thirdLuminance(keepOneLum, keepTwoLum, ratio)).filter(n => n);
    //Get a color for each of the compliant luminances
    let newColors = changeOneColor(changeColor.color, compliantLums);
    newColors = newColors.map(newColor =>{
        return {color: newColor.hex(), index: changeColor.index}
    });;
    keepOne.color = keepOne.color.hex();
    keepTwo.color = keepTwo.color.hex();
    //TODO: Check if any colours are the same
    return newColors.map(color => {return [color,keepOne,keepTwo]})
}

function getTwoColors(keepColors, changeColors, ratio){
    let changeOne = {color: changeColors[0].color, index: changeColors[0].index};
    let changeTwo = {color: changeColors[1].color, index: changeColors[1].index};
    let keepColor = {color: keepColors[0].color, index: keepColors[0].index};
    changeOne.color = chroma(changeOne.color);
    changeTwo.color = chroma(changeTwo.color);
    keepColor.color = chroma(keepColor.color);    
    if(ThreeWayChecker(keepColor.color, changeOne.color, changeTwo.color, ratio)){
        return "Compliant";
    }
    let colors = [];
    //Check for the possibility of changing just one colour
    if(chroma.contrast(changeOne.color, keepColor.color) >= ratio){
        colors = colors.concat(getThirdColor([changeColors[0], keepColors[0]], [changeColors[1]], ratio))
    }
    if(chroma.contrast(changeTwo.color, keepColor.color) >= ratio){
        colors = colors.concat(getThirdColor([changeColors[1], keepColors[0]], [changeColors[0]], ratio))
    }
    console.log("colors from third color getting", colors);
    let keepLum = keepColor.color.luminance();
    let compliantLums = Object.values(twoMoreLuminances(keepLum, ratio)).filter(n => n);
    let changeLighter = changeOne.color.luminance() > changeTwo.color.luminance ? changeOne : changeTwo;
    let changeDarker = changeOne.color.luminance() > changeTwo.color.luminance ? changeTwo : changeOne;
    let darkerLums = compliantLums.map(lum => {
        return lum.darker;
    })
    let lighterLums = compliantLums.map(lum => {
        return lum.lighter;
    })
    let darkerColors = changeOneColor(changeDarker.color, darkerLums);
    let lighterColors = changeOneColor(changeLighter.color, lighterLums);
    console.log("darker and lighter colors", darkerColors, lighterColors);
    // TODO: Filter duplicates and reduce total pull
    darkerColors.forEach(darkColor => {
        lighterColors.forEach(lightColor => {
            colors.push([{color: darkColor.hex(), index: changeDarker.index},{color: lightColor.hex(), index: changeLighter.index}, {color: keepColor.color.hex(), index: keepColor.index}]);
        })
    })
    return colors;
}

function changeEverythingTwo(changeColors, ratio){
    let colors = [];
    //Try change 1
    
    let colour1passthrough = {color: changeColors[0].color, index: changeColors[0].index}
    let colour2passthrough = {color: changeColors[1].color, index: changeColors[1].index}
    if(chroma.contrast(colour1passthrough.color, colour2passthrough.color) >= ratio){
        return "compliant";
    }
    colors = colors.concat(getSecondColor(colour1passthrough, colour2passthrough, ratio))
    //Try change the other
    colour1passthrough = {color: changeColors[0].color, index: changeColors[0].index}
    colour2passthrough = {color: changeColors[1].color, index: changeColors[1].index}
    colors = colors.concat(getSecondColor(colour2passthrough, colour1passthrough, ratio))
    //Try change both
    colour1passthrough = {color: changeColors[0].color, index: changeColors[0].index}
    colour2passthrough = {color: changeColors[1].color, index: changeColors[1].index}
    //let compliantLums = Object.values(generateLumsTwo(chroma(colour1passthrough.color).luminance(), chroma(colour2passthrough.color).luminance(), ratio)).filter(n => n);
    return colors;
}

function changeEverythingThree(changeColors, ratio){
    let changeColorPassthrough = changeColors.map(useColor => {
        return {color: chroma(useColor.color), index: useColor.index}
    })
    if(ThreeWayChecker(changeColorPassthrough[0].color, changeColorPassthrough[1].color, changeColorPassthrough[2].color, ratio)){
        return "Compliant";
    }
    let colors = [];
    //If any two colours match, try changing the other one
    if(chroma.contrast(changeColorPassthrough[0].color, changeColorPassthrough[1].color) >= ratio){
        console.log("Some colours are compliant!")
        colors=colors.concat(getThirdColor([changeColorPassthrough[0], changeColorPassthrough[1]], [changeColorPassthrough[2]], ratio))
    }
    if(chroma.contrast(changeColorPassthrough[0].color, changeColorPassthrough[2].color) >= ratio){
        console.log("Some colours are compliant!")
        colors=colors.concat(getThirdColor([changeColorPassthrough[0], changeColorPassthrough[2]], [changeColorPassthrough[1]], ratio))
    }
    if(chroma.contrast(changeColorPassthrough[2].color, changeColorPassthrough[1].color) >= ratio){
        console.log("Some colours are compliant!")
        colors=colors.concat(getThirdColor([changeColorPassthrough[2], changeColorPassthrough[1]], [changeColorPassthrough[0]], ratio))
    }
    //Try keeping each colour and changing the other two
    colors = colors.concat(getTwoColors([changeColorPassthrough[0]], [changeColorPassthrough[1], changeColorPassthrough[2]], ratio));
    colors = colors.concat(getTwoColors([changeColorPassthrough[1]], [changeColorPassthrough[2], changeColorPassthrough[0]], ratio));
    colors = colors.concat(getTwoColors([changeColorPassthrough[2]], [changeColorPassthrough[1], changeColorPassthrough[0]], ratio));
    return colors;
}

// COLOR ADJUSTMENT

function changeOneColor(baseColor, compliantLums){
    let baseColors = [baseColor];
    let returnColors = [];
    //Filter compliant lums to remove very similar options
    let buffer = 0.1;
    let reducedLums = [];
    for(let i=0; i<compliantLums.length; i++){
        let min = compliantLums[i] - buffer;
        let max = compliantLums[i] + buffer;
        if(reducedLums.filter(lum2 => {return(lum2 >= min && lum2 <= max)}).length === 0){
            reducedLums.push(compliantLums[i]);
        }
    }
    compliantLums = reducedLums;
    let greyScale = baseColors.filter(color => {
        return color.lch()[1] < 1
    })
    if(greyScale.length > 0){
        baseColors = baseColors.concat(liftChroma(greyScale, 2, 30));
        baseColors = baseColors.concat(addHues(baseColors, 4, 40));
    } else {
        if(compliantLums.length*baseColors.length < 2){
            baseColors = baseColors.concat(addHues(baseColors, 6, 20));
        } else if(compliantLums.length*baseColors.length < 4){
            baseColors = baseColors.concat(addHues(baseColors, 4, 20));
        } else if(compliantLums.length*baseColors.length < 10){
            baseColors = baseColors.concat(addHues(baseColors, 2, 20));
        }
    }
    baseColors.forEach(baseColor => {
        returnColors = returnColors.concat(generateFromLuminosity(baseColor, compliantLums));
    })
    return returnColors;
}

function liftChroma(baseColors, count, spread){
    let colors = [];
    baseColors.forEach(color => {
        for(let i=0;i<count;i++){
            let newColor = color.lch();
            newColor[1] += spread*(i+1);
            colors.push(chroma(newColor, "lch"));
        }
    })  
    return colors;
}
//Add some hue variety
function addHues(baseColors, count, spread){
    let colors=[];
    baseColors.forEach((baseColor)=>{
        for(let i=0;i<count;i++){
            let newColor = baseColor.lch()
            if(i < count/2){
                newColor[2] -= (i+1)*spread
            } else {
                newColor[2] += (i+1-count/2)*spread
            }
            colors.push(chroma(newColor, 'lch'));
        }
    })
    return colors;
}

//Alter a given color so that it matches a luminance. Includes provisions to ensure if it needs to beat a certain ratio, it overshoots/undershoots the luminosity accordingly. This helps avoid rounding errors.
function generateFromLuminosity(baseColor, compliantLums){
    let colors=[];
    //Interpolation with white/black
    compliantLums.forEach(lum =>{
        // let interpolateAdjust = baseColor.luminance(lum);
        //newColor = tweak(newColor, baseColor, ratio, "rgb");
        // colors.push(interpolateAdjust);
        let lightnessAdjust = adjustLightnessBetween(baseColor, lum, lum-0.1, lum+0.1)
        colors.push(lightnessAdjust);

    })
    return colors;    
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
    let options = {
        underBoth: null,
        aboveBoth: null,
        middleDarker: null,
        trueMiddle: null,
        middleLighter: null
    };
    //Middle
    if (getRatio(darkest, brightest) > desired_ratio) {
        //Get luminance that is compliant with the darkest stable colour
        let middleDarker = secondLuminance(darkest, desired_ratio).lightOption;

        //Get luminance that is compliant with the lightest stable colour
        let middleLighter = secondLuminance(brightest, desired_ratio).darkOption;

        //Get luminance that is exactly between the lightest and darkest stable colours
        let trueMiddle = (middleDarker + middleLighter) / 2;

        //Check that new luminances are compliant with both existing stable luminances
        if (getRatio(middleDarker, brightest) >= desired_ratio) {
            options.middleDarker = middleDarker;
        }
        if (getRatio(middleLighter, darkest) >= desired_ratio) {
            options.middleLighter = middleLighter;
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
        let finalLuminance = thirdLuminance(oldLuminance, second_luminance.darkOption, desired_ratio);
        if(finalLuminance.underBoth){
            options.bothBelow = {lighter: second_luminance.darkOption, darker: finalLuminance.underBoth};
        }
        if(finalLuminance.aboveBoth){
            options.around = {darker: second_luminance.darkOption, lighter: finalLuminance.aboveBoth};
        }
    }
    if(second_luminance.lightOption){
        let finalLuminance = thirdLuminance(oldLuminance, second_luminance.lightOption, desired_ratio);
        if(finalLuminance.aboveBoth){
            options.bothAbove = {darker: second_luminance.lightOption, lighter: finalLuminance.aboveBoth};
        }
    }
    return(options);
}

//Generate luminances from scratch for change all cases
function generateLumsTwo(color1, color2, ratio){
    console.log(color1, color2, ratio);
    let compliantLums = []
    //Start with black
    compliantLums = compliantLums.concat(secondLuminance(0, ratio));
    //Start with white
    compliantLums = compliantLums.concat(secondLuminance(1, ratio));
    //Use average
    let averageLum = (color1 + color2)/2;
    let averageOptions = secondLuminance(averageLum, ratio/2);
    if(averageOptions.lightOption){
        compliantLums = compliantLums.concat(secondLuminance(averageOptions.lightOption, ratio));
    } if (averageOptions.darkOption){
        compliantLums = compliantLums.concat(secondLuminance(averageOptions.darkOption, ratio));
    }

    return compliantLums;
}

//Gets contrast ratio between two relative luminosities
function getRatio (lum1, lum2) {
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return ((brightest + 0.05) / (darkest + 0.05));
}


//======================Colour adjustment calculators===========================
//Adjust the lch lightness of a colour until it meets the required luminance

function adjustLightnessBetween(initial_color, target_luminance, lower_luminance, upper_luminance) {
    let working_color = initial_color.lch();
    //Generate all possible colours across the lightness spectrum with a granularity of 0.01
    let spectrum = Array.from(Array(1510).keys())
    spectrum = spectrum.map(function(pos){
        return [pos/10, working_color[1], working_color[2]]
    });
    //Filter to just those with a luminosity within bounds
    let within_bounds = spectrum.filter( function(colour){
        let test_color = chroma(colour, 'lch');
        return test_color.luminance() >= lower_luminance && test_color.luminance() <= upper_luminance;
    });
    //Find the colour closest to the target
    let final_color = within_bounds[0];
    let old_distance = Math.abs(target_luminance -chroma(within_bounds[0], 'lch').luminance());
    within_bounds.forEach(function(color){
        let distance = Math.abs(target_luminance - chroma(color, 'lch').luminance());
        if(distance < old_distance){
            old_distance = distance;
            final_color = color;
        }
    });
    return chroma(final_color, 'lch');
}

function ThreeWayChecker(color1, color2, color3, ratio){
    return(
        chroma.contrast(color1, color2) >= ratio
        && chroma.contrast(color2, color3) >= ratio
        && chroma.contrast(color1, color3) >= ratio
    )
}

export function filterSimilarColorsets(colorSets, matchBuffer){
    colorSets = colorSets.map(colorSet =>{
        return colorSet.sort((a,b) => a.index - b.index);
    })
    console.log(colorSets);
    let filteredColorSets = colorSets.filter((colorSet, index, colorSets) => {
        let sameColor = colorSets.find((checkColorSet) => {
            return chroma.deltaE(colorSet[0].color, checkColorSet[0].color) < matchBuffer && chroma.deltaE(colorSet[1].color, checkColorSet[1].color) < matchBuffer && chroma.deltaE(colorSet[2].color, checkColorSet[2].color) < matchBuffer
        });
        console.log("matching colors", colorSet, sameColor);
        if(colorSets.indexOf(sameColor) === index){
            return colorSet;
        } else {
            console.log("Rejected a similar color");
        }
    })
    return filteredColorSets;
}