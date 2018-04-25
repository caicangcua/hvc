var url_noty = 'http://brick.dnd.vn/api/cutcaller',
 loader_frm, _WC, dulieuDIV = $('#dulieu'), pagination = $('#pagination'), calllogOuter = $('#calllogOuter'), calllogHEAD = $('#calllogHEAD'), calllogBODY = $('#calllogBODY')
                , _table3 = dulieuDIV.find('.table3'), _table3SIZE = false
                , nodataMsg = $('#nodataMsg')
                , _MEMORY = {}
                , _SERVERMAP = null, cache_VER = null, STATIC_UI = false, _CHUA_LOAD_HET = true, limitTable3R = 5;


function layoutRender() {
    if (typeof debugurl_noty === 'function') {
        url_noty = debugurl_noty();
    };
    _WC = new workScreen()
}

function autoUpdate() {
    var that = this, VER = '';
    this.checkVersion = function (causeby) {
        $.ajax({
            url: exlink,
            cache: false,
            timeout: 3000, //3 second timeout
            success: function (data, textStatus, xhr) {
                if (VER == '') {
                    VER = data.cutcaller;
                    that.start_version_timer();
                } else if (parseInt(data.cutcaller) > parseInt(VER)) {//diffirence version
                    setTimeout(function () { window.location.reload(); }, 1000);
                    toastr["info"]("Updating new version now ...");
                } else {
                    that.start_version_timer();
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                that.start_version_timer();
                toastr["error"]("Check new version error, Please check internet connection.");
            }
        });
    };
    //
    var version_timer = null, version_duration = 30, limit_version_timer = 0, counter_version_timer = 0;
    this.start_version_timer = function () {
        if (limit_version_timer == 0 || counter_version_timer <= limit_version_timer) {
            version_timer = setTimeout(function () { counter_version_timer += 1; that.version_timer_callback(); }, version_duration * 1000);
        };
    };
    this.stop_version_timer = function () {
        clearTimeout(version_timer);
    };
    this.version_timer_callback = function () {
        that.checkVersion('timer');
    };
    //
    that.version_timer_callback();
}

