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
 * @param {String} id  页面
 */
function $(id) { return document.getElementById(id); }
/**
 * 判断是否是数组
 * @param   {Array|String|Number}  obj  数组或其他对象参数
 * @return  {Boolean}
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
 * @param {Object}   obj                待格式化的对象
 * @param {Number}   indent             缩进
 * @param {Boolean}  addComma           是否加逗号
 * @param {Boolean}  isArray            是否是数组
 * @param {Boolean}  isPropertyContent  是否为键值
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
 * @param {String}  literal  字符
 * @param {String}  quote    引号
 * @param {String}  comma    逗号
 * @param {Number}  indent   缩进
 * @param {Boolean} isArray  是否数组
 * @param {String}  style    样式
 * @returns {String}
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
 * @param {Number} indent   缩进
 * @param {Object} obj      对象
 * @returns {String}
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

/**
 * 获取行
 * @param {Number}  indent            缩进个数
 * @param {Object}  data              JSON数据
 * @param {Boolean} isPropertyContent 是否为键值
 * @returns {String}
 * @constructor
 */
function GetRow(indent, data, isPropertyContent) {
    var tabs = '';
    for (var i = 0; i < indent && !isPropertyContent; i++) tabs += TAB;

    if (data != null && data.length > 0 && data.charAt(data.length - 1) !== '\n') data += '\n';

    return tabs + data;
}
/**
 * 显示控制
 * @constructor
 */
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

/**
 * 收缩JSON
 * @constructor
 */
function CollapseAllClicked() {
    EnsureIsPopulated();

    TraverseChildren($('Canvas'), function(element) {

        if (element.className === 'collapsible') {
            MakeContentVisible(element, false);
        }

    }, 0);

}

/**
 * 展开JSON
 * @constructor
 */
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
        // 切换加号和减号
        element.previousSibling.firstChild.src = visible ? ImgExpanded : ImgCollapsed;

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
 * @param {Object}  img HTML图片元素
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
/**
 * 折叠对象层次
 * @param {String}  level  折叠层次
 * @constructor
 */
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
/**
 * 缩进控制
 * @constructor
 */
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

/**
 * 格式化
 * @constructor
 */
function EnsureIsPopulated() {
    // 如果输入不为空、输出为空时
    if (!$('Canvas').innerHTML && !!$('RawJson').value) Process();
}

/**
 * 拼凑字符串
 * @param   {Number}    num  字符串个数(其实是空格个数)
 * @param   {String}    str  待拼凑的字符串(其实是缩进空格单位)
 * @returns {String}
 * @constructor
 */
function MultiplyString(num, str) {
    var sb = [];

    for (var i = 0; i < num; i++) {
        sb.push(str);
    }
    return sb.join('');
}

/**
 * 全选
 * @constructor
 */
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

