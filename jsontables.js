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
        that.stop_noty_timer();
        //
        //$.ajax({
        //    url: url_noty,
        //    type: 'GET',
        //    dataType: 'json',
        //    cache: false,
        //    timeout:3000, //3 second timeout
        //    success: function (data, textStatus, xhr) {
        //        that.start_noty_timer();
        //        toastr["success"]("Get json success." + counter_noty_timer);
        //    },
        //    error: function (xhr, textStatus, errorThrown) {
        //        that.start_noty_timer();
        //        toastr["error"]("Get json error." + counter_noty_timer);
        //    }
        //});

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
            timeout: 3000, //3 second timeout
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

                    if (data['FF_MayCat'] != null && data['FF_MayCat'] != '') {
                        headertitle = data['FF_MayCat'] + ' - Ngày: ' + data['EachDate'];
                        //
                        if (data['Lines'] != null) {
                            isChangeSide = jsonTable.fromJSON(data['Lines']);
                        } else {
                            isChangeSide = jsonTable.clearTable();
                        };
                    } else {
                        isChangeSide = jsonTable.clearTable();
                    };
                    //
                    var dogHEADER1 = $('#head1');
                    if (dogHEADER1.text() != $("<div>" + headertitle + "</div>").text() || isChangeSide) {
                        dogHEADER1.html(headertitle);
                        $(window).trigger('resize');
                    };
                };
            },
            error: function (xhr, textStatus, errorThrown) {
                that.start_noty_timer();
                toastr["error"]("Server API ERR. (" + counter_noty_timer + ')');
            }
        });
    };
    var jsonTable = new JSONTable($("#tieude"), $("#content"))
    //
    loader_frm = $('.loader_frm').detach();
    //
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
    that.start_noty_timer();//check new data from server API
}

function CreateTableFromJSON(tbHeader) {
    var newsec = $("<table id='tbhead'>" +
            "<tr>" +
                "<td id='head1' class='head1' colspan='5' style='text-align:center'>" +
                    "<div class='nomachine'><h1>MACHINE VERIFING ...</h1></div>" +
                "</td>" +
                "</tr>" +
            "<tbody id='tieude'><tr class='head2'>" +
                "<td style='position:relative'>" +
                    "<div class='loading'><div class='round-trip'></div><div class='open-jaw'></div><div class='one-way'></div></div>MÃ HÀNG" +
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
            "</tr></tbody>" +
    "</table>" +
    "<div class='table-responsive'><table id='content'></table></div>");

    $('#dulieu')['append'](newsec).ready(function () {
        // test jquery deffer!
        tbHeader.resolve($('#head1').length);
    });
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
        var newROWs = $.makeArray($(jsonSourceData).map(function (index) {
            return this['C0'];
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
            var taskID = jsonSourceData[jr]['C' + tableHeaderArray[0]];
            if (existROWs.hasOwnProperty(taskID)) {
                $(existROWs[taskID]).find('.solieu').each(function (i, fuck) {
                    var _val = jsonSourceData[jr]['C' + (i + 1)].split('|');
                    $(fuck).text(_val[1]);
                });
            } else {
                var tableDataRow = $("<tr id='" + taskID + "'></tr>")
                for (var ki = 0; ki < tableHeaderArray.length; ki++) {
                    if (ki == 0) {
                        tableDataRow.append('<td>' + jsonSourceData[jr]['C' + tableHeaderArray[ki]] + '</td>');
                    } else {
                        var _val = jsonSourceData[jr]['C' + tableHeaderArray[ki]].split('|');
                        var color = ''; if (ki == 2) { color = "style='color:blue'" };
                        tableDataRow.append('<td>' + "<div class='thoigian'>" + _val[0] + "</div><div " + color + " class='solieu'>" + _val[1] + "</div>" + '</td>');
                    };
                };
                that.table.append(tableDataRow);
            };
        }
        return isChangeSize;
    }
}