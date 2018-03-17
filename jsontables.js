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