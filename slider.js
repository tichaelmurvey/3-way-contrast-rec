const chroma = require('chroma-js')
const $ = require('jquery')


//==========================DOM event listeners==========================
console.log('running');
let thirdColor = false;
$(document).ready(function(){
    //Set default values
    $("#color-one-input").val("0, 131, 119");
    $("#color-two-input").val("255, 255, 255");
    $("#color-three-input").val("0, 0, 0");
    updateColorFromRGB($("#color-one-input").val(), $("#color-one-input").parent());
    updateColorFromRGB($("#color-two-input").val(), $("#color-two-input").parent());
    updateColorFromRGB($("#color-three-input").val(), $("#color-three-input").parent());
    //Hide the third color
    $("#color-three").hide();
    $(".three-colour-example").hide()
    //Listen for changes on the mode buttons
    $(".mode-change").on("click", function(){
        changeMode($(this).attr('id'))
    });
    //Listen for changes in the RGB input
    $(".rgb-input").on("input", function(){
        updateColorFromRGB($(this).val(), $(this).parent())
    });
    //Listen for changes in the LCH input
    $(".lch-input").on("input", function(){
        updateColorFromLCH($(this).parent());
    });
    //Listen for changes in slider input
    $(".slider").on("input", function(){
        $(this).prev().val($(this).val());
        updateColorFromLCH($(this).parent());
    });
    //Listen for changes in ratio
    $("#ratio").on("input", function(){
        checkCompliance();
    });
    //Listen for "recommend new colours" button
    $("#get-recommendations").on("click", function(){
        let colours = getRecommendations(true);
        console.log("Got recommendations")
        console.log(colours)
        printResults(colours, $(".results"));
    });
    //Listen for "modify existing colours" button
    $("#get-modifications").on("click", function(){
        let colours = getRecommendations(false);
        console.log("got modifications")
        console.log(colours)
        printResults(colours, $(".results"));
    });
});


//Print colour results to results container on the page.
function printResults (color_sets, results_container) {
    results_container.empty()
    if(Array.isArray(color_sets)){
        color_sets.forEach( function(color_set, index){
            results_container.append("<div class = \'color-set\' id=\'color-set-" + index + "\'></div>")
            color_set.forEach( function(colour){
                let colour_info;
                if(chroma.valid(colour.chroma_value)){
                    colour_info = colour.chroma_value.rgb();
                } else {
                    colour_info = colour.chroma_value;
                }
                $("#color-set-"+index).append("<span style=\"border-left: 18px solid rgb(" + colour_info + ")\" class='color-box'>" + colour_info + " "+colour.type + "</span>")
            });
            $("#color-set-"+index).append("<button id=\'use-" + index + "\'>Use</button>" )
            $("#use-"+index).on("click", function(){
                color_set.forEach(function(colour){
                    updateColourFromChroma(colour.chroma_value, $(".color-" + colour.num))
                });
            })
        });
    } else {
    results_container.append("<p class = \'text-result\'>"+ color_sets + "</p>");
    }

}

