const chroma = require('chroma-js')
const $ = require('jquery')

//Event handler for two colour recommender (from one given color)
function twoColorRec () {
    //get the value of the input fields
    var r = Number($("#two-color-red").val());
    var g = Number($("#two-color-green").val());
    var b = Number($("#two-color-blue").val());
    var ratio = $("#ratio").val();
    let colors = getSecondColor(chroma(r, g, b), ratio);
    console.log(colors);
    $("#two-color-result").empty();
    $("#two-color-result").append("<p style=\"border-left: 18px solid rgb(" + chroma(r, g, b).rgb() + ")\" class='color-box'> Initial color: " + chroma(r, g, b).rgb() + "</p>");
    printResults(colors, $("#two-color-result"));
}

//Event handler for two colour recommender (from two given colors)
function twoColorRecFromGivenColor () {
    //Get the value of the input fields
    var r1 = Number($("#two-color-stable-color-red").val());
    var g1 = Number($("#two-color-stable-color-green").val());
    var b1 = Number($("#two-color-stable-color-blue").val());
    var r2 = Number($("#two-color-changeable-color-red").val());
    var g2 = Number($("#two-color-changeable-color-green").val());
    var b2 = Number($("#two-color-changeable-color-blue").val());
    var ratio = $("#ratio").val();
    let stable_color = chroma(r1, g1, b1);
    let changeable_color = chroma(r2, g2, b2);
    let colors = modifyColor(stable_color, changeable_color, ratio);
    console.log(colors);
    $("#two-color-result-from-given").empty();
    $("#two-color-result-from-given").append("<p style=\"border-left: 18px solid rgb(" + stable_color.rgb() + ")\" class='color-box'> Initial color: " + stable_color.rgb() + "</p>");
    $("#two-color-result-from-given").append("<p style=\"border-left: 18px solid rgb(" + changeable_color.rgb() + ")\" class='color-box'> Changed color: " + changeable_color.rgb() + "</p>");
    printResults(colors, $("#two-color-result-from-given"));
}

function twoFromOneColorRec(){
    console.log("starting two from one rec");
    //Get the value of input fields
    var r = Number($("#two-from-one-color-red").val());
    var g = Number($("#two-from-one-color-green").val());
    var b = Number($("#two-from-one-color-blue").val());
    var ratio = $("#ratio").val();
    let stable_color = chroma(r,g,b);
    let colors = getSecondAndThirdColors(stable_color, ratio);
    console.log(colors);
    $("#two-from-one-color-result").empty();
    $("#two-from-one-color-result").append("<p style=\"border-left: 18px solid rgb(" + stable_color.rgb() + ")\" class='color-box'> Initial color: " + stable_color.rgb() + "</p>");
    printResults(colors, $("#two-from-one-color-result"));
}

//Event handler for three color recommender (from two given colors)
function threeColorRec () {
    console.log("starting threeColorRec");
    //Get the value of the input fields
    var r_one = Number($("#three-color-one-red").val());
    var g_one = Number($("#three-color-one-green").val());
    var b_one = Number($("#three-color-one-blue").val());
    var r_two = Number($("#three-color-two-red").val());
    var g_two = Number($("#three-color-two-green").val());
    var b_two = Number($("#three-color-two-blue").val());
    var ratio = Number($("#ratio").val());
    let color_one = chroma(r_one, g_one, b_one);
    let color_two = chroma(r_two, g_two, b_two);
    let colors = getThirdColor(color_one, color_two, ratio);
    console.log(colors);
    $("#three-color-result").empty();
    $("#three-color-result").append("<p style=\"border-left: 18px solid rgb(" + color_one.rgb() + ")\" class='color-box'> Stable color one: " + color_one.rgb() + "</p>");
    $("#three-color-result").append("<p style=\"border-left: 18px solid rgb(" + color_two.rgb() + ")\" class='color-box'> Stable color two: " + color_two.rgb() + "</p>");
    printResults(colors, $("#three-color-result"));
}

