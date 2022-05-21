function checkContrast(){
    color_one = getColor("one");
    color_two = getColor("two");
    console.log(color_one, color_two);
    color_one_L = getLuminance(color_one.h, color_one.s, color_one.l);
    color_two_L = getLuminance(color_two.h, color_two.s, color_two.l);
    console.log(color_one_L, color_two_L);
    let ratio;
    if(color_one_L == color_two_L){
        ratio = 0;
    } else if(color_one_L > color_two_L){
        ratio = (color_one_L + 0.05)/(color_two_L + 0.05);
    } else {
        ratio = (color_two_L + 0.05)/(color_one_L + 0.05);
    }
    console.log(ratio);
    
}

function getColor(x){
    h = $("#hue-"+x).val();
    s = $("#sat-"+x).val();
    l = $("#lig-"+x).val();
    return {h, s, l}
}


function RGBtoHSL(r, g, b){
    r/= 255;
    g/= 255;
    b/= 255;

    console.log(r, g, b);
    let min = Math.min(r, g, b);
    let max = Math.max(r, g, b);
    console.log(max, min);
    let diff = max-min;
    let h, s, l;
    console.log(diff);

    //Hue
    if(diff == 0){
        h = 0;
    } else if(max == r){
        console.log("r");
        h = (g - b) / diff;
    }
    else if (max == g){
        console.log("g");
        h = 2 + (b - r) / diff;
    }
    else{
        console.log("b");
        h = 4.0 + (r - g) / diff;
    }
    h = Math.round(h * 60);
    if (h < 0){
        h += 360;
    }
    //Lightness
    l = 0.5*(max+min);

    //Saturation
    if(diff == 0){
        s = 0;
    } else if(l > 0.5){
        s = (max - min)/(2.0 - max - min)
    } else {
        s = (max - min)/(max + min)
    }

    s = Math.round(s*100);
    l = Math.round(l*100);
    return { h, s, l};
}

function getLuminance(R8bit, G8bit, B8bit){
    RsRGB = R8bit/255
    GsRGB = G8bit/255
    BsRGB = B8bit/255
    console.log(RsRGB, GsRGB, BsRGB);
    R = getLumVals(RsRGB);
    G = getLumVals(GsRGB);
    B = getLumVals(BsRGB);
    console.log(R, G, B);
    L = (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
    return L;
}

function getLumVals(sRGB){
    if(sRGB > 0.03928 ){
        C = ((sRGB+0.055)/1.055)**2.4;
    } else {
        C = sRGB/12.92
    }
    return C;
}