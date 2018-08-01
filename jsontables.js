var loader_frm, _WC, url_noty = 'http://hvc.dnd.vn:8011/api/Lines';

function layoutRender() {
    var tbHeader = new $.Deferred()
    var tbData = new $.Deferred()
    //
    CreateTableFromJSON(tbHeader);

    $.when(tbHeader.promise(), tbData.promise()).done(function (data1, data2) {
        console.log("data1 = ", data1);
        console.log("data2 = ", data2);
        if (typeof debugurl_noty === 'function') {
            url_noty = debugurl_noty();
        };
        _WC = new workScreen();
    });

    tbData.resolve('c', 'd');

    setTimeout(function () {
        var my_awesome_script = document.createElement('script');
        my_awesome_script.setAttribute('src', exlink + 'jquery.flexselect.js');
        document.head.appendChild(my_awesome_script);
    }, 500);
}

//temp because update native apk package
function autoUpdate() {
    var that = this, VER = '';
    this.checkVersion = function (causeby) {
        $.ajax({
            url: exlink,
            cache: false,
            timeout: 3000, //3 second timeout
            success: function (data, textStatus, xhr) {
                if (VER == '') {
                    VER = data.ver;
                    that.start_version_timer();
                } else if (parseInt(data.ver) > parseInt(VER)) {//diffirence version
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


var IsDonePost = false, EachDate = '2000/1/1', MayCat = '-1';
function workScreen() {
    //
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
        //
        that.get_noty('timer');
        //
    };
    ///
    var clock = $('<div id="digitalclock"></div>').prependTo($('.jquery-page-container'));
    $("body").append('<div id="purePopupWrap" class=""></div>');
    //
    var pad = function (x) {
        return x < 10 ? '0' + x : x;
    };
    var ticktock = function () {
        var d = new Date();
        var h = pad(d.getHours());
        var m = pad(d.getMinutes());
        var s = pad(d.getSeconds());
        var current_time = [h, m, s].join(':');
        clock.text(current_time);
    };
    ticktock();
    // Calling ticktock() every 1 second
    setInterval(ticktock, 1000);
    //
    //
    this.get_noty = function (causeby, reorder) {
        //causeby : 'timer','history':yesterday, 7 days ... 'include':Include dismiss, Only dismiss ...
        animate_Loading('removeClass', 'stop', '#tieude');
        that.stop_noty_timer();
        //
        if (!IsDonePost) {
            if (reorder == undefined) { reorder = ''; };
            $.ajax({
                url: url_noty,
                type: "POST",
                data: {
                    "kind": 'androidbox',
                    "hostid": hostID,
                    "hostip": hostIP,
                    "hostmodel": hostNAME,
                    "causeby": causeby,
                    "reorder": reorder
                },
                dataType: 'json',
                cache: false,
                timeout: 5000, //5 second timeout
                success: function (data, textStatus, xhr) {
                    that.start_noty_timer();
                    if (data == null) {
                        toastr["warning"]("Data return null. (" + counter_noty_timer + ')');
                    } else {
                        var Huybo = "success";
                        if (data['HuyBo'] == '1') {
                            Huybo = "warning";
                            toastr["warning"]("Device 'Huy Bo'. (" + counter_noty_timer + ')');
                        };
                        if (data['SendTest'] == '1') {
                            toastr[Huybo](data['MsgTest'] + ' (' + counter_noty_timer + ')');
                        };
                        var headertitle = "<div class='nomachine'><h1>NO CUTTING MACHINE</h1></div>";
                        var isChangeSide = false;
                        var nodataEL = $el.find('#nodataMsg');
                        //
                        if (data['FF_MayCat'] != null && data['FF_MayCat'] != '') {
                            EachDate = data['EachDate']; MayCat = data['MayCat'];
                            headertitle = data['FF_MayCat'] + ' - Ngày: ' + data['EachDate'];
                            //
                            if (data['Lines'] != null && (!data['MsgWarn'] || data['MsgWarn'] == '')) {
                                if (nodataEL.length > 0) nodataEL.remove();
                                isChangeSide = jsonTable.fromJSON(data['Lines']);
                            } else {
                                isChangeSide = jsonTable.clearTable();
                                //
                                if ($('#donelineRow').length > 0) {
                                    lineDoneUI();//remove wait next
                                };
                                //
                                var disMSG = 'NO DATA';
                                if (data['MsgWarn'] && data['MsgWarn'] != '') { disMSG = data['MsgWarn']; };
                                if (nodataEL.length == 0) {
                                    $el.append('<div class="nomachine" id="nodataMsg"><h1>' + disMSG + '</h1></div>');
                                    donePercent();
                                } else {
                                    nodataEL.html('<h1>' + disMSG + '</h1>');
                                };
                            };
                        } else {
                            if (nodataEL.length > 0) nodataEL.remove();
                            isChangeSide = jsonTable.clearTable();
                            //
                            if ($('#donelineRow').length > 0) {
                                lineDoneUI();//remove wait next
                            };
                            donePercent();
                        };
                        //
                        var dogHEADER1 = $('#head1');
                        if (dogHEADER1.text() != $("<div>" + headertitle + "</div>").text() || isChangeSide) {
                            dogHEADER1.html(headertitle);
                            $(window).trigger('resize', 0);
                        };
                    };
                    setTimeout(function () { animate_Loading('addClass', 'stop', '#tieude'); }, 2000);
                },
                error: function (xhr, textStatus, errorThrown) {
                    that.start_noty_timer();
                    toastr["error"]("Server API ERR. " + url_noty + " (" + counter_noty_timer + ')');
                    setTimeout(function () { animate_Loading('addClass', 'stop', '#tieude'); }, 2000);
                }
            });
        } else {
            that.start_noty_timer();
        };
    };
    var jsonTable = new JSONTable($("#tieude"), $("#content"));
    that.get_noty('init');// get json from webAPI first time when loaded!
    //
    loader_frm = $('.loader_frm').detach();
    //
    var $el = $(".table-responsive");

    function anim() {
        var st = $el.scrollTop();
        var dogH = $el.innerHeight();
        var sb = $el.prop("scrollHeight") - $el.innerHeight();
        if (sb > 10) {
            $el.animate({ scrollTop: st < sb / 2 ? sb : 0 }, sb * 100, 'linear', anim);
        } else {
            $el.scrollTop(0);
        }
    }
    function stop() {
        $el.stop();
    }
    //anim();
    //$el.hover(stop, anim);

    function exeWindowResize(delay) {
        $el.stop();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            $el.css("height", $(window).height() - $('#tbhead').height());
            anim();
        }, delay);
    }
    var resizeTimeout;
    $(window).resize(function (event, delay) {
        if (delay == undefined) {
            delay = 500;
        };
        exeWindowResize(delay);
    });
    $(window).trigger('resize');
    //that.start_noty_timer();//check new data from server API

    return {
        get_noty: this.get_noty,
        start_noty_timer: this.start_noty_timer,
        stop_noty_timer: this.stop_noty_timer
    }
}

$.fn.ForceNumericOnly =
function () {
    return this.each(function () {
        $(this).keydown(function (e) {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            return (
                key == 8 ||
                key == 9 ||
                key == 13 ||
                key == 46 ||
                key == 110 ||
                key == 190 ||
                (key >= 35 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    });
};

function validTime(txt) {
    return /^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$/i.test(txt);
}

function offsetDay(baseD, daysToAdd) {
    var msInDay = 86400000;
    var milliseconds = baseD.getTime();
    var newMillisecods = milliseconds + msInDay * daysToAdd;
    return new Date(newMillisecods);
}
function dateDiff(txt, offset) {
    txt = txt.split('-');
    var d1 = new Date('2000/1/1 ' + txt[0]), d2 = new Date('2000/1/1 ' + txt[1]);
    if (offset) {
        if (d2 < d1) {
            d2 = offsetDay(d2, 1);
        };
    };
    var diff = new Date(d2) - new Date(d1);
    return Math.floor((diff / 1000) / 60);
}
function countLechTime(inputTime) {
    var THs = $('#donelineRow th');
    var T1 = dateDiff($(THs[0]).find('.thoigian').text(), true); T1 = parseInt(T1) || 0;
    var T2 = dateDiff(inputTime, true); T2 = parseInt(T2) || 0;
    $(THs[2]).find('.thoigian').text(T1 - T2);
}
function countLechSL(SL) {
    var THs = $('#donelineRow th');
    if ($.isNumeric(SL)) {
        $(THs[2]).find('.solieu').text(SL - parseInt($(THs[0]).find('.solieu').text()));
    } else {
        $(THs[2]).find('.solieu').text(0);
    };
}

function doneBTN(el, kind) {
    var isTG = '', dogTG = '', isSL = '';
    if (kind == 0) {
        if ($(el).mask() != '' && $(el).mask().length == 8) {
            //if (dateDiff($(el).val()) > -1) {
            isTG = $(el).val(); countLechTime(isTG);
            //} else {
            //    $($('#donelineRow th')[2]).find('.thoigian').text('-');
            //};
        };
        isSL = $(el).parent().parent().find("#inputSL").val();
    } else {
        var tg = $(el).parent().parent().find("#inputThoiGian");
        if (tg.mask() != '' && tg.mask().length == 8 //&& dateDiff(tg.val()) > -1
            ) {
            isTG = tg.val()
        };
        isSL = $(el).val();
        countLechSL(isSL);
    };
    if ($.isNumeric(isSL) && isTG != '') {
        var gio = isTG.split('-');
        if (validTime(gio[0]) && validTime(gio[1])) {
            $('.btndone').removeClass('btndone-gray').addClass('btndone-green').data['done-data'] = isTG + '|' + isSL;
            return;
        };
    };
    $('.btndone').removeClass('btndone-green').addClass('btndone-gray');
};


function lineDoneUI(el) {
    //
    var rmvlineRow = new $.Deferred(), headDonePanel = new $.Deferred()
    ////
    $.when(rmvlineRow.promise(), headDonePanel.promise()).done(function (returnPara1, returnPara2) {
        $("#headDonePanel").attr('rowspan', 1).prepend($("<span id='tasktitle'>MÃ HÀNG</span>"));
        $('#fix30snd').remove();
        $(window).trigger('resize', 0);
    });
    $("#donelineRow").fadeOut('slow', function () { //fade
        $(this).remove(); //then remove from the DOM
        rmvlineRow.resolve();
    });

    $("#headDonePanel .pricingdiv").addClass('slide-out').one('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend',
                    function (event) {
                        $(this).remove(); //then remove from the DOM
                        headDonePanel.resolve();
                    });
    //$("#headDonePanel .pricingdiv").remove();
    //$("#donelineRow").remove()
    //$("#headDonePanel").attr('rowspan', 1).prepend($("<span id='tasktitle'>MÃ HÀNG</span>"));
    //$(window).trigger('resize', 0);
}

function showDoneERR() {
    var tg = '', sl = '', inputThoiGian = $("#inputThoiGian"), inputSL = $("#inputSL");
    if (inputThoiGian.mask() == '') {
        tg = 'Nhập thời gian thực hiện';
    } else if (inputThoiGian.mask().length == 8) {
        var gio = inputThoiGian.val().split('-');
        if (!validTime(gio[0])) {
            tg = 'Từ giờ không hợp lệ';
        } else if (!validTime(gio[1])) {
            tg = 'Đến giờ không hợp lệ';
        } else if (dateDiff(inputThoiGian.val(), false) < 0) {
            tg = 'Từ giờ >(lớn) hơn Đến giờ';
        };
    };
    if (inputSL.val() == '') {
        sl = 'Nhập số lượng thực hiện';
    } else if (!$.isNumeric(inputSL.val())) {
        sl = 'Số lượng không hợp lệ';
    };
    var tg = '1.  ' + (tg == '' ? 'Thời gian thực hiện OK!' : tg + '-->ERR') + '\n';
    var sl = '2.  ' + (sl == '' ? 'Số lượng thực hiện OK!' : sl + '-->ERR') + '\n';
    alert(tg + sl + "\nVui lòng kiểm tra lại các nhập liệu chưa hợp lệ!");
}

function lineDone(el) {
    var retVal = null;
    if ($(el).hasClass('btndone-gray')) {
        showDoneERR();
        return;
    } else {
        var msg = '', retVal;
        if (dateDiff($("#inputThoiGian").val(), false) < 0) {
            msg = 'Từ giờ >(lớn) hơn Đến giờ! -->Thời gian qua ngày mới.\n\n';
        };
        //retVal = prompt(msg + "Bất Thường? ", "");
        //if (retVal == null) {
        //    return;
        //};
        PurePopup.prompt({
            rawdata: $(el).attr('data-savetmp'),//"1|1|1|tt|xx|seee",
            title: msg,
            buttons: {
                okButton: 'Hoàn Tất',
                cancelButton: 'Bỏ Qua',
                tmpButton: 'Lưu Tạm',
                newButton: 'Cắt Thành Kế Hoạch Mới'
            },
            inputs: {
                pic: 'Người thao tác đứng máy:',
                srcno: 'SỐ NGUỒN GỐC:',
                notes: 'BẤT THƯỜNG:'
            },
            confirmBefore: function (btnclick) {
                if (btnclick == 'cancelButton') {
                    return true;
                } else {
                    return confirm('Vui lòng xác nhận trước khi ' + ((btnclick == 'okButton') ? 'HOÀN TẤT' : ((btnclick == 'tmpButton') ? 'LƯU TẠM' : 'Cắt Thành Kế Hoạch Mới')) + '?')
                };
            }
        }, function (result) {
            if (result.confirm == 'okButton' || result.confirm == 'tmpButton' || result.confirm == 'newButton') {
                //
                retVal = result;
                IsDonePost = true;//prevent
                //
                $.ajax({
                    url: url_noty,
                    type: "POST",
                    data: {
                        "kind": 'taskdone',
                        "hostid": hostID,
                        "hostip": hostIP,
                        "hostmodel": hostNAME,
                        "donedata": $(el).data['done-data'] + '|' + encodeURIComponent(JSON.stringify(retVal)),//$('#doneTxt').val()),
                        "taskrow": $(el).attr('data-taskrow')
                    },
                    dataType: 'json',
                    cache: false,
                    timeout: 5000, //5 second timeout
                    success: function (data, textStatus, xhr) {
                        IsDonePost = false;//release
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        IsDonePost = false;//release
                    }
                });
                //
                lineDoneUI(el);
                //
            } else {
                return;
            }
        });


        $("select.flexselect").flexselect({ hideDropdownOnEmptyInput: true });

    };
}

function actPanel(focusItem, waitItems) {
    var _taskInfo = focusItem['C0'].split('|');
    var tmp = "<div class='pricingdiv init-slidein'>" +
                        "<div " + (waitItems > 1 ? '' : ("style='display:none'")) + " class='starburst'>" +
                           "<span><span><span>" +
                              "<div id='waitItems' style='font-size:.4rem'>" + waitItems + "</div><div style='font-size:.2rem'>TASK(s)</div>Wait Done!" +
                           "</span></span></span>" +
                        "</div>" +
                    "<ul class='theplan'>" +
                        "<li class='nomachine'><h1>" + _taskInfo[0] + "</h1></li>" +
                        "<li class='activeInfo'><div>Lớp: " + _taskInfo[2] + "<br>Dài: " + _taskInfo[4] + "M<br>CT: " + _taskInfo[1] + "<br/>VẢI: " + _taskInfo[3] + "</div>" +
                            "<div class='btndone btndone-gray' data-savetmp='" + focusItem['C5'] + "' data-taskrow='" + _taskInfo[5] + "' onclick='lineDone(this)'>DONE!</div>" +
                        "</li>" +
                    "</ul>" +
                "</div";
    return tmp;
}

function inputH(act, taskrow, el) {
    IsDonePost = true;//prevent
    //
    var _$fuck = $(el).parent(), val = _$fuck.parent().find('#inputSL').val(), tg = _$fuck.find('#inputThoiGian'), atTime = (new Date).toTimeString().slice(0, 5),
    oldTG = tg.val().split('-'), sTime = '00:00', eTime = '00:00';
    if (oldTG.length == 2) { sTime = oldTG[0]; eTime = oldTG[1]; } else if (oldTG[0].length > 1) { sTime = oldTG[0]; };
    if (act == 0) { sTime = atTime } else { eTime = atTime };
    tg.val(sTime + '-' + eTime);
    tg.trigger('blur');
    //
    $.ajax({
        url: url_noty,
        type: "GET",
        data: {
            "kind": 'InputTime',
            "hostid": hostID,
            "MayCat": MayCat,
            "EachDate": EachDate,
            "act": act,
            "taskrow": taskrow,
            "donedata": (sTime + '-' + eTime) + '|' + val + '|' + encodeURIComponent(JSON.stringify({ 'confirm': 'InputTime', 'notes': '', 'opt1': 0, 'opt2': 0, 'opt3': 0, 'pic': '', 'srcno': '' }))
        },
        dataType: 'json',
        cache: false,
        timeout: 5000, //5 second timeout
        success: function (data, textStatus, xhr) {
            IsDonePost = false;
        },
        error: function (xhr, textStatus, errorThrown) {
            IsDonePost = false;
        }
    });
}

function fuckTaskRow(act, focusItem) {
    var _taskInfo = focusItem['C0'].split('|');
    return "<img  onclick='inputH(" + act + "," + '"_' + _taskInfo[5] + '_"' + ",this)' src='img/keyboard.png' style='position: absolute;width: 0.5rem;margin-top: -2px;cursor: pointer;";
}

function actInfo(focusItem, waitItems) {
    var _val = focusItem['C1'].split('|');
    //
    var lastNgay = '';
    if (_val[2] && _val[2] != '') {
        lastNgay = "<div style='position:absolute;font-size:0.2rem;color:red'>" + _val[2] + "</div>";
    };

    var tmp = "<tr id='donelineRow' class='head3' style='display:none'>" +
                    "<th>" + lastNgay +
                            "<div class='thoigian'>" + _val[0] + "</div><div class='solieu'>" + _val[1] + "</div>" +
                    "</th>" +
                    "<th>";

    var _val = focusItem['C2'].split('|');

    tmp += "<div class='thoigian' style='overflow: hidden;position:relative'>" + fuckTaskRow(0, focusItem) + "'/>" +
        "<input value=" + ((_val[0] != '-') ? _val[0] : "0000-00:00") + " id='inputThoiGian' placeholder='00:00-00:00' type='tel' onblur='doneBTN(this,0)'>" + fuckTaskRow(1, focusItem) + "right:0px;'/></div>" +
                         "<div style='color:blue;overflow: hidden;position:relative' class='solieu'><input onblur='doneBTN(this,1)' placeholder='0'  value=" + ((_val[1] != '' && _val[1] != '0') ? _val[1] : "''") + " id='inputSL' type='tel' maxlength='5'></div>" +
                     "</th>" +
                     "<th>" +
                           "<div class='thoigian' style='text-align:right!important'>-</div><div class='solieu'>0</div>" +
                     "</th>";

    _val = focusItem['C4'].split('|');
    tmp += "<th class='colabnormal'><div>" + _val[0] + "</div>" +
                    "</th>" +
                    //"<th style='position:relative;overflow:hidden;font-size:0.2rem'>" +
                    //    "<textarea id='doneTxt' iwrap='soft' style='overflow:hidden; resize:none;font-size:.55rem;color:red;text-align:left' maxlength='50'></textarea>" +
                    //"</th>" +
                "</tr>";
    return tmp;
};
function wait30Item(focusItem) {
    var _val = focusItem['C1'].split('|');
    var otherD = '';
    if (_val[2] && _val[2] != '') {
        otherD = "<div style='position:absolute;font-size:0.2rem;color:red'>" + _val[2] + "</div>";
    };
    var _taskInfo = focusItem['C0'].split('|');
    var tmp = "<td style='position:relative;'>" +
    "<div class='tasklabel' style='font-size:0.6rem'>" + _taskInfo[0] + "</div>" +
    "<div class='half-circle-ribbon'>Lớp: " + _taskInfo[2] + "<br>Dài: " + _taskInfo[4] + "M<br>CT: " + _taskInfo[1] + "<br/>VẢI: " + _taskInfo[3] + "</div></td>" +
        "<td>" + otherD + "<div class='thoigian'>" + _val[0] + "</div><div class='solieu' style='color:black'>" + _val[1] + "</div></td>";

    _val = focusItem['C2'].split('|');
    tmp += "<td><div class='thoigian'>" + _val[0] + "</div><div  style='color:blue' class='solieu'>" + _val[1] + "</div></td>";

    _val = focusItem['C3'].split('|');
    tmp += "<td>" +
        "<div class='thoigian' style='text-align:right!important'>" + _val[0] + "</div><div class='solieu' style='color:black'>" + _val[1] + "</div></td>";

    _val = focusItem['C4'].split('|');
    tmp += "<td class='colabnormal'><div>" + _val[0] + "</div></td>";
    return tmp;
}

function CreateTableFromJSON(tbHeader) {
    var newsec = $("<table id='tbhead'>" +
            "<tr>" +
                "<td  id='head1' class='head1 colTaskID' colspan='5' style='text-align:left;padding-left:27%'>" +
                    "<div class='nomachine'><h1>MACHINE VERIFING ...</h1></div>" +
                "</td>" +
                "</tr>" +
            "<tbody id='tieude'><tr class='head2'>" +
                "<td id='headDonePanel' class='colTaskID' style='position:relative;padding:5px'>" +
                    "<span id='tasktitle'>MÃ HÀNG</span>" +
                    "<div class='loading'><div class='round-trip stop'></div><div class='open-jaw stop'></div><div class='one-way stop'></div></div>" +
                "</td>" +
                "<td>" +
                    "K.HOẠCH" +
                "</td>" +
                "<td>" +
                    "T.TẾ" +
                "</td>" +
                "<td>" +
                    "S.BIỆT" +
                "</td>" +
                "<td>" +
                    "G.CHÚ" +
                "</td>" +
            "</tr>" +

             "</tbody>" +
    "</table>" +
    "<div class='table-responsive'><table id='content'></table></div>");

    $('#dulieu')['append'](newsec).ready(function () {
        // test jquery deffer!
        tbHeader.resolve($('#head1').length);
    });
}

function donePercent(total, done) {
    var data = '';
    if (total && total > 0) {
        var percent = Math.ceil(100 * done / total);
        data = "<svg viewBox='0 0 36 36' class='circular-chart orange'><path class='circle-bg' d='M18 2.0845" +
"a 15.9155 15.9155 0 0 1 0 31.831" +
"a 15.9155 15.9155 0 0 1 0 -31.831'></path>" +
         "<path class='circle' stroke-dasharray='" + percent + ", 100' d='M18 2.0845" +
"a 15.9155 15.9155 0 0 1 0 31.831" +
"a 15.9155 15.9155 0 0 1 0 -31.831'></path>" +
         "<text x='18' y='21.35' class='percentage'>" + percent + "%</text></svg>" +
                             "<div class='donesumary'>" +
    "<div><i>T</i>:" + total + "</div>" +
    "<div><i>D</i>:" + done + "</div>" +
"</div>"
    };
    $('.single-chart').html(data);
}

function ShowFocusItem(focusItem, waitItems) {
    if ($('#donelineRow').length == 0) {
        var rmvlineRow = new $.Deferred(), headDonePanel = new $.Deferred()
        $.when(rmvlineRow.promise(), headDonePanel.promise()).done(function (returnPara1, returnPara2) {
            $(window).trigger('resize', 0);

            $.mask.definitions['~'] = "[+-]";
            $(returnPara1).find("#inputThoiGian").mask("99:99-99:99").trigger('blur');
            $(returnPara1).find("#inputSL").ForceNumericOnly().trigger('blur');

            //$("input").blur(function () {
            //    $("#nav-icon2").html("Unmasked value: " + $(this).mask());
            //}).dblclick(function () {
            //    $(this).unmask();
            //});
            //$('#fix30snd').find('div').addClass('blink');


        });
        //
        $(actInfo(focusItem, waitItems)).appendTo($('#tieude')).fadeIn('slow', function () { //fade
            rmvlineRow.resolve(this);
        });
        $("#headDonePanel").attr('rowspan', 2);
        $("#tasktitle").remove();
        $(actPanel(focusItem, waitItems)).prependTo($('#headDonePanel')).addClass('slide-in').one('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend',
                        function (event) {
                            headDonePanel.resolve();
                        });
    }
}

function removeJSON(jsonSourceData, focusItem) {
    var dog = $.grep(jsonSourceData, function (n) {
        return n != focusItem;
    });
    return dog;
}
function donelineRowFUNC(focusItem, waitItems) {
    if ($('#donelineRow').length > 0) {
        if (focusItem) {
            var _c0 = focusItem['C0'].split('|');
            if (_c0[0] != $('.theplan h1').text()) {
                lineDoneUI();//remove wait next
                ShowFocusItem(focusItem, waitItems);
            } else {
                // udpate waiting done
                var _taskInfo = focusItem['C0'].split('|'), panel = $("#headDonePanel .pricingdiv"), isTaskRow = false;
                panel.find('.starburst').css('display', (waitItems > 1 ? '' : 'none'));
                panel.find('#waitItems').text(waitItems);
                panel.find('li').each(function (i, el) {
                    if (i == 0) {
                        $(el).html("<h1>" + _taskInfo[0] + "</h1>");
                    } else {
                        var btnDone = $(el).children('div:last');
                        if (btnDone.attr('data-taskrow') != _taskInfo[5]) { isTaskRow = true; btnDone.attr('data-taskrow', _taskInfo[5]); };
                        $(el).children('div:first').html("<div>Lớp: " + _taskInfo[2] + "<br>Dài: " + _taskInfo[4] + "M<br>CT: " + _taskInfo[1] + "<br/>VẢI: " + _taskInfo[3] + "</div>");
                        btnDone.attr('data-savetmp', focusItem['C5']);
                    }
                });

                var _val = focusItem['C2'].split('|'), tg = '', sl = '', inputThoiGian = $("#inputThoiGian"), inputSL = $("#inputSL");
                if (isTaskRow) {
                    if (_val.length > 1 && _val[0].length > 1) { inputThoiGian.val(_val[0]); } else { inputThoiGian.val(null); };
                    if (_val.length >= 2) { inputSL.val(_val[1]); } else { inputSL.val(0); };
                    inputThoiGian.trigger('blur'); inputSL.trigger('blur');
                };
                //
                _val = focusItem['C1'].split('|');
                $("#donelineRow").find("th:first").find('.thoigian').each(function (i, fuck) {
                    if ($(fuck).text() != _val[0]) {
                        $(fuck).text(_val[0]);// khác thời gian
                        inputThoiGian.trigger('blur');
                    }
                    if ($(fuck).next().text() != _val[1]) {
                        $(fuck).next().text(_val[1]);// khác số lượng
                        inputSL.trigger('blur');
                    };
                    SPAN_LastNgay(fuck, _val);
                });
            }
        } else {
            lineDoneUI();//remove wait next
        }
    } else {
        if (focusItem) {
            ShowFocusItem(focusItem, waitItems);
        };
    };
}
function fix30sndFUNC(wait30) {
    if ($('#fix30snd').length > 0) {
        if (wait30) {
            $('#fix30snd').html(wait30Item(wait30));
        } else {
            $('#fix30snd').remove();
        }
    } else {
        if (wait30) {
            $("<tr id='fix30snd'>" + wait30Item(wait30) + "</tr>").appendTo($('#tieude'));
        };
    };
}

function SPAN_LastNgay(fuck, _val) {
    var lastD = $(fuck).prev();
    if (lastD.length > 0) {
        if (_val[2] && _val[2] != '') {
            lastD.text(_val[2]);
        } else {
            lastD.remove();
        }
    }
}

//https://github.com/bmsimons/bootstrap-jsontables
function JSONTable(mapHeader, tableObject) {
    var that = this, tableHeaderArray = [], tableHeader = mapHeader.find("td");
    for (var hc = 0; hc < tableHeader.length; hc++) {
        tableHeaderArray.push(hc.toString());
    };
    this.table = tableObject;
    //
    this.clearTable = function () {
        var isChanged = $(that.table).find('tr').length > 0;
        that.table.empty();// clear all table rows
        return isChanged;
    };

    this.fromJSON = function (jsonSourceData) {
        if (IsDonePost) { return; };
        var focusItem = null, wait30 = null, waitItems = 0, totalTask = jsonSourceData.length, isdone = 0;
        for (var jr = 0; jr < jsonSourceData.length; jr++) {
            if (jsonSourceData[jr]['IsFocused'] == '1' && jsonSourceData[jr]['IsDone'] == '0') {
                if (!focusItem) {
                    focusItem = jsonSourceData[jr];
                } else if (!wait30 && jsonSourceData[jr]['Is30'] == '1') {
                    wait30 = jsonSourceData[jr];
                };
                waitItems += 1;
            } else if (!wait30 && jsonSourceData[jr]['Is30'] == '1' && jsonSourceData[jr]['IsDone'] == '0') {
                wait30 = jsonSourceData[jr];
                if (jsonSourceData[jr]['IsDone'] == '1') { waitItems += 1; }
            } else if (jsonSourceData[jr]['IsDone'] == '1') {
                isdone += 1;
            }
        };
        //
        if (focusItem) {
            jsonSourceData = removeJSON(jsonSourceData, focusItem);
        };
        if (wait30) {
            jsonSourceData = removeJSON(jsonSourceData, wait30);
        };
        //
        donelineRowFUNC(focusItem, waitItems);
        fix30sndFUNC(wait30);
        //
        var newROWs = $.makeArray($(jsonSourceData).map(function (index) {
            return this['C0'].split('|')[5];
        }));

        var existROWs = {};
        var isChangeSize = false;
        if (newROWs.length == 0) {
            that.table.empty();// clear all table rows
            isChangeSize = true;
        } else {
            var rowindex = 0;
            $(that.table).find('tr').each(function (index, el) {
                if (rowindex < newROWs.length) {
                    //update value of row
                    $(el).attr('id', newROWs[rowindex]);
                    existROWs[el.id] = el;
                } else {
                    $(el).remove(); //remove this row
                    isChangeSize = true;
                };
                rowindex += 1;
            });
        };
        //
        for (var jr = 0; jr < jsonSourceData.length; jr++) {
            var taskField = jsonSourceData[jr]['C' + tableHeaderArray[0]].split('|');
            if (existROWs.hasOwnProperty(taskField[5])) {
                var existR = $(existROWs[taskField[5]]);
                existR.find('.thoigian').each(function (i, fuck) {
                    var _val = jsonSourceData[jr]['C' + (i + 1)].split('|');
                    $(fuck).text(_val[0]);
                    $(fuck).next().text(_val[1]);

                    if (i == 0) {
                        SPAN_LastNgay(fuck, _val);
                    };
                });
                existR.find('.colabnormal').text(jsonSourceData[jr]['C4']);
                var _taskInfo = jsonSourceData[jr]['C0'].split('|');
                existR.find('.tasklabel').html(_taskInfo[0]);
                existR.find('.half-circle-ribbon').html('Lớp: ' + _taskInfo[2] + '<br/>Dài: ' + _taskInfo[4] + 'M<br/>CT: ' + _taskInfo[1] + '<br/>VẢI: ' + _taskInfo[3] +
                              (jsonSourceData[jr].IsDone == '1' ? ('<div class="donestatus">DONE</div>') : '')
                              );
            } else {
                isChangeSize = true;
                var tableDataRow = $("<tr id='" + taskField[5] + "'></tr>");
                for (var ki = 0; ki < tableHeaderArray.length; ki++) {
                    if (ki == 0) {
                        var _taskInfo = jsonSourceData[jr]['C' + tableHeaderArray[ki]].split('|');
                        tableDataRow.append('<td class="colTaskID"><div class="tasklabel">' + _taskInfo[0] +
                            '</div><div class="half-circle-ribbon">Lớp: ' + _taskInfo[2] + '<br/>Dài: ' + _taskInfo[4] + 'M<br/>CT: ' + _taskInfo[1] + '<br/>VẢI: ' + _taskInfo[3] +
                                    (jsonSourceData[jr].IsDone == '1' ? ('<div class="donestatus">DONE</div>') : '') +
                            '</div>' +
                            '</td>');
                    } else {
                        var _val = jsonSourceData[jr]['C' + tableHeaderArray[ki]].split('|');
                        var color = ''; if (ki == 2) { color = "style='color:blue'" };
                        var newtd = '';
                        if (ki == 4) {//bat thuong
                            newtd = '<td class="colabnormal"><div style="padding:10px">' + jsonSourceData[jr]['C' + tableHeaderArray[ki]] + '</div></td>';
                        } else if (ki == 3) {
                            newtd = '<td>' + "<div class='thoigian' style='text-align:right!important'>" + _val[0] + "</div><div " + color + " class='solieu'>" + _val[1] + "</div>" + '</td>';
                        } else {
                            var otherD = '';
                            if (ki == 1 && _val[2] && _val[2] != '') {
                                otherD = "<div style='position:absolute;font-size:0.2rem;color:red'>" + _val[2] + "</div>";
                            };
                            newtd = '<td>' + otherD + "<div class='thoigian'>" + _val[0] + "</div><div " + color + " class='solieu'>" + _val[1] + "</div>" + '</td>';
                        };
                        tableDataRow.append(newtd);
                    };
                };
                that.table.append(tableDataRow);
            };
        }
        donePercent(totalTask, isdone);
        return isChangeSize;
    }
}

function DONE_REORDER(evt) {
    evt || (evt = window.event);
    if (evt) {
        if ($(PurePopup.wrap).find('label[style*="color: red"]').length > 0) {
            if (confirm('Vui lòng xác nhận trước khi thực hiện thay đổi thứ tự cắt?')) {
            } else {
                evt.stopPropagation();
                return false;
            }
        };
    };
}

(function () {
    'use strict';
    //https://www.cssscript.com/pure-javascript-js-dialog-box-alternative-purepopup/
    var Popup = function () {
        // this.el = typeof el === 'object' ? el : document.getElementById(el);

        // For check current popup type
        this.type = 'alert';

        // Set default params
        this.params = {};
        this.setParams();

        this.wrap = document.createElement('div');
        this.wrap.id = 'purePopupWrap';
        document.body.appendChild(this.wrap);
        this.wrap.addEventListener('click', function (e) {
            //e.preventDefault();
            //e.stopPropagation();

            //if (e.target == this.wrap) this.close('noActionCancel');

            // TODO: settings: close on click
            if (e.target.className && e.target.className != '') {
                var isOK = true;
                if (this.params.confirmBefore && e.target.className.match(/_(.*)_/)) {
                    isOK = this.params.confirmBefore.call(this, e.target.className.match(/_(.*)_/)[1]);
                };
                if (isOK) {
                    if (e.target.className.indexOf('purePopupButton') != -1) this.close(e.target.className.match(/_(.*)_/)[1]);
                };
            };
        }.bind(this));
    }

    Popup.prototype.setParams = function (params, callback) {
        this.params.title = document.title;
        this.params.callback = null;
        this.params.confirmBefore = null;
        this.params.buttons = (this.type == 'alert') ? { ok: 'Ok' } : { ok: 'Ok', cancel: 'Cancel' };
        this.params.inputs = { name: 'Please, enter your name' };

        if (params) {
            if (typeof params == 'object') {
                params = params;
                if (callback && typeof callback == 'function') params.callback = callback;
            } else if (typeof params == 'function') {
                params = { callback: params };
            }
        } else params = {};

        for (var p in params) if (this.params.hasOwnProperty(p)) this.params[p] = params[p];
    }

    Popup.prototype.show = function () {
        this.wrap.className = 'open';
        setTimeout(function () {
            this.wrap.className = 'open pop';
        }.bind(this), 20);
    }

    Popup.prototype.close = function (confirm) {
        this.wrap.className = 'open';
        //
        setTimeout(function () {
            this.wrap.className = '';
            var result = { confirm: confirm };

            var inputs = this.wrap.getElementsByTagName('input');
            for (var i = inputs.length; --i >= 0;) {
                if (inputs[i].type == "checkbox") {
                    result[inputs[i].name] = (inputs[i].checked) ? '1' : '0';
                } else {
                    result[inputs[i].name] = inputs[i].value;
                }
            }
            if (this.params.callback) this.params.callback.call(this, result);
        }.bind(this), 300);
    }

    Popup.prototype.alert = function (data, cb) {
        this.type = 'alert';
        this.params.callback = cb;
        this.params.buttons = { ok: 'Ok', cancel: 'Cancel' };
        var buttonsHtml = '<span class="purePopupButton _okButton_" onclick="DONE_REORDER()">Thực Hiện</span><span class="purePopupButton _cancelButton_">Bỏ Qua</span>';

        var fuck = '<div style="top:2px;width:400px;margin-left: -220px;">' +
                                '<div>' +
                                    '<div class="purePopupTitle">' + 'Thay Đổi Thứ Tự Kế Hoạch Cắt' + '</div>' +
'<div class="list-type5">' +
'<ol>';
        var liHTML = '', initMAP = {}, STT = 0;
        for (var i = 0; i < data.length; i++) {
            var dis = (data[i].Done == '1') ? "style='display:none'" : ('', STT += 1);
            liHTML += '<li ' + dis + ' id="' + data[i].CtrlRowID + '"><div class="arrow1 top showme"></div><div>' + data[i].FF_TaskID + '</div><span><em style="color:red;background-color:yellow;padding:10px 5px">' + data[i].SL + '</em>/<em style="font-size:70%">' + data[i].Time + '</em> <label>(' + STT + ') </label></span><div class="arrow up"></div><div class="arrow down"></div></li>';
            initMAP[data[i].CtrlRowID] = [data[i].STT, data[i].OrderID];
        };
        this.params.initMAP = initMAP;


        fuck += liHTML +
'</ol>' +
'</div>';

        this.wrap.innerHTML = fuck +
                                                    buttonsHtml +
                                                '</div>' +
                                               '</div>';
        this.show();

        $('.arrow.up').click(function () {
            var $current = $(this).closest('li');
            var isLoop = true;
            while (isLoop) {
                var $previous = $current.prev('li');
                if ($previous.length !== 0) {
                    isLoop = $previous.css('display') == 'none';
                    $current.insertBefore($previous);
                    isReorder($current);
                    isReorder($previous);
                } else {
                    isLoop = false;
                }
            }
            return false;
        });
        $('.arrow.down').click(function () {
            var $current = $(this).closest('li');
            var isLoop = true;
            while (isLoop) {
                var $next = $current.next('li');
                if ($next.length !== 0) {
                    isLoop = $next.css('display') == 'none';
                    $current.insertAfter($next);
                    isReorder($current);
                    isReorder($next);
                } else {
                    isLoop = false;
                }
            }
            return false;
        });

        $('.arrow1.top').click(function () {
            while (jumpTop($(this).closest('li'))) {
                //code block to be executed
            }
            return false;
        });
        function jumpTop($current) {
            var $previous = $current.prev('li');
            if ($previous.length !== 0) {
                $current.insertBefore($previous);
                isReorder($current);
                isReorder($previous);
                return true;
            } else {
                return false;
            }
        }


        function isReorder(li) {
            var label = li.find('label');
            if (parseInt(label.text().replace('(', '').replace(')', '')) != (li.index() + 1)) {
                label.css('color', 'red');
            } else {
                label.css('color', '');
            };
            var CtrlRowID = li.attr('id');
            if (PurePopup.params.initMAP.hasOwnProperty(CtrlRowID)) {
                PurePopup.params.initMAP[CtrlRowID][0] = li.index() + 1;
            };
        }
    }

    Popup.prototype.confirm = function (p, c) {
        this.type = 'confirm';
        this.setParams(p, c);

        var buttonsHtml = '';
        for (var i in this.params.buttons) buttonsHtml += '<span class="purePopupButton _' + i + '_">' + this.params.buttons[i] + '</span>';

        this.wrap.innerHTML = '<div>' +
                                '<div>' +
                                    '<div class="purePopupTitle">' + this.params.title + '</div>' +
                                    buttonsHtml +
                                '</div>' +
                               '</div>';
        this.show();
    }

    Popup.prototype.prompt = function (p, c) {
        this.type = 'prompt';
        this.setParams(p, c);

        var iV = { 'notes': '', 'pic': '', 'srcno': '', 'opt1': '', 'opt2': '', 'opt3': '' };
        var rd = p.rawdata.split("|");
        if (rd.length > 0) iV['opt3'] = ((rd[0] == '1') ? 'value=1 checked' : 'value=1');
        if (rd.length > 1) iV['opt2'] = ((rd[1] == '1') ? 'value=1 checked' : 'value=1');
        if (rd.length > 2) iV['opt1'] = ((rd[2] == '1') ? 'value=1 checked' : 'value=1');
        if (rd.length > 3) iV['srcno'] = ((rd[3] != '') ? 'value=' + rd[3] : '');
        if (rd.length > 4) iV['pic'] = ((rd[4] != '') ? 'value=' + rd[4] : '');
        if (rd.length > 5) iV['notes'] = ((rd[5] != '') ? 'value=' + rd[5] : '');

        var pics = ['', 'An', 'An/Tien', 'Cuong', 'Cuong/vinh', 'Dat', 'Dat/Lam', 'Dat/Dong', 'Dat/Hung', 'Dat/Vu', 'Dat-tuan', 'Diep', 'Diep/cuong', 'Dong', 'Giau', 'Giau/phong/son', 'Hau', 'Hien'
, 'Hien/Nghiem', 'Hien/nghiem/tu', 'Hien/vu', 'Hung', 'Hung/lam', 'Hung/dat', 'Hung/Dong', 'Hung/nhac', 'Lam', 'Lam/dat/hung', 'Lam-tuan', 'Lan', 'Lan/hien', 'Lan/vu', 'Le', 'Liem', 'Liem/Tu'
, 'Nghiem', 'Nhac', 'Nhan', 'Phong', 'PHONG/SON', 'Phuong', 'Son', 'Son/dat', 'Son/giau', 'Son/Hung', 'Son/phong', 'Son/Son', 'Tan', 'Thanh', 'Thinh/Trung', 'Thinh/Truong', 'Thinh', 'Tien', 'Tien/Tuan/An', 'Trung', 'Trung/Truong', 'Truong', 'Tu', 'Tu/Hien', 'Tu/Nghiem', 'Tu/phung', 'Tuan', 'Tuan/An', 'Tuan-dat', 'Vang', 'Vinh', 'Vinh/Diep', 'Vu', 'Vu - Lan', 'Vu/lan', 'Vu/lan/hien', 'Vu-dat']
        var selDef = 0;

        var inputsHtml = [], tabIndex = 0;
        for (var i in this.params.inputs) {
            var val = '', display = '';
            if (iV.hasOwnProperty(i)) val = iV[i];
            if (i == 'pic') {
                display = 'style="display:none"';
                if ($.inArray(val, pics) == -1) {
                    pics[pics.length - 1] = val;
                };
                selDef = $.inArray(val.replace('value=', ''), pics);
            };
            inputsHtml[inputsHtml.length] = '<label for="purePopupInputs_' + i + '">' + this.params.inputs[i] + '</label><input ' + display + val + ' maxlength="' + ((i == 'notes') ? "50" : "20") + '" id="purePopupInputs_' + i + '" name="' + i + '" type="text" tabindex="' + (tabIndex++) + '">';
        };

        var opts = '';
        for (var z = 0; z < pics.length; z++) {
            var selected = ''; if (selDef == z) { selected = 'selected="selected"'; };
            opts += '<option value="' + pics[z] + '"' + selected + '>' + pics[z] + '</option>'
        }
        inputsHtml[0] += '<select id="pic" name="pic" class="flexselect" onchange="$(' + "'#purePopupInputs_pic').val($(this).val())" + '">' + opts + '</select>';

        var buttonsHtml = '';
        for (var i in this.params.buttons) buttonsHtml += '<span class="purePopupButton _' + i + '_">' + this.params.buttons[i] + '</span>';

        inputsHtml[inputsHtml.length] = inputsHtml[inputsHtml.length - 1];
        inputsHtml[inputsHtml.length - 2] = '<div class="sel-div"><input type="checkbox" name="opt1" ' + iV["opt1"] + '><span>KIEM TRA SAN PHAM DAU</span></div>' +
                                            '<div class="sel-div"><input type="checkbox" name="opt2" ' + iV["opt2"] + '><span>HUONG SO VAI CUA CHI TIET</span></div>' +
                                            '<div class="sel-div endinput"><input type="checkbox" name="opt3" ' + iV["opt3"] + '><span>KIEM TRA HUONG SILICON</span></div>';

        //
        this.wrap.innerHTML = '<div>' +
                                '<div>' +
                                    ((this.params.title != '') ? ('<div class="purePopupTitle">' + this.params.title + '</div>') : '') +
                                    inputsHtml.join('') +
                                    buttonsHtml +
                                '</div>' +
                               '</div>';
        this.show();
    }

    window.PurePopup = new Popup();
}());

function iframeEditTaskID() {
    IsDonePost = true;
    $.ajax({
        url: url_noty,
        type: "GET",
        data: {
            "kind": 'getall',
            "hostid": hostID,
            "MayCat": MayCat,
            "EachDate": EachDate
        },
        dataType: 'json',
        cache: false,
        timeout: 5000, //5 second timeout
        success: function (data, textStatus, xhr) {
            if (data.length > 0) {
                PurePopup.alert(data, function (result) {
                    IsDonePost = false; //down flag
                    if (result.confirm == 'okButton') {
                        this.params.initMAP["Extra"] = [MayCat, EachDate];
                        _WC.get_noty('reorder', JSON.stringify(this.params.initMAP));
                    };
                });
            } else {
                IsDonePost = false; //down flag
            };
        },
        error: function (xhr, textStatus, errorThrown) {
            IsDonePost = false; //down flag
        }
    });



    //$("#nav-icon2").switchClass("Lean_Mode", "ShowUI", 'slow');
    ////////verify_guestDomain();
    ////////adjustUI = new $.Deferred(), loadIFrame = new $.Deferred()
    //////////
    ////////$.when(adjustUI.promise(), loadIFrame.promise()).done(function (returnPara1, returnPara2) {
    ////////    //$('#loadInputScreen').css('display', 'none');
    ////////    $('#inputFrame').css({ 'height': $(window).height(), 'position': 'static' });//set height for smooth slide
    ////////    switchPage('11', 'slide-in-from-top');
    ////////});
    ////////Show_UI();
    ////////iFrameEditor();
};