# AI Rules

使用：

微信原生小程序

JavaScript

CloudBase

不要第三方UI

每次只生成一个文件

不要省略代码

不要输出"..."。

所有数据库操作放 services

不要直接在页面访问数据库

所有函数中文注释

命名统一 camelCase

等待用户确认以后继续生成下一文件。

## 页面组件规范

默认使用 View 构建页面。

除以下组件外，不建议使用 Text：

- button
- input
- textarea
- image

页面标题、正文、提示文字、Section 标题等统一使用 View，以保证布局一致性和后续扩展能力。