//Event handler for three color recommender (with two stable colors, modifying one)
function threeColorRecFromGivenColor () {
    var r_stable_one = Number($("#three-color-stable-color-one-red").val());
    var g_stable_one = $("#three-color-stable-color-one-green").val();
    var b_stable_one = Number($("#three-color-stable-color-one-blue").val());
    var r_stable_two = Number($("#three-color-stable-color-two-red").val());
    var g_stable_two = Number($("#three-color-stable-color-two-green").val());
    var b_stable_two = Number($("#three-color-stable-color-two-blue").val());
    var r_change = Number($("#three-color-changeable-color-red").val());
    var g_change = Number($("#three-color-changeable-color-green").val());
    var b_change = Number($("#three-color-changeable-color-blue").val());
    var ratio = $("#ratio").val();
    let color_one = chroma(r_stable_one, g_stable_one, b_stable_one);
    let color_two = chroma(r_stable_two, g_stable_two, b_stable_two);
    let color_three = chroma(r_change, g_change, b_change)
    let colors = modifyThreeColor(color_one, color_two, color_three, ratio);
    printResults(colors, $('#three-color-from-color-result'));
}

function printResults (colors, results_container) {
    if(colors === "compliant"){
        results_container.append("<p>Already compliant</p>");
    } else {
        colors.forEach(function (color) {
            results_container.append("<p style=\"border-left: 18px solid rgb(" + color[1].rgb() + ")\" class='color-box'>" + color[1].rgb() + " "+color[0] + "</p>");
        });
    }
}

//Check contrast ratio compliance for two chroma colors
function checkCompliant (change_color, stable_color, ratio) {
    return (chroma.contrast(change_color, stable_color) >= ratio ? true : false);
}

//Produce a list of compliant options for a given color and ratio
function getSecondColor (initial_color, ratio) {
    //Get WCAG luminance for input color
    let initial_lum = initial_color.luminance();
    //Find luminances that are compliant
    let compliant_lums = secondLuminance(initial_lum, ratio);
    console.log(compliant_lums);
    //Get a color for each of the compliant luminances
    let colors = makeColors(compliant_lums, 60);
    colors.forEach(function (color) {
        color[1] = tweak(color[1], initial_color, ratio, "rgb");
    });
    return colors;
}

function getThirdColor (color_one, color_two, ratio) {
    //Get WCAG luminance for input color
    let color_one_lum = color_one.luminance();
    let color_two_lum = color_two.luminance();
    //Find luminances that are compliant
    let compliant_lums = thirdLuminance(color_one_lum, color_two_lum, ratio);
    //Get a color for each of the compliant luminances
    let colors = makeColors(compliant_lums, 60);
    colors.forEach(function (color) {
        color[1] = TwoWayTweak(color[1], color_one, color_two, ratio, "rgb");
    });
    return colors;
}

function getSecondAndThirdColors (initial_color, ratio){
    //Get WCAG luminance for input color
    let initial_color_lum = initial_color.luminance();
    //Find luminances that are compliant
    let lums = twoMoreLuminances(initial_color_lum, ratio);
    
}

//Modify an existing color to meet contrast with another color
function modifyColor (initial_color, change_color, ratio) {
    //Check whether ratio is compliant already
    if(chroma.contrast(initial_color, change_color) >= ratio){
        return "compliant";
    }
    //Get WCAG luminance for input color
    let initial_lum = initial_color.luminance();
    //Find luminances that are compliant
    let compliant_lums = secondLuminance(initial_lum, ratio);
    console.log("compliant lums:" + compliant_lums);
    //Modify the new color to meet the requirements
    return adjustColor(change_color, compliant_lums, initial_lum, ratio);
}

