# easy-browser
基于node环境实现一个简单的浏览器，主要包括http请求获取Document，dom树构建，cssom构建，排版，渲染等过程

## 目录结构

``` bash
├── .client.js                  # 客户端
├── .layout.js                  # 排版
├── .parser.js                  # 解析
├── .render.js                  # 渲染
├── .server.js                  # 服务端
```
## 聊一聊为什么要搞明白浏览器的工作原理
> 浏览器应该是程序员日常使用最多的工具了，在目前流行的前后端分离的浪潮下，浏览器在前端工程师那里显得就更加重要了。所以前端性能优化也是前端圈里永恒的话题。前端的性能优化当然要懂得浏览器的工作原理，不然你永远只知其然不知其所以然。

## 学过浏览器的工作原理之后，我们能做哪些前端性能优化，并解释其原理
### 1. 为什么要把css文件放在head标签，js文件放在body标签最下面？
### 2. 为什么要动态加载组件或者说懒加载，其原理是什么？
### 3. 为什么重排比重绘更耗时，如何避免重排和重绘？
### 4. 包括vue中的v-for为什么要加key值,学完浏览器的工作原理之后你会对这个问题有重新的认识

## 学完浏览器的五大步骤，我们将学习到哪些知识点？
>其实前端百分之七十的知识都是和浏览器相关，搞明白浏览器的工作原理，你将能覆盖百分之七八十的前端知识。
我们在浏览器中手敲一个url，到最后看到的图片(Bitmap)经历了以下5个步骤：
>Bitmap传给我们的显卡驱动设备，它才能转换成我们人眼所能识别的光信号。
### 第一步 发送http请求，获取一个html文件
首先需要了解一下七层网络模型
>会话，表示，应用这三层是http层，对应node里的‘http’包，传输层(TCP)，基于node环境，TCP层对应一个‘net’包，，在这里我们基于传输层手动实现一个http协议。
网络层就是internet层，数据链路和物理层就是我们常说的4G/5G/WiFi
#### 1. http状态解析
Request组成部分
```
POST/HTTP/1.1  --->Request Line
Host:127.0.0.1  --->headers 行数不定 以空行结束
Content-Type:application/x-www-from-urlencoded
                --->空行
name=husanfeng  --->body
```
Respones组成部分
```
HTTP/1.1 200 OK --->statue line
Content-Type:text/html --->headers 行数不定 以空行结束
Date:Mon,23Dec 2019 06:46:11
Connection:keep-alive

26  --->body
<html></html>
0
```

### 第二步 解析html文件，构建DOM树
#### 1. 有限状态机处理字符串

### 第三步 解析CSS文件，构建CSSOM
#### 1. CSSOM是一个带样式的DOM树
#### 2. 选择器的优先级
行内样式>id选择器>类选择器>tag选择器

### 第四步 计算每个DOM元素产生盒的位置

### 第五步 渲染
