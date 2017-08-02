
# scrollspy
一个基于jquery 的滚动监听插件。

## Usage
使用jquery工具方法引用或者当作cmd或amd模块引用
```js
$.scrollspy({});
or
var scrollspy = require('.');
scrollspy({})

```
## Options
`navEl`: 导航元素，跟随fixed的元素;

`navListEl`: 导航容器元素，默认就是导航元素;

`navItemEl`: 导航列表元素，默认就是导航容器元素子元素;

`currentCls`:导航列表元素选中样式;

`contentEl`: 需要滚动的内容区域;

`contentTxtCls`: 内容区域要在导航中呈现的文字;

`contentShiftCls`: 内容区域偏移参数;

`navTopH`: 内容区域距离顶部的高度;

`renderNav`: 导航模版生成函数;

`fixedNav`: 导航fixed生成函数;

`scrollFn`: 触发滚动执行;

`enterFn`: 进入区域执行;

`reachFn`: 第一次到达执行;

`loadFn`: 超过到达执行;

## License

  MIT