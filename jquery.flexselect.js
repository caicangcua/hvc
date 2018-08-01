var LiquidMetal = (function () { var i = 0; var a = 1; var e = 0.8; var h = 0.9; var c = 0.85; var d = " \t_-"; return { lastScore: null, lastScoreArray: null, score: function (q, k) { if (k.length === 0) { return e } if (k.length > q.length) { return i } var r = []; var t = q.toLowerCase(); k = k.toLowerCase(); this._scoreAll(q, t, k, -1, 0, [], r); if (r.length == 0) { return 0 } var s = 0, m = []; for (var p = 0; p < r.length; p++) { var l = r[p]; var o = 0; for (var n = 0; n < q.length; n++) { o += l[n] } if (o > s) { s = o; m = l } } s /= q.length; this.lastScore = s; this.lastScoreArray = m; return s }, _scoreAll: function (m, u, j, s, r, l, o) { if (r == j.length) { var p = (u.charAt(0) == j.charAt(0)); var t = p ? h : e; f(l, t, l.length, m.length); o.push(l.slice(0)); return } var q = j.charAt(r); r++; var n = u.indexOf(q, s); if (n == -1) { return } var k = s; while ((n = u.indexOf(q, s + 1)) != -1) { if (b(m, n)) { l[n - 1] = 1; f(l, c, k + 1, n - 1) } else { if (g(m, n)) { f(l, c, k + 1, n) } else { f(l, i, k + 1, n) } } l[n] = a; s = n; this._scoreAll(m, u, j, s, r, l, o) } } }; function g(k, j) { var l = k.charAt(j); return ("A" <= l && l <= "Z") } function b(k, j) { var l = k.charAt(j - 1); return (d.indexOf(l) != -1) } function f(n, k, m, l) { for (var j = m; j < l; j++) { n[j] = k } return n } })(); (function (a) { a.flexselect = function (b, c) { this.init(b, c) }; a.extend(a.flexselect.prototype, { settings: { allowMismatch: false, allowMismatchBlank: true, sortBy: "score", blankSortBy: "initial", preSelection: true, hideDropdownOnEmptyInput: false, selectedClass: "flexselect_selected", dropdownClass: "flexselect_dropdown", showDisabledOptions: false, inputIdTransform: function (b) { return b + "_flexselect" }, inputNameTransform: function (b) { return }, dropdownIdTransform: function (b) { return b + "_flexselect_dropdown" } }, select: null, input: null, dropdown: null, dropdownList: null, cache: [], results: [], lastAbbreviation: null, abbreviationBeforeFocus: null, selectedIndex: 0, picked: false, allowMouseMove: true, dropdownMouseover: false, indexOptgroupLabels: false, init: function (b, c) { this.settings = a.extend({}, this.settings, c); this.select = a(b); this.reloadCache(); this.renderControls(); this.wire() }, reloadCache: function () { var c, e, f, d; var b = this.settings.indexOptgroupLabels; this.cache = this.select.find("option").map(function () { c = a(this).text(); e = a(this).parent("optgroup").attr("label"); f = b ? [c, e].join(" ") : c; d = a(this).parent("optgroup").attr("disabled") || a(this).attr("disabled"); return { text: a.trim(f), name: a.trim(c), value: a(this).val(), disabled: d, score: 0 } }) }, renderControls: function () { var b = this.settings.preSelection ? this.select.find("option:selected") : null, c = this; this.input = a("<input type='text' autocomplete='off' />").attr({ id: this.settings.inputIdTransform(this.select.attr("id")), name: this.settings.inputNameTransform(this.select.attr("name")), accesskey: this.select.attr("accesskey"), tabindex: this.select.attr("tabindex"), style: this.select.attr("style"), placeholder: this.select.attr("data-placeholder") }).addClass(this.select.attr("class")).val(a.trim(b ? b.text() : "")).css({ visibility: "visible" }); this.dropdown = a("<div></div>").attr({ id: this.settings.dropdownIdTransform(this.select.attr("id")) }).addClass(this.settings.dropdownClass); this.dropdownList = a("<ul></ul>"); this.dropdown.append(this.dropdownList); this.select.after(this.input).hide(); a("body").append(this.dropdown); a(window).on("resize", function () { c.dropdown.hide() }) }, wire: function () { var c = this; this.input.click(function () { c.lastAbbreviation = null; c.focus() }); this.input.mouseup(function (d) { d.preventDefault() }); this.input.focus(function () { c.abbreviationBeforeFocus = c.input.val(); c.input[0].setSelectionRange(0, c.input.val().length); if (!c.picked) { c.filterResults() } }); this.input.blur(function () { if (!c.dropdownMouseover) { c.hide(); if (c.settings.allowMismatchBlank && a.trim(a(this).val()) == "") { c.setValue("") } else { if (!c.settings.allowMismatch && !c.picked) { c.reset() } } } }); this.dropdownList.mouseover(function (d) { if (!c.allowMouseMove) { c.allowMouseMove = true; return } if (d.target.tagName == "LI") { var e = c.dropdown.find("li"); c.markSelected(e.index(a(d.target))) } }); this.dropdownList.mouseleave(function () { c.markSelected(-1) }); this.dropdownList.mouseup(function (d) { c.pickSelected(); c.focusAndHide() }); this.dropdownList.bind("touchstart", function (d) { if (d.target.tagName == "LI") { var e = c.dropdown.find("li"); c.markSelected(e.index(a(d.target))) } }); this.dropdown.mouseover(function (d) { c.dropdownMouseover = true }); this.dropdown.mouseleave(function (d) { c.dropdownMouseover = false }); this.dropdown.mousedown(function (d) { d.preventDefault() }); this.input.keyup(function (d) { switch (d.keyCode) { case 13: d.preventDefault(); c.pickSelected(); c.focusAndHide(); break; case 27: d.preventDefault(); c.reset(); c.focusAndHide(); break; default: c.filterResults(); break } }); this.input.keydown(function (d) { switch (d.keyCode) { case 9: c.pickSelected(); c.hide(); break; case 33: d.preventDefault(); c.markFirst(); break; case 34: d.preventDefault(); c.markLast(); break; case 38: d.preventDefault(); c.moveSelected(-1); break; case 40: d.preventDefault(); c.moveSelected(1); break; case 13: case 27: d.preventDefault(); d.stopPropagation(); break } }); var b = this.input; this.select.change(function () { b.val(a.trim(a(this).find("option:selected").text())) }) }, filterResults: function () { var d = this.settings.showDisabledOptions; var e = a.trim(this.input.val()); var c = (e == "") ? this.settings.blankSortBy : this.settings.sortBy; if (e == this.lastAbbreviation) { return } var b = []; a.each(this.cache, function () { if (this.disabled && !d) { return } this.score = LiquidMetal.score(this.text, e); if (this.score > 0) { b.push(this) } }); this.results = b; this.sortResultsBy(c); this.renderDropdown(); this.markFirst(); this.lastAbbreviation = e; this.picked = false; this.allowMouseMove = false; if (this.settings.hideDropdownOnEmptyInput) { if (e == "") { this.dropdown.hide() } else { this.dropdown.show() } } }, sortResultsBy: function (b) { if (b == "score") { this.sortResultsByScore() } else { if (b == "name") { this.sortResultsByName() } } }, sortResultsByScore: function () { this.results.sort(function (d, c) { return c.score - d.score }) }, sortResultsByName: function () { this.results.sort(function (d, c) { return d.name < c.name ? -1 : (d.name > c.name ? 1 : 0) }) }, renderDropdown: function () { var f = this.settings.showDisabledOptions; var e = this.dropdown.outerWidth() - this.dropdown.innerWidth(); var d = this.input.offset(); this.dropdown.css({ width: (this.input.outerWidth() - e) + "px", top: (d.top + this.input.outerHeight()) + "px", left: d.left + "px", maxHeight: "" }); var c = ""; var b = ""; a.each(this.results, function () { if (this.disabled && !f) { return } b = this.disabled ? ' class="disabled"' : ""; c += "<li" + b + ">" + this.name + "</li>" }); this.dropdownList.html(c); this.adjustMaxHeight(); this.dropdown.show() }, adjustMaxHeight: function () { var c = a(window).height() + a(window).scrollTop() - this.dropdown.outerHeight(); var b = parseInt(this.dropdown.css("top"), 10); this.dropdown.css("max-height", b > c ? (Math.max(0, c - b + this.dropdown.innerHeight()) + "px") : "") }, markSelected: function (f) { if (f < 0 || f >= this.results.length) { return } var b = this.dropdown.find("li"); b.removeClass(this.settings.selectedClass); var d = a(b[f]); if (d.hasClass("disabled")) { this.selectedIndex = null; return } this.selectedIndex = f; d.addClass(this.settings.selectedClass); var c = d.position().top; var e = c + d.outerHeight() - this.dropdown.height(); if (e > 0) { this.allowMouseMove = false; this.dropdown.scrollTop(this.dropdown.scrollTop() + e) } else { if (c < 0) { this.allowMouseMove = false; this.dropdown.scrollTop(Math.max(0, this.dropdown.scrollTop() + c)) } } }, pickSelected: function () { var b = this.results[this.selectedIndex]; if (b && !b.disabled) { this.input.val(b.name); this.setValue(b.value); this.picked = true } else { if (this.settings.allowMismatch) { this.setValue.val("") } else { this.reset() } } }, setValue: function (b) { if (this.select.val() === b) { return } this.select.val(b).change() }, hide: function () { this.dropdown.hide(); this.lastAbbreviation = null }, moveSelected: function (b) { this.markSelected(this.selectedIndex + b) }, markFirst: function () { this.markSelected(0) }, markLast: function () { this.markSelected(this.results.length - 1) }, reset: function () { this.input.val(this.abbreviationBeforeFocus) }, focus: function () { this.input.focus() }, focusAndHide: function () { this.focus(); this.hide() } }); a.fn.flexselect = function (b) { this.each(function () { if (a(this).data("flexselect")) { a(this).data("flexselect").reloadCache() } else { if (this.tagName == "SELECT") { a(this).data("flexselect", new a.flexselect(this, b)) } } }); return this } })(jQuery);