function modifyThreeColor (color_one, color_two, change_color, ratio) {
    if(chroma.contrast(color_one, change_color) >= ratio && chroma.contrast(color_two, change_color) >= ratio ){
        return "compliant";
    }
    //Get WCAG luminance for input color
    let color_one_lum = color_one.luminance();
    let color_two_lum = color_two.luminance();
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
            var new_color = chroma(initial_color).luminance(compliant_lums[lum]);
            //new_color = tweak(new_color, initial_color, ratio, "rgb");
            colors.push(["interpolation", new_color]);
        }
    }
    //lch Option retaining chroma and hue

    //Simple light or dark
    for (var lumtype in compliant_lums) {
        if(compliant_lums[lumtype]) {
            if(lumtype === 'darkOption' || lumtype === 'underBoth'){
                colors.push(["lch lightness change", adjustLightnessDown(initial_color, compliant_lums[lumtype])]);
            }
            if(lumtype === 'lightOption' || lumtype === 'aboveBoth'){
                colors.push(["lch lightness change", adjustLightnessUp(initial_color, compliant_lums[lumtype])]);
            }
        }
    }
    //Middle options
    if(compliant_lums.trueMiddle){
        new_color = adjustLightnessBetween(initial_color, compliant_lums.trueMiddle, compliant_lums.middleDarker, compliant_lums.middleLighter);
        colors.push(['lch true middle', new_color]);
    }
    
    if(compliant_lums.middleDarker){
        let new_color = adjustLightnessBetween(initial_color, compliant_lums.middleDarker, compliant_lums.middleDarker, compliant_lums.trueMiddle);
        colors.push(['lch middle darker', new_color]);
    }

    if(compliant_lums.middleLighter){
        let new_color = adjustLightnessBetween(initial_color, compliant_lums.middleLighter, compliant_lums.trueMiddle, compliant_lums.middleLighter);
        colors.push(['lch middle lighter', new_color]);
    }

    // compliant_lums.forEach(function (lum) {
    //     if(lum > initial_lum){
    //         new_color = adjustLightnessUp(initial_color, lum);
    //         if(new_color != "no color found"){
    //             colors.push(['lch lightness adjustment', new_color]);
    //         }
    //     }
    //     else {
    //         new_color = adjustLightnessDown(change_color, lum);
    //         if(new_color != "no color found"){
    //             colors.push(['lch lightness adjustment', new_color]);
    //         }
    //     }
    // });
    console.log(colors);
    return colors;
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
    let options = {
        underBoth: null,
        aboveBoth: null,
        middleDarker: null,
        trueMiddle: null,
        middleLighter: null
    };
    //Middle
    if (getRatio(darkest, brightest) > desired_ratio) {
        let middleDarker = secondLuminance(darkest, desired_ratio).lightOption;
        let middleLighter = secondLuminance(brightest, desired_ratio).darkOption;
        let trueMiddle = (middleDarker + middleLighter) / 2;
        if (getRatio(middleDarker, brightest) >= desired_ratio) {
            options.middleDarker = middleDarker;
            console.log("Darker middle: " + middleDarker);
        }
        if (getRatio(middleLighter, darkest) >= desired_ratio) {
            options.middleLighter = middleLighter;
            console.log("Lighter middle option: " + middleLighter);
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


//Adjust the lch lightness of a colour until it meets the required luminance
function adjustLightnessUp(initial_color, target_luminance){
    //Check colour for compliance
    let working_color = initial_color.lch();
    working_color[1] = 130;
    for(let i = 0;i<100;i++){
        let test_color = chroma(working_color, 'lch');
        if(test_color.luminance() >= target_luminance){
            console.log(working_color);
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
            console.log(working_color);
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
    let spectrum = Array.from(Array(101).keys())
    spectrum = spectrum.map(function(pos){
        return [pos, working_color[1], working_color[2]]
    });

    console.log(spectrum);

    //Filter to just those with a luminosity within bounds
    const within_bounds = spectrum.filter(withinBounds);
    function withinBounds(colour){
        let test_color = chroma(colour, 'lch');
        console.log(test_color);
        console.log(test_color.luminance());
        console.log(test_color.luminance() >= lower_luminance && test_color.luminance() <= upper_luminance);
        return test_color.luminance() >= lower_luminance && test_color.luminance() <= upper_luminance;
    }
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
    console.log(final_colour);
    return chroma(final_colour, 'lch');
}

function makeColors(lums, width) {
    let colors = [];
    for (var lum in lums){
        if(lums[lum]){
            colors.push(["Grayscale", chroma('white').luminance(lums[lum])]);
            let base_color = chroma("red").luminance(lums[lum]);
            for(let i = 0; i<6; i++){
                let rainbow_stage = base_color.lch();
                rainbow_stage[2] += i*width;
                if(rainbow_stage[2] > 360){
                    rainbow_stage[2] -= 360;
                }
                console.log(rainbow_stage);
                colors.push([lum, chroma(rainbow_stage, 'lch')]);
            }
        }
    }
    return colors;
}

module.exports = { getSecondColor, twoColorRec, twoColorRecFromGivenColor, threeColorRec, threeColorRecFromGivenColor, twoFromOneColorRec }
