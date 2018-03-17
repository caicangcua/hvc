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