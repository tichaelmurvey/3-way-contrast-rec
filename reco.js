let colors;
let testCase;
let ratio;
let colorsToChange;

function populateTestCases(){
    
}

function updateColors(){
    //Get values from page
    colors = $(".color-input input").map(function() {
        return $(this).val();
    }).get();
    example = $('input[name=example]:checked').val();

    //Update colors
    //TODO: Add regex check
    $(".color-preview").each(function(index){
        $(this).css('background-color', colors[index]);
    })
}

function updateResult(){
    //TODO: Update result
}

function updatePreview(){
    //TODO: Update preview
}

function getRecommendations(){
    //TODO: Get recommendations
}

$(function() {
    updateColors();
});

$(document).on('keypress click input change', function() {
    console.log("updatingcolors");
    updateColors();
  });

