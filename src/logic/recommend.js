import chroma, { average } from 'chroma-js';
let compliantMessage = "These colors are already compliant at this contrast ratio."
let initialRatio;
export default function getRecs(changeColors, keepColors, ratio, numRecs){
    changeColors = structuredClone(changeColors);
    keepColors = structuredClone(keepColors);
    initialRatio = ratio;
    ratio = ratio+ratio*0.01;
    console.log("Running function getRecs");
    let recOutput = recSorter(changeColors, keepColors, ratio);
    if(!recOutput.length){
        recOutput = recSorter(changeColors, keepColors, initialRatio);
    }
    if(recOutput.length && typeof(recOutput) === "object"){
        recOutput = sortColors(recOutput);
        recOutput = filterFails(recOutput, initialRatio);
        if(recOutput.length > 0){
            recOutput = filterSimilarColorsets(recOutput, numRecs, changeColors, keepColors);    
        }
    }
    return recOutput;
}

function recSorter(changeColors, keepColors, ratio){
    if(changeColors.length == 0){
        return("Select one or more colors to change.");
    } else if(keepColors.length == 2){
        return getThirdColor(keepColors, changeColors, ratio);
    } else if(changeColors.length === 1 && keepColors.length === 1){
        return getSecondColor(keepColors[0], changeColors[0], ratio, true);
    } else if(keepColors.length == 1 && changeColors.length == 2){
        return getTwoColors(keepColors, changeColors, ratio);
    } else if(keepColors.length == 0 && changeColors.length == 2){
        return changeEverythingTwo(changeColors, ratio);
    } else if(keepColors.length == 0 && changeColors.length == 3){
        return changeEverythingThree(changeColors, ratio);
    }
    else {
        return "No colors found";
    }
}

//======================color modifiers==============================
//Modify an existing color to meet contrast with another color
function getSecondColor(keepColor, changeColor, ratio, makeLots=false){
    keepColor = structuredClone(keepColor);
    changeColor = structuredClone(changeColor);
    keepColor.color = chroma(keepColor.color);
    changeColor.color = chroma(changeColor.color);
    if(chroma.contrast(keepColor.color, changeColor.color) >= initialRatio){
        return compliantMessage;
    }
    
    //Get WCAG luminance for input color
    let initialLum = keepColor.color.luminance();
    
    //Find luminances that are compliant
    let compliantLums = Object.values(secondLuminance(initialLum, ratio)).filter(n => n);
    //Modify the new color to meet the requirements
    let newColors = changeOneColor(changeColor.color, compliantLums, true)
    newColors = newColors.map(newColor =>{
        return {color: newColor.hex(), index: changeColor.index}
    });;
    keepColor.color = keepColor.color.hex();
    return newColors.map(color => {return [color,keepColor]});
}

