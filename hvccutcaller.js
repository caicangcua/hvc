var url_noty = 'http://brick.dnd.vn/api/cutcaller',
    loader_frm ,dulieuDIV = $('#dulieu'), pagination = $('#pagination'), calllogOuter = $('#calllogOuter'), calllogHEAD = $('#calllogHEAD'), calllogBODY = $('#calllogBODY')
        , _table3 = dulieuDIV.find('.table3'), _table3SIZE = false
        , nodataMsg = $('#nodataMsg')
        , _WC = new workScreen()
        , _MEMORY = {};

function layoutRender() {
    if (typeof debugurl_noty === 'function') {
        url_noty = debugurl_noty();
    };
}

function windowRESIZE() {
    var img_circle = $('.img-circle');
    img_circle.each(function () {
        $(this).css({ 'width': 0, 'height': 0 });
    });
    //
    var maxH = 0;
    $('.img-td').each(function () {
        var td = $(this);
        var newH = td.css('height');
        if (parseInt(maxH) < parseInt(newH)) { maxH = newH; };
        td.css('width', newH);
    });
    maxH = parseInt(maxH) - 20;//tru ra border
    var newW = parseInt(maxH) * 1.5;
    img_circle.each(function () {
        $(this).css({ 'width': newW, 'height': maxH });
    });

    document.title = 'W: ' + $(window).width() + ' - H: ' + $(window).height();
    $('#test_screen').text('W: ' + $(window).width() + ' - H: ' + $(window).height());
    if (pagination.length > 0) {
        var mVert = parseInt(pagination.css('margin-top')) + parseInt(pagination.css('margin-bottom')) + parseInt(pagination.outerHeight());
        calllogOuter.css('top', pagination.position().top + mVert);
        var HeadH = parseInt(calllogHEAD.css('height')) + 15;
        calllogBODY.css('top', HeadH - 15);
        calllogHEAD.parent().css({ 'height': HeadH, 'overflow-y': (hasVerticalScrollBar(calllogBODY)) ? 'scroll' : 'hidden' });
    };

    if (_table3SIZE) {
        _table3LO(maxH + 20);
    };
    _table3SIZE = false;
}

function handleErrorIMG() {
    this.src = 'img/dummy.jpg';
};
function hasVerticalScrollBar(el) {
    return el.get(0) ? el.get(0).scrollHeight > el.innerHeight() : false;
}
function _gotoPage(tagA) {
    //alert(tagA);
}

function _DoDelivery(el) {
    retVal = prompt("Vui lòng xác nhận trước khi Giao Hàng.", "");
    if (retVal == null) {
        return;
    };
    reply_caller('delivery', $(el).parent().parent(), retVal);

}
function _DoCancel(el) {
    retVal = prompt("Vui lòng xác nhận trước khi Hủy gọi.", "");
    if (retVal == null) {
        return;
    };
    reply_caller('cancel', $(el).parent().parent().parent(), retVal);
}
function reply_caller(act, TR, retVal) {
    loader_frm.appendTo('body');
    var MsgID = TR.attr('id');
    $.ajax({
        url: url_noty,
        type: "POST",
        data: {
            "kind": act,
            "MsgID": MsgID,
            "SL": TR.find('input.soluong-input').val(), 
            "Notes":encodeURIComponent(retVal.substring(1, 50))
        },
        dataType: 'json',
        cache: false,
        timeout: 5000, //5 second timeout
        success: function (data, textStatus, xhr) {
            loader_frm.detach();
        },
        error: function (xhr, textStatus, errorThrown) {
            loader_frm.detach();
        }
    });
}


