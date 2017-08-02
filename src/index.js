

(function (factory) {
    var root = (function () { return this }).call();
    if (typeof define === 'function') {
        if (define.amd) {//amd
            define(['jquery'], factory);
        }
        if (define.cmd) { //cmd 
            define('scrollspy',/*["jquery"],*/ function (require, exports, module) {
                // var $ = require("jquery");
                return factory($);
            });
        }
    } else if (typeof exports === 'object') { // commonjs for pack
        module.exports = factory();
    } else {
        root.Scrollspy = factory(root.jQuery || root.$);
    }
})(function ($) {
    //  base class
    var Scrollspy = function (options) {
        var self = this;
        self.config = $.extend({}, self.defaults, options);
        //
        self.initial.call(self);
    };
    var Origin = Scrollspy.prototype;
    /**
     * 默认参数
     */
    Origin.defaults = {
        //导航fixed元素
        navEl: null,
        //导航列表父元素
        navListEl: null,
        //导航列表元素
        navItemEl: null,
        //导航选中样式
        currentCls: "current",
        //需要滚动的内容区域
        contentEl: null,
        //区域导航文字
        contentTxtCls: "data-txt",
        //区域偏移参数
        contentShiftCls: "data-shift",
        //内容区域距离顶部的高度
        navTopH: 0,
        //
        renderNav: function (data) {
            var html = "";
            for (var i = 0; i < data.length; i++) {
                html += '<a class="" href="#' + data[i].id + '">' + data[i].txt + '</a>';
            }
            return html;
        },
        //导航fixed操作
        fixedNav: function (el, sign) {
            switch (sign) {
                case 0:
                    el.css({ position: "static" });
                    break;
                case 1:
                    el.css({
                        position: "fixed",
                        display: "block"
                    });
                    break;
                case 2:
                    el.css({ display: "none" });
                    break;
            }
        },
        //触发滚动执行
        scrollFn: {},
        //进入区域执行
        enterFn: {},
        //第一次到达执行
        reachFn: {},
        //超过到达执行
        loadFn: {}
    };
    /**
     * 初始化监听
     */
    Origin.initial = function () {
        var self = this,
            config = self.config;
        //初始化配置参数
        config.navEl = $(config.navEl);
        if (config.navListEl) {
            config.navListEl = config.navEl.find(config.navListEl);
        } else {
            config.navListEl = config.navEl;
        }
        config.contentEl = $(config.contentEl);
        config.contentObj = [];
        config.contentEl.each(function (index, item) {
            var contobj = {};
            contobj.el = $(this);
            contobj.id = contobj.el.attr("id");
            contobj.txt = contobj.el.attr(config.contentTxtCls);
            contobj.shift = parseInt(contobj.el.attr(config.contentShiftCls)) || 0;
            //
            config.contentObj.push(contobj);
        });
        config.isEnter = '';
        config.isReach = {};
        config.isLoad = {};
        //渲染导航
        if (config.renderNav) {
            var html = config.renderNav.call(self, config.contentObj);
            config.navListEl.html(html);
        }
        //设置导航节点
        if (config.navItemEl) {
            config.navItemEl = config.navListEl.find(config.navItemEl);
        } else {
            config.navItemEl = config.navListEl.children();
        }
        //滚动初始
        self.scrollFlow();
        //滚动事件
        self.scrollEvents();
    };
    /**
     * 滚动改变状态
     */
    Origin.scrollFlow = function () {
        var self = this,
            config = self.config;
        //
        if (!config.contentObj.length) return;
        //
        var winScrollTop = $(window).scrollTop(),
            docHeight = $(document).height(),
            winHeight = $(window).height(),
            maxScrollTop = docHeight - winHeight;
        //
        $.each(config.contentObj, function (index, item) {
            var Jelem = item.el;
            item.offsetTop = Jelem.offset().top - config.navTopH;
            //重置fakeOffsetTop
            item.fakeOffsetTop = item.offsetTop;
            item.height = Jelem.height();
            item.offsetBot = Math.round(item.offsetTop + item.height);
            //针对设置偏移量设置fakeOffsetTop
            if (item.shift) {
                item.fakeOffsetTop = item.offsetTop + item.shift;
            }
            //针对滚动不到的区域添加fakeOffsetTop
            if (item.offsetTop >= maxScrollTop) {
                item.fakeOffsetTop = maxScrollTop;
            }
        });
        //
        var fistElTop = config.contentObj[0].offsetTop,
            lastElBot = config.contentObj[config.contentObj.length - 1].offsetBot,
            //是否已经超过上边界
            isAbove = winScrollTop >= fistElTop,
            //是否已经超过下边界
            isBelow = winScrollTop >= lastElBot,
            //0为未超过上边界,1为中间,2为超过下边界
            isDown = isAbove + isBelow;
        //
        config.fixedNav.call(self, config.navEl, isDown);
        //执行回调方法
        $.each(config.contentObj, function (index, item) {
            //判断是否进入区域
            var offsetTop, nextItem, nextOffsetTop;
            offsetTop = item.fakeOffsetTop || item.offsetTop;
            nextItem = config.contentObj[index + 1];
            if (nextItem) {
                nextOffsetTop = nextItem.fakeOffsetTop || nextItem.offsetTop;
            } else {
                nextOffsetTop = item.offsetBot;
            }
            // hack 浮点导致的计算有误,所以需要-2
            nextOffsetTop = nextOffsetTop - 2;
            //当滚动高度大于元素距顶高度 且 小于下个元素距顶高度
            if ((winScrollTop >= offsetTop) && (winScrollTop < nextOffsetTop)) {
                config.navItemEl.removeClass(config.currentCls);
                $(config.navItemEl[index]).addClass(config.currentCls);
                //执行每一次进入的方法
                if (config.isEnter !== item.id) {
                    config.isEnter = item.id;
                    config.enterFn[item.id] && config.enterFn[item.id].call(self, item);
                }
                //执行第一次进入的方法(未进入浏览器框时加载)
                if (!config.isReach[item.id]) {
                    config.isReach[item.id] = true;
                    config.reachFn[item.id] && config.reachFn[item.id].call(self, item);
                }
            }
            /**
             * 浏览器底部已触及元素顶部时加载(往下滚动)
             * 当浏览器顶部滚动到元素底部位置(往上滚动)
             * (未进入浏览器框时加载)
             */
            if ((winScrollTop <= offsetTop) && (winScrollTop + winHeight >= offsetTop) || (winScrollTop >= offsetTop) && (winScrollTop < nextOffsetTop)) {
                //执行第一次进入的方法(未进入浏览器框时加载)
                if (!config.isLoad[item.id]) {
                    config.isLoad[item.id] = true;
                    config.loadFn[item.id] && config.loadFn[item.id].call(self, item);
                }
            }
            //
            config.scrollFn[item.id] && config.scrollFn[item.id].call(self, item);
        });
    };

    /**
     * 初始化监听
     */
    Origin.scrollEvents = function () {
        var self = this,
            config = self.config;
        // 
        self.scrollEvent = self.throttle(function (e) {
            self.scrollFlow.call(self, e);
        }, 25);;
        // 
        self.navClickEvent = function (e) {
            var Jself = $(this);
            config.navItemEl.removeClass(config.currentCls);
            Jself.addClass(config.currentCls);

            var Jthis = this.tagName.toLowerCase() == "a" ? $(this) : $(this).find("a"),
                contId = Jthis.attr("href"),
                offsetTop;
            //获取
            for (var i = 0; i < config.contentObj.length; i++) {
                if (config.contentObj[i].id == contId.split("#")[1]) {
                    offsetTop = config.contentObj[i].fakeOffsetTop || config.contentObj[i].offsetTop;
                    break;
                }
            }
            if (!offsetTop) {
                offsetTop = $(contId).offset().top - config.navTopH;
            }
            $(window).scrollTop(offsetTop);
            e.preventDefault();
        }

        //滚动监听
        $(window).on("scroll", self.scrollEvent);
        //点击监听
        config.navItemEl.on("click", self.navClickEvent);
    };
    /**
     * 组件销毁
     */
    Origin.destroy = function (callback) {
        var self = this,
            config = self.config;
        $(window).off("scroll", self.scrollEvent);
        config.navItemEl.on("click", self.navClickEvent);
        //
        callback && callback.call(this);
    };

    /**
     * 节流(underscore)
     */
    Origin.throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        // 上次执行时间点
        var previous = 0;
        if (!options) options = {};
        // 延迟执行函数
        var later = function () {
            // 若设定了开始边界不执行选项，上次执行时间始终为0
            previous = options.leading === false ? 0 : +new Date();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function () {
            var now = +new Date();
            // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
            if (!previous && options.leading === false) previous = now;
            // 延迟执行时间间隔
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
            // remaining大于时间窗口wait，表示客户端系统时间被调整过
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
                //如果延迟执行不存在，且没有设定结尾边界不执行选项
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    /**
     * 添加jq方法
     */
    $.scrollspy = function (options) {
        return new Scrollspy(options);
    };
    /**
     * 添加模块方法
     */
    return function scrollspy(options) {
        return new Scrollspy(options);
    };
});
