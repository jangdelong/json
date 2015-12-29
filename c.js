var TAB           = '',
    SINGLE_TAB    = '  ',
    ImgCollapsed  = 'Collapsed.gif',
    ImgExpanded   = 'Expanded.gif',
    QuoteKeys     = true,
    IsCollapsible = true,
    _dateObj      = new Date(),
    _regexpObj    = new RegExp();
/**
 * 获取DOM元素
 * @param {string} id  页面
 */
function $(id) { return document.getElementById(id); }
/**
 * 判断是否是数组
 * @param   {object|string|number}  obj  数组或其他对象参数
 * @return  {boolean}
 */
function IsArray(obj) {
    return  obj && typeof obj === 'object' && typeof obj.length === 'number' && !(obj.propertyIsEnumerable('length'));
}

/**
 * 执行代码格式化
 *
 */
function Process() {
    SetTab();
    IsCollapsible = $('CollapsibleView').checked;
    var json             = $('RawJson').value,
        html             = '';
    try {
        if (json === '' || json.replace(/^\s+$/, '') === '') {
            json = '""';
            alert('JSON为空');
            $('RawJson').value = '';
            $('RawJson').focus();
        }
        var obj = eval('[' + json + ']');
        html = ProcessObject(obj[0], 0, false, false, false);

        $('Canvas').innerHTML = '<pre class="CodeContainer">' + html + '</pre>';
    } catch (e) {
        alert('JSON数据格式不正确:\n' + e.message);
        $('Canvas').innerHTML = '';
    }
}

/**
 * 处理对象类型数据
 * @param {object}   obj                待格式化的对象
 * @param {number}   indent             缩进
 * @param {boolean}  addComma           是否加逗号
 * @param {boolean}  isArray            是否是数组
 * @param {boolean}  isPropertyContent  是否为键值
 *
 */
function ProcessObject(obj, indent, addComma, isArray, isPropertyContent) {
    var html     = '',
        comma    = (addComma) ? '<span class="Comma">,</span> ' : '',
        type     = typeof obj,
        clpsHtml = '';

    if (IsArray(obj)) {
        if (obj.length == 0) {
            html += GetRow(indent, '<span class="ArrayBrace">[ ]</span>' + comma, isPropertyContent);
        } else {
            clpsHtml = IsCollapsible ? '<span><img src="' + window.ImgExpanded + '" onclick="ExpImgClicked(this)" /></span><span class="collapsible">' : '';
            html    += GetRow(indent, '<span class="ArrayBrace">[</span>' + clpsHtml, isPropertyContent);
            for (var i = 0, len = obj.length; i < len; i++) {
                html += ProcessObject(obj[i], indent + 1, i < (obj.length - 1), true, false);
            }
            clpsHtml = IsCollapsible ? '</span>' : '';
            html    += GetRow(indent, clpsHtml + '<span class="ArrayBrace">]</span>' + comma);
        }
    } else if (type === 'object') {
        if (obj == null) {
            html += FormatLiteral('null', '', comma, indent, isArray, 'Null');
        } else if (obj.constructor == _dateObj.constructor) {
            html += FormatLiteral('new Date(' + obj.getTime() + ') /*' + obj.toLocaleString() + '*/', '', comma, indent, isArray, 'Date');
        } else if (obj.constructor == _regexpObj.constructor) {
            html += FormatLiteral('new RegExp(' + obj + ')', '', comma, indent, isArray, 'RegExp');
        } else {
            var numProps = 0;
            for (var prop in obj) numProps++;
            if (numProps === 0) {
                html += GetRow(indent, "<span class='ObjectBrace'>{ }</span>"+comma, isPropertyContent);
            } else {
                clpsHtml = IsCollapsible ? '<span><img src="' + window.ImgExpanded + '" onclick="ExpImgClicked(this)" /></span><span class="collapsible">' : '';
                html += GetRow(indent, "<span class='ObjectBrace'>{</span>"+clpsHtml, isPropertyContent);

                var j = 0;

                for (var prop in obj) {

                    var quote = QuoteKeys ? '"' : '';

                    html += GetRow(indent + 1, '<span class="PropertyName">' + quote + prop + quote + '</span>: ' + ProcessObject(obj[prop], indent + 1, ++j < numProps, false, true));

                }

                clpsHtml = IsCollapsible ? '</span>' : '';
                html    += GetRow(indent, clpsHtml + '<span class="ObjectBrace">}</span>' + comma);
            }
        }
    } else if (type === 'number') {
        html += FormatLiteral(obj, '', comma, indent, isArray, 'Number');
    } else if (type == 'boolean') {
        html += FormatLiteral(obj, '', comma, indent, isArray, 'Boolean');

    } else if (type === 'function') {

        if (obj.constructor === _regexpObj.constructor) {
            html += FormatLiteral('new RegExp(' + obj + ')', '', comma, indent, isArray, 'RegExp');
        } else {
            obj   = FormatFunction(indent, obj);
            html += FormatLiteral(obj, '', comma, indent, isArray, 'Function');
        }
    } else if (type === 'undefined') {
        html += FormatLiteral('undefined', '', comma, indent, isArray, 'Null');
    } else {
        html += FormatLiteral(obj.toString().split('\\').join('\\\\').split('"').join('\\"'), '\"', comma, indent, isArray, 'String');
    }

    return html;

}