function workScreen() {

    calllogBODY.on('click', '.gotoPage', function () { _gotoPage(this); });
    _table3.on('keydown', 'input[type=tel]', function (e) { ForceNumericOnly(e); });

    var that = this, noty_timer = null, noty_duration = 10, limit_noty_timer = 0, counter_noty_timer = 0;
    this.start_noty_timer = function () {
        if (limit_noty_timer == 0 || counter_noty_timer <= limit_noty_timer) {
            noty_timer = setTimeout(function () { counter_noty_timer += 1; that.noty_timer_callback(); }, noty_duration * 1000);
        };
    };
    this.stop_noty_timer = function () {
        clearTimeout(noty_timer);
    };
    this.noty_timer_callback = function () {
        that.get_noty('timer');
    };

    this.get_noty = function (causeby) {
        that.stop_noty_timer();
        //$.ajax({
        //    url: 'http://localhost:2432/api/cutcaller/',
        //    type: "POST",
        //    data: {
        //        "kind": 'androidbox'
        //    },
        //    dataType: 'json',
        //    cache: false,
        //    timeout: 5000, //5 second timeout
        //    success: function (data, textStatus, xhr) {
        //        var light = 'red';
        //        if (data && data.length > 0) {
        //            for (var i = 0; i < data.length; i++) {
        //                var eachCall = data[0]
        //                if (eachCall.act == 'pause') {
        //                    light = 'yellow';
        //                } else {
        //                    if (eachCall.IsExpire == 0) {
        //                        light = 'green';
        //                    };
        //                }
        //            }
        //        };
        //        $('#test_light').removeClass().addClass('tracfic-light ' + light);
        //        that.start_noty_timer();
        //    },
        //    error: function (xhr, textStatus, errorThrown) {
        //        that.start_noty_timer();
        //    }
        //});
    }

    that.get_noty();// get json from webAPI first time when loaded!
    //
    loader_frm = $('.loader_frm').detach();
    //
    this.outside_func1 = function () {
        alert('here');
    }
    return {
        outside_func1: this.outside_func1
    }
}

function playMP3() {
    var mp3URL = getMediaURL("sounds/incoming_call.mp3");
    var media = new Media(mp3URL, null, mediaError);
    media.setVolume(1.0);
    media.play();
}

function playMp3Mild() {
    var mp3URL = getMediaURL("sounds/button-1.mp3");
    var media = new Media(mp3URL, null, mediaError);
    media.setVolume(0.1);
    media.play();
}

function playRemoteFile() {
    var media = new Media("http://SERVER_IP:PORT/media/test.mp3");
    media.setVolume(0.1);
    media.play();
}

function getMediaURL(s) {
    if (device.platform.toLowerCase() === "android") return "/android_asset/www/" + s;
    return s;
}

function mediaError(e) {
    //alert('Media Error');
    //alert(JSON.stringify(e));
}

