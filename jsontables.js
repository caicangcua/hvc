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
                };
            },
            error: function (xhr, textStatus, errorThrown) {
                that.start_noty_timer();
                toastr["error"]("Server API ERR. (" + counter_noty_timer + ')');
            }
        });

    };


    var jsonTable = new JSONTable($("#tieude"), $("#content"))
    var tableData = [{
        "0": "N35P8M",
        "1": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1500</div>",
        "2": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1600</div>",
        "3": "<div class='thoigian'>+10'</div><div class='solieu plus'>+100</div>",
        "4": "<div class='thoigian'></div><div class='solieu'></div>"
    },
    {
        "0": "EZ5-04B",
        "1": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1500</div>",
        "2": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1600</div>",
        "3": "<div class='thoigian'>+10'</div><div class='solieu plus'>+100</div>",
        "4": "<div class='thoigian'></div><div class='solieu'></div>"
    },
    {
        "0": "M18C-RH",
        "1": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1500</div>",
        "2": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1600</div>",
        "3": "<div class='thoigian'>+10'</div><div class='solieu plus'>+100</div>",
        "4": "<div class='thoigian'></div><div class='solieu'></div>"
    },
    {
        "0": "N28S-RH",
        "1": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1500</div>",
        "2": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1600</div>",
        "3": "<div class='thoigian'>+10'</div><div class='solieu plus'>+100</div>",
        "4": "<div class='thoigian'></div><div class='solieu'></div>"
    },
    {
        "0": "NB1P",
        "1": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1500</div>",
        "2": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1600</div>",
        "3": "<div class='thoigian'>+10'</div><div class='solieu plus'>+100</div>",
        "4": "<div class='thoigian'></div><div class='solieu'></div>"
    },
    {
        "0": "P211A",
        "1": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1500</div>",
        "2": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1600</div>",
        "3": "<div class='thoigian'>+10'</div><div class='solieu plus'>+100</div>",
        "4": "<div class='thoigian'></div><div class='solieu'></div>"
    },
    {
        "0": "N35P8M",
        "1": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1500</div>",
        "2": "<div class='thoigian'>6:00-9:00</div><div class='solieu'>1600</div>",
        "3": "<div class='thoigian'>+10'</div><div class='solieu plus'>+100</div>",
        "4": "<div class='thoigian'></div><div class='solieu'></div>"
    }];
    jsonTable.fromJSON(tableData);
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
                    "MÁY CẮT LC8 : Ngày 2018/02/21" +
                "</td>" +
                "</tr>" +
            "<tbody id='tieude'><tr class='head2'>" +
                "<td style='position:absolute'>" +
                    "MÃ HÀNG<div class='loading'><div class='round-trip off'></div><div class='open-jaw off'></div><div class='one-way off'></div></div>" +                        
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
    this.fromJSON = function (jsonSourceData) {
        that.table.empty();
        for (var jr = 0; jr < jsonSourceData.length; jr++) {
            var tableDataRow = $('<tr></tr>')
            for (var ki = 0; ki < tableHeaderArray.length; ki++) {
                tableDataRow.append('<td>' + jsonSourceData[jr][tableHeaderArray[ki]] + '</td>');
            }
            that.table.append(tableDataRow);
        }
    }

    //this.tableJSON = this.toJSON()
    //this.tableFullJSON = this.toJSON()
    //this.isTableFiltered = false

    //this.clearTable = function () {
    //    this.table.find("tr").has("td").remove()
    //}

    //this.fromJSON = function (jsonSourceData, setFullJSON) {
    //    if (setFullJSON == undefined) setFullJSON = true;

    //    if (jsonSourceData.length == 0) {
    //        this.clearTable()
    //        return
    //    }
    //    rootTableObject = this.table.clone().empty().append('<thead><tr></tr></thead>')
    //    rootHeaderRow = rootTableObject.find('tr')
    //    tableHeaderKeyArray = []
    //    tableHeaderKeys = Object.keys(jsonSourceData[0])
    //    for (var kc = 0; kc < tableHeaderKeys.length; kc++) {
    //        tableHeaderKeyArray.push(tableHeaderKeys[kc])
    //        $(rootHeaderRow).append('<th>' + tableHeaderKeys[kc] + '</th>')
    //    }
    //    rootTableObject.append("<tbody></tbody>")
    //    for (var jr = 0; jr < jsonSourceData.length; jr++) {
    //        tableDataRow = $('<tr></tr>')
    //        for (var ki = 0; ki < tableHeaderKeyArray.length; ki++) {
    //            tableDataRow.append('<td>' + jsonSourceData[jr][tableHeaderKeyArray[ki]])
    //        }
    //        rootTableObject.find("tbody").append(tableDataRow)
    //    }
    //    this.table.html(rootTableObject[0].innerHTML)
    //    this.tableJSON = jsonSourceData
    //    if (setFullJSON) {
    //        this.tableFullJSON = jsonSourceData
    //    }
    //}

    //this.limitJSON = function () {
    //    var page = 0, limit = 25, updateTableDirectly = false, inputJSON = that.tableJSON;
    //    return inputJSON.slice(page * limit, (page * limit) + limit)
    //}

    //this.filter = function (searchQuery) {
    //    this.isTableFiltered = true
    //    resultList = []
    //    searchQuery = searchQuery.toLowerCase()
    //    sourceTableJSON = this.tableFullJSON
    //    sourceTableJSONLength = sourceTableJSON.length
    //    sourceTableKeys = Object.keys(sourceTableJSON[0])
    //    sourceTableKeysLength = sourceTableKeys.length
    //    searchQuerySplit = searchQuery.split(" ")
    //    searchQuerySplitLength = searchQuerySplit.length
    //    for (fj = 0; fj < sourceTableJSONLength; fj++) {
    //        tempResultListLength = 0
    //        for (ql = 0; ql < searchQuerySplitLength; ql++) {
    //            for (tk = 0; tk < sourceTableKeysLength; tk++) {
    //                if (sourceTableJSON[fj][sourceTableKeys[tk]].toLowerCase().indexOf(searchQuerySplit[ql]) != -1) {
    //                    tempResultListLength++
    //                    break
    //                }
    //            }
    //        }
    //        if ((tempResultListLength == searchQuerySplitLength)) {
    //            resultList.push(sourceTableJSON[fj])
    //        }
    //    }
    //    if (!searchQuery) {
    //        this.isTableFiltered = false
    //        this.tableJSON = this.tableFullJSON
    //        resultList = this.tableFullJSON

    //        this.fromJSON(resultList)
    //    }
    //    else {
    //        this.fromJSON(resultList, false)
    //    }
    //}
}