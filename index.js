var $el = $(".table-responsive");

function anim() {
    var st = $el.scrollTop();
    var dogH = $el.innerHeight();
    var sb = $el.prop("scrollHeight") - $el.innerHeight();
    if (sb > 10) {
        $el.animate({ scrollTop: st < sb / 2 ? sb : 0 }, sb * 30, 'linear', anim);
    } else {
        $el.scrollTop(0);
    }
}
function stop() {
    $el.stop();
}
//anim();
//$el.hover(stop, anim);


var resizeTimeout;
$(window).resize(function () {
    $el.stop();
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        $el.css("height", $(document).height() - $('#tbhead').height());
        anim();
    }, 1000);
});

$(window).trigger('resize');