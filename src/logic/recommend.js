import chroma from 'chroma-js';

export default function getRecs(changeColors, keepColors, ratio){
    ratio = ratio+0.02;
    console.log("Running function getRecs");
    console.log(changeColors, keepColors, ratio);
    if(changeColors.length == 0){
        return("No change color selected");
    } else if(keepColors.length == 2){
        return getThirdColor(keepColors, changeColors, ratio);
    } else if(changeColors.length === 1 && keepColors.length === 1){
        return getSecondColor(keepColors[0], changeColors[0], ratio);
    } else if(keepColors.length == 1 && changeColors.length == 2){
        return getTwoColors(keepColors, changeColors, ratio);
    } else if(keepColors.length == 0){
        return changeEverything(keepColors, changeColors);
    } else {
        return "No colours found";
    }
}

//======================Colour modifiers==============================
//Modify an existing color to meet contrast with another color
function getSecondColor (keepColor, changeColor, ratio) {
    console.log("Running function getSecondColor");
    console.log(keepColor, changeColor, ratio);
    //Check whether ratio is compliant already
    keepColor.color = chroma(keepColor.color);
    changeColor.color = chroma(changeColor.color);
    if(chroma.contrast(keepColor.color, changeColor.color) >= ratio){
        return "compliant";
    }
    //Get WCAG luminance for input color
    let initialLum = keepColor.color.luminance();
    //Find luminances that are compliant
    let compliantLums = secondLuminance(initialLum, ratio);
    //Modify the new color to meet the requirements
    console.log("Got compliant luminances");
    console.log(compliantLums);
    let newColors = adjustColor(changeColor.color, compliantLums, ratio);
    newColors.forEach(color => color.index = changeColor.index);
    keepColor.color = keepColor.color.hex();
    return newColors.map(color => {return [color,keepColor]});
}


function getThirdColor(keepColors, changeColors, ratio){
    console.log("Running function getThirdColor");
    let keepOne = keepColors[0];
    let keepTwo = keepColors[1];
    let changeColor = changeColors[0];
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
    let compliantLums = thirdLuminance(keepOneLum, keepTwoLum, ratio);
    //Get a color for each of the compliant luminances
    let newColors = adjustColor(changeColor.color, compliantLums, ratio);
    newColors.forEach(color => color.index = changeColor.index);
    keepOne.color = keepOne.color.hex();
    keepTwo.color = keepTwo.color.hex();
    return newColors.map(color => {return [color,keepOne,keepTwo]})
}

function getTwoColors(keepColors, changeColors, ratio){
    //TODO: Get two colours using two more luminances
    console.log("Running function getTwoColors");
    let changeOne = changeColors[0];
    let changeTwo = changeColors[1];
    let keepColor = keepColors[0];
    changeOne.color = chroma(changeOne.color);
    changeTwo.color = chroma(changeTwo.color);
    keepColor.color = chroma(keepColor.color);    
    if(ThreeWayChecker(keepColor.color, changeOne.color, changeTwo.color, ratio)){
        return "Compliant";
    }
    let keepLum = keepColor.color.luminance();
    let compliantLums = twoMoreLuminances(keepLum, ratio);
    let changeLighter = changeOne.color.luminance() > changeTwo.color.luminance ? changeOne : changeTwo;
    let changeDarker = changeOne.color.luminance() > changeTwo.color.luminance ? changeTwo : changeOne;
    let colors = adjustTwoColors(compliantLums, changeLighter, changeDarker);
    colors.forEach(color => color.push({color: keepColor.color.hex(), index: keepColor.index}));
    return colors;
}

function changeEverything(){
    return "change everything";
}

// LUMINANCE CALCULATIONS

