const css = require("css");

const EOF = Symbol('EOF');

const layout = require("./layout.js")

let currentToken = null;
let currentAttribute = null;

let stack = [{ type: 'document', children: [] }]
let currentTextNode = null

let rules = []
// 新增addCSSRules 将css规则暂存到一个数组里
function addCSSRules(text) {
    var ast = css.parse(text)
    rules.push(...ast.stylesheet.rules)
}

/**
 * 选择器匹配 当前只处理简单选择器(.class #id tagName)
 * @param {*} element
 * @param {*} selector
 */
function match(element, selector) {
    if (!selector || !element.attributes) { // 如果是文本节点 不予处理 <div id="text">你好</div>
        return false
    }

    if (selector.charAt(0) === '#') {
        var attr = element.attributes.filter(attr => attr.name === 'id')[0]
        if (attr && attr.value === selector.replace('#', '')) {
            return true
        }
    } else if (selector.charAt(0) === '.') {
        var attr = element.attributes.filter(attr => attr.name === 'class')[0]
        if (attr && attr.value === selector.replace('.', '')) {
            return true
        }
    } else {
        if (element.tagName === selector) {
            return true
        }
    }
    return false
}

function computeCSS(element) {
    var elements = stack.slice().reverse()
    if (!element.computedStyle) {
        element.computedStyle = {}
    }

    for (let rule of rules) {
        var selectorParts = rule.selectors[0].split(" ").reverse()

        if (!match(element, selectorParts[0])) {
            continue
        }

        let matched = false

        var j = 1 // 当前选择器位置
        for (var i = 0; i < elements.length; i++) { // i 当前元素的位置
            if (match(elements[i], selectorParts[j])) {
                j++
            }
        }
        if (j >= selectorParts.length) {
            matched = true
        }

        if (matched) {
            var sp = specificity(rule.selectors[0])
            var computedStyle = element.computedStyle
            for (var declaration of rule.declarations) {
                if (!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {}
                }
                if (!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
            }
        }
    }
}

function emit(token) {
    let top = stack[stack.length - 1]

    if (token.type == 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: []
        }

        element.tagName = token.tagName

        for (let p in token) {
            if (p != 'type' && p != 'tagName') {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        // 在入栈时计算css属性
        computeCSS(element)

        top.children.push(element)
        // element.parent = top

        if (!token.isSelfClosing) {
            stack.push(element)
        }
        
        currentTextNode = null
    } else if (token.type == 'endTag') {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!")
        } else {
            // 匹配css规则 (当前只包含style标签和内联css的写法)
            if (top.tagName === 'style') {
                addCSSRules(top.children[0].content)
            }
            layout(top)
            stack.pop()
        }
        currentTextNode = null
    } else if (token.type == 'text') {
        if (currentTextNode == null) {
            currentTextNode = {
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content
    }
}

// 计算css优先级
function specificity(selector) {
    // 内联 id class tagName
    var p = [0, 0, 0, 0]
    // 假定复合选择器中只有简单选择器 div div #id .class
    var selectorParts = selector.split(' ')
    for (var part of selectorParts) {
        if (part.charAt(0) == "#") {
            p[1] += 1
        } else if (part.charAt(0) == ".") {
            p[2] += 1
        } else {
            p[3] += 1
        }
    }
    return p
}

function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0]
    }
    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1]
    }
    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2]
    }
    return sp1[3] - sp1[3]
}

// 匹配的标签类型 开始标签 | 结束标签 | 自封闭标签
function data(c) {
    if (c === "<") {
        return tagOpen;
    } else if (c == EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        emit({
            type: 'text',
            content: c
        });
        return data
    }
}

function tagOpen(c) {
    if (c === "/") {
        // 匹配结束标签 左尖括号之后紧跟 '/'
        return endTagOpen
    } else if (c.match(/^[a-zA-Z]$/)) {
        // 如果匹配到英文字母 则为开始标签或自封闭标签
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c)
    } else {
        return
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        }
         return tagName(c)
    } else if (c == '>') {

    } else if (c == EOF) {

    } else {

    }
}

function tagName(c) {
    // 匹配到空格 说明后面其后是属性 <html prop ... 
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
        // 匹配到 '/' 说明为自封闭标签 <hr/>
    } else if (c == "/") {
        return selfClosingStartTag
        // 若匹配英文字符 意味着当前标签名称匹配尚未结束 将字符追加到当前tagName中
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c
        return tagName
        // 普通的开始标签
    } else if (c == ">") {
        emit(currentToken);
        return data
    } else {
        return tagName
    }
}

// 处理属性
function beforeAttributeName(c) {
    // 即将开始处理属性 <html prop... 
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
        // 属性已结束
    } else if (c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c)
        // 属性不会以 '=' 开头 不予处理
    } else if (c == "=") {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c)
    }
}

function attributeName(c) {
    // 属性结束
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c)
        // 进入属性value处理逻辑 id="tag"
    } else if (c == "=") {
        return beforeAttributeValue
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'" || c == "<") {

    } else {
        currentAttribute.name += c
        return attributeName
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue
    } else if (c == "\"") {
        return doubleQuotedAttributeValue
    } else if (c == "\'") {
        return singleQuotedAttributeValue
    } else if (c == '>') {

    } else {
        return UnquotedAttributeValue(c)
    }
}

function doubleQuotedAttributeValue(c) {
    if (c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (c == '\u0000') {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}

function singleQuotedAttributeValue(c) {
    if (c == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (c == '\u0000') {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return singleQuotedAttributeValue
    }
}

function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    } else if (c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == '\u0000') {

    } else if (c == '\"' || c == "'" || c == '<' || c == '=' || c == '`') {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return UnquotedAttributeValue
    }
}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName
    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c == "=") {
        return beforeAttributeValue
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c)
    }
}

function selfClosingStartTag(c) {
    // 标签关闭
    if (c == '>') {
        currentToken.isSelfClosing = true
        emit(currentToken)
        return data
    } else if (c == 'EOF') {

    } else {

    }
}

module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state = state(EOF);
    return stack[0]
}