function getThirdColor(keepColors, changeColors, ratio){
    let keepOne = {color: keepColors[0].color, index: keepColors[0].index};
    let keepTwo = {color: keepColors[1].color, index: keepColors[1].index};
    let changeColor = {color: changeColors[0].color, index: changeColors[0].index};
    keepOne.color = chroma(keepOne.color);
    keepTwo.color = chroma(keepTwo.color);
    changeColor.color = chroma(changeColor.color);
    if(ThreeWayChecker(keepOne.color, keepTwo.color, changeColor.color, initialRatio)){
        return compliantMessage;
    }
    if(chroma.contrast(keepOne.color, keepTwo.color) < ratio){
        return ("Color " + (keepOne.index+1) + " and Color " + (keepTwo.index+1) + " are not compliant with each other. Choose one of those colors to change.");
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
    return newColors.map(color => {return [color,keepOne,keepTwo]})
}

function getTwoColors(keepColors, changeColors, ratio){
    let changeOne = {color: changeColors[0].color, index: changeColors[0].index};
    let changeTwo = {color: changeColors[1].color, index: changeColors[1].index};
    let keepColor = {color: keepColors[0].color, index: keepColors[0].index};
    changeOne.color = chroma(changeOne.color);
    changeTwo.color = chroma(changeTwo.color);
    keepColor.color = chroma(keepColor.color);    
    if(ThreeWayChecker(keepColor.color, changeOne.color, changeTwo.color, initialRatio)){
        return compliantMessage;
    }
    let colors = [];
    //Check for the possibility of changing just one color
    if(chroma.contrast(changeOne.color, keepColor.color) >= ratio){
        colors = colors.concat(getThirdColor([changeColors[0], keepColors[0]], [changeColors[1]], ratio))
    }
    if(chroma.contrast(changeTwo.color, keepColor.color) >= ratio){
        colors = colors.concat(getThirdColor([changeColors[1], keepColors[0]], [changeColors[0]], ratio))
    }

    //Keep one color while changing two others
    let keepLum = keepColor.color.luminance();
    let compliantLums = Object.values(twoMoreLuminances(keepLum, ratio)).filter(n => n);
    let changeLighter = changeOne.color.luminance() > changeTwo.color.luminance ? changeOne : changeTwo;
    let changeDarker = changeOne.color.luminance() > changeTwo.color.luminance ? changeTwo : changeOne;
    
    //Map out darker and lighter luminances for color generation
    let darkerLums = compliantLums.map(lum => {
        return lum.darker;
    })
    let lighterLums = compliantLums.map(lum => {
        return lum.lighter;
    })
    let darkerColors = changeOneColor(changeDarker.color, darkerLums, true);
    let lighterColors = changeOneColor(changeLighter.color, lighterLums, true);
    darkerColors.forEach(darkColor => {
        lighterColors.forEach(lightColor => {
            colors.push([{color: darkColor.hex(), index: changeDarker.index},{color: lightColor.hex(), index: changeLighter.index}, {color: keepColor.color.hex(), index: keepColor.index}]);
        })
    })
    return colors;
}

function changeEverythingTwo(changeColors, ratio){
    let colors = [];
    let color1passthrough = {color: changeColors[0].color, index: changeColors[0].index}
    let color2passthrough = {color: changeColors[1].color, index: changeColors[1].index}
    if(chroma.contrast(chroma(changeColors[0].color), chroma(changeColors[1].color)) >= initialRatio){
        return compliantMessage;
    }

    //Try change 1
    if(chroma.contrast(color1passthrough.color, color2passthrough.color) >= initialRatio){
        return compliantMessage;
    }
    colors = colors.concat(getSecondColor(color1passthrough, color2passthrough, ratio))
    console.log('changing color one', colors.length);
    //Try change the other
    color1passthrough = {color: changeColors[0].color, index: changeColors[0].index}
    color2passthrough = {color: changeColors[1].color, index: changeColors[1].index}
    colors = colors.concat(getSecondColor(color2passthrough, color1passthrough, ratio))
    console.log('changing color 2', colors.length);
    // Try change both
    color1passthrough = {color: changeColors[0].color, index: changeColors[0].index}
    color2passthrough = {color: changeColors[1].color, index: changeColors[1].index}
    
    let compliantLums = Object.values(generateLumsTwo(chroma(color1passthrough.color).luminance(), chroma(color2passthrough.color).luminance(), ratio)).filter(n => n);
    console.log("compliant lums", compliantLums);
    
    //Map out darker and lighter luminances for color generation
    color1passthrough = {...color1passthrough, color: chroma(color1passthrough.color)}
    color2passthrough = {...color2passthrough, color: chroma(color2passthrough.color)}

    let changeLighter = (color1passthrough.color.luminance() < color2passthrough.color.luminance()) ? color2passthrough : color1passthrough;
    let changeDarker = (color1passthrough.color.luminance() > color2passthrough.color.luminance()) ? color2passthrough : color1passthrough;
    
    compliantLums.forEach(lumSet => {
        console.log("using lumset", lumSet);
        let darkerColors = changeOneColor(changeDarker.color, [lumSet.darker]);
        let lighterColors = changeOneColor(changeLighter.color, [lumSet.lighter]); 
        console.log("made some colors for this lumset", darkerColors, lighterColors);  
        darkerColors.forEach(darkColor => {
            lighterColors.forEach(lightColor => {
                colors.push([{color: darkColor.hex(), index: changeDarker.index},{color: lightColor.hex(), index: changeLighter.index}]);
            })
        })
     
    })
    console.log('changing both', colors.length);
    return colors;
}

function changeEverythingThree(changeColors, ratio){
    let changeColorPassthrough = changeColors.map(useColor => {
        return {color: chroma(useColor.color), index: useColor.index}
    })
    if(ThreeWayChecker(changeColorPassthrough[0].color, changeColorPassthrough[1].color, changeColorPassthrough[2].color, initialRatio)){
        return compliantMessage;
    }
    let colors = [];
    // If any two colors match, try changing the other one
    if(chroma.contrast(changeColorPassthrough[0].color, changeColorPassthrough[1].color) >= ratio){
        colors=colors.concat(getThirdColor([changeColorPassthrough[0], changeColorPassthrough[1]], [changeColorPassthrough[2]], ratio))
    }
    if(chroma.contrast(changeColorPassthrough[0].color, changeColorPassthrough[2].color) >= ratio){
        colors=colors.concat(getThirdColor([changeColorPassthrough[0], changeColorPassthrough[2]], [changeColorPassthrough[1]], ratio))
    }
    if(chroma.contrast(changeColorPassthrough[2].color, changeColorPassthrough[1].color) >= ratio){
        colors=colors.concat(getThirdColor([changeColorPassthrough[2], changeColorPassthrough[1]], [changeColorPassthrough[0]], ratio))
    }
    //Try keeping each color and changing the other two
    colors = colors.concat(getTwoColors([changeColorPassthrough[0]], [changeColorPassthrough[1], changeColorPassthrough[2]], ratio));
    colors = colors.concat(getTwoColors([changeColorPassthrough[1]], [changeColorPassthrough[2], changeColorPassthrough[0]], ratio));
    colors = colors.concat(getTwoColors([changeColorPassthrough[2]], [changeColorPassthrough[1], changeColorPassthrough[0]], ratio));
    //Try changing all three
    changeColorPassthrough = changeColors.map(useColor => {
        return {color: chroma(useColor.color), index: useColor.index}
    })
    let compliantLums = Object.values(generateLumsThree(changeColorPassthrough, ratio)).filter(n => n);
    console.log("compliant lums", compliantLums);

    changeColorPassthrough.sort((a, b) =>{
        return a.color.luminance() - b.color.luminance();
    })
    console.log("sorted colors", changeColorPassthrough);
    let changeDarker = changeColorPassthrough[0]
    let changeMiddle = changeColorPassthrough[1] 
    let changeLighter = changeColorPassthrough[2] 

    compliantLums.forEach(lumSet => {
        console.log("using lumset", lumSet);
        let darkerColors = changeOneColor(changeDarker.color, [lumSet.darker]);
        let lighterColors = changeOneColor(changeLighter.color, [lumSet.lighter]); 
        let middleColors = changeOneColor(changeMiddle.color, [lumSet.middle]); 
        console.log("made some colors for this lumset", darkerColors, lighterColors);  
        darkerColors.forEach(darkColor => {
            lighterColors.forEach(lightColor => {
                middleColors.forEach(middleColor => {
                colors.push([{color: darkColor.hex(), index: changeDarker.index},{color: lightColor.hex(), index: changeLighter.index}, {color: middleColor.hex(), index: changeMiddle.index}]);
                })
            })
        })
     
    })

    
    return colors;
}

// COLOR ADJUSTMENT

function changeOneColor(baseColor, compliantLums, makeLots=false){
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
    //Add a color spectrum if the color is grey, for variety
    let greyScale = baseColors.filter(color => {
        return color.lch()[1] < 15
    })
    if(greyScale.length > 0){
        baseColors = baseColors.concat(liftChroma(greyScale, 3, 40));
        baseColors = baseColors.concat(addHues(baseColors, 4, 60));
    } else {
        //Add variety in terms of hue
        if(compliantLums.length*baseColors.length < 2){
            baseColors = baseColors.concat(addHues(baseColors, 20, 10));
        } else if(compliantLums.length*baseColors.length < 4){
            baseColors = baseColors.concat(addHues(baseColors, 8, 15));
        } else if(compliantLums.length*baseColors.length < 10){
            baseColors = baseColors.concat(addHues(baseColors, 4, 20));
        }
    }
    if(makeLots){
        baseColors = baseColors.concat(liftChroma(baseColors, 1, 20));
        baseColors = baseColors.concat(addHues(baseColors, 3, 40));
    }
    baseColors.forEach(baseColor => {
        returnColors = returnColors.concat(generateFromLuminosity(baseColor, compliantLums));
    })
    return returnColors.filter((color, index, array) => index === array.findIndex(compareColor => compareColor.hex() === color.hex()));
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
    compliantLums = compliantLums.filter(n => n != null);
    //Interpolation with white/black
    compliantLums.forEach(lum =>{
        // let interpolateAdjust = baseColor.luminance(lum);
        //newColor = tweak(newColor, baseColor, ratio, "rgb");
        // colors.push(interpolateAdjust);
        let lightnessAdjust = adjustLightnessBetween(baseColor, lum, lum-0.0001, lum+0.0001)
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

function secondLuminanceWithOriginal (oldLuminance, desired_ratio) {
    let options = [];
    let darkOption = (oldLuminance + 0.05) / desired_ratio - 0.05;
    if (darkOption > 0 && darkOption < 1) {
        options.push({lighter: oldLuminance, darker: darkOption});
    }
    let lightOption = desired_ratio * (oldLuminance + 0.05) - 0.05;
    if (lightOption > 0 && lightOption < 1) {
        options.push({lighter: lightOption, darker: oldLuminance});
    }
    return (options);
}

function twoMoreLumsWithOriginal (oldLuminance, desired_ratio) {
    let options = [];
    let second_luminance = secondLuminance(oldLuminance, desired_ratio);
    if(second_luminance.darkOption){
        let finalLuminance = thirdLuminance(oldLuminance, second_luminance.darkOption, desired_ratio);
        if(finalLuminance.underBoth){
            options.push({lighter:oldLuminance, middle: second_luminance.darkOption, darker: finalLuminance.underBoth});
        }
        if(finalLuminance.aboveBoth){
            options.push({middle: oldLuminance, darker: second_luminance.darkOption, lighter: finalLuminance.aboveBoth});
        }
    }
    if(second_luminance.lightOption){
        let finalLuminance = thirdLuminance(oldLuminance, second_luminance.lightOption, desired_ratio);
        if(finalLuminance.aboveBoth){
            options.push({darker: oldLuminance, middle: second_luminance.lightOption, lighter: finalLuminance.aboveBoth});
        }
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
        //Get luminance that is compliant with the darkest stable color
        let middleDarker = secondLuminance(darkest, desired_ratio).lightOption;

        //Get luminance that is compliant with the lightest stable color
        let middleLighter = secondLuminance(brightest, desired_ratio).darkOption;

        //Get luminance that is exactly between the lightest and darkest stable colors
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

// Generate luminances from scratch for change all cases
function generateLumsTwo(color1, color2, ratio){
    let compliantLums = []
    // Start with black
    compliantLums = compliantLums.concat(secondLuminanceWithOriginal(0, ratio));
    //Start with white
    compliantLums = compliantLums.concat(secondLuminanceWithOriginal(1, ratio));
    console.log("with black and white", compliantLums);
    // Work outwards from the middle
    console.log(color1, color2);
    let averageLum = (color1 + color2)/2;
    let averageRec = false;
    while(!averageRec){
        console.log("average lum", averageLum);
        let testLums = [averageLum+0.01, averageLum-0.01]
        let solution = false;
        while(!solution){
            if(getRatio(testLums[0], testLums[1]) >= ratio){
                console.log("compliant testlums", testLums);
                compliantLums = compliantLums.concat({darker: testLums[1], lighter: testLums[0]});
                averageRec = true;
                solution = true;
            } else {
                testLums[0] += 0.01;
                testLums[1] -= 0.01;
                if(testLums[0] >= 1 || testLums[1] <= 0){
                    console.log("hit barrier with", testLums);
                    solution = true;
                }
            }
        }
        if(averageLum > 0.179){
            averageLum -= 0.05;
        } else {
            averageLum += 0.05;
        }
    }
    return compliantLums;
}
function generateLumsThree(colors, ratio){
    let compliantLums = []
    // Start with black
    compliantLums = compliantLums.concat(twoMoreLumsWithOriginal(0, ratio));
    //Start with white
    compliantLums = compliantLums.concat(twoMoreLumsWithOriginal(1, ratio));
    console.log("with black and white", compliantLums);
    
    // Work outwards from the middle
    console.log(colors);
    let averageLum = (colors[0].color.luminance() + colors[1].color.luminance() + colors[2].color.luminance())/2;
    let tryGetLums = twoMoreLumsWithOriginal(averageLum, ratio);
    console.log("tried getting compliant lums for average", tryGetLums)
    if(tryGetLums.length > 0){
        compliantLums = compliantLums.concat(tryGetLums);
    }
    // let averageRec = false;
    // while(!averageRec){
    //     console.log("average lum", averageLum);
    //     let testLums = [averageLum+0.01, averageLum-0.01]
    //     let solution = false;
    //     while(!solution){
    //         if(getRatio(testLums[0], testLums[1]) >= ratio){
    //             console.log("compliant testlums", testLums);
    //             compliantLums = compliantLums.concat({darker: testLums[1], lighter: testLums[0]});
    //             averageRec = true;
    //             solution = true;
    //         } else {
    //             testLums[0] += 0.01;
    //             testLums[1] -= 0.01;
    //             if(testLums[0] >= 1 || testLums[1] <= 0){
    //                 console.log("hit barrier with", testLums);
    //                 solution = true;
    //             }
    //         }
    //     }
    //     if(averageLum > 0.179){
    //         averageLum -= 0.05;
    //     } else {
    //         averageLum += 0.05;
    //     }
    // }
    return compliantLums;
}

//Gets contrast ratio between two relative luminosities
function getRatio (lum1, lum2) {
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return ((brightest + 0.05) / (darkest + 0.05));
}


//======================color adjustment calculators===========================
//Adjust the lch lightness of a color until it meets the required luminance

function adjustLightnessBetween(initial_color, target_luminance, lower_luminance, upper_luminance) {
    let working_color = initial_color.lch();
    //Generate all possible colors across the lightness spectrum with a granularity of 0.01
    let spectrum = Array.from(Array(1510).keys())
    spectrum = spectrum.map(function(pos){
        return [pos/10, working_color[1], working_color[2]]
    });
    //Filter to just those with a luminosity within bounds
    let within_bounds = spectrum.filter( function(color){
        let test_color = chroma(color, 'lch');
        return test_color.luminance() >= lower_luminance && test_color.luminance() <= upper_luminance;
    });
    if(within_bounds.length === 0){
        return initial_color.luminance(target_luminance);
    } else {
    //Find the color closest to the target
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
}

function ThreeWayChecker(color1, color2, color3, ratio){
    return(
        chroma.contrast(color1, color2) >= ratio
        && chroma.contrast(color2, color3) >= ratio
        && chroma.contrast(color1, color3) >= ratio
    )
}

export function filterSimilarColorsets(colorSets, numRecs, changeColors, keepColors){
    let originalColors = sortColors([changeColors.concat(keepColors)])[0];
    //filter duplicates
    console.log("number of results: ", colorSets.length);
    console.log("result example", colorSets[0]);
    colorSets = colorSets.filter((colorSet,index,colorsets)=>{
        let matchindex = (colorsets.findIndex(colorset2=>
            {return arraysEqual(colorset2, colorSet)}
        ))
        return matchindex === index;
    });
    console.log("after removing duplicates", colorSets.length);
    // Reduce list from ridiculous length
    // let reducedList =[colorSets[0]];
    let filterDistance = 15;
    // if(colorSets.length > 400){
    //         for(let i=0; i<colorSets.length; i++){
    //             let matchindex = reducedList.findIndex(set2 => {
    //                 let distance = distanceBetweenSets(colorSets[i], set2);
    //                 return (distance < filterDistance);
    //             });
    //             if(matchindex === -1){
    //                 reducedList.push(colorSets[i]);
    //                 console.log(reducedList);
    //             }
    //          }
    // colorSets = reducedList;
    // }
    if(colorSets.length > 400){
        colorSets.sort((a, b) => {
                    return distanceBetweenSets(originalColors, a) - distanceBetweenSets(originalColors, b);
            });
            
        let lessNums = Math.round(colorSets.length/200);
        colorSets = colorSets.filter((val, index) => {
            return index % lessNums === 0;
        })
    }
    console.log("after removing excessive number", colorSets.length)
    //Remove very similar
    filterDistance = 1.5;
    colorSets = colorSets.filter((set, index, array) => {
        return index === array.findIndex(set2 => {
            return distanceBetweenSets(set, set2) < filterDistance;
        })
    })
    
    console.log("after removing similar", colorSets.length);
    //Get most similar to original colors
    let returnColors = [];
    if(numRecs > colorSets.length){
        numRecs = colorSets.length;
    }
    colorSets.sort((a, b) => {
        return distanceBetweenSets(originalColors, a) - distanceBetweenSets(originalColors, b);
    })
    let remainingColors = [...colorSets.slice(1, colorSets.length)];
    returnColors.push(colorSets[0]);
    
    //Order recs by uniqueness
    for(let i=0; i<numRecs-1; i++){
        //Scan the current return colors to get the average color
        let averageRec = [];
        returnColors[0].forEach((color, index) => {
            //Make list of colors in this test case position
            let colorList = returnColors.map(colorSet => {
                return colorSet[index].color;
            })
            averageRec.push({color: chroma.average(colorList).hex(), index: index});
        })
        //Sort recs by uniqueness compared to average
        let uniqueness = 1.2;
        remainingColors.sort((a, b) => {
            //return (distanceBetweenSets(averageRec, a) - distanceBetweenSets(averageRec, b)) ;
            return Math.pow(distanceBetweenSets(averageRec, b), uniqueness)/distanceBetweenSets(originalColors, b) - Math.pow(distanceBetweenSets(averageRec, a), uniqueness)/distanceBetweenSets(originalColors, a);
        })
        returnColors.push(remainingColors[0]);
        remainingColors = remainingColors.slice(1, remainingColors.length);
    }
    return returnColors;
//     return returnColors.sort((a, b) => {
//         return distanceBetweenSets(originalColors, a) - distanceBetweenSets(originalColors, b);
//    });
}

function sortColors(colorSets){
    return colorSets.map(colorSet =>{
        return colorSet.sort((a,b) => a.index - b.index);
    })
}

function filterFails(colorSets, ratio){
    if(colorSets[0].length > 2){
        return colorSets.filter(colorSet => {
            return ThreeWayChecker(colorSet[0].color, colorSet[1].color, colorSet[2].color, ratio);
        })  
    } else {
        return colorSets.filter(colorSet => {
            return (chroma.contrast(colorSet[0].color, colorSet[1].color, ratio));
        })
    }
}

function arraysEqual(a, b) {  
    //console.log(a, b);
    for (let  i = 0; i < a.length; ++i) {
      if (a[i].color !== b[i].color) return false;
    }
    return true;
  }

  function distanceBetweenSets(set1, set2){
    let distances = set1.map((color, index) => {
        return chroma.distance(color.color, set2[index].color);
    });
    let gap = distances.reduce( ( p, c ) => p + c, 0 ) / distances.length;
    //console.log("gap", gap)
    return gap;
}