/**
 * 格式化字符
 * @param {string}  literal  字符
 * @param {string}  quote    引号
 * @param {string}  comma    逗号
 * @param {number}  indent   缩进
 * @param {boolean} isArray  是否数组
 * @param {string}  style    样式
 * @returns {string}
 *
 */
function FormatLiteral(literal, quote, comma, indent, isArray, style) {
    if (typeof literal === 'string')
        literal = literal.split('<').join('&lt;').split('>').join('&gt;');

    var str = '<span class="' + style + '">' + quote + literal + quote + comma + '</span>';
    if (isArray) str = GetRow(indent, str);
    return str;
}
/**
 * 格式化函数
 * @param {number} indent   缩进
 * @param {object} obj      对象
 * @returns {string}
 *
 */
function FormatFunction(indent, obj) {
    var tabs = '';
    for (var i = 0; i < indent; i++) tabs += TAB;
    var funcStrArray = obj.toString().split('\n'),
        str          = '';
    for (var i = 0; i < funcStrArray.length; i++) {
        str += (i === 0 ? '' : tabs) + funcStrArray[i] + '\n';
    }
    return str;
}

function GetRow(indent, data, isPropertyContent) {
    var tabs = '';
    for (var i = 0; i < indent && !isPropertyContent; i++) tabs += TAB;

    if (data != null && data.length > 0 && data.charAt(data.length - 1) !== '\n') data += '\n';

    return tabs + data;
}

function CollapsibleViewClicked() {
    $('CollapsibleViewDetail').style.visibility = $('CollapsibleView').checked ? 'visible' : 'hidden';
    Process();
}
/**
 * 格式化结果属性是否加引号操作
 * @constructor
 */
function QuoteKeysClicked() {
    QuoteKeys = $('QuoteKeys').checked;
    Process();
}

function CollapseAllClicked() {
    EnsureIsPopulated();

    TraverseChildren($('Canvas'), function(element) {

        if (element.className === 'collapsible') {
            MakeContentVisible(element, false);
        }

    }, 0);

}

function ExpandAllClicked() {
    EnsureIsPopulated();

    TraverseChildren($('Canvas'), function(element) {

        if (element.className === 'collapsible') {
            MakeContentVisible(element, true);
        }

    }, 0);

}

function MakeContentVisible(element, visible) {
    var img = element.previousSibling.firstChild;

    if (!!img.tagName && img.tagName.toUpperCase() === 'IMG') {
        element.style.display = visible ? 'inline' : 'none';
        element.previousSibling.firstChild.src = visible ? window.ImgExpanded : window.ImgCollapsed;

    }
}

function TraverseChildren(element, func, depth) {

    for (var i = 0, len = element.childNodes.length; i < len; i++) {
        TraverseChildren(element.childNodes[i], func, depth + 1);
    }
    func(element, depth);
}
/**
 * 折叠操作
 * @param {object}  img HTML图片元素
 * @constructor
 */
function ExpImgClicked(img) {

    var container = img.parentNode.nextSibling;
    if (!container) return;

    var disp = 'none',
        src  = window.ImgCollapsed;

    if (container.style.display === 'none') {
        disp = 'inline';
        src = window.ImgExpanded;
    }

    container.style.display = disp;

    img.src = src;
}

function CollapseLevel(level) {

    EnsureIsPopulated();

    TraverseChildren($('Canvas'), function(element, depth) {

        if (element.className === 'collapsible') {

            if (depth >= level) {
                MakeContentVisible(element, false);
            } else {
                MakeContentVisible(element, true);
            }
        }
    }, 0);
}

function TabSizeChanged() {
    Process();
}

/**
 * 设置tab
 * @constructor
 */
function SetTab() {
    var select = $('TabSize');
    TAB = MultiplyString(parseInt(select.options[select.selectedIndex].value), window.SINGLE_TAB);
}

function EnsureIsPopulated() {
    if (!$('Canvas').innerHTML && !!$('RawJson').value) Process();
}

function MultiplyString(num, str) {
    var sb = [];

    for (var i = 0; i < num; i++) {
        sb.push(str);
    }
    return sb.join('');
}

function SelectAllClicked() {
    if (!!document.selection && !!document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.removeAllRanges) {
            window.getSelection().removeAllRanges();
        }
    }

    var range = (!!document.body && !!document.body.createTextRange) ? document.body.createTextRange() : document.createRange();

    if (!!range.selectNode) range.selectNode($('Canvas'));
    else if (range.moveToElementText) range.moveToElementText($('Canvas'));

    if (!!range.select) range.select($('Canvas'));
    else window.getSelection().addRange(range);
    // 2015/12/28
}