function ForceNumericOnly(e) {
    var key = e.charCode || e.keyCode || 0;
    var valid= (
        key == 8 ||
        key == 9 ||
        key == 13 ||
        key == 46 ||
        key == 110 ||
        key == 190 ||
        (key >= 35 && key <= 40) ||
        (key >= 48 && key <= 57) ||
        (key >= 96 && key <= 105));

    if (!valid) {
        e.preventDefault();
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function testpage() {

    //var audio = document.createElement('audio');
    //audio.style.display = "none";
    //audio.src = 'sounds/incoming_call.mp3';
    //audio.autoplay = true;
    //audio.onended = function () {
    //    $(audio).remove() //Remove when played.
    //};
    //document.body.appendChild(audio);

    //playMP3();
    var url = calllogBODY.data("SERVERMAP");
    if (url == undefined) {
        url = url_noty+ '?msgid=-1&page=1&pageSize=5';
    } else {
        url = url_noty + '?msgid=' + url.MaxMsgID + '&page=1&pageSize=5';
    };

    $.ajax({
        url: url,
        type: "GET",
        data: {
            "kind": 'androidbox'
        },
        dataType: 'json',
        cache: false,
        timeout: 5000, //5 second timeout
        success: function (data, textStatus, xhr) {
            if (data && data.Results.length > 0) {
                nodataMsg.css('display', 'none');
                dulieuDIV.css('display', '');
                tb3R(data);
                paginationJOB(data);
            } else {
                dulieuDIV.css('display', 'none');
                nodataMsg.css('display', '');
                RESET_TVDISPLAY();
            };
            _table3SIZE = true;
            $(window).trigger("resize");
        },
        error: function (xhr, textStatus, errorThrown) {
            var d = 1;
        }
    });
}

function RESET_TVDISPLAY() {
    _table3.find('tbody').html('');
    calllogBODY.find('table tbody').html('');
    _MEMORY = {};
}

function tb3R(data) {
    var calls = data.Results;
    var spaceR = '<tr><td colspan="5" style="height:10px"></td></tr>';
    var isExistR = _table3.find('tr.dataR').length;
    var limitR = 5;
    for (var i = 0; i < calls.length; i++) {
        if (isExistR >= limitR) {
            break;
        } else {
            var CALL = calls[i];
            var newTR = $(((i == 0 && isExistR > 0) ? spaceR : '') + '<tr id="' + CALL.MsgID + '" class="dataR">' +
                '<th>' +
                    '<div class="nomachine">' +
                        '<h1>' + CALL.UserName + '</h1>' +
                    '</div>' +
                    '<div class="agent-call">' +
                        '<button onclick="_DoCancel(this)" style="color:red">←Hủy</button><span class="call-time">/ Call At: ' + CALL.CallAt + '</span>' +
                    '</div>' +
                '</th>' +
                '<td>' +
                    '<div class="taskpn"><span class="taskid">' + CALL.FF_TaskID + '</span><span class="partno">' + CALL.FF_PartNo + '</span></div>' +
                    '<div class="ghichu">' + ((!CALL.Notes || CALL.Notes == '') ? '-' : CALL.Notes) + '</div>' +
                '</td>' +
                '<td class="img-td" align="center" valign="middle">' +
                    '<img class="img-circle" src="https://i.imgur.com/' + CALL.ImgUrl + '"/>' +
                '</td>' +
                '<td class="soluong-td">' +
                    '<div class="soluong">' + CALL.SL + '</div>' +
                    '<div>' +
                        '<input class="soluong-input " type="tel" placeholder="0"/>' +
                    '</div>' +
                '</td>' +
                '<td>' +
                    '<div id="test_light" class="tracfic-light green"></div>' +
                    '<button class="delivery" onclick="_DoDelivery(this)">' +
                        'Giao hàng →' +
                    '</button>' +
                    '<div class="ellapsetime"></div>' +
                '</td>' +
            '</tr>' + ((i < calls.length - 1 && (isExistR + 1) < limitR) ? spaceR : ''));
            _table3.find('tbody').append(newTR);
            newTR.find('img').error(handleErrorIMG);
            var timer = new countupTimer();
            timer.init(newTR.find('.ellapsetime'))
            timer.startCounter(new Date(CALL.CallAt));
            isExistR += 1;
        }
    };
    if (isExistR >= limitR) {
        _table3.css('position', 'relative');
        pagination.css('display', '');
        calllogOuter.css('display', '');
    } else {
        _table3.css('position', 'absolute');
        pagination.css('display', 'none');
        calllogOuter.css('display', 'none');
    };
}
function paginationJOB(data) {
    var BODY = calllogBODY.find('table tbody'), calls = data.Results, maxMsgID = '-1';
    for (var i = 0; i < calls.length; i++) {
        var CALL = calls[i];
        manage_MEMORY(CALL);
        var newTR = $('<tr id="' + CALL.MsgID + '">' +
                            '<td></td>' +
                            '<td>' + CALL.UserName + '</td>' +
                            '<td>' + CALL.FF_TaskID + '</td>' +
                            '<td>' + CALL.FF_PartNo + '</td>' +
                            '<td>' + CALL.SL + '</td>' +
                            '<td>' + CALL.Notes + '</td>' +
                        '</tr>');
        BODY.append(newTR);
        maxMsgID = CALL.MsgID;
    };
    calllogBODY.data("SERVERMAP", { MaxMsgID: maxMsgID, PageNo: data.PageNo, PageSize: data.PageSize, TotalPages: data.TotalPages, TotalRecords: data.TotalRecords, PrevPageUrl: data.PrevPageUrl, NextPageUrl: data.NextPageUrl });
    BODY.find('tr td:first-child').each(function (z, el) {
        el.innerHTML = (z + 1) + ' /<a class="gotoPage" href="javascript:void(0)">T.1</a> /<span>10 phút</span>';
    })
}

function manage_MEMORY(CALL) {
    _MEMORY[CALL.MsgID] = CALL;
}

function _table3LO(TRHeight) {
    var _table3H = _table3.outerHeight();
    if (_table3H < $(window).height()) {
        //dulieuDIV.css('height', $(window).height());
    };
}

function countupTimer() {
    var clock, setT, startMS;
    this.timeCount = function () {
        var date = new Date(), ms = date - startMS, ss, mm;
        if (ms > 999) {
            ss = parseInt(ms / 1000, 10);
            ms = ms % 1000;
        }
        else {
            ss = 0
        }

        mm = parseInt(ss / 60, 10);
        mm < 10 ? mm = '0' + mm : null;
        ss = ss - mm * 60;
        //
        ms < 10 ? ms = '00' + ms : ms < 100 ? ms = '0' + ms : null;
        ss < 10 ? ss = '0' + ss : null;
        //
        clock.text(mm + ' m : ' + ss + ' s');// : ' + ms + 'ms');
        var that = this;
        setT = setTimeout(function () {
            that.timeCount()
        }, 1000);
    },
    this.startCounter = function (atTime) {
        startMS = new Date(atTime);
        this.timeCount();
    },
    this.stopCounter = function () {
        clearTimeout(setT);
    };
    return {
        init: function (el) { clock = el; },
        startCounter: this.startCounter,
        stopCounter: this.stopCounter,
        timeCount: this.timeCount
    }
}