# 第四周 浏览器工作原理

## 1. 浏览器总论｜浏览器工作原理总论

> URL(HTTP) -> HTML(parse) -> DOM(css computing) -> DOM with CSS(layout) -> DOM with position(render) -> Bitmap

## 2. 状态机｜有限状态机

- 每一个状态都是一个机器
  - 在每一个机器里，我们可以做计算、存储、输出
  - 所有的这些机器接受的输入是一致的
  - 状态机的每一个机器本身没有状态，如果我们用函数来表示的话，它应该是纯函数（无副作用）
- 每一个机器知道下一个状态
  - 每个机器都有确定的下一个状态（Moore）
  - 每个机器根据输入决定下一个状态（Mealy）

### JS中的有限状态机（Mealy）

```javascript
// 每个函数都是一个状态
function state(input) { // 函数参数就是输入
  // 在函数中，可以自由地编写代码，处理每个状态的逻辑
  return next; // 返回值作为下一个状态
}

///// 以下是调用 /////
while (input) {
  // 获取输入
  state = state(input); // 把状态机的返回值作为下一个状态
}
```

## 3. 状态机｜不使用状态机处理字符串（一）

在一个字符串中，找到字符“a”

```javascript
function match(string) {
  for (let c of string) {
    if (c === 'a') return true
  }
  return false
}

match('I am groot')
```

## 4. 状态机｜不使用状态机处理字符串（二）

在一个字符串中，找到字符“ab”

```javascript
function match(string) {
  let foundA = false
  for (let c of string) {
    if (c == 'a') {
      foundA = true
    } else if (foundA && c == 'b') {
      return true
    } else {
      foundA = false
    }
  }
  return false
}
```

## 5. 状态机｜不使用状态机处理字符串（三）

在一个字符串中，找到字符“abcdef”

注：示例代码运行结果并不符合，abcdef 返回 true，abcddef 也返回 true。

```javascript
function match(string) {
  let foundA = false
  let foundB = false
  let foundC = false
  let foundD = false
  let foundE = false
  for (let c of string) {
    if (c === 'a') {
      foundA = true
    } else if (foundA && c === 'b') {
      foundB = true
    } else if (foundB && c === 'c') {
      foundC = true
    } else if (foundC && c === 'd') {
      foundD = true
    } else if (foundD && c === 'e') {
      foundE = true
    } else if (foundE && c === 'f') {
      return true
    } else {
      foundA = false
      foundB = false
      foundC = false
      foundD = false
      foundE = false
    }
  }

  return false
}
```

## 6. 状态机｜使用状态机处理字符串（一）

使用状态机，找到“abcdef”

```javascript
function match(string) {
  let state = start
  for (let c of string) {
    state = state(c)
  }
  return state === end
}

function start(c) {
  if (c === 'a') {
    return foundA
  } else {
    return start(c)
  }
}

function end(c) {
  return end
}

function foundA(c) {
  if (c === 'b') {
    return foundB
  } else {
    return start(c)
  }
}

function foundB(c) {
  if (c === 'c') {
    return foundC
  } else {
    return start(c)
  }
}

function foundC(c) {
  if (c === 'd') {
    return foundD
  } else {
    return start(c)
  }
}

function foundD(c) {
  if (c === 'e') {
    return foundE
  } else {
    return start(c)
  }
}

function foundE(c) {
  if (c === 'f') {
    return end
  } else {
    return start(c)
  }
}
```

## 7. 状态机｜使用状态机处理字符串（二）

使用状态机，找到字符“abcabx”

```javascript
function match(string) {
  let state = start
  for (let c of string) {
    state = state(c)
  }
  return state === end
}

function start(c) {
  if (c === 'a') {
    return foundA
  } else {
    return start(c)
  }
}

function end(c) {
  return end
}

function foundA(c) {
  if (c === 'b') {
    return foundB
  } else {
    return start(c)
  }
}

function foundB(c) {
  if (c === 'c') {
    return foundC
  } else {
    return start(c)
  }
}

function foundC(c) {
  if (c === 'a') {
    return foundA2
  } else {
    return start(c)
  }
}

function foundA2(c) {
  if (c === 'b') {
    return foundB2
  } else {
    return start(c)
  }
}

function foundB2(c) {
  if (c === 'x') {
    return end
  } else {
    return foundB(c)
  }
}
```

## 8. HTTP请求｜HTTP的协议解析

ISO-OSI七层网络模型

