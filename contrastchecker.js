//function that runs when button #rec is clicked
   function twoColorRec(){
        console.log("clicked");
        //get the value of the input fields
        var r = $("#two-color-red").val();
        var g = $("#two-color-green").val();
        var b = $("#two-color-blue").val();
        var ratio = $("#ratio").val();
        colors = getSecondColor([r,g,b], ratio);
        console.log(colors);
        colors.forEach(function(color){
            color.forEach(function(color){
            $("#two-color-result").empty();
            $("#two-color-result").append("<p class='color-box'>"+color+"</p>");
            });
        });
    }

//Calculate contrast ratio between two colors
function getContrast(rgb1, rgb2) {
    var lum1 = getLuminance(rgb1);
    var lum2 = getLuminance(rgb2);
    return getRatio(lum1, lum2);
}


//Gets contrast ratio between two relative luminosities
function getRatio(lum1, lum2){
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function getLuminance(RGB){
    linear = RGBtoLinear(RGB);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

// Calculate relative luminance from RGB values
function RGBtoLinear(rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    r /= 255;
    g /= 255;
    b /= 255;
    r = (r <= 0.03928) ? r / 12.92 : Math.pow(((r + 0.055) / 1.055), 2.4);
    g = (g <= 0.03928) ? g / 12.92 : Math.pow(((g + 0.055) / 1.055), 2.4);
    b = (b <= 0.03928) ? b / 12.92 : Math.pow(((b + 0.055) / 1.055), 2.4);
    return [r, g, b];
}


//Convert linear RGB to sRGB
function linearToSRGB(linear){
    var srgb = [];
    var srgb_low = [];
    for(var i = 0; i < linear.length; i++){
        if(linear[i] <= 0.003035269835488375){
            srgb[i] = Math.round(255*(linear[i] * 12.92));
        } 
        else{
            srgb[i] = Math.round((255*(Math.pow(linear[i], 1/2.4)*1.055 - 0.055)));
        }
    }
    return(srgb)
}


//Calculate compliant luminance above and below input luminance for a given ratio
function secondLuminance(oldLuminance, desired_ratio) {
    darkOption = (oldLuminance + 0.05)/desired_ratio - 0.05 - 0.005; // to fudge a bit in the direction of more contrast for rounding errors with floating point
    lightOption = desired_ratio*(oldLuminance + 0.05) - 0.05 + 0.005;
    return([darkOption, lightOption]);
}


//Calculate compliant luminance for two other luminances (which don't necessarily contrast) at a given ratio
function thirdLuminance(first_luminance, second_luminance, desired_ratio){
    var brightest = Math.max(first_luminance, second_luminance);
    var darkest = Math.min(first_luminance, second_luminance);
    var options = [];
    //Middle
    if(getRatio(darkest, brightest) > desired_ratio){
        middle_option_one = secondLuminance(darkest, desired_ratio)[1];
        middle_option_two = secondLuminance(brightest, desired_ratio)[0];
        if(getRatio(middle_option_one, brightest) >= desired_ratio){
            options.push(middle_option_one);
            console.log("middle option one: " + middle_option_one);
        }
        if(getRatio(middle_option_two, darkest) >= desired_ratio){
            options.push(middle_option_two);
            console.log("middle option two: " + middle_option_two);
        }
        if((getRatio(middle_option_two, darkest) >= desired_ratio) && (getRatio(middle_option_one, brightest) >= desired_ratio)){
            true_middle = (middle_option_one + middle_option_two)/2;
            options.push(true_middle);
            console.log("true middle: " + true_middle);
        }
    }

    //Lower
    lower_option = secondLuminance(darkest, desired_ratio)[0];
    if(lower_option >=0){
        options.push(lower_option);
        console.log("lower option: " + lower_option);
    }

    //Higher
    higher_option = secondLuminance(brightest, desired_ratio)[1];
    if(higher_option <=1){
    options.push(higher_option);
    console.log("higher option: " + higher_option);
    }
    return(options);
}

function getSecondColor(rgb, desired_ratio){
    var lum = getLuminance(rgb);
    var options = secondLuminance(lum, desired_ratio);
    colors = [];
    options.forEach(function(option){
        colors.push(makeColors(option))
    });
    return(colors);
}

function getThirdColor(rgb1, rgb2, desired_ratio){
    var lum1 = getLuminance(rgb1);
    var lum2 = getLuminance(rgb2);
    var options = thirdLuminance(lum1, lum2, desired_ratio);
    colors = [];
    options.forEach(function(option){
        colors.concat(makeColors(option))
    });    
}

//Generate colors from relative luminance
function makeColors(luminance){
    var colors = [];
    var coefficients = [0.2126, 0.7152, 0.0722];
    //check for single color options
    for(i=0; i<3; i++){
        if(luminance/coefficients[i] <= 1 && luminance/coefficients[i] >= 0){
            var single_color_linear = luminance/coefficients[i];
            linearRGB = [0, 0, 0];
            linearRGB[i] = single_color_linear;
            console.log("linear color: "+linearRGB);
            colors.push(linearToSRGB(linearRGB));
        }
    }
    return colors;
}

