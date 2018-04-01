var loader_frm, url_noty = 'http://brick.dnd.vn/api/Lines';

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
        workScreen();
    });

    tbData.resolve('c', 'd');
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

    this.get_noty = function (causeby) {
        //causeby : 'timer','history':yesterday, 7 days ... 'include':Include dismiss, Only dismiss ...
        animate_Loading('removeClass', 'stop', '#tieude');
        that.stop_noty_timer();
        //
        $.ajax({
            url: url_noty,
            type: "POST",
            data: {
                "kind": 'androidbox',
                "hostid": hostID,
                "hostip": hostIP,
                "hostmodel": hostNAME
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
                        headertitle = data['FF_MayCat'] + ' - Ngày: ' + data['EachDate'];
                        //
                        if (data['Lines'] != null) {
                            if (nodataEL.length > 0) nodataEL.remove();
                            isChangeSide = jsonTable.fromJSON(data['Lines']);
                        } else {
                            isChangeSide = jsonTable.clearTable();
                            //
                            if ($('#donelineRow').length > 0) {
                                lineDoneUI();//remove wait next
                            };
                            //
                            if (nodataEL.length == 0) $el.append('<div class="nomachine" id="nodataMsg"><h1>NO DATA</h1></div>');
                        };
                    } else {
                        if (nodataEL.length > 0) nodataEL.remove();
                        isChangeSide = jsonTable.clearTable();
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
    };
    var jsonTable = new JSONTable($("#tieude"), $("#content"));
    that.get_noty();// get json from webAPI first time when loaded!
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
function dateDiff(txt) {
    txt = txt.split('-');
    var d1 = new Date('2000/1/1 ' + txt[0]), d2 = new Date('2000/1/1 ' + txt[1]), diff = new Date(d2) - new Date(d1);
    return Math.floor((diff / 1000) / 60);
}
function countLechTime(inputTime) {
    var THs = $('#donelineRow th');
    var T1 = dateDiff($(THs[0]).find('.thoigian').text());
    var T2 = dateDiff(inputTime);
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
            if (dateDiff($(el).val()) > -1) {
                isTG = $(el).val(); countLechTime(isTG);
            } else {
                $($('#donelineRow th')[2]).find('.thoigian').text('-');
            };
        };
        isSL = $(el).parent().parent().find("#inputSL").val();
    } else {
        var tg = $(el).parent().parent().find("#inputThoiGian");
        if (tg.mask() != '' && tg.mask().length == 8 && dateDiff(tg.val()) > -1) { isTG = tg.val() };
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
    //var rmvlineRow = new $.Deferred(), headDonePanel = new $.Deferred()
    //////
    //$.when(rmvlineRow.promise(), headDonePanel.promise()).done(function (returnPara1, returnPara2) {
    //    $("#headDonePanel").attr('rowspan', 1);
    //    $(window).trigger('resize', 0);
    //});
    //$("#donelineRow").fadeOut('slow', function () { //fade
    //    $(this).remove(); //then remove from the DOM
    //    rmvlineRow.resolve();
    //});

    //$("#headDonePanel .pricingdiv").addClass('slide-out').one('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend',
    //                function (event) {
    //                    $(this).remove(); //then remove from the DOM
    //                    headDonePanel.resolve();
    //                });
    $("#headDonePanel .pricingdiv").remove();
    $("#donelineRow").remove()
    $("#headDonePanel").attr('rowspan', 1).prepend($("<span id='tasktitle'>MÃ HÀNG</span>"));
    $(window).trigger('resize', 0);
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
        } else if (dateDiff(inputThoiGian.val()) < 0) {
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
    if ($(el).hasClass('btndone-gray')) {
        showDoneERR();
        return;
    } else if (!confirm('Confirm before DONE!')) {
        return;
    };

    lineDoneUI(el);

    $.ajax({
        url: url_noty,
        type: "POST",
        data: {
            "kind": 'taskdone',
            "hostid": hostID,
            "hostip": hostIP,
            "hostmodel": hostNAME,
            "donedata": $(el).data['done-data'] + '|' + $('#doneTxt').val(),
            "taskrow": $(el).attr('data-taskrow')
        },
        dataType: 'json',
        cache: false,
        timeout: 5000, //5 second timeout
        success: function (data, textStatus, xhr) {

        },
        error: function (xhr, textStatus, errorThrown) {
        }
    });
}

function actPanel(focusItem, waitItems) {
    var _taskInfo = focusItem['C0'].split('|');
    var tmp = "<div class='pricingdiv init-slidein'>" +
                        "<a href='javascript:void(0)' " + (waitItems > 1 ? '' : ("style='display:none'")) + " class='starburst'>" +
                           "<span><span><span>" +
                              "<div id='waitItems' style='font-size:.4rem'>" + waitItems + "</div><div style='font-size:.2rem'>TASK(s)</div>Wait Done!" +
                           "</span></span></span>" +
                        "</a>" +
                    "<ul class='theplan'>" +
                        "<li class='nomachine'><h1>" + _taskInfo[0] + "</h1></li>" +
                        "<li class='activeInfo'><div>Lớp: " + _taskInfo[2] + "<br>Dài: " + _taskInfo[4] + "M<br>CT: " + _taskInfo[1] + "<br/>VẢI: " + _taskInfo[3] + "</div>" +
                            "<div class='btndone btndone-gray' data-taskrow='" + _taskInfo[5] + "' onclick='lineDone(this)'>DONE!</div>" +
                        "</li>" +
                    "</ul>" +
                "</div";
    return tmp;
}
function actInfo(focusItem, waitItems) {
    var _val = focusItem['C1'].split('|');
    //
    var tmp = "<tr id='donelineRow' class='head3' style='display:none'>" +
                    "<th>" +
                            "<div class='thoigian'>" + _val[0] + "</div><div class='solieu'>" + _val[1] + "</div>" +
                    "</th>" +
                    "<th>" +
                        "<div class='thoigian' style='overflow: hidden;position:relative'><input id='inputThoiGian' placeholder='00:00-00:00' type='tel' onblur='doneBTN(this,0)'></div>" +
                        "<div style='color:blue;overflow: hidden;position:relative' class='solieu'><input onblur='doneBTN(this,1)' placeholder='0' id='inputSL' type='tel' maxlength='5'></div>" +
                    "</th>" +
                    "<th>" +
                          "<div class='thoigian' style='text-align:right!important'>-</div><div class='solieu'>0</div>" +
                    "</th>" +
                    "<th style='position:relative;overflow:hidden;font-size:0.2rem'>" +
                        "<textarea id='doneTxt' iwrap='soft' style='overflow:hidden; resize:none;font-size:.55rem;color:red;text-align:left' maxlength='50'></textarea>" +
                    "</th>" +
                "</tr>";
    return tmp;
};

function CreateTableFromJSON(tbHeader) {
    var newsec = $("<table id='tbhead'>" +
            "<tr>" +
                "<td  id='head1' class='head1 colTaskID' colspan='5' style='text-align:center'>" +
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
                    "BẤT Thg" +
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

function ShowFocusItem(focusItem, waitItems) {
    if ($('#donelineRow').length == 0) {
        var rmvlineRow = new $.Deferred(), headDonePanel = new $.Deferred()
        $.when(rmvlineRow.promise(), headDonePanel.promise()).done(function (returnPara1, returnPara2) {
            $(window).trigger('resize', 0);

            $.mask.definitions['~'] = "[+-]";
            $(returnPara1).find("#inputThoiGian").mask("99:99-99:99");
            $(returnPara1).find("#inputSL").ForceNumericOnly();

            //$("input").blur(function () {
            //    $("#nav-icon2").html("Unmasked value: " + $(this).mask());
            //}).dblclick(function () {
            //    $(this).unmask();
            //});
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

        var focusItem = null, waitItems = 0;
        for (var jr = 0; jr < jsonSourceData.length; jr++) {
            if (jsonSourceData[jr]['IsFocused'] == '1' && jsonSourceData[jr]['IsDone'] == '0') {
                if (!focusItem) { focusItem = jsonSourceData[jr]; }
                waitItems += 1;
            }
        };

        if (focusItem) {
            var dog = $.grep(jsonSourceData, function (n) {
                return n != focusItem;
            });
            jsonSourceData = dog;
        };


        if ($('#donelineRow').length > 0) {
            if (focusItem) {
                var _c0 = focusItem['C0'].split('|');
                if (_c0[0] != $('.theplan h1').text()) {
                    lineDoneUI();//remove wait next
                    ShowFocusItem(focusItem, waitItems);
                } else {
                    // udpate waiting done
                    var panel = $(actPanel(focusItem, waitItems)).html();
                    $("#headDonePanel .pricingdiv").html(panel);
                    var _val = focusItem['C1'].split('|');
                    $("#donelineRow").find("th:first").find('.thoigian').each(function (i, fuck) {
                        if ($(fuck).text() != _val[0]) {
                            $(fuck).text(_val[0]);// khác thời gian
                            $('#inputThoiGian').trigger('blur');
                        }
                        if ($(fuck).next().text() != _val[1]) {
                            $(fuck).next().text(_val[1]);// khác số lượng
                            $('#inputSL').trigger('blur');
                        }
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


        var newROWs = $.makeArray($(jsonSourceData).map(function (index) {
            return this['C0'].split('|')[0];
        }));

        var existROWs = {};
        var isChangeSize = false;
        if (newROWs.length == 0) {
            that.table.empty();// clear all table rows
            isChangeSize = true;
        } else {
            $(that.table).find('tr').each(function (index, el) {
                if (newROWs.indexOf(el.id) == -1) {
                    $(el).remove(); //remove this row
                    isChangeSize = true;
                } else {
                    //update value of row
                    existROWs[el.id] = el;
                };
            });
        };
        //
        for (var jr = 0; jr < jsonSourceData.length; jr++) {
            var taskID = jsonSourceData[jr]['C' + tableHeaderArray[0]].split('|')[0];
            if (existROWs.hasOwnProperty(taskID)) {
                var existR = $(existROWs[taskID]);
                existR.find('.thoigian').each(function (i, fuck) {
                    var _val = jsonSourceData[jr]['C' + (i + 1)].split('|');
                    $(fuck).text(_val[0]);
                    $(fuck).next().text(_val[1]);
                });
                existR.find('.colabnormal').text(jsonSourceData[jr]['C4']);
                var _taskInfo = jsonSourceData[jr]['C0'].split('|');
                existR.find('.half-circle-ribbon').html('Lớp: ' + _taskInfo[2] + '<br/>Dài: ' + _taskInfo[4] + 'M<br/>CT: ' + _taskInfo[1] + '<br/>VẢI: ' + _taskInfo[3] +
                                                                                          '<div style="top:auto;right:0px;bottom:0px" class="starburst">' +
                              (jsonSourceData[jr].IsDone == '1' ? ('<div class="donestatus">DONE</div>') : '')
                              );
            } else {
                isChangeSize = true;
                var tableDataRow = $("<tr id='" + taskID + "'></tr>");
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
                            newtd = '<td>' + "<div class='thoigian'>" + _val[0] + "</div><div " + color + " class='solieu'>" + _val[1] + "</div>" + '</td>';
                        };
                        tableDataRow.append(newtd);
                    };
                };
                that.table.append(tableDataRow);
            };
        }
        return isChangeSize;
    }
}