//===================Recommendation request parsing and translation====================
function getRecommendations(generate) {
    let ratio = $("#ratio").val();
    let keep_color_one = $("#keep-color-one").is(":checked");
    let keep_color_two = $("#keep-color-two").is(":checked");
    let colours = [{chroma_value: stringToColour($("#color-one-input").val()), keep: keep_color_one, num: 1}, {chroma_value: stringToColour($("#color-two-input").val()), keep: keep_color_two, num: 2}]
    console.log("colour info")
    console.log(colours)
    if(thirdColor){
        let keep_color_three = $("#keep-color-three").is(":checked");
        colours.push({chroma_value: stringToColour($("#color-three-input").val()), keep: keep_color_three, num: 3})
        let stable_colours = colours.filter( function(colour){
            return colour.keep;
        });
        let change_colours = colours.filter( function(colour){
            return !colour.keep;
        });
        let unstable_nums = change_colours.map(function(colour){
            return colour.num;
        })
        let new_colours;
        //Two stable
        if(stable_colours.length == 2){
            console.log("Two stable colours.");
            if(generate){
                //Generate from scratch
                console.log("Creating new color from scratch")
                new_colours = getThirdColor(stable_colours[0], stable_colours[1], unstable_nums[0], ratio);
                return getColourSet(stable_colours, new_colours, unstable_nums[0]);    
            } else {
                //Modify existing
                console.log("Modifying third colour options.");
                new_colours = modifyThreeColor(stable_colours[0], stable_colours[1], change_colours[0], ratio);
                return getColourSet(stable_colours, new_colours, unstable_nums[0]);
            }
        }
        //One stable
        else if(stable_colours.length == 1){
            console.log("One stable colour")
            if(generate){
                console.log("Generating second and third colour options.")
                new_colours = getSecondAndThirdColors(stable_colours[0], unstable_nums, ratio)    
            }   else {
                console.log("Modifying second and third colour options.")
                new_colours = modifySecondAndThirdColors(stable_colours[0].chroma_value, ratio)
            }
        }
    } else {
        let stable_colours = colours.filter( function(colour){
            return colour.keep;
        });
        let change_colours = colours.filter( function(colour){
            return !colour.keep;
        });
        let unstable_num = 1;
        if(stable_colours[0].num == 1){
            unstable_num = 2;
        }
        console.log("Two colour input")
        if(generate){
            console.log("Creating second colour")
            let new_colours = getSecondColor(stable_colours[0], unstable_num, ratio);
            return getColourSet(stable_colours, new_colours);
        } else {
            console.log("Modifying second colour")

        }
        let new_colours = modifyColor(stable_colours[0], change_colours[0], ratio);
        return getColourSet(stable_colours, new_colours);
    }
}

function getColourSet(stable_colors, new_colours){
    console.log("getting colour set.")
    console.log(new_colours)
    if(Array.isArray(new_colours)){
        let colour_set = new_colours.map(function(new_colour){
            let current_set = [...stable_colors];
            current_set.push(new_colour)
            return(current_set);
        });
        return colour_set;
    } else {
        return new_colours;
    }
}

function getColourSetMultipleNew(stable_colors, new_colours, unstable_nums){
    console.log("getting colour sets")
    let colour_set = new_colours.map(function(new_colour_combo){
        let current_set = [...stable_colors];
        new_colour_combo.forEach( function(new_colour, index){
            current_set.push({chroma_value: new_colour.chroma_value, num: unstable_nums[index], type: new_colour.type})
        })
    });
    return colour_set
}

//======================Colour modifiers==============================
//Modify an existing color to meet contrast with another color
function modifyColor (initial_color, change_color, ratio, unstable_num) {
    //Check whether ratio is compliant already
    if(chroma.contrast(initial_color.chroma_value, change_color.chroma_value) >= ratio){
        return "compliant";
    }
    //Get WCAG luminance for input color
    let initial_lum = initial_color.chroma_value.luminance();
    //Find luminances that are compliant
    let compliant_lums = secondLuminance(initial_lum, ratio);
    console.log("compliant lums:" + compliant_lums);
    //Modify the new color to meet the requirements
    return adjustColor(change_color, compliant_lums, initial_lum, ratio);
}

function modifyThreeColor (color_one, color_two, change_color, ratio) {
    if(chroma.contrast(color_one.chroma_value, change_color.chroma_value) >= ratio && chroma.contrast(color_two.chroma_value, change_color.chroma_value) >= ratio ){
        return "compliant";
    }
    //Get WCAG luminance for input color
    let color_one_lum = color_one.chroma_value.luminance();
    let color_two_lum = color_two.chroma_value.luminance();
    //Find luminances that are compliant
    let compliant_lums = thirdLuminance(color_one_lum, color_two_lum, ratio);
    //Get a color for each of the compliant luminances
    return adjustColor(change_color, compliant_lums, ratio);
}

