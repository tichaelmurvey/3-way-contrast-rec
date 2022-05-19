function checkContrast(){
    color_one = getColor("one");
    color_two = getColor("two");
    console.log(color_one, color_two);
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