//Find a set of second luminances that work with a given luminance
function secondLuminance (oldLuminance, desired_ratio) {
    console.log("Running function secondLuminance");
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
    console.log("Running function thirdLuminance");
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
    console.log("Running function twoMoreLuminances");
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

//Gets contrast ratio between two relative luminosities
function getRatio (lum1, lum2) {
    console.log("Running function getRatio");
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    console.log((brightest + 0.05) / (darkest + 0.05));
    return ((brightest + 0.05) / (darkest + 0.05));
}

// COLOR ADJUSTMENT

//Add some hue variety
function adjustColor(baseColor, compliantLums){
    let colors = [];
    if(baseColor.lch()[1] > 20){
        let spread = 4;
        for(let i=0;i<spread;i++){
            let newColor = baseColor.lch()
            newColor[2] -= (spread-2*i)*15
            colors = colors.concat(adjustOneColor(chroma(newColor, 'lch'), compliantLums));
        }    
    } else {
        colors = adjustOneColor(baseColor, compliantLums);
    }
    return colors;
}

function changeOneColor(baseColor, compliantLums){
    let baseColors = [baseColor];
    baseColors = baseColors.concat(
        liftChroma(
            baseColors.filter(color => {
                return color.lch()[1] < 10
            }
            ), 3, 10))
    baseColors.forEach(color => {
        if(color.lch()[1] < 10){
            liftChroma()
        }
    })
}

function liftChroma(baseColors, count, spread){
    let colors = [];
    baseColors.forEach(color =>{
        for(let i=0;i<count;i++){
            let newColor = color.lch();
            newColor[1] += spread*(i+1);
            colors.push(newColor);
        }
    })  
    return colors;
}

function addHues(baseColors, count, spread){
    let colors=[];
    baseColors.forEach(()=>{
        for(let i=0;i<count;i++){
            let newColor = baseColors[i].lch()
            newColor[2] -= (count-2*i)*spread
            colors.push(chroma(newColor, 'lch'));
        }
    })
    return colors;
}

//Alter a given color so that it matches a luminance. Includes provisions to ensure if it needs to beat a certain ratio, it overshoots/undershoots the luminosity accordingly. This helps avoid rounding errors.
function generateFromLuminosity(baseColor, compliantLums){
    let colors=[];
    //Interpolation with white/black
    for (var lum in compliantLums) {
        if(compliantLums[lum]) {
            let interpolateAdjust = {color: baseColor.luminance(compliantLums[lum]).hex()};
            //newColor = tweak(newColor, baseColor, ratio, "rgb");
            colors.push(interpolateAdjust);
            let lightnessAdjust = {color: adjustLightnessBetween(baseColor, lum, lum-1, lum+1)}
            colors.push(lightnessAdjust);
        }
    }
    return colors;    
}

function adjustOneColor (baseColor, compliantLums) {
    console.log("Running function adjustColor");
    let colors = [];
    //Basic white interpolation option
    for (var lum in compliantLums) {
        if(compliantLums[lum]) {
            let newColor = {changeMethod: "interpolation", color: baseColor.luminance(compliantLums[lum]).hex()};
            //newColor = tweak(newColor, baseColor, ratio, "rgb");
            colors.push(newColor);
        }
    }
    if(baseColor.lch()[1] > 10){
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
            let newColor = adjustLightnessBetween(baseColor, compliantLums.middleDarker, compliantLums.middleDarker, compliantLums.trueMiddle);
            colors.push({type: 'lch middle darker', color: newColor.hex()});
        }

        if(compliantLums.middleLighter){
            let newColor = adjustLightnessBetween(baseColor, compliantLums.middleLighter, compliantLums.trueMiddle, compliantLums.middleLighter);
            colors.push({type: 'lch middle lighter', color: newColor.hex()});
        }
}
    return colors;
}

function adjustTwoColors(compliantLums, lighterColor, darkerColor){
    let colorSets = [];
    for (var option in compliantLums) {
        if(compliantLums[option]) {
            let lighter = {index: lighterColor.index, color: lighterColor.color.luminance(compliantLums[option].lighter).hex()};
            let darker = {index: darkerColor.index, color: darkerColor.color.luminance(compliantLums[option].darker).hex()};
            colorSets.push([lighter, darker]);
        }
    }
    // //Simple light or dark
    // for (var option in compliantLums) {
    //     if(compliantLums[option]) {
    //         if(lumtype === 'darkOption' || lumtype === 'underBoth'){
    //             colors.push({type: "lch lightness decreased", color: adjustLightnessDown(baseColor, compliantLums[lumtype]).hex()});
    //         }
    //         if(lumtype === 'lightOption' || lumtype === 'aboveBoth'){
    //             colors.push({changeMethod: "lch lightness increased", color: adjustLightnessUp(baseColor, compliantLums[lumtype]).hex()});
    //         }
    //     }
    // }
    return(colorSets);
}


//======================Colour adjustment calculators===========================
//Adjust the lch lightness of a colour until it meets the required luminance
function adjustLightnessUp(initial_color, target_luminance){
    console.log("Running function adjustLightnessUp");
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
    console.log("Running function adjustLightnessDown");
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
    console.log("Running function adjustLightnessBetween");
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

function ThreeWayChecker(color1, color2, color3, ratio){
    return(
        chroma.contrast(color1, color2) >= ratio
        && chroma.contrast(color2, color3) >= ratio
        && chroma.contrast(color1, color3) >= ratio
    )
}