function adjustColor (initial_color, compliant_lums, ratio) {
    let colors = [];
    console.log(compliant_lums);
    //Basic white interpolation option
    for (var lum in compliant_lums) {
        if(compliant_lums[lum]) {
            let new_color = {type: "interpolation", chroma_value: initial_color.chroma_value.luminance(compliant_lums[lum])};
            //new_color = tweak(new_color, initial_color, ratio, "rgb");
            colors.push(new_color);
        }
    }
    //lch Option retaining chroma and hue

    //Simple light or dark
    for (var lumtype in compliant_lums) {
        if(compliant_lums[lumtype]) {
            if(lumtype === 'darkOption' || lumtype === 'underBoth'){
                colors.push({type: "lch lightness decreased", chroma_value: adjustLightnessDown(initial_color.chroma_value, compliant_lums[lumtype])});
            }
            if(lumtype === 'lightOption' || lumtype === 'aboveBoth'){
                colors.push({type: "lch lightness increased", chroma_value: adjustLightnessUp(initial_color.chroma_value, compliant_lums[lumtype])});
            }
        }
    }
    //Middle options
    if(compliant_lums.trueMiddle){
        let new_color = adjustLightnessBetween(initial_color.chroma_value, compliant_lums.trueMiddle, compliant_lums.middleDarker, compliant_lums.middleLighter);
        colors.push({type: 'lch true middle', chroma_value: new_color});
    }
    
    if(compliant_lums.middleDarker){
        let new_color = adjustLightnessBetween(initial_color.chroma_value, compliant_lums.middleDarker, compliant_lums.middleDarker, compliant_lums.trueMiddle);
        colors.push({type: 'lch middle darker', chroma_value: new_color});
    }

    if(compliant_lums.middleLighter){
        let new_color = adjustLightnessBetween(initial_color.chroma_value, compliant_lums.middleLighter, compliant_lums.trueMiddle, compliant_lums.middleLighter);
        colors.push({type: 'lch middle lighter', chroma_value: new_color});
    }
    colors = colors.map( function(colour){
        colour.num = initial_color.num;
        return colour;
    });
    console.log(colors);
    return colors;
}

//======================Colour creators=================================

//Create colours for a given luminosity
function makeColors(lums, width) {
    let colors = [];
    for (var lum in lums){
        if(lums[lum]){
            colors.push({type: "Grayscale", chroma_value: chroma('white').luminance(lums[lum])});
            let base_color = chroma("red").luminance(lums[lum]);
            for(let i = 0; i<6; i++){
                let rainbow_stage = base_color.lch();
                rainbow_stage[2] += i*width;
                if(rainbow_stage[2] > 360){
                    rainbow_stage[2] -= 360;
                }
                console.log(rainbow_stage);
                colors.push({type: lum, chroma_value: chroma(rainbow_stage, 'lch')});
            }
        }
    }
    return colors;
}

//Produce a list of compliant options for a given color and ratio
function getSecondColor (initial_color, change_num, ratio) {
    //Get WCAG luminance for input color
    let initial_lum = initial_color.chroma_value.luminance();
    //Find luminances that are compliant
    let compliant_lums = secondLuminance(initial_lum, ratio);
    console.log(compliant_lums);
    //Get a color for each of the compliant luminances
    let colors = makeColors(compliant_lums, 60);
    colors = colors.map(function (color) {
        color.chroma_value = tweak(color.chroma_value, initial_color.chroma_value, ratio, "rgb");
        color.num = change_num;
        return color;
    });
    return colors;
}