- 应用
- 表示
- 会话
- 传输
- 网络
- 数据链路
- 物理层

为方便理解，可以大概如此对应：

- HTTP
  - 应用
  - 表示
  - 会话
- TCP
  - 传输
- Internet
  - 网络
- 4G/5G/Wi-Fi
  - 数据链路
  - 物理层

### TCP与IP的一些基础知识

- 流
- 端口
- require('net')

>

- 包
- IP地址
- libnet（构造IP包并发送）/libpcap（从网卡抓取所有流经的IP包）

### HTTP

- Request
- Response

Request 和 Response 一一对应。

## 9. HTTP请求｜服务端环境准备

服务端代码见 server.js

一个简单的 HTTP 请求示例：

```
POST / HTTP/1.1
Host: 127.0.0.1
Content-Type: application/x-www-form-urlencoded

field1=aaa&code=x%3D1
```
HTTP 协议是一个文本型协议，其中的内容都是用字符串表示。

第一行称为 Request line，其中第一部分是 Method，本例中是 "POST"；第二部分是访问的地址，本例中是 "/"；第三部分是 HTTP 及其版本，本例中是 "HTTP/1.1"。

Request line 下面的是 headers，其中的内容以键值对的形式表示，行数不固定，以一个空行结束。

headers 下面是 body，body 的格式由 headers 中的 Content-Type 决定。

HTTP 协议中的换行都是 "\r\n"。

## 10. HTTP 请求｜实现一个HTTP请求

见 client.js

第一步 HTTP请求总结

- 设计一个HTTP请求的类
- Content-Type 是一个必要的字段，要有默认值
- body 是 KV 格式
- 不同的 Content-Type 影响 body 的格式

## 11. HTTP请求｜send函数的编写，了解response格式

第二步 send 函数总结

- 在 Request 的构造器中收集必要的信息
- 设计一个 send 函数，把请求真实发送到服务器
- send 函数应该是异步的，所以返回 Promise

一个简单的 Response 示例：

```
HTTP/1.1 200 OK
Content-Type: text/html
Date: Mon, 23 Dec 2019:06:46:19 GMT
Connection:keep-alive
Transfer-Encoding: chunked

26
<html><body>Hello World</body></html>
0
```

第一行称为 status line，第一部分是 HTTP 及其版本，本例中是 "HTTP/1.1"；第二部分是 HTTP 状态吗，本例中是 "200"；第三部分是 HTTP 状态文本，本例中是 "OK"。下面是 headers，以空行结束。再下面是body。

## 12. HTTP请求｜发送请求

- 设计支持已有的 connection 或者自己新建 connection
- 收到数据传给 parser
- 根据 parser 的状态 resolve Promise

## 13. HTTP请求｜response请求

- Response 必须分段构造，所以我们要用一个 ResponseParser 来“装配”
- ResponseParser 分段处理 ResponseText，我们用状态机来分析文本的结构

## 14. HTTP请求｜response body的解析

- Response 的 body 可能根据 Content-Type 有不同的结构，因此我们会采用子 Parser 的结构来解决问题
- 以 TrunkedBodyParser 为例，我们同样用状态机来处理 body 的格式

## 15. HTML解析｜HTML parser模块的文件拆分

- 为了方便文件管理，我们把parser单独拆分到文件中
- parser 接受 HTML 文本作为参数，返回一棵 DOM 树

## 16. HTML解析｜用FSM实现HTML的分析

- 在HTML标准中，已经规定了HTML的状态
- Toy-Browser只挑选其中一部分状态，完成一个最简版本

## 17. HTML解析｜解析标签

- 主要的标签有：开始标签，结束标签和自封闭标签
- 在这一步暂时忽略属性

## 18. HTML解析｜创建元素

- 在状态机中，出了状态迁移，我们还会要加入业务逻辑
- 在标签结束状态提交标签token

## 19. HTML解析｜处理属性

- 属性值分为单引号、双引号、无引号三种写法，因此需要较多状态处理
- 处理属性的方式跟标签类似
- 属性结束时，把属性加到标签Token上

## 20. HTML解析｜用token构建DOM树

- 从标签构建DOM树的基本技巧是使用栈
- 遇到开始标签时创建元素并入栈，遇到结束标签时出栈
- 自封闭节点可视为入栈后立刻出栈
- 任何元素的父元素是它入栈前的栈顶元素

## 21. HTML解析｜将文本节点加到DOM树

- 文本节点与自封闭标签处理类似
- 多个文本节点需要合并