
FADE_IN_TIME = 150;
FADE_OUT_TIME = 150;

$("body").css("display", "none");
$(window).on('pageshow', function(){
    $("body").fadeIn(FADE_IN_TIME);
    $(".transition").click(function(event){
        // event.preventDefault();
        linkLocation = event.currentTarget.attributes.href.value;
        $("body").fadeOut(FADE_OUT_TIME, redirectPage);
    });
         
    function redirectPage() {
        window.location = linkLocation;
    }
});