//Produce from scratch a list of compliant colours from two given colours and a ratio
function getThirdColor (color_one, color_two, change_num, ratio) {
    //Get WCAG luminance for input color
    let color_one_lum = color_one.chroma_value.luminance();
    console.log("first luminance")
    console.log(color_one_lum)
    let color_two_lum = color_two.chroma_value.luminance();
    console.log("second luminance")
    console.log(color_two_lum)
    //Find luminances that are compliant
    let compliant_lums = thirdLuminance(color_one_lum, color_two_lum, ratio);
    //Get a color for each of the compliant luminances
    let colors = makeColors(compliant_lums, 60);
    colors = colors.map(function (color) {
        color.chroma_value = TwoWayTweak(color.chroma_value, color_one.chroma_value, color_two.chroma_value, ratio, "rgb");
        color.num = change_num;
        return color;
    });
    return colors;
}

function getSecondAndThirdColors (initial_color, ratio){
    //Get WCAG luminance for input color
    let initial_color_lum = initial_color.luminance();
    //Find luminances that are compliant
    let compliant_lums = twoMoreLuminances(initial_color_lum, ratio);
    let colors = makeColors
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

//=======================Luminosity calculations====================
//Calculate compliant luminance above and below input luminance for a given ratio
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
            console.log("true middle: " + trueMiddle);
        }
    }

    //Lower
    let lower_option = secondLuminance(darkest, desired_ratio).darkOption;
    if (lower_option > 0 && lower_option < 1) {
        options.underBoth = lower_option;
        console.log("lower option: " + lower_option);
    }

    //Higher
    let higher_option = secondLuminance(brightest, desired_ratio).lightOption;
    if (higher_option <= 1) {
        options.aboveBoth = higher_option;
        console.log("higher option: " + higher_option);
    }
    return (options);
}

function twoMoreLuminances(oldLuminance, desired_ratio){
    let options = {
        bothBelow: null,
        bothAbove: null,
        around: null,
    };
    let second_luminance = secondLuminance(oldLuminance, desired_ratio);
    if(second_luminance.darkOption){
        third_luminance = thirdLuminance(oldLuminance, second_luminance.darkOption, desired_ratio);
        if(third_luminance.underBoth){
            options.bothBelow = {middle: second_luminance.darkOption, bottom: third_luminance.underBoth};
        }
        if(third_luminance.aboveBoth){
            options.around = {bottom: second_luminance.darkOption, top: third_luminance.aboveBoth};
        }
    }
    if(second_luminance.lightOption){
        third_luminance = thirdLuminance(oldLuminance, second_luminance.lightOption, desired_ratio);
        if(third_luminance.aboveBoth){
            options.bothAbove = {middle: second_luminance.lightOption, top: third_luminance.aboveBoth};
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

//=======================Checks and balances===================

//Check contrast ratio compliance for two chroma colors
function checkCompliant (change_color, stable_color, ratio) {
    return (chroma.contrast(change_color, stable_color) >= ratio ? true : false);
}

//Tweak a color output of a given type be compliant with the ratio
function tweak (change_color, stable_color, ratio, color_type) {
    for (let i = 0; i < 20; i++) {
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

//=========================Manage and propogate changes to colour input fields========================

function updateColourFromChroma(colour, container){
    container.find(".preview").css({"background-color": "rgb("+colour.rgb()+")"});
    //Update LCH fields
    let new_lch = colour.lch();
    container.find(".lightness").val(Math.round(new_lch[0]));
    container.find(".chroma").val(Math.round(new_lch[1]));
    container.find(".hue").val(Math.round(new_lch[2]));
    container.find(".rgb-input").val(colour.rgb());
    container.find(".slider.lightness").val(new_lch[0]);
    container.find(".slider.chroma").val(new_lch[1]);
    container.find(".slider.hue").val(new_lch[2]);
    updateLuminance(colour, container);
    checkCompliance()
    updateExamples();

}

function updateColorFromRGB(color_string, container){
    let rgb_values = color_string.split(",");
    if(chroma.valid(rgb_values)){
        let new_color = chroma(rgb_values);
        //Update display colour
        container.find(".preview").css({"background-color": "rgb("+new_color.rgb()+")"});
        //Update LCH fields
        let new_lch = new_color.lch();
        container.find(".lightness").val(Math.round(new_lch[0]));
        container.find(".chroma").val(Math.round(new_lch[1]));
        container.find(".hue").val(Math.round(new_lch[2]));
        updateLuminance(new_color, container);
        checkCompliance()
        updateExamples();

    }
}

function updateColorFromLCH(container){
    // console.log("updating from lch");
    let lch_values = [Number(container.find(".lightness").val()), Number(container.find(".chroma").val()), Number(container.find(".hue").val())];
    // console.log(lch_values);
    let new_color = chroma(lch_values, 'lch');
    // console.log("new color: " + new_color);
    //Update display colour
    container.find(".preview").css({"background-color": "rgb("+new_color.rgb()+")"});
    //Update RGB fields
    container.find(".rgb-input").val(new_color.rgb());
    container.find(".slider.lightness").val(lch_values[0]);
    container.find(".slider.chroma").val(lch_values[1]);
    container.find(".slider.hue").val(lch_values[2]);
    updateLuminance(new_color, container);
    checkCompliance();
    updateExamples();
}

function updateLuminance(new_color, container){
    container.find('.luminance').text(Math.round(new_color.luminance()*100)/100);
    updateExamples();

}

function checkCompliance(){
    let containers = $(".color");
    containers.each(function(index){
        $(this).find(".error").empty();
        let my_color = getColorFromObject($(this).find(".rgb-input"));
        let colors = [getColorFromObject($("#color-one-input")), getColorFromObject($("#color-two-input"))];
        if(thirdColor){
            colors.push(getColorFromObject($("#color-three-input")));
        }
        for(let i=0; i<colors.length; i++){
            if(index != i){
                let ratio = chroma.contrast(my_color, colors[i]);
                if(ratio < $("#ratio").val()){
                    // console.log("error on color " + index + " against color " + i);
                    // console.log($(this));
                    $(this).find(".error").append("<p>Not compliant with color " + (i+1) + ". Ratio of " + Math.round(ratio*100)/100 + ".</p>");
                }
            }
        }
    });
}

//Switch between two and three colours
function changeMode(mode){
    console.log("changing mode");
    $(".results").empty();
    if(mode === "two-colors" && thirdColor){
        $("#color-three").hide();
        $("#three-colors").attr("aria-current", "false");
        $("#two-colors").attr("aria-current", "true");
        $(".two-colour-example").show()
        $(".three-colour-example").hide()
        thirdColor = false;
    } else if (mode === "three-colors" && !thirdColor){
        $("#color-three").show();
        $("#three-colors").attr("aria-current", "true");
        $("#two-colors").attr("aria-current", "false");
        $(".two-colour-example").hide()
        $(".three-colour-example").show()
        thirdColor = true;
    } 
    checkCompliance();
    updateExamples();
}

function updateExamples(){
    let colours = [stringToColour($("#color-one-input").val()), stringToColour($("#color-two-input").val())];
    
    if(thirdColor){
        colours.push(stringToColour($("#color-three-input").val()))
        $(".three-colour-example").css({"color": colours[0], "background-color": colours[1]})
        $(".three-colour-example a").css({"color": colours[2]})
        $(".three-colour-example button").css({"background-color": colours[0], "color": colours[2], "border": "2px solid " + colours[2]})
    } else {
        $(".two-colour-example").css({"color": colours[0], "background-color": colours[1]});
    }
}

//=======================Data type conversions=============================

function stringToColour(input_string){
    let colour = input_string.split(",");
    colour = colour.map(Number);
    return chroma(colour[0], colour[1], colour[2]);
}

function getColorFromObject(color_object){
    let color_string = color_object.val();
    let rgb_values = color_string.split(",");
    return(chroma(rgb_values));
}