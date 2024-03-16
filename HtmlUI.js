/** HtmlUI :) **/

let HtmlUIInitialized = true;

//Custom Debug Handler
var ___HtmlUIListener = function(arrayListener) {
    var t = this;

    t._event = {};
    t._event._events = {};
    t._event.listenEvent = {
        on: function(type, fn) {
            if (!t._event._events[type]) {
                t._event._events[type] = [];
            }

            t._event._events[type].push(fn);
        },
        _execEvent: function(type) {
            if (!t._event._events[type]) return;

            l = t._event._events[type].length;

            if (!l) {
                return;
            }

            t._event._events[type].forEach(function(call) {

                call();
            });
        }
    }

    for (var a = 0; a < arrayListener.length; a++) {
        t[arrayListener[a]] = function() {}
    }
    t.arraysListener = arrayListener;
}

var HtmlUI_DebugListener = new ___HtmlUIListener(["all", "logerror", "promiserejected", "log", "error", "warning", "info"]);
var HtmlUI_Debug_Console = true;
function HtmlUI_DebugConsole(active = true) {
    HtmlUI_Debug_Console = active;
}

var UIConsole = {
    log: window.console.log,
    error: window.console.error,
    warn: window.console.warn,
    info: window.console.info,
    debugging: window.console.debug,
    limitText: function(text, maxLength) {
        text = new String(text);
        var txt = "";
        for (var i = 0; i < Math.min(maxLength, text.length); i++) {
            txt += text.charAt(i);
        }
        if (maxLength == Math.min(maxLength, text.length)) {
            txt += `... (${text.length - maxLength} character remaining)`;
        }
        return txt;
    },
    debug: function(debugType, debugName, debugTxt = "", debugListener, noLimit = false) {
        var debugTime = new Date();
        var debugText = "`" + `[${debugTime.toLocaleString()}:${debugTime.getMilliseconds()}] HtmlUI ${debugName}:\n${noLimit ? debugTxt: UIConsole.limitText(debugTxt, 4000)}` + "`";
        try {
            var debugFn = new Function(`
                UIConsole.${debugType}(${debugText})
                `);
            if (HtmlUI_Debug_Console) {
                debugFn();
            }
        }
        catch(e) {}
        UIConsole.currentDebug = {
            type: debugType,
            name: debugName,
            text: debugTxt,
            time: debugTime,
            listener: debugListener
        };
        HtmlUI_DebugListener._event.listenEvent._execEvent(debugListener);
        HtmlUI_DebugListener._event.listenEvent._execEvent("all");
    },
    currentDebug: {}
}

HtmlUI_DebugListener.arraysListener.forEach(function(e) {
    HtmlUI_DebugListener[e] = function(callback) {
        HtmlUI_DebugListener._event.listenEvent.on(e, function() {
            callback(UIConsole.currentDebug);
        });
    }
});

window.addEventListener("error", function(e) {
    if (e.message == "ResizeObserver loop limit exceeded") {
        e.preventDefault();
    } else {
        if (e.error && e.error.stack) {
            e.preventDefault();
            if (HtmlUI_Debug_Console) {
                //UIConsole.error(`[${new Date().toLocaleString()}:${new Date().getMilliseconds()}] HtmlUI Log Error:\n${UIConsole.limitText(e.error.stack, 1500)}`);
            }
            UIConsole.debug("error", "Log Error", e.error.stack, "logerror");
        }
    }
});
window.addEventListener("unhandledrejection", function(e) {
    if (HtmlUI_Debug_Console) {
        //UIConsole.error(`[${new Date().toLocaleString()}:${new Date().getMilliseconds()}] HtmlUI Log Promise Rejected:\n${UIConsole.limitText(e.reason, 1500)}`);
    }
    UIConsole.debug("error", "Log Promise Rejected", e.reason, "promiserejected");
    e.preventDefault();
});

window.console.log = function() {
    var message = "";
    for (var i in arguments) {
        message += arguments[i] + (arguments[arguments.length - 1] != arguments[i] ? " ": "");
    }
    UIConsole.debug("log", "Console Log", message, "log", true);
}
window.console.error = function() {
    var message = "";
    for (var i in arguments) {
        message += arguments[i] + (arguments[arguments.length - 1] != arguments[i] ? " ": "");
    }
    UIConsole.debug("error", "Console Error", message, "error");
}
window.console.warn = function() {
    var message = "";
    for (var i in arguments) {
        message += arguments[i] + (arguments[arguments.length - 1] != arguments[i] ? " ": "");
    }
    UIConsole.debug("warn", "Console Warning", message, "warning");
}
window.console.info = function() {
    var message = "";
    for (var i in arguments) {
        message += arguments[i] + (arguments[arguments.length - 1] != arguments[i] ? " ": "");
    }
    UIConsole.debug("info", "Console Info", message, "info");
}
window.console.debug = function() {
    var message = "";
    for (var i in arguments) {
        message += arguments[i] + (arguments[arguments.length - 1] != arguments[i] ? " ": "");
    }
    UIConsole.debug("debugging", "Console Debug", message, "debug");
}
/** **/

//Component Required
var SuperGesture;
if (SuperGesture) SuperGesture = window.SuperGesture;
else {
    SuperGesture = function() {
        throw new Error(`Component "SuperGesture" is missing`);
    }
}

var Mustache;
if (Mustache) Mustache = window.Mustache;
else {
    Mustache = function() {
        throw new Error(`Component "Mustache" is missing`);
    }
}

var DynamicColor;
if (DynamicColor) DynamicColor = window.DynamicColor;
else {
    DynamicColor = function() {
        throw new Error(`Component "DynamicColor" is missing`);
    }
}
/** **/

//HtmlUI Styles
var HtmlUIStyles = document.createElement("style");
var HtmlUI_Carousel_Button_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"><g style="transform: translate(-3px,7.5px) rotate(-45deg)"><rect y="3" x="3" width="1.75" height="9" fill="white"></rect><rect x="3" y="3" width="9" height="1.75" fill="white"></rect><rect x="6.5" y="-0.875" width="10.25" height="1.75" fill="white" transform="rotate(45 0 0)"></rect></g></svg>';
HtmlUIStyles.textContent = `
html, body {
margin: 0px !important;
padding: 0px !important;
user-select: none;
zoom: 100% !important;
}

.htmlui-style {
display: block;
position: relative;
}

.htmlui-style.htmlui-scroller {
overflow: hidden !important;
touch-action: none !important;
}
.htmlui-style.htmlui-scroller > htmlui-scroller-content {
position: relative !important;
display: block;
}

.htmlui-style.htmlui-carousel {
overflow: hidden !important;
touch-action: none !important;
}
.htmlui-style.htmlui-carousel > htmlui-carousel-content {
position: relative !important;
display: flex !important;
}
.htmlui-style.htmlui-carousel > htmlui-carousel-content > * {
flex-shrink: 0 !important;
}
.htmlui-style.htmlui-carousel > htmlui-carousel-content.vertical {
display: block !important;
width: 100% !important;
}
.htmlui-style.htmlui-carousel > .htmlui-carousel-button {
background-image: url('${HtmlUI_Carousel_Button_SVG}');
background-size: 14px 14px;
background-color: rgba(0,0,0,0.5);
background-repeat: no-repeat;
background-position: 48.75% 50%;
display: block !important;
width: 34px;
height: 34px;
border-radius: 100%;
position: absolute !important;
border: none;
box-sizing: border-box !important;
outline: none !important;
z-index: 1 !important;
}
.htmlui-style.htmlui-carousel > .htmlui-carousel-button.disabled {
visibility: hidden;
}
.htmlui-style.htmlui-carousel > .htmlui-carousel-button:not(.vertical) {
top: 50% !important;
}
.htmlui-style.htmlui-carousel > .htmlui-carousel-button.vertical {
left: 50% !important;
}
.htmlui-style.htmlui-carousel > htmlui-carousel-button-prev {
left: 16px;
transform: translateY(-50%) rotate(0deg) !important;
}
.htmlui-style.htmlui-carousel > htmlui-carousel-button-next {
right: 16px;
transform: translateY(-50%) rotate(180deg) !important;
}
.htmlui-style.htmlui-carousel > htmlui-carousel-button-prev.vertical {
top: 16px;
transform: translateX(-50%) rotate(90deg) !important;
}
.htmlui-style.htmlui-carousel > htmlui-carousel-button-next.vertical {
bottom: 16px;
transform: translateX(-50%) rotate(-90deg) !important;
}

.htmlui-style.htmlui-scroller > htmlui-pull-to-refresh, .htmlui-style.htmlui-overscroll > htmlui-pull-to-refresh {
display: flex !important;
justify-content: center !important;
width: 100% !important;
position: absolute !important;
top: 0px !important;
left: 0px !important;
overflow: hidden;
z-index: 100;
}
.htmlui-style.htmlui-scroller > htmlui-pull-to-refresh > htmlui-refresh-progress-background, .htmlui-style.htmlui-overscroll > htmlui-pull-to-refresh > htmlui-refresh-progress-background {
display: flex !important;
border-radius: 100% !important;
background-color: rgba(0, 0, 0, 0.05);
width: 36px !important;
height: 36px !important;
justify-content: center;
align-items: center;
position: absolute;
bottom: calc((48px - 36px) / 2);
}
.htmlui-style.htmlui-scroller > htmlui-pull-to-refresh > htmlui-refresh-progress-background > htmlui-refresh-circle, .htmlui-style.htmlui-overscroll > htmlui-pull-to-refresh > htmlui-refresh-progress-background > htmlui-refresh-circle {
display: block !important;
border-radius: 100% !important;
border-top: 4px solid black;
border-bottom: 4px solid black;
border-left: 4px solid transparent;
border-right: 4px solid transparent;
width: 16px !important;
height: 16px !important;
}

.htmlui-style.htmlui-overflow-scroll {
overflow: hidden !important;
touch-action: none !important;
}

.htmlui-style.htmlui-overscroll {
display: block !important;
overflow: hidden !important;
touch-action: none !important;
}
.htmlui-style.htmlui-overscroll > htmlui-content-overflow-scroll-layer {
display: block !important;
overflow: hidden !important;
position: absolute !important;
left: 0px;
top: 0px;
}
.htmlui-style.htmlui-overscroll > htmlui-content-overflow-scroll-layer > htmlui-content-overflow-scroll {
display: block !important;
overflow: hidden !important;
position: relative !important;
left: 0px !important;
top: 0px !important;
}

.htmlui-style.htmlui-overscroll > htmlui-overscroll-glow-effect {
display: block !important;
position: absolute !important;
width: 100%;
height: 0%;
border-radius: 100%;
}
.htmlui-style.htmlui-overscroll > htmlui-overscroll-glow-effect.horizontal {
width: 0%;
height: 100%;
}

.htmlui-style.htmlui-mustache {
display: block;
overflow: hidden !important;
}
.htmlui-style.htmlui-mustache > .htmlui-mustache-content {
display: block;
overflow: auto;
width: 100%;
height: 100%;
}

.htmlui-style.htmlui-pan-zoom {
display: block !important;
position: relative;
overflow: hidden !important;
touch-action: pan-x pan-y !important;
}
.htmlui-style.htmlui-pan-zoom.has-zoom {
touch-action: none !important;
}
.htmlui-style.htmlui-pan-zoom > .htmlui-pan-zoom-content {
position: absolute !important;
display: block !important;
transform-origin: 50% 50% !important;
}
.htmlui-style.htmlui-pan-zoom > .htmlui-pan-zoom-content.media {
object-fit: contain !important;
user-drag: none !important;
}
.htmlui-overflow-snap-scroll {
scroll-snap-type: initial !important;
scroll-behavior: initial !important;
touch-action: none !important;
}

[htmlui-layout="fill"] {
width: 100% !important;
height: 100% !important;
}
[htmlui-layout="fixed-height"] {
width: 100% !important;
}
[htmlui-layout="no-display"] {
display: none !important;
}
[htmlui-layout="flex-row"] {
display: flex !important;
flex-direction: row !important;
}
[htmlui-layout="flex-column"] {
display: flex !important;
flex-direction: column !important;
}
[htmlui-layout="container"] {
display: block !important;
width: auto !important;
height: auto !important;
}

htmlui-main {
display: flex !important;
flex-direction: column !important;
width: 100% !important;
height: 100% !important;
overflow: hidden !important;
position: relative !important;
background-color: white;
color: black;
transform: translate(0px, 0px);
pointer-events: auto !important;
}
htmlui-main[activity] {
position: fixed !important;
visibility: hidden !important;
left: 0px !important;
top: 0px !important;
will-change: transform !important;
}
htmlui-main[activity][main-activity] {
visibility: visible !important;
}
htmlui-main[activity].hidden {
/**display: none !important;**/
}

htmlui-main > htmlui-content {
display: block !important;
flex-shrink: 0px !important;
width: 100% !important;
height: 100% !important;
overflow: auto !important;
position: relative !important;
}
htmlui-main > htmlui-nav, htmlui-main > htmlui-bottom-nav {
display: flex !important;
flex-shrink: 0 !important;
align-items: center !important;
width: calc(100% - 30px) !important;
height: 40px !important;
padding: 0px 15px !important;
background-color: white;
color: black;
position: relative;
}

htmlui-main > htmlui-viewpager {
display: flex !important;
flex-shrink: 0 !important;
width: 100% !important;
height: 40px !important;
}
htmlui-main > htmlui-viewpager > page {
display: flex !important;
width: 100% !important;
height: calc(40px - 2px);
align-items: center !important;
justify-content: center !important;

border-bottom: 2px solid #EEE;
margin-bottom: 2px;

transition: border-bottom 125ms;
}
htmlui-main > htmlui-viewpager > page.selected {
border-bottom: 2px solid #666;
}

htmlui-main[dark-mode] {
background-color: black;
color: white;
}
htmlui-main[dark-mode] > htmlui-nav, htmlui-main[dark-mode] > htmlui-bottom-nav {
background-color: black;
color: white;
}
htmlui-main[dark-mode] > htmlui-viewpager > page {
border-bottom: 2px solid #222;
}
htmlui-main[dark-mode] > htmlui-viewpager > page.selected {
border-bottom: 2px solid #CCC;
}
htmlui-main > htmlui-nav[translucent] {
position: fixed !important;
background-color: transparent;
z-index: 1000;
}
htmlui-main > htmlui-bottom-nav[translucent] {
position: fixed !important;
bottom: 0px;
background-color: transparent;
z-index: 1000;
}

htmlui-button {
border: none;
outline: none;
padding: 3px 7px;
background-color: #EEE;
transition: background-color 50ms;
border-radius: 4px;
display: inline-block;
color: black;
}
htmlui-button:active {
background-color: #CCC;
}

.htmlui-button {
border: none;
outline: none;
padding: 3px 7px;
background-color: #EEE;
transition: background-color 50ms;
border-radius: 4px;
display: inline-block;
color: black;
}
.htmlui-button:active {
background-color: #CCC;
}
`;
document.head.insertBefore(HtmlUIStyles, document.head.childNodes[0]);
/** **/

//HtmlUI Functions
var HtmlUIBuild = function(el) {
    var elem = typeof el == "string" ? document.querySelector(el): el;
    elem.classList.add("htmlui-style");

    return elem;
}

var HtmlUIDelta = function() {
    var t = this;
    var start = 0,
    end = 0,
    delta = 0;
    t.start = function(value) {
        start = end = value;
        delta = start - end;
    }
    t.set = function(value) {
        start = value;
        delta = start - end;
        end = start;

        return delta;
    }
}

var HtmlUIDimension = function(el, el2) {
    return {
        el: el,
        el2: el2 != null ? el2: el,
        contentWidth: el2 != null ? Math.max(0, el2.scrollWidth - el.clientWidth): 0,
        contentHeight: el2 != null? Math.max(0, el2.scrollHeight - el.clientHeight): 0
    }
}

var HtmlUIListener = ___HtmlUIListener;

var HtmlUIAnimation = function(callback, fps) {
    var t = this,
    delta = new HtmlUIDelta(),
    isAnim = false,
    now = 0,
    prevTick = 0;
    t.isAnim = false;
    t.frameSync = 1;
    t.active = function(value) {
        t.isAnim = value != null ? value: false;
    }

    t.fps = function(_fps) {
        fps = _fps;
    }

    t.anim = function() {
        var time = performance.now();
        if (isAnim == false) {
            isAnim = true;
            delta.start(time);
        }

        now = Math.round((fps || 0) * time / 1000);

        if ((fps != null && (now != prevTick)) || fps == null || !t.isAnim) {
            prevTick = now;
            var deltaTime = delta.set(time);
            t.frameSync = deltaTime / (1000 / 60) || 0;
            callback({
                time: time, deltaTime: deltaTime || (1000 / 60), frameSync: t.frameSync, isAnim: t.isAnim
            });
        }
        if (t.isAnim == true) {
            window.requestAnimationFrame(t.anim);
        } else {
            isAnim = false;
        }
    }
}

var HtmlUISetPosition = function(el, x, y, transform = true, hw = false) {
    if (transform == true) {
        el.style.left = "";
        el.style.top = "";
        el.style.transform = `translate(${x}px, ${y}px) ` + (hw ? "translateZ(0px)": "");
    } else {
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.transform = "";
    }
}

var HtmlUIClamp = function(min, max, value) {
    return value < min ? min: value > max ? max: value;
}

var HtmlUIResize = function(el, callback) {
    new ResizeObserver(function(e) {
        callback(e);
    }).observe(el);
}

var HtmlUIConfig = function(configObject, config) {
    for (var configs in config) {
        configObject[configs] = config[configs];
    }
}

var HtmlUIChilds = function(el, elQuery) {
    var childs = el.querySelectorAll(elQuery),
    arrayChilds = [];
    childs.forEach(function(UIEach) {
        arrayChilds.push(UIEach);
    });

    return arrayChilds;
}

var HtmlUIRepeat = function(value, percent) {
    return value >= 0 ? value%percent: percent - ((0 - value)%percent);
}

var HtmlUIInterval = function(callback, time) {
    var t = this;
    t.isRunning = false;

    t.time = time;

    var UICallback = function() {
        callback({
            date: Date.now(),
            performance: performance.now(),
            isRunning: t.isRunning
        });
        if (t.isRunning) {
            setTimeout(UICallback, t.time);
        }
    }

    t.start = function() {
        if (t.isRunning) return;
        t.isRunning = true;
        UICallback();
    }

    t.stop = function() {
        t.isRunning = false;
    }
}
/** **/

//HtmlUI Components
window.HtmlUI = {
    ScrollView: function(el, config = {}) {
        var t = this;
        t.UIElement = {};

        t.UIElement.main = HtmlUIBuild(el);
        t.UIGesture = new SuperGesture(t.UIElement.main);
        t.UIElement.main.classList.add("htmlui-scroller");
        var UIHtmlRaw = t.UIElement.main.innerHTML;
        var startX = t.UIElement.main.scrollLeft;
        var startY = t.UIElement.main.scrollTop;

        t.UIConfig = {
            scrollX: true,
            scrollY: true,
            friction: 0.0375,
            bounceRate: 0.15,
            bounceBackRate: 0.15,
            dynamicBounce: true,
            dynamicBounceRate: 0.15,
            minDelta: 0.1,
            bounce: true,
            transform: false,
            sensivity: 1,
            fastScroll: false,
            improveAnimation: false,
            bounceDistanceLimits: 48,
            hardware: false,
            content: null
        }
        HtmlUIConfig(t.UIConfig, config);

        if (!t.UIConfig.content) {
            t.UIElement.main.innerHTML = "";

            t.UIElement.content = document.createElement("htmlui-scroller-content");
            t.UIElement.content.innerHTML = UIHtmlRaw;
            t.UIElement.main.appendChild(t.UIElement.content);
        } else {
            t.UIElement.content = typeof t.UIConfig.content == "string" ? HtmlUI.Query("selector", t.UIConfig.content): t.UIConfig.content;
        }

        var UIUpdateDimension = function() {
            t.UIDimension = HtmlUIDimension(t.UIElement.main, t.UIElement.content);
        }
        UIUpdateDimension();

        t.UIListener = new HtmlUIListener(["scroll"]);

        t.UIScroll = {
            x: startX,
            y: startY,
            deltaX: 0,
            deltaY: 0,
            boundX: 0,
            boundY: 0,
            velX: 0,
            velY: 0,
            smoothScroll: false,
            smoothX: 0,
            smoothY: 0,
            smoothRate: 0,
            isPressed: false,
            dynamicBounceX: 0,
            dynamicBounceY: 0,
            dynamicSmoothScroll: false,
            dynamicSmoothScrollRate: 0,
            fastX: 0,
            fastY: 0,
            fastDebounce_1: null,
            fastDebounce_2: null,
            fastDebounce_3: null
        }
        var UIVelDeltaX = new HtmlUIDelta(),
        UIVelDeltaY = new HtmlUIDelta();

        t.UIAnimation = new HtmlUIAnimation(function(e) {
            UIUpdateDimension();

            if (((Math.abs(t.UIScroll.deltaX) > t.UIConfig.minDelta || Math.abs(t.UIScroll.deltaY) > t.UIConfig.minDelta) || (t.UIScroll.x < -0.1 || t.UIScroll.x > t.UIDimension.contentWidth + 0.1) || (t.UIScroll.y < -0.1 || t.UIScroll.y > t.UIDimension.contentHeight + 0.1)) && e.isAnim) {
                if (t.UIScroll.x >= 0 && t.UIScroll.x <= t.UIDimension.contentWidth) {
                    t.UIScroll.dynamicBounceX = 0;

                    t.UIScroll.x = !t.UIConfig.bounce ? HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x - t.UIScroll.deltaX * e.frameSync): t.UIScroll.x - t.UIScroll.deltaX * e.frameSync;
                    t.UIScroll.deltaX += (0 - t.UIScroll.deltaX) * Math.min(1, t.UIConfig.friction * e.frameSync);
                } else {
                    t.UIScroll.dynamicBounceX += (t.UIConfig.bounceBackRate - t.UIScroll.dynamicBounceX) * Math.min(1, t.UIConfig.dynamicBounceRate * e.frameSync);

                    t.UIScroll.x -= t.UIScroll.deltaX * e.frameSync;
                    t.UIScroll.x += (HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x) - t.UIScroll.x) * Math.min(1, (t.UIConfig.dynamicBounce ? t.UIScroll.dynamicBounceX: t.UIConfig.bounceBackRate) * e.frameSync);
                    t.UIScroll.deltaX = HtmlUIClamp(-t.UIDimension.el.clientWidth / (t.UIConfig.bounceDistanceLimits * e.frameSync), t.UIDimension.el.clientWidth / (t.UIConfig.bounceDistanceLimits * e.frameSync), t.UIScroll.deltaX + (0 - t.UIScroll.deltaX) * Math.min(1, t.UIConfig.bounceRate * e.frameSync));
                }

                if (t.UIScroll.y >= 0 && t.UIScroll.y <= t.UIDimension.contentHeight) {
                    t.UIScroll.dynamicBounceY = 0;

                    t.UIScroll.y = !t.UIConfig.bounce ? HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y - t.UIScroll.deltaY * e.frameSync): t.UIScroll.y - t.UIScroll.deltaY * e.frameSync;
                    t.UIScroll.deltaY += (0 - t.UIScroll.deltaY) * Math.min(1, t.UIConfig.friction * e.frameSync);
                } else {
                    t.UIScroll.dynamicBounceY += (t.UIConfig.bounceBackRate - t.UIScroll.dynamicBounceY) * Math.min(1, t.UIConfig.dynamicBounceRate * e.frameSync);

                    t.UIScroll.y -= t.UIScroll.deltaY * e.frameSync;
                    t.UIScroll.y += (HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y) - t.UIScroll.y) * Math.min(1, (t.UIConfig.dynamicBounce ? t.UIScroll.dynamicBounceY: t.UIConfig.bounceBackRate) * e.frameSync);
                    t.UIScroll.deltaY = HtmlUIClamp(-t.UIDimension.el.clientHeight / (t.UIConfig.bounceDistanceLimits * e.frameSync), t.UIDimension.el.clientHeight / (t.UIConfig.bounceDistanceLimits * e.frameSync), t.UIScroll.deltaY + (0 - t.UIScroll.deltaY) * Math.min(1, t.UIConfig.bounceRate * e.frameSync));
                }
            } else {
                if (!t.UIScroll.smoothScroll && e.isAnim) {
                    t.UIScroll.deltaX = 0;
                    t.UIScroll.deltaY = 0;
                    t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x);
                    t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y);
                    t.UIAnimation.active(false);
                }
            }

            if (t.UIScroll.smoothScroll) {
                window.cancelAnimationFrame(t.UIScroll.fastDebounce_1);
                window.cancelAnimationFrame(t.UIScroll.fastDebounce_2);
                window.cancelAnimationFrame(t.UIScroll.fastDebounce_3);

                if (t.UIScroll.dynamicSmoothScroll) {
                    t.UIScroll.dynamicBounceX += (1 - t.UIScroll.dynamicBounceX) * Math.min(1, t.UIScroll.dynamicSmoothScrollRate * e.frameSync);
                    t.UIScroll.dynamicBounceY += (1 - t.UIScroll.dynamicBounceY) * Math.min(1, t.UIScroll.dynamicSmoothScrollRate * e.frameSync);
                }

                t.UIScroll.deltaX = 0;
                t.UIScroll.deltaY = 0;
                var smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.smoothX);
                var smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.smoothY);

                if ((t.UIScroll.x > smoothX - 0.1 && t.UIScroll.x < smoothX + 0.1) && (t.UIScroll.y > smoothY - 0.1 && t.UIScroll.y < smoothY + 0.1)) {
                    t.UIScroll.x = smoothX;
                    t.UIScroll.y = smoothY;
                    t.UIAnimation.active(false);
                    t.UIScroll.smoothScroll = false;
                } else {
                    if (t.UIScroll.dynamicSmoothScroll) {
                        t.UIScroll.x += (smoothX - t.UIScroll.x) * Math.min(1, t.UIScroll.smoothRate * e.frameSync * t.UIScroll.dynamicBounceX);
                        t.UIScroll.y += (smoothY - t.UIScroll.y) * Math.min(1, t.UIScroll.smoothRate * e.frameSync * t.UIScroll.dynamicBounceY);
                    } else {
                        t.UIScroll.x += (smoothX - t.UIScroll.x) * Math.min(1, t.UIScroll.smoothRate * e.frameSync);
                        t.UIScroll.y += (smoothY - t.UIScroll.y) * Math.min(1, t.UIScroll.smoothRate * e.frameSync);
                    }
                }
            }

            if (t.UIScroll.isPressed) {
                if (t.UIConfig.fastScroll) {
                    t.UIScroll.fastX = t.UIScroll.deltaX;
                    t.UIScroll.fastY = t.UIScroll.deltaY;
                } else {
                    t.UIScroll.fastX = 0;
                    t.UIScroll.fastY = 0;
                }
            }

            t.UIScroll.velX = UIVelDeltaX.set(t.UIScroll.x);
            t.UIScroll.velY = UIVelDeltaY.set(t.UIScroll.y);

            t.UIElement.content.style.willChange = (
                (
                    ((t.UIScroll.velX != 0 || t.UIScroll.deltaY != 0) && (t.UIScroll.x != 0 && t.UIScroll.x != t.UIDimension.contentWidth)) ||
                    ((t.UIScroll.velY != 0 || t.UIScroll.deltaY != 0) && (t.UIScroll.y != 0 && t.UIScroll.y != t.UIDimension.contentHeight))
                ) || t.UIScroll.isPressed
            ) && t.UIConfig.improveAnimation ? "transform": "";

            t.UIElement.main.scrollLeft = 0;
            t.UIElement.main.scrollTop = 0;
            HtmlUISetPosition(t.UIElement.content, -t.UIScroll.x, -t.UIScroll.y, t.UIConfig.transform, t.UIConfig.hardware);

            t.UIListener._event.listenEvent._execEvent("scroll");
        });

        t.UIAction = {
            scrollTo: function(x, y, smooth = false,
                dynamic = false) {
                t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
                if (t.UIScroll.dynamicSmoothScroll) {
                    t.UIScroll.dynamicBounceX = 0;
                    t.UIScroll.dynamicBounceY = 0;
                    t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
                }

                UIUpdateDimension();
                t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;
                if ((smooth ? true: false)) {
                    t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                    t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
                } else {
                    t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                    t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
                }

                t.UIScroll.smoothScroll = smooth ? true: false;
                if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                    t.UIAnimation.active(smooth ? true: false);
                    t.UIAnimation.anim();
                }
            },
            scrollBy: function(x, y, smooth = false, dynamic = false) {
                t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
                if (t.UIScroll.dynamicSmoothScroll) {
                    t.UIScroll.dynamicBounceX = 0;
                    t.UIScroll.dynamicBounceY = 0;
                    t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
                }

                UIUpdateDimension();
                t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;
                if ((smooth ? true: false)) {
                    t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x + x);
                    t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y + y);
                } else {
                    t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x + x);
                    t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y + y);
                }

                t.UIScroll.smoothScroll = smooth ? true: false;
                if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                    t.UIAnimation.active(smooth ? true: false);
                    t.UIAnimation.anim();
                }
            },
            scrollIntoView: function(el, smooth = false, direction = "center", dynamic = false) {
                if (!el) return;

                t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
                if (t.UIScroll.dynamicSmoothScroll) {
                    t.UIScroll.dynamicBounceX = 0;
                    t.UIScroll.dynamicBounceY = 0;
                    t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
                }

                UIUpdateDimension();
                t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;

                var mainScroll = t.UIElement.content.getBoundingClientRect();
                var targetScroll = el.getBoundingClientRect();

                var x = 0 - (mainScroll.left - targetScroll.left);
                var y = 0 - (mainScroll.top - targetScroll.top);

                if (direction == "left top") {
                    x += 0;
                    y += 0;
                } else if (direction == "center top") {
                    x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                    y += 0;
                } else if (direction == "right top") {
                    x += -t.UIDimension.el.clientWidth - el.offsetWidth;
                    y += 0;
                } else if (direction == "left center") {
                    x += 0;
                    y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
                } else if (direction == "center") {
                    x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                    y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
                } else if (direction == "right center") {
                    x += -(t.UIDimension.el.clientWidth - el.offsetWidth);
                    y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
                } else if (direction == "left bottom") {
                    x += 0;
                    y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
                } else if (direction == "center bottom") {
                    x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                    y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
                } else if (direction == "right bottom") {
                    x += -(t.UIDimension.el.clientWidth - el.offsetWidth);
                    y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
                }

                if ((smooth ? true: false)) {
                    t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                    t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
                } else {
                    t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                    t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
                }

                t.UIScroll.smoothScroll = smooth ? true: false;
                if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                    t.UIAnimation.active(smooth ? true: false);
                    t.UIAnimation.anim();
                }
            },
            refresh: function() {
                if (!t.UIAnimation.isAnim) {
                    t.UIAnimation.active(false);
                    t.UIAnimation.anim();
                }
            },
            navigationScrollToTop: function(HtmlUINav, preventTriggerEl = []) {
                var _trigger = true;
                if (HtmlUINav.tagName != "HTMLUI-NAV" || HtmlUINav.parentNode.tagName != "HTMLUI-MAIN") return;
                HtmlUINav.addEventListener("click", function(e) {
                    var trigger = _trigger;
                    preventTriggerEl.forEach(function(el) {
                        if (e.target == el || e.target.parentElement == el || e.target.parentNode == el) {
                            trigger = false;
                        }
                    });
                    if (trigger) {
                        t.UIAction.scrollTo(t.UIScroll.x, 0, true, 0.0375);
                    }
                });

                return {
                    disable: function(v) {
                        _trigger = typeof v == "boolean" ? !v: true;
                    }
                }
            }
        }

        t.UIGesture.listen.onStart(function(e) {
            var fireStart = function() {
                t.UIScroll.smoothScroll = false;
                t.UIScroll.isPressed = true;

                t.UIAnimation.active(false);
            }
            if (t.UIConfig.fastScroll) {
                t.UIScroll.fastDebounce_1 = window.requestAnimationFrame(function() {
                    t.UIScroll.fastDebounce_2 = window.requestAnimationFrame(function() {
                        t.UIScroll.fastDebounce_3 = window.requestAnimationFrame(function() {
                            fireStart();
                        });
                    });
                });
            } else {
                fireStart();
            }
        });
        t.UIGesture.listen.onSwipeLock(function(e) {
            if (t.UIConfig.fastScroll) {
                t.UIScroll.isPressed = true;

                window.cancelAnimationFrame(t.UIScroll.fastDebounce_1);
                window.cancelAnimationFrame(t.UIScroll.fastDebounce_2);
                window.cancelAnimationFrame(t.UIScroll.fastDebounce_3);
            }

            t.UIGesture.swipeAxis(t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? true: false, t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? true: false);
            t.UIGesture.updateConfig({
                maxDelta: (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? t.UIDimension.el.clientWidth: t.UIDimension.el.clientHeight) / 4
            });

            t.UIScroll.boundX = (t.UIScroll.x < 0 ? (e.deltaX > 0 ? Math.max(0, -t.UIScroll.x): 0): (e.deltaX < 0 ? Math.max(0, t.UIScroll.x - t.UIDimension.contentWidth): 0)) / (t.UIDimension.el.clientWidth / 16);
            t.UIScroll.boundY = (t.UIScroll.y < 0 ? (e.deltaY > 0 ? Math.max(0, -t.UIScroll.y): 0): (e.deltaY < 0 ? Math.max(0, t.UIScroll.y - t.UIDimension.contentHeight): 0)) / (t.UIDimension.el.clientHeight / 16);

            if (t.UIConfig.bounce) {
                t.UIScroll.x -= t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX): 0;
                t.UIScroll.y -= t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY): 0;
            } else {
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x - (t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX): 0));
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y - (t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY): 0));
            }

            t.UIScroll.smoothScroll = false;
            t.UIAnimation.active(false);
            t.UIAnimation.anim();
        });
        t.UIGesture.listen.onFlingLock(function(e) {
            t.UIScroll.fastX = (e.deltaX != 0 ? (e.deltaX > 0 ? Math.max(0, t.UIScroll.fastX): -Math.max(0, -t.UIScroll.fastX)): 0) || 0;
            t.UIScroll.fastY = (e.deltaY != 0 ? (e.deltaY > 0 ? Math.max(0, t.UIScroll.fastY): -Math.max(0, -t.UIScroll.fastY)): 0) || 0;
            t.UIScroll.deltaX = t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX) * t.UIConfig.sensivity + t.UIScroll.fastX: 0;
            t.UIScroll.deltaY = t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY) * t.UIConfig.sensivity + t.UIScroll.fastY: 0;

            t.UIScroll.isPressed = false;

            t.UIScroll.dynamicBounceX = 0;
            t.UIScroll.dynamicBounceY = 0;

            if (!t.UIAnimation.isAnim) {
                t.UIAnimation.active(true);
                t.UIAnimation.anim();
            }
        });

        t.UIListener["scroll"] = function(callback) {
            t.UIListener._event.listenEvent.on("scroll",
                function() {
                    callback({
                        x: t.UIScroll.x,
                        y: t.UIScroll.y,
                        distanceX: t.UIScroll.velX,
                        distanceY: t.UIScroll.velY,
                        deltaX: t.UIScroll.deltaX,
                        deltaY: t.UIScroll.deltaY,
                        clientWidth: t.UIDimension.el.clientWidth,
                        clientHeight: t.UIDimension.el.clientHeight,
                        scrollWidth: t.UIDimension.el2.scrollWidth,
                        scrollHeight: t.UIDimension.el2.scrollHeight,
                        contentWidth: t.UIDimension.contentWidth,
                        contentHeight: t.UIDimension.contentHeight,
                        isPressed: t.UIScroll.isPressed
                    });
                });
        }

        HtmlUIResize(t.UIElement.main,
            function() {
                if (!t.UIAnimation.isAnim) {
                    t.UIAction.scrollTo(t.UIScroll.x, t.UIScroll.y, false);
                }
            });
        HtmlUIResize(t.UIElement.content,
            function() {
                if (!t.UIAnimation.isAnim) {
                    t.UIAction.scrollTo(t.UIScroll.x, t.UIScroll.y, false);
                }
            });

        t.UIAction.refresh();
    },
    CarouselView: function(el, config = {}) {
        var t = this;
        t.UIElement = {}

        t.UIElement.main = HtmlUIBuild(el);
        t.UIElement.main.classList.add("htmlui-carousel");
        var UIHtmlRaw = t.UIElement.main.innerHTML;

        t.UIElement.main.innerHTML = "";

        var UICarouselID = Math.floor(Math.random() * 1000000000);
        t.UIElement.content = document.createElement("htmlui-carousel-content");
        t.UIGesture = new SuperGesture(t.UIElement.content);
        t.UIElement.content.classList.add("id-" + UICarouselID);
        t.UIElement.content.innerHTML = UIHtmlRaw;
        t.UIElement.main.appendChild(t.UIElement.content);

        t.UIElement.button = {
            prev: document.createElement("htmlui-carousel-button-prev"),
            next: document.createElement("htmlui-carousel-button-next")
        }

        t.UIElement.button.prev.addEventListener("click",
            function(e) {
                t.UIAction.slideBy(-1, true);
            });
        t.UIElement.button.next.addEventListener("click",
            function(e) {
                t.UIAction.slideBy(1, true);
            });
        t.UIElement.button.prev.classList.add("htmlui-carousel-button");
        t.UIElement.button.next.classList.add("htmlui-carousel-button");

        t.UIElement.main.appendChild(t.UIElement.button.prev);
        t.UIElement.main.appendChild(t.UIElement.button.next);

        t.UIConfig = {
            friction: 0.0375,
            minDelta: 0.1,
            align: "center",
            slide: 0,
            slideRate: 0.2,
            transform: true,
            childSize: 0,
            vertical: false,
            loop: false,
            autoSize: false,
            minAutoSize: 0,
            dynamicSlideRate: 0.25,
            freeMode: false,
            sensivity: 1,
            improveAnimation: true,
            button: false,
            autoHide: true,
            velocitySlide: true,
            autoplay: false,
            autoplayPauseWhileGesture: false
        }
        HtmlUIConfig(t.UIConfig,
            config);

        t.UICarousel = {
            position: 0,
            inertia: false,
            delta: 0,
            slideDelta: 0,
            velocity: 0,
            velocity2: 0,
            currentSlide: t.UIConfig.slide,
            smooth: false,
            endPosition: 0,
            anim: false,
            totalSize: 0,
            smoothSlide: false,
            bound: 0,
            dynamicSlide: 0,
            bounceStart: 0,
            bounceEnd: 0,
            isPressed: false,
            willChangeCSS: "",
            autoplay: false,
            autoplayDuration: 0,
            autoplayStart: false
        }

        var UIUpdate = function() {
            t.UIElement.contentChilds = HtmlUIChilds(t.UIElement.main,
                "htmlui-carousel-content.id-" + UICarouselID + " > *");
            t.UIDimension = HtmlUIDimension(t.UIElement.main,
                t.UIElement.content);

            t.UICarousel.totalSize = 0;

            t.UIElement.contentChilds.forEach(function(UIEach) {
                var UIMargin = window.getComputedStyle(UIEach);
                var UIMarginSize = (parseFloat(UIMargin.getPropertyValue(t.UIConfig.vertical ? "margin-top": "margin-left")) + parseFloat(UIMargin.getPropertyValue(t.UIConfig.vertical ? "margin-bottom": "margin-right"))) || 0;
                t.UICarousel.totalSize += UIMarginSize + (UIEach[t.UIConfig.vertical ? "offsetHeight": "offsetWidth"]);
            });
        }
        UIUpdate();

        t.UIListener = new HtmlUIListener(["scroll",
            "change"]);

        UIVelocityDelta = new HtmlUIDelta();
        UISlideDelta = new HtmlUIDelta();

        t.UIAutoHideAnimation = new HtmlUI.Animator(function(e) {
            t.UIElement.button.prev.style.opacity = HtmlUIClamp(0, 1, e.fn.distance(4, 0));
            t.UIElement.button.next.style.opacity = HtmlUIClamp(0, 1, e.fn.distance(4, 0));
        },
            {
                duration: 1000
            });

        var ver = "clientWidth", ver2 = "offsetLeft", ver3 = "deltaX";
        t.UIAnimation = new HtmlUIAnimation(function(e) {
            UIUpdate();
            if (t.UIConfig.vertical) {
                t.UIElement.button.prev.classList.add("vertical");
                t.UIElement.button.next.classList.add("vertical");
            } else {
                t.UIElement.button.prev.classList.remove("vertical");
                t.UIElement.button.next.classList.remove("vertical");
            }

            ver = t.UIConfig.vertical ? "clientHeight": "clientWidth";
            ver2 = t.UIConfig.vertical ? "offsetTop": "offsetLeft";
            ver3 = t.UIConfig.vertical ? "deltaY": "deltaX";

            if (t.UIConfig.vertical) {
                t.UIElement.content.classList.add("vertical");
            } else {
                t.UIElement.content.classList.remove("vertical");
            }

            var UIChild = t.UIElement.contentChilds[t.UICarousel.currentSlide];
            t.UICarousel.childSize = UIChild ? UIChild[ver.replace("client", "offset")]: 0;
            if (t.UIConfig.autoSize) {
                var UIMargin = UIChild ? window.getComputedStyle(UIChild): null;
                var UIMarginSize = UIChild ? (parseFloat(UIMargin.getPropertyValue(!t.UIConfig.vertical ? "margin-top": "margin-left")) + parseFloat(UIMargin.getPropertyValue(!t.UIConfig.vertical ? "margin-bottom": "margin-right"))): 0;

                t.UIElement.main.style[t.UIConfig.vertical ? "minWidth": "minHeight"] = UIChild ? (Math.max(t.UIConfig.minAutoSize, UIChild[t.UIConfig.vertical ? "offsetWidth": "offsetHeight"] + UIMarginSize) + "px"): "";
                t.UIElement.main.style[t.UIConfig.vertical ? "maxWidth": "maxHeight"] = UIChild ? (Math.max(t.UIConfig.minAutoSize, UIChild[t.UIConfig.vertical ? "offsetWidth": "offsetHeight"] + UIMarginSize) + "px"): "";
                if (t.UIConfig.vertical) {
                    t.UIElement.main.style.minHeight = "";
                    t.UIElement.main.style.maxHeight = "";
                } else {
                    t.UIElement.main.style.minWidth = "";
                    t.UIElement.main.style.maxWidth = "";
                }
            } else {
                t.UIElement.main.style.minWidth = "";
                t.UIElement.main.style.minHeight = "";
                t.UIElement.main.style.maxWidth = "";
                t.UIElement.main.style.maxHeight = "";
            }

            var UIAlign = 0;
            if (t.UIConfig.align == "center") {
                UIAlign = UIChild && t.UICarousel.childSize != 0 ? (t.UICarousel.childSize - t.UIDimension.el[ver]) / 2: 0;
            } else if (t.UIConfig.align == "start") {
                UIAlign = 0;
            } else if (t.UIConfig.align == "end") {
                UIAlign = UIChild && t.UICarousel.childSize != 0 ? t.UICarousel.childSize - t.UIDimension.el[ver]: 0;
            }

            t.UICarousel.endPosition = (UIChild ? UIChild[ver2]: t.UIDimension.el[ver]) + (!t.UICarousel.inertia || t.UIConfig.freeMode && t.UICarousel.smoothSlide ? UIAlign: 0);

            t.UICarousel.inertia = t.UIConfig.freeMode || t.UICarousel.childSize > t.UIDimension.el[ver] && !t.UICarousel.smoothSlide ? true: false;

            t.UICarousel.bounceStart = (t.UIConfig.loop && t.UIConfig.freeMode ? -Infinity: t.UIConfig.freeMode ? 0: t.UICarousel.endPosition) || 0;
            t.UICarousel.bounceEnd = (t.UIConfig.loop && t.UIConfig.freeMode ? Infinity: t.UIConfig.freeMode ? (t.UICarousel.totalSize - t.UIDimension.el[ver] || 0): t.UICarousel.endPosition + (t.UICarousel.childSize - t.UIDimension.el[ver])) || 0;

            if (!t.UICarousel.smoothSlide && t.UIConfig.freeMode && t.UICarousel.inertia) {
                if (t.UIConfig.loop) {
                    if ((t.UICarousel.position < -t.UIDimension.el[ver] / 2) || (t.UICarousel.position > t.UICarousel.totalSize - t.UIDimension.el[ver] / 2)) {
                        if (t.UICarousel.velocity2 < 0) {
                            t.UICarousel.currentSlide = t.UIElement.contentChilds.length - 1;
                            t.UICarousel.position = (t.UICarousel.totalSize - t.UIDimension.el[ver] / 2) + (t.UIDimension.el[ver] / 2 + t.UICarousel.position);
                        } else {
                            t.UICarousel.currentSlide = 0;
                            t.UICarousel.position = (-t.UIDimension.el[ver] / 2 + t.UICarousel.position - (t.UICarousel.totalSize - t.UIDimension.el[ver] / 2));
                        }
                    } else {
                        if ((t.UICarousel.position < t.UICarousel.endPosition - t.UIDimension.el[ver] / 2) || (t.UICarousel.position > t.UICarousel.endPosition + Math.max(0, t.UICarousel.childSize - t.UIDimension.el[ver] / 2))) {
                            t.UICarousel.currentSlide = HtmlUIClamp(0, t.UIElement.contentChilds.length - 1, t.UICarousel.currentSlide + (t.UICarousel.velocity2 > 0 ? 1: -1));
                        }
                    }
                } else {
                    if ((t.UICarousel.position < t.UICarousel.endPosition - t.UIDimension.el[ver] / 2) || (t.UICarousel.position > t.UICarousel.endPosition + Math.max(0, t.UICarousel.childSize - t.UIDimension.el[ver] / 2))) {
                        t.UICarousel.currentSlide = HtmlUIClamp(0, t.UIElement.contentChilds.length - 1, t.UICarousel.currentSlide + (t.UICarousel.velocity2 > 0 ? 1: -1));
                    }
                }
            }

            if (t.UICarousel.smooth && (t.UICarousel.position < t.UICarousel.endPosition - 0.1 || t.UICarousel.position > t.UICarousel.endPosition + 0.1) || t.UICarousel.inertia && !t.UICarousel.smoothSlide) {
                if (t.UICarousel.inertia && !t.UICarousel.smoothSlide) {
                    if (t.UICarousel.position > t.UICarousel.bounceStart && t.UICarousel.position < t.UICarousel.bounceEnd) {
                        t.UICarousel.dynamicSlide = 0;

                        t.UICarousel.position += t.UICarousel.delta * e.frameSync;
                        t.UICarousel.delta += (0 - t.UICarousel.delta) * Math.min(1, t.UIConfig.friction * e.frameSync);
                    } else {
                        t.UICarousel.dynamicSlide += (1 - t.UICarousel.dynamicSlide) * Math.min(1, t.UIConfig.dynamicSlideRate * e.frameSync);

                        t.UICarousel.position += t.UICarousel.delta * e.frameSync;
                        t.UICarousel.position += (HtmlUIClamp(t.UICarousel.bounceStart, t.UICarousel.bounceEnd, t.UICarousel.position) - t.UICarousel.position) * Math.min(1, t.UIConfig.slideRate * e.frameSync / 1.5) * t.UICarousel.dynamicSlide;
                        t.UICarousel.delta = HtmlUIClamp(-t.UIDimension.el[ver] / 32, t.UIDimension.el[ver] / 32, t.UICarousel.delta + (0 - t.UICarousel.delta) * Math.min(1, t.UIConfig.slideRate * e.frameSync * 1.5));
                    }

                    if (!(Math.abs(t.UICarousel.delta) > t.UIConfig.minDelta || (t.UICarousel.position < t.UICarousel.bounceStart - 0.1 || t.UICarousel.position > t.UICarousel.bounceEnd + 0.1))) {
                        if (t.UICarousel.anim) {
                            t.UICarousel.dynamicSlide = 0;
                            t.UICarousel.delta = 0;
                            t.UICarousel.smooth = false;
                            t.UICarousel.anim = false;

                            t.UICarousel.position = HtmlUIClamp(t.UICarousel.bounceStart, t.UICarousel.bounceEnd, t.UICarousel.position);
                        }
                        t.UIAnimation.active(false);
                    }
                } else {
                    t.UICarousel.dynamicSlide += (1 - t.UICarousel.dynamicSlide) * Math.min(1, t.UIConfig.dynamicSlideRate * e.frameSync);

                    t.UICarousel.position += t.UICarousel.slideDelta * e.frameSync;
                    t.UICarousel.position += (t.UICarousel.endPosition - t.UICarousel.position) * Math.min(1, t.UIConfig.slideRate * e.frameSync / 1.5) * t.UICarousel.dynamicSlide;
                    t.UICarousel.slideDelta += (0 - t.UICarousel.slideDelta) * Math.min(1, t.UIConfig.slideRate * e.frameSync * 1.5);
                }
            } else {
                if (t.UICarousel.anim) {
                    t.UICarousel.dynamicSlide = 0;

                    t.UICarousel.slideDelta = 0;
                    t.UICarousel.smoothSlide = false;
                    t.UICarousel.smooth = false;
                    t.UICarousel.anim = false;

                    t.UICarousel.position = t.UICarousel.endPosition;
                }
                t.UIAnimation.active(false);
            }

            if (t.UIElement.contentChilds.length <= 1) t.UIAction.autoplay(false);

            t.UICarousel.velocity = UIVelocityDelta.set(t.UICarousel.position);
            t.UICarousel.velocity2 = t.UICarousel.delta * (e.frameSync || 1);

            if (UISlideDelta.set(Math.floor(t.UICarousel.currentSlide)) != 0) {
                t.UIListener._event.listenEvent._execEvent("change");
            }

            t.UICarousel.willChangeCSS = (t.UICarousel.anim || t.UICarousel.isPressed) && t.UIConfig.improveAnimation ? "transform": "";

            t.UIElement.contentChilds.forEach(function(UIEach) {
                UIEach.style.willChange = t.UICarousel.willChangeCSS;
                var childDistance = UIEach[ver2] - t.UIElement.main[ver2];
                var position = t.UIConfig.loop && t.UIElement.contentChilds.length > 1 ? (HtmlUIRepeat(t.UICarousel.position - childDistance + (t.UICarousel.totalSize / 2) - UIEach[ver] / 2, t.UICarousel.totalSize) + childDistance - t.UICarousel.totalSize + (t.UICarousel.totalSize / 2) + UIEach[ver] / 2): t.UICarousel.position;
                HtmlUISetPosition(UIEach, !t.UIConfig.vertical ? -position: 0, t.UIConfig.vertical ? -position: 0, t.UIConfig.transform);
            });

            if (!t.UICarousel.anim && !t.UICarousel.isPressed && t.UIConfig.autoHide && t.UIConfig.button) {
                t.UIAutoHideAnimation.UIPlayer.start();
            } else {
                t.UIElement.button.prev.style.opacity = 1;
                t.UIElement.button.next.style.opacity = 1;
            }

            if (!t.UIConfig.button) {
                t.UIElement.button.prev.classList.add("disabled");
                t.UIElement.button.next.classList.add("disabled");
            } else {
                if (t.UICarousel.currentSlide != 0 && !t.UIConfig.loop) t.UIElement.button.prev.classList.remove("disabled");
                else t.UIElement.button.prev.classList.add("disabled");

                if (t.UICarousel.currentSlide != Math.max(0, t.UIElement.contentChilds.length - 1) && !t.UIConfig.loop) t.UIElement.button.next.classList.remove("disabled");
                else t.UIElement.button.next.classList.add("disabled");
            }
            t.UIListener._event.listenEvent._execEvent("scroll");
        });
        setTimeout(function() {
            t.UIAnimation.active(false);
            t.UIAnimation.anim();
            t.UIListener._event.listenEvent._execEvent("change");
        });

        var UICarouselAutoPlay = function() {
            if (t.UICarousel.autoplayStart) {
                if (t.UIConfig.loop) t.UIAction.slideBy(1, true);
                else {
                    if (t.UICarousel.currentSlide >= t.UIElement.contentChilds.length - 1) {
                        t.UIAction.slideTo(0, true);
                    } else {
                        t.UIAction.slideBy(1, true);
                    }
                }
            }
            t.UICarousel.autoplayStart = true;

            if (t.UICarousel.autoplay) setTimeout(UICarouselAutoPlay, t.UICarousel.autoplayDuration);
        }

        t.UIAction = {
            slideTo: function(slide, smooth = false) {
                t.UICarousel.dynamicSlide = 0;
                t.UICarousel.currentSlide = HtmlUIClamp(0,
                    t.UIElement.contentChilds.length - 1,
                    (typeof slide == "string" ? Number(slide.toFixed(0)): slide));

                t.UICarousel.delta = 0;
                t.UICarousel.smoothSlide = true;
                t.UICarousel.inertia = false;
                if (!t.UIAnimation.isAnim) {
                    t.UICarousel.smooth = smooth;
                    t.UICarousel.anim = true;
                    t.UIAnimation.active(smooth);
                    t.UIAnimation.anim();
                }
            },
            slideBy: function(slide, smooth = false) {
                t.UICarousel.dynamicSlide = 0;
                if (t.UICarousel.currentSlide >= t.UIElement.contentChilds.length - 1 && t.UIConfig.loop && slide > 0) {
                    t.UICarousel.currentSlide = 0;
                    t.UICarousel.position = (-t.UIDimension.el[ver] + t.UICarousel.position - (t.UICarousel.totalSize - t.UIDimension.el[ver]));
                } else if (t.UICarousel.currentSlide <= 0 && t.UIConfig.loop && slide < 0) {
                    t.UICarousel.currentSlide = t.UIElement.contentChilds.length - 1;
                    t.UICarousel.position = (t.UICarousel.totalSize - t.UIDimension.el[ver]) + (t.UIDimension.el[ver] + t.UICarousel.position);
                } else {
                    t.UICarousel.currentSlide = HtmlUIClamp(0, t.UIElement.contentChilds.length - 1, t.UICarousel.currentSlide + (typeof slide == "string" ? Number(slide.toFixed(0)): slide));
                }

                t.UICarousel.delta = 0;
                t.UICarousel.smoothSlide = true;
                t.UICarousel.inertia = false;
                if (!t.UIAnimation.isAnim) {
                    t.UICarousel.smooth = smooth;
                    t.UICarousel.anim = true;
                    t.UIAnimation.active(smooth);
                    t.UIAnimation.anim();
                }
            },
            refresh: function() {
                t.UICarousel.dynamicSlide = 0;
                if (!t.UIAnimation.isAnim) {
                    t.UICarousel.anim = true;
                    t.UICarousel.inertia = false;
                    t.UIAnimation.active(false);
                    t.UIAnimation.anim();
                }
                t.UICarousel.position = t.UICarousel.endPosition;
            },
            append: function(tagName, prop = {}) {
                var UICreateElement = document.createElement(tagName);
                for (var UIProperty in prop) {
                    UICreateElement[UIProperty] = prop[UIProperty];
                }
                if (prop.style) {
                    for (var UIElementStyle in prop.style) {
                        UICreateElement.style[UIElementStyle] = prop.style[UIElementStyle];
                    }
                }
                if (prop.attribute) {
                    for (var UIAttribute in prop.attribute) {
                        UICreateElement.setAttribute(UIAttribute, prop.attribute[UIAttribute]);
                    }
                }
                if (prop.listener) {
                    for (var UIEventListener in prop.listener) {
                        UICreateElement.addEventListener(UIEventListener, prop.listener[UIEventListener]);
                    }
                }

                t.UIElement.content.appendChild(UICreateElement);

                return UICreateElement;
            },
            removeAll: function() {
                t.UIElement.content.innerHTML = "";
            },
            triggerViewPager: function(tvpel) {
                var viewpager = typeof tvpel == "string" ? document.querySelector(tvpel): tvpel;
                if (viewpager.tagName != "HTMLUI-VIEWPAGER" || viewpager.parentNode.tagName != "HTMLUI-MAIN") return;

                var viewpagerPages = viewpager.querySelectorAll("page");
                var prevViewpagerPage = null;
                var pages = [];
                var prevPage = Infinity;

                for (var i = 0; i < viewpagerPages.length; i++) {
                    pages.push({
                        index: i,
                        pageEl: viewpagerPages[i]
                    });
                }

                pages.forEach(function(e) {
                    e.pageEl.addEventListener("click", function() {
                        t.UIAction.slideTo(e.index, true);
                    });
                });

                t.UIListener.change(function(e) {
                    if (e.slide == prevPage) return;
                    viewpagerPages[e.slide].classList.add("selected");

                    if (prevViewpagerPage) {
                        prevViewpagerPage.classList.remove("selected");
                    }

                    prevViewpagerPage = viewpagerPages[e.slide];
                    prevPage = e.slide;
                });
            },
            autoplay: function(autoplay) {
                t.UICarousel.autoplay = autoplay != false ? true: false;
                t.UICarousel.autoplayDuration = typeof autoplay == "number" ? autoplay: 3000;

                if (t.UICarousel.autoplay) {
                    UICarouselAutoPlay();
                } else {
                    t.UICarousel.autoplayStart = false;
                }
            }
        }

        t.UIGesture.listen.onStart(function(e) {
            if (t.UIConfig.autoplayPauseWhileGesture) t.UIAction.autoplay(false);

            t.UICarousel.isPressed = true;
            t.UICarousel.dynamicSlide = 0;
            t.UICarousel.smoothSlide = false;
            t.UICarousel.smooth = false;
            t.UICarousel.anim = false;
            t.UIAnimation.active(false);
        });
        t.UIGesture.listen.onSwipeLock(function(e) {
            t.UIGesture.swipeAxis(t.UIConfig.vertical ? false: true, t.UIConfig.vertical ? true: false);
            t.UIGesture.updateConfig({
                maxDelta: (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? t.UIDimension.el[ver]: t.UIDimension.el[ver]) / 2
            });

            t.UICarousel.bound = t.UIConfig.loop && t.UIElement.contentChilds.length > 1 ? 0: (t.UICarousel.position < 0 ? (e[ver3] > 0 ? Math.max(0, -t.UICarousel.position): 0): (e[ver3] < 0 ? Math.max(0, t.UICarousel.position - Math.max(0, t.UICarousel.totalSize - t.UIDimension.el[ver])): 0)) / (t.UIDimension.el[ver] / 16);

            t.UICarousel.velocity2 = -e[ver3];

            t.UICarousel.smooth = false;
            t.UICarousel.position -= e[ver3] / (1 + t.UICarousel.bound);
            t.UIAnimation.active(false);
            t.UIAnimation.anim();
        });
        t.UIGesture.listen.onFlingLock(function(e) {
            t.UICarousel.isPressed = false;
            if (e[ver3] != 0 && !(t.UICarousel.inertia && t.UICarousel.position > t.UICarousel.bounceStart && t.UICarousel.position < t.UICarousel.bounceEnd)) {
                if (!((t.UICarousel.currentSlide == 0 && e[ver3] > 0) || (t.UICarousel.currentSlide == t.UIElement.contentChilds.length - 1 && e[ver3] < 0)) || !t.UIConfig.loop || t.UIElement.contentChilds.length <= 1) {
                    if ((t.UICarousel.position > t.UICarousel.endPosition && e[ver3] < 0) || (t.UICarousel.position < t.UICarousel.endPosition + Math.max(0, t.UICarousel.childSize - t.UIDimension.el[ver]) && e[ver3] > 0)) {
                        t.UICarousel.currentSlide = HtmlUIClamp(0, t.UIElement.contentChilds.length - 1, t.UICarousel.currentSlide + (e[ver3] < 0 ? 1: -1));
                    }
                } else {
                    if ((t.UICarousel.position > t.UICarousel.endPosition && e[ver3] < 0) || (t.UICarousel.position < t.UICarousel.endPosition + Math.max(0, t.UICarousel.childSize - t.UIDimension.el[ver]) && e[ver3] > 0)) {
                        if (t.UICarousel.currentSlide == 0) {
                            t.UICarousel.currentSlide = t.UIElement.contentChilds.length - 1;
                            t.UICarousel.position = (t.UICarousel.totalSize - t.UIDimension.el[ver]) + (t.UIDimension.el[ver] + t.UICarousel.position);
                        } else {
                            t.UICarousel.currentSlide = 0;
                            t.UICarousel.position = (-t.UIDimension.el[ver] + t.UICarousel.position - (t.UICarousel.totalSize - t.UIDimension.el[ver]));
                        }
                    }
                }
            } else {
                if (t.UICarousel.inertia && e[ver3] != 0) {
                    t.UICarousel.delta = -e[ver3] / (1 + t.UICarousel.bound) * t.UIConfig.sensivity;
                } else {
                    t.UICarousel.delta = 0;
                }
            }
            t.UICarousel.slideDelta = t.UIConfig.velocitySlide ? HtmlUIClamp(-t.UIDimension.el[ver] / 5, t.UIDimension.el[ver] / 5, -e[ver3]) * t.UIConfig.sensivity: 0;

            t.UICarousel.smooth = true;
            t.UICarousel.anim = true;
            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        });

        t.UIListener["scroll"] = function(callback) {
            t.UIListener._event.listenEvent.on("scroll",
                function() {
                    callback({
                        position: t.UICarousel.position,
                        distance: t.UICarousel.velocity,
                        clientSize: t.UIDimension.el[ver],
                        scrollSize: t.UICarousel.totalSize,
                        contentSize: Math.min(0, t.UICarousel.totalSize - t.UIDimension.el[ver]),
                        slide: t.UICarousel.currentSlide,
                        slideLength: Math.max(0, t.UIElement.contentChilds.length - 1),
                        inertia: t.UICarousel.inertia,
                        startPosition: t.UICarousel.endPosition,
                        endPosition: t.UICarousel.endPosition + Math.max(0, t.UICarousel.childSize - t.UIDimension.el[ver]),
                        childs: t.UIElement.contentChilds
                    });
                });
        }
        t.UIListener["change"] = function(callback) {
            t.UIListener._event.listenEvent.on("change",
                function() {
                    callback({
                        position: t.UICarousel.position,
                        distance: t.UICarousel.velocity,
                        clientSize: t.UIDimension.el[ver],
                        scrollSize: t.UICarousel.totalSize,
                        contentSize: Math.min(0, t.UICarousel.totalSize - t.UIDimension.el[ver]),
                        slide: t.UICarousel.currentSlide,
                        slideLength: Math.max(0, t.UIElement.contentChilds.length - 1),
                        inertia: t.UICarousel.inertia,
                        startPosition: t.UICarousel.endPosition,
                        endPosition: t.UICarousel.endPosition + Math.max(0, t.UICarousel.childSize - t.UIDimension.el[ver]),
                        childs: t.UIElement.contentChilds
                    });
                });
        }

        HtmlUIResize(t.UIElement.main,
            function() {
                t.UIAction.slideBy(0);
            });
        HtmlUIResize(t.UIElement.content,
            function() {
                t.UIAction.slideBy(0);
            });

        t.UIAnimation.active(false);
        t.UIAnimation.anim();

        t.UIAction.autoplay(t.UIConfig.autoplay);
    },
    Layout: function(el, layout) {
        (typeof el == "string" ? document.querySelector(el): el).setAttribute("htmlui-layout",
            layout);
    },
    JSON: function(url = "",
        autoRun = false,
        accessControl = true) {
        var t = this;

        t.UIListener = new HtmlUIListener(["load",
            "error",
            "xhrerror"]);
        var UIXHR = new XMLHttpRequest();

        t.UIJSON = {
            url: url,
            status: 0,
            response: {},
            progress: {},
            accessControl: accessControl
        }

        UIXHR.onload = function() {
            t.UIJSON.status = UIXHR.status;
            t.UIJSON.response = UIXHR.response;

            if (t.UIJSON.status == 200) {
                t.UIListener._event.listenEvent._execEvent("load");
            } else {
                t.UIListener._event.listenEvent._execEvent("error");
            }
        }
        UIXHR.onerror = function() {
            t.UIListener._event.listenEvent._execEvent("xhrerror");
        }
        UIXHR.onprogress = function(e) {
            t.UIJSON.progress = e;
            t.UIListener._event.listenEvent._execEvent("progress");
        }

        t.UIAction = {}
        t.UIAction.update = function() {
            UIXHR.open("GET", t.UIJSON.url && t.UIJSON.url != ""? t.UIJSON.url: null, true);
            if (t.UIJSON.accessControl) {
                UIXHR.setRequestHeader("Access-Control-Allow-Headers", "*");
                UIXHR.setRequestHeader("Access-Control-Allow-Origin", "*");
            }
            UIXHR.responseType = "json";
            UIXHR.send();
        }
        t.UIAction.changeURL = function(url, accessControl = true) {
            t.UIJSON.url = url;
            t.UIJSON.accessControl = accessControl;
        }

        t.UIListener["load"] = function(callback) {
            t.UIListener._event.listenEvent.on("load", function() {
                callback(t.UIJSON.response, t.UIJSON.status);
            });
        }
        t.UIListener["error"] = function(callback) {
            t.UIListener._event.listenEvent.on("error", function() {
                callback(t.UIJSON.response, t.UIJSON.status);
            });
        }
        t.UIListener["xhrerror"] = function(callback) {
            t.UIListener._event.listenEvent.on("xhrerror", function() {
                callback();
            });
        }
        t.UIListener["progress"] = function(callback) {
            t.UIListener._event.listenEvent.on("progress", function() {
                callback(t.UIJSON.progress);
            });
        }

        if (autoRun == true && url != "") {
            t.UIAction.update();
        }
    }
}
window.HtmlUI.PullToRefresh = function(HtmlUIScrollView, config = {}) {
    var t = this;
    t.UIScrollView = HtmlUIScrollView;
    if (t.UIScrollView.UIScroll) t.UIScrollView.UIElement.content.style.minHeight = "125%";
    t.UIGesture = new SuperGesture(t.UIScrollView.UIElement.main);
    t.UIGesture.swipeAxis(false, true);

    t.UIElement = {}
    t.UIElement.refresh = document.createElement("htmlui-pull-to-refresh");
    t.UIScrollView.UIElement.main.insertBefore(t.UIElement.refresh, t.UIScrollView.UIElement.main.childNodes[0]);
    t.UIElement.refreshProgress = document.createElement("htmlui-refresh-progress-background");
    t.UIElement.refresh.appendChild(t.UIElement.refreshProgress);
    t.UIElement.refreshProgressCircle = document.createElement("htmlui-refresh-circle");
    t.UIElement.refreshProgress.appendChild(t.UIElement.refreshProgressCircle);

    t.UIConfig = {
        timeout: 10000,
        bounceMode: true
    }
    HtmlUIConfig(t.UIConfig, config);
    if (t.UIScrollView.UIScroll) {
        t.UIScrollView.UIConfig.bounce = t.UIConfig.bounceMode;
    }

    t.UIListener = new HtmlUIListener(["refresh", "abort", "refreshing"]);

    t.UIRefresh = {
        timeout: null,
        isRefresh: false,
        circleRotate: 0,
        circleAnimTimeStart: 0,
        timeStart: 0,
        startPos: 0,
        status: "",
        isBounce: false,
        isCustom: false,
        positionRefresh: 0,
        refreshTime: 0,
        refreshStartTime: 0,
        refreshSize: 48
    }

    var UIEasingPos = function(start, end, range) {
        return start + (end - start) * (1 - Math.pow(1 - range, 12));
    }

    t.UIAnimation = new HtmlUIAnimation(function(e) {
        if (!t.UIRefresh.isCustom) {
            var UIRotate = (t.UIRefresh.circleRotate + ((e.time - t.UIRefresh.circleAnimTimeStart) / 500) * 360)%360;
            t.UIElement.refreshProgress.style.transform = `rotate(${UIRotate}deg)`;
        }
        if (t.UIRefresh.isRefresh) {
            t.UIRefresh.refreshTime = e.time;
            if (t.UIScrollView.UIScroll) {
                t.UIScrollView.UIScroll.deltaY = 0;
                t.UIScrollView.UIScroll.y = UIEasingPos(t.UIRefresh.startPos, -t.UIRefresh.refreshSize, Math.max(0, Math.min(1, (e.time - t.UIRefresh.timeStart) / 1000)));
                t.UIScrollView.UIAnimation.anim();
            } else {
                t.UIScrollView.UIOverscroll.y = UIEasingPos(t.UIRefresh.startPos, -t.UIRefresh.refreshSize, Math.max(0, Math.min(1, (e.time - t.UIRefresh.timeStart) / 1000)));
                t.UIScrollView.UIAnimation.active(false);
                t.UIScrollView.UIAnimation.anim();
            }

            if ((e.time - t.UIRefresh.timeStart) > t.UIConfig.timeout) {
                t.UIRefresh.isRefresh = false;
                t.UIAnimation.active(false);

                t.UIScrollView.UIAnimation.active(true);
                t.UIScrollView.UIAnimation.anim();
                t.UIListener._event.listenEvent._execEvent("abort");
                t.UIListener._event.listenEvent._execEvent("timeout");
            }
        }
        t.UIListener._event.listenEvent._execEvent("update");
    });

    t.UIGesture.listen.onStart(function(e) {
        t.UIRefresh.isRefresh = false;
        t.UIAnimation.active(false);
        t.UIListener._event.listenEvent._execEvent("abort");
    });
    t.UIGesture.listen.onSwipeY(function(e) {
        t.UIRefresh.isBounce = t.UIConfig.bounceMode || (t.UIScrollView.UIScroll ? t.UIScrollView.UIScroll.y: t.UIScrollView.UIOverscroll.y) <= 0 ? true: false;
    });
    t.UIGesture.listen.onEnd(function(e) {
        t.UIRefresh.isRefresh = (t.UIScrollView.UIScroll ? t.UIScrollView.UIScroll.y: t.UIScrollView.UIOverscroll.y) <= -t.UIRefresh.refreshSize ? true: false;
        t.UIAnimation.active(t.UIRefresh.isRefresh);
        if (t.UIRefresh.isRefresh) {
            t.UIScrollView.UIAnimation.active(false);
            t.UIRefresh.circleAnimTimeStart = e.time;
            t.UIRefresh.timeStart = e.time;
            t.UIRefresh.refreshStartTime = t.UIRefresh.timeStart;
            t.UIRefresh.startPos = t.UIScrollView.UIScroll ? t.UIScrollView.UIScroll.y: t.UIScrollView.UIOverscroll.y;
            t.UIAnimation.anim();
            t.UIListener._event.listenEvent._execEvent("refreshing");
        }
    });

    t.UIScrollView.UIListener.scroll(function(e) {
        if (t.UIRefresh.isBounce && e.y > 0) {
            t.UIRefresh.isBounce = t.UIConfig.bounceMode || (t.UIScrollView.UIScroll ? t.UIScrollView.UIScroll.y: t.UIScrollView.UIOverscroll.y) <= 0 ? true: false;
        }

        if (e.y >= 0) {
            t.UIRefresh.status = "SCROLL";
        } else {
            if (t.UIRefresh.isRefresh) t.UIRefresh.status = "REFRESHING";
            else t.UIRefresh.status = "REFRESH";
        }

        if (t.UIScrollView.UIScroll) {
            t.UIScrollView.UIConfig.bounce = t.UIRefresh.isBounce;
        }

        t.UIRefresh.positionRefresh = Math.max(0, -e.y);
        t.UIElement.refresh.style.height = `${t.UIRefresh.positionRefresh}px`;
        if (!t.UIRefresh.isRefresh && !t.UIRefresh.isCustom) {
            t.UIRefresh.circleRotate = 0 - Math.max(0, -e.y / t.UIRefresh.refreshSize) * 360;
            t.UIElement.refreshProgress.style.transform = `rotate(${t.UIRefresh.circleRotate}deg)`;
        }
        t.UIListener._event.listenEvent._execEvent("update");
    });

    t.UIAction = {
        refresh: function() {
            if (t.UIRefresh.isRefresh) {
                t.UIRefresh.isRefresh = false;
                t.UIAnimation.active(false);

                t.UIScrollView.UIAnimation.active(true);
                t.UIScrollView.UIAnimation.anim();
                t.UIListener._event.listenEvent._execEvent("refresh");
            }
        },
        abort: function() {
            if (t.UIRefresh.isRefresh) {
                t.UIRefresh.isRefresh = false;
                t.UIAnimation.active(false);

                t.UIScrollView.UIAnimation.active(true);
                t.UIScrollView.UIAnimation.anim();
                t.UIListener._event.listenEvent._execEvent("abort");
            }
        }
    }
    t.UIAction.customRefresh = function(UICustom = {}) {
        if (!UICustom.init || !UICustom.event) return;
        t.UIRefresh.isCustom = true;
        if (UICustom.size) t.UIRefresh.refreshSize = UICustom.size;
        t.UIElement.refresh.innerHTML = "";
        var main = {};

        UICustom.init(main, t.UIElement.refresh);

        t.UIListener._event.listenEvent.on("update", function() {
            UICustom.event(main, {
                status: t.UIRefresh.status,
                position: t.UIRefresh.positionRefresh,
                size: t.UIRefresh.refreshSize,
                time: t.UIRefresh.refreshTime - t.UIRefresh.refreshStartTime
            });
        });
    }

    t.UIListener["refresh"] = function(callback) {
        t.UIListener._event.listenEvent.on("refresh", function() {
            callback();
        });
    }
    t.UIListener["refreshing"] = function(callback) {
        t.UIListener._event.listenEvent.on("refreshing", function() {
            callback();
        });
    }
    t.UIListener["abort"] = function(callback) {
        t.UIListener._event.listenEvent.on("abort", function() {
            callback();
        });
    }
    t.UIListener["timeout"] = function(callback) {
        t.UIListener._event.listenEvent.on("timeout", function() {
            callback();
        });
    }
}
window.HtmlUI.Scrollbar = function(UIScrollView, config = {}) {
    var t = this;
    t.UIScrollView = UIScrollView;

    t.UIElement = {
        scrollbar: {
            trackX: document.createElement("htmlui-scrollbar-track-x"),
            trackY: document.createElement("htmlui-scrollbar-track-y"),
            thumbX: document.createElement("htmlui-scrollbar-thumb-x"),
            thumbY: document.createElement("htmlui-scrollbar-thumb-y"),
        }
    }
    t.UIScrollView.UIElement.main.appendChild(t.UIElement.scrollbar.trackX);
    t.UIElement.scrollbar.trackX.appendChild(t.UIElement.scrollbar.thumbX);

    t.UIScrollView.UIElement.main.appendChild(t.UIElement.scrollbar.trackY);
    t.UIElement.scrollbar.trackY.appendChild(t.UIElement.scrollbar.thumbY);

    t.UIElement.scrollbar.trackX.style.cssText = "display: block; position: absolute; left: 3px; bottom: 3px; width: calc(100% - 6px); height: 3px; overflow: hidden; opacity: 0";
    t.UIElement.scrollbar.thumbX.style.cssText = "display: block; position: relative; height: 100%; border-radius: 3px; ";

    t.UIElement.scrollbar.trackY.style.cssText = "display: block; position: absolute; right: 3px; top: 3px; width: 3px; height: calc(100% - 6px); overflow: hidden; opacity: 0";
    t.UIElement.scrollbar.thumbY.style.cssText = "display: block; position: relative; width: 100%; border-radius: 3px; ";

    t.UIConfig = {
        minSize: 32,
        maxSize: Infinity,
        scrollbarType: "android" + (/CPH[0-9]|RMX[0-9]/i.test(navigator.userAgent) ? "-2px": ""),
        opacity: 0.25,
        trackColor: "transparent",
        thumbColor: "black",
        autoHide: true,
        draggable: true,
        outside: false,
        shrink: true,
        fling: true
    }
    HtmlUIConfig(t.UIConfig, config);

    var UIScrollbarDeactive,
    UIScrollbarActive,
    UIScrollbarEnableSize;
    var UIScrollbarStyle = function() {
        t.UIElement.scrollbar.trackX.style.background = t.UIConfig.trackColor;
        t.UIElement.scrollbar.trackY.style.background = t.UIConfig.trackColor;
        t.UIElement.scrollbar.thumbX.style.background = t.UIConfig.thumbColor;
        t.UIElement.scrollbar.thumbY.style.background = t.UIConfig.thumbColor;
        t.UIElement.scrollbar.trackX.style.zIndex = t.UIConfig.outside ? "10000000000000000": "";
        t.UIElement.scrollbar.trackY.style.zIndex = t.UIConfig.outside ? "10000000000000000": "";
        UIScrollbarEnableSize = true;

        if (t.UIConfig.scrollbarType == "android") {
            t.UIElement.scrollbar.trackX.style.left = "0px";
            t.UIElement.scrollbar.trackX.style.bottom = "0px";
            t.UIElement.scrollbar.trackX.style.width = "100%";
            t.UIElement.scrollbar.trackX.style.height = "4px";
            t.UIElement.scrollbar.trackY.style.right = "0px";
            t.UIElement.scrollbar.trackY.style.top = "0px";
            t.UIElement.scrollbar.trackY.style.width = "4px";
            t.UIElement.scrollbar.trackY.style.height = "100%";

            t.UIElement.scrollbar.thumbX.style.borderRadius = "";
            t.UIElement.scrollbar.thumbY.style.borderRadius = "";
            t.UIElement.scrollbar.trackX.style.borderRadius = "";
            t.UIElement.scrollbar.trackY.style.borderRadius = "";

            UIScrollbarEnableSize = false;
        } else if (t.UIConfig.scrollbarType == "android-2px") {
            t.UIElement.scrollbar.trackX.style.left = "2px";
            t.UIElement.scrollbar.trackX.style.bottom = "2px";
            t.UIElement.scrollbar.trackX.style.width = "calc(100% - 4px)";
            t.UIElement.scrollbar.trackX.style.height = "4px";
            t.UIElement.scrollbar.trackY.style.right = "2px";
            t.UIElement.scrollbar.trackY.style.top = "2px";
            t.UIElement.scrollbar.trackY.style.width = "4px";
            t.UIElement.scrollbar.trackY.style.height = "calc(100% - 4px)";

            t.UIElement.scrollbar.thumbX.style.borderRadius = "";
            t.UIElement.scrollbar.thumbY.style.borderRadius = "";
            t.UIElement.scrollbar.trackX.style.borderRadius = "";
            t.UIElement.scrollbar.trackY.style.borderRadius = "";

            UIScrollbarEnableSize = false;
        } else if (t.UIConfig.scrollbarType == "ios") {
            t.UIElement.scrollbar.trackX.style.left = "3px";
            t.UIElement.scrollbar.trackX.style.bottom = "3px";
            t.UIElement.scrollbar.trackX.style.width = "calc(100% - 6px)";
            t.UIElement.scrollbar.trackX.style.height = "3px";
            t.UIElement.scrollbar.trackY.style.right = "3px";
            t.UIElement.scrollbar.trackY.style.top = "3px";
            t.UIElement.scrollbar.trackY.style.width = "3px";
            t.UIElement.scrollbar.trackY.style.height = "calc(100% - 6px)";

            t.UIElement.scrollbar.thumbX.style.borderRadius = "3px";
            t.UIElement.scrollbar.thumbY.style.borderRadius = "3px";
            t.UIElement.scrollbar.trackX.style.borderRadius = "6px";
            t.UIElement.scrollbar.trackY.style.borderRadius = "6px";

            UIScrollbarEnableSize = true;
        } else if (t.UIConfig.scrollbarType == "macos") {
            t.UIElement.scrollbar.trackX.style.left = "3px";
            t.UIElement.scrollbar.trackX.style.bottom = "3px";
            t.UIElement.scrollbar.trackX.style.width = "calc(100% - 6px)";
            t.UIElement.scrollbar.trackX.style.height = "6px";
            t.UIElement.scrollbar.trackY.style.right = "3px";
            t.UIElement.scrollbar.trackY.style.top = "3px";
            t.UIElement.scrollbar.trackY.style.width = "6px";
            t.UIElement.scrollbar.trackY.style.height = "calc(100% - 6px)";

            t.UIElement.scrollbar.thumbX.style.borderRadius = "6px";
            t.UIElement.scrollbar.thumbY.style.borderRadius = "6px";
            t.UIElement.scrollbar.trackX.style.borderRadius = "12px";
            t.UIElement.scrollbar.trackY.style.borderRadius = "12px";

            UIScrollbarEnableSize = false;
        }

        UIScrollbarDeactive = t.UIElement.scrollbar.trackX.style.height || t.UIElement.scrollbar.trackY.style.width;
        UIScrollbarActive = UIScrollbarEnableSize ? ((parseInt(t.UIElement.scrollbar.trackX.style.height, 10) * 2) + "px" || (parseInt(t.UIElement.scrollbar.trackY.style.width, 10) * 2) + "px"): UIScrollbarDeactive;
    }
    UIScrollbarStyle();

    t.UIScrollbar = {
        barWidth: 0,
        barHeight: 0,
        barX: 0,
        barY: 0,
        barBoundX: 0,
        barBoundY: 0,
        moveBoundX: 0,
        moveBoundY: 0
    }

    t.UIGesture = {
        thumbX: new SuperGesture(t.UIElement.scrollbar.thumbX),
        thumbY: new SuperGesture(t.UIElement.scrollbar.thumbY)
    }

    t.UIGesture.thumbX.listen.onStart(function() {
        if (!t.UIConfig.draggable) return;
        t.UIElement.scrollbar.trackX.style.transition = "opacity 0ms, height 250ms";
        t.UIElement.scrollbar.trackX.style.opacity = t.UIConfig.opacity;
        t.UIElement.scrollbar.trackX.style.height = UIScrollbarActive;
    });
    t.UIGesture.thumbX.listen.onEnd(function() {
        if (!t.UIConfig.draggable) return;
        t.UIElement.scrollbar.trackX.style.height = UIScrollbarDeactive;
    });
    t.UIGesture.thumbX.listen.onSwipeX(function(e) {
        t.UIGesture.thumbX.swipeAxis(t.UIConfig.draggable, false);
        if (t.UIConfig.draggable) {
            if (t.UIScrollView.UIScroll) {
                t.UIScrollbar.moveBoundX = (t.UIScrollView.UIScroll.x < 0 ? (e.deltaX < 0 ? Math.max(0, -t.UIScrollView.UIScroll.x): 0): (e.deltaX > 0 ? Math.max(0, t.UIScrollView.UIScroll.x - t.UIScrollView.UIDimension.contentWidth): 0)) / (t.UIScrollView.UIDimension.el.clientWidth / 8);
                t.UIScrollView.UIScroll.x += (e.deltaX * (t.UIScrollView.UIDimension.el2.scrollWidth / t.UIScrollView.UIDimension.el.clientWidth) * (t.UIScrollView.UIElement.main.clientWidth / t.UIElement.scrollbar.trackX.clientWidth)) / Math.pow(1 + t.UIScrollbar.moveBoundX, 3);
                t.UIScrollView.UIAnimation.active(false);
                t.UIScrollView.UIAnimation.anim();
            } else if (t.UIScrollView.UIOverscroll) {
                t.UIScrollbar.moveBoundX = (t.UIScrollView.UIOverscroll.x < 0 ? (e.deltaX < 0 ? Math.max(0, -t.UIScrollView.UIOverscroll.x): 0): (e.deltaX > 0 ? Math.max(0, t.UIScrollView.UIOverscroll.x - Math.max(0, t.UIScrollView.UIElement.content.scrollWidth - t.UIScrollView.UIElement.main.clientWidth)): 0)) / (t.UIScrollView.UIElement.main.clientWidth / 8);
                t.UIScrollView.UIOverscroll.x += (e.deltaX * (t.UIScrollView.UIElement.content.scrollWidth / t.UIScrollView.UIElement.main.clientWidth) * (t.UIScrollView.UIElement.main.clientWidth / t.UIElement.scrollbar.trackX.clientWidth)) / Math.pow(1 + t.UIScrollbar.moveBoundX, 3);
                t.UIScrollView.UIKinetic.UIAnimation.active(false);
                t.UIScrollView.UIKinetic.UIAnimation.anim();
                t.UIScrollView.UIAnimation.active(false);
                t.UIScrollView.UIAnimation.anim();
                t.UIScrollView.UIOverscroll.isPressed = true;
            }
        }
    });
    t.UIGesture.thumbX.listen.onFlingX(function(e) {
        if (t.UIConfig.draggable && t.UIConfig.fling) {
            if (t.UIScrollView.UIScroll) {
                setTimeout(function() {
                    t.UIScrollbar.moveBoundX = (t.UIScrollView.UIScroll.x < 0 ? (e.deltaX < 0 ? Math.max(0, -t.UIScrollView.UIScroll.x): 0): (e.deltaX > 0 ? Math.max(0, t.UIScrollView.UIScroll.x - t.UIScrollView.UIDimension.contentWidth): 0)) / (t.UIScrollView.UIDimension.el.clientWidth / 8);
                    t.UIScrollView.UIScroll.deltaX = (-e.deltaX * (t.UIScrollView.UIDimension.el2.scrollWidth / t.UIScrollView.UIDimension.el.clientWidth) * (t.UIScrollView.UIElement.main.clientWidth / t.UIElement.scrollbar.trackX.clientWidth)) / Math.pow(1 + t.UIScrollbar.moveBoundX, 3);
                    if (!t.UIScrollView.UIAnimation.isAnim) {
                        t.UIScrollView.UIAnimation.active(true);
                        t.UIScrollView.UIAnimation.anim();
                    }
                });
            }
        }
    });

    t.UIGesture.thumbY.listen.onStart(function() {
        if (!t.UIConfig.draggable) return;
        t.UIElement.scrollbar.trackY.style.transition = "opacity 0ms, width 250ms";
        t.UIElement.scrollbar.trackY.style.opacity = t.UIConfig.opacity;
        t.UIElement.scrollbar.trackY.style.width = UIScrollbarActive;
    });
    t.UIGesture.thumbY.listen.onEnd(function() {
        if (!t.UIConfig.draggable) return;
        t.UIElement.scrollbar.trackY.style.width = UIScrollbarDeactive;
    });
    t.UIGesture.thumbY.listen.onSwipeY(function(e) {
        t.UIGesture.thumbY.swipeAxis(false, t.UIConfig.draggable);
        if (t.UIConfig.draggable) {
            if (t.UIScrollView.UIScroll) {
                t.UIScrollbar.moveBoundY = (t.UIScrollView.UIScroll.y < 0 ? (e.deltaY < 0 ? Math.max(0, -t.UIScrollView.UIScroll.y): 0): (e.deltaY > 0 ? Math.max(0, t.UIScrollView.UIScroll.y - t.UIScrollView.UIDimension.contentHeight): 0)) / (t.UIScrollView.UIDimension.el.clientHeight / 8);
                t.UIScrollView.UIScroll.y += (e.deltaY * (t.UIScrollView.UIDimension.el2.scrollHeight / t.UIScrollView.UIDimension.el.clientHeight) * (t.UIScrollView.UIElement.main.clientHeight / t.UIElement.scrollbar.trackY.clientHeight)) / Math.pow(1 + t.UIScrollbar.moveBoundY, 3);
                t.UIScrollView.UIAnimation.active(false);
                t.UIScrollView.UIAnimation.anim();
            } else if (t.UIScrollView.UIOverscroll) {
                t.UIScrollbar.moveBoundY = (t.UIScrollView.UIOverscroll.y < 0 ? (e.deltaY < 0 ? Math.max(0, -t.UIScrollView.UIOverscroll.y): 0): (e.deltaY > 0 ? Math.max(0, t.UIScrollView.UIOverscroll.y - Math.max(0, t.UIScrollView.UIElement.content.scrollHeight - t.UIScrollView.UIElement.main.clientHeight)): 0)) / (t.UIScrollView.UIElement.main.clientHeight / 8);
                t.UIScrollView.UIOverscroll.y += (e.deltaY * (t.UIScrollView.UIElement.content.scrollHeight / t.UIScrollView.UIElement.main.clientHeight) * (t.UIScrollView.UIElement.main.clientHeight / t.UIElement.scrollbar.trackY.clientHeight)) / Math.pow(1 + t.UIScrollbar.moveBoundY, 3);
                t.UIScrollView.UIKinetic.UIAnimation.active(false);
                t.UIScrollView.UIKinetic.UIAnimation.anim();
                t.UIScrollView.UIAnimation.active(false);
                t.UIScrollView.UIAnimation.anim();
            }
        }
    });
    t.UIGesture.thumbY.listen.onFlingY(function(e) {
        if (t.UIConfig.draggable && t.UIConfig.fling) {
            if (t.UIScrollView.UIScroll) {
                setTimeout(function() {
                    t.UIScrollbar.moveBoundY = (t.UIScrollView.UIScroll.y < 0 ? (e.deltaY < 0 ? Math.max(0, -t.UIScrollView.UIScroll.y): 0): (e.deltaY > 0 ? Math.max(0, t.UIScrollView.UIScroll.y - t.UIScrollView.UIDimension.contentHeight): 0)) / (t.UIScrollView.UIDimension.el.clientHeight / 8);
                    t.UIScrollView.UIScroll.deltaY = (-e.deltaY * (t.UIScrollView.UIDimension.el2.scrollHeight / t.UIScrollView.UIDimension.el.clientHeight) * (t.UIScrollView.UIElement.main.clientHeight / t.UIElement.scrollbar.trackY.clientHeight)) / Math.pow(1 + t.UIScrollbar.moveBoundY, 3);
                    if (!t.UIScrollView.UIAnimation.isAnim) {
                        t.UIScrollView.UIAnimation.active(true);
                        t.UIScrollView.UIAnimation.anim();
                    }
                });
            }
        }
    });

    t.UIScrollView.UIListener.scroll(function(e) {
        if (t.UIScrollView.UIScroll) {
            t.UIElement.scrollbar.trackX.style.visibility = e.contentWidth != 0 && t.UIScrollView.UIConfig.scrollX ? "visible": "hidden";
            t.UIElement.scrollbar.trackY.style.visibility = e.contentHeight != 0 && t.UIScrollView.UIConfig.scrollY ? "visible": "hidden";
        } else if (t.UIScrollView.UIOverscroll) {
            if (t.UIScrollView.UIKinetic.UIKinetic) {
                t.UIElement.scrollbar.trackX.style.visibility = e.contentWidth != 0 && t.UIScrollView.UIKinetic.UIConfig.kineticX ? "visible": "hidden";
                t.UIElement.scrollbar.trackY.style.visibility = e.contentHeight != 0 && t.UIScrollView.UIKinetic.UIConfig.kineticY ? "visible": "hidden";
            } else if (t.UIScrollView.UIKinetic.UIOverflowScroll) {
                t.UIElement.scrollbar.trackX.style.visibility = e.contentWidth != 0 && t.UIScrollView.UIKinetic.UIConfig.scrollX ? "visible": "hidden";
                t.UIElement.scrollbar.trackY.style.visibility = e.contentHeight != 0 && t.UIScrollView.UIKinetic.UIConfig.scrollY ? "visible": "hidden";
            }
        }

        var UIStatusMovingX = ((!t.UIScrollView.UIScroll ? e.velX: e.distanceX) != 0 && e.x > 0 && e.x < e.contentWidth) || e.x < 0 || e.x > e.contentWidth || !t.UIConfig.autoHide || e.isPressed ? true: false;
        var UIStatusMovingY = ((!t.UIScrollView.UIScroll ? e.velY: e.distanceY) != 0 && e.y > 0 && e.y < e.contentHeight) || e.y < 0 || e.y > e.contentHeight || !t.UIConfig.autoHide || e.isPressed ? true: false;

        t.UIElement.scrollbar.trackX.style.transition = UIStatusMovingX ? "opacity 0ms, height 250ms": "opacity 250ms 1000ms, height 250ms";
        t.UIElement.scrollbar.trackY.style.transition = UIStatusMovingY ? "opacity 0ms, width 250ms": "opacity 250ms 1000ms, width 250ms";

        t.UIElement.scrollbar.trackX.style.opacity = UIStatusMovingX ? t.UIConfig.opacity: 0;
        t.UIElement.scrollbar.trackY.style.opacity = UIStatusMovingY ? t.UIConfig.opacity: 0;

        if (t.UIScrollView.UIScroll) {
            t.UIScrollbar.barBoundX = Math.round(e.x < 0 ? Math.max(0, 0 - e.x): Math.max(0, e.x - e.contentWidth));
            t.UIScrollbar.barBoundY = Math.round(e.y < 0 ? Math.max(0, 0 - e.y): Math.max(0, e.y - e.contentHeight));
        } else if (t.UIScrollView.UIOverscroll) {
            if (t.UIScrollView.UIConfig.effect == "bounce") {
                t.UIScrollbar.barBoundX = Math.round(e.x < 0 ? Math.max(0, 0 - e.x): Math.max(0, e.x - e.contentWidth));
                t.UIScrollbar.barBoundY = Math.round(e.y < 0 ? Math.max(0, 0 - e.y): Math.max(0, e.y - e.contentHeight));
            } else {
                t.UIScrollbar.barBoundX = 0;
                t.UIScrollbar.barBoundY = 0;
            }
        }
        if (!t.UIConfig.shrink) {
            t.UIScrollbar.barBoundX = 0;
            t.UIScrollbar.barBoundY = 0;
        }

        t.UIScrollbar.barWidth = Math.round(HtmlUIClamp(t.UIElement.scrollbar.trackX.clientHeight * 2, t.UIElement.scrollbar.trackX.clientWidth, HtmlUIClamp(t.UIConfig.minSize, t.UIConfig.maxSize, t.UIElement.scrollbar.trackX.clientWidth * (e.clientWidth / e.scrollWidth)) - t.UIScrollbar.barBoundX));
        t.UIScrollbar.barHeight = Math.round(HtmlUIClamp(t.UIElement.scrollbar.trackY.clientWidth * 2, t.UIElement.scrollbar.trackY.clientHeight, HtmlUIClamp(t.UIConfig.minSize, t.UIConfig.maxSize, t.UIElement.scrollbar.trackY.clientHeight * (e.clientHeight / e.scrollHeight)) - t.UIScrollbar.barBoundY));


        t.UIScrollbar.barX = Math.floor((HtmlUIClamp(0, e.contentWidth, e.x) / e.contentWidth) * (t.UIElement.scrollbar.trackX.clientWidth - t.UIScrollbar.barWidth));
        t.UIScrollbar.barY = Math.floor((HtmlUIClamp(0, e.contentHeight, e.y) / e.contentHeight) * (t.UIElement.scrollbar.trackY.clientHeight - t.UIScrollbar.barHeight));


        t.UIElement.scrollbar.thumbX.style.width = t.UIScrollbar.barWidth + "px";
        t.UIElement.scrollbar.thumbY.style.height = t.UIScrollbar.barHeight + "px";

        t.UIElement.scrollbar.thumbX.style.transform = `translateX(${t.UIScrollbar.barX}px)`;
        t.UIElement.scrollbar.thumbY.style.transform = `translateY(${t.UIScrollbar.barY}px)`;
    });

    t.UIAction = {
        updateScrollbar: function() {
            UIScrollbarStyle();
        }
    }
}
window.HtmlUI.Kinetic = function(el, config = {}) {
    var t = this;
    t.UIElement = {}

    t.UIElement.main = HtmlUIBuild(el);

    t.UIGesture = new SuperGesture(t.UIElement.main);

    t.UIListener = new HtmlUIListener(["update"]);

    t.UIConfig = {
        friction: 0.0375,
        minDelta: 0.1,
        maxDelta: 250,
        sensivity: 1,
        kineticX: true,
        kineticY: true,
        fast: false
    }
    HtmlUIConfig(t.UIConfig,
        config);

    t.UIKinetic = {
        deltaX: 0,
        deltaY: 0,
        velX: 0,
        velY: 0,
        frameSync: 0,
        isPressed: false,
        fastX: 0,
        fastY: 0,
        fastDebounce_1: null,
        fastDebounce_2: null,
        fastDebounce_3: null
    }

    t.UIAnimation = new HtmlUIAnimation(function(e) {
        t.UIKinetic.frameSync = e.frameSync || 0;

        if (!t.UIKinetic.isPressed) {
            t.UIKinetic.velX = t.UIKinetic.deltaX * t.UIKinetic.frameSync;
            t.UIKinetic.velY = t.UIKinetic.deltaY * t.UIKinetic.frameSync;
        }

        if (Math.abs(t.UIKinetic.deltaX) < t.UIConfig.minDelta && Math.abs(t.UIKinetic.deltaY) < t.UIConfig.minDelta) {
            t.UIKinetic.deltaX = 0;
            t.UIKinetic.deltaY = 0;
            t.UIKinetic.velX = t.UIKinetic.deltaX;
            t.UIKinetic.velY = t.UIKinetic.deltaY;
            t.UIAnimation.active(false);
        }

        t.UIKinetic.deltaX += (0 - t.UIKinetic.deltaX) * Math.min(1, t.UIConfig.friction * t.UIKinetic.frameSync);
        t.UIKinetic.deltaY += (0 - t.UIKinetic.deltaY) * Math.min(1, t.UIConfig.friction * t.UIKinetic.frameSync);

        if (!t.UIKinetic.isPressed) {
            if (t.UIConfig.fast) {
                t.UIKinetic.fastX = t.UIKinetic.deltaX;
                t.UIKinetic.fastY = t.UIKinetic.deltaY;
            } else {
                t.UIKinetic.fastX = 0;
                t.UIKinetic.fastY = 0;
            }
        }

        t.UIListener._event.listenEvent._execEvent("update");
    });

    t.UIAction = {
        setDelta: function(x = 0,
            y = 0) {
            t.UIKinetic.deltaX = !isNaN(x) ? x: 0;
            t.UIKinetic.deltaY = !isNaN(y) ? y: 0;
            t.UIKinetic.velX = t.UIKinetic.deltaX;
            t.UIKinetic.velY = t.UIKinetic.deltaY;

            if (!t.UIAnimation.isAnim) {
                t.UIAnimation.active(true);
                t.UIAnimation.anim();
            }
        },
        addDelta: function(x = 0, y = 0) {
            t.UIKinetic.deltaX += !isNaN(x) ? x: 0;
            t.UIKinetic.deltaY += !isNaN(y) ? y: 0;
            t.UIKinetic.velX = t.UIKinetic.deltaX;
            t.UIKinetic.velY = t.UIKinetic.deltaY;

            if (!t.UIAnimation.isAnim) {
                t.UIAnimation.active(true);
                t.UIAnimation.anim();
            }
        }
    }

    t.UIGesture.listen.onStart(function() {
        var fireStart = function() {
            t.UIAnimation.active(false);
            t.UIKinetic.velX = 0;
            t.UIKinetic.velY = 0;
            t.UIKinetic.deltaX = 0;
            t.UIKinetic.deltaY = 0;

            t.UIKinetic.isPressed = true;
        }
        if (t.UIConfig.fast) {
            t.UIKinetic.fastDebounce_1 = window.requestAnimationFrame(function() {
                t.UIKinetic.fastDebounce_2 = window.requestAnimationFrame(function() {
                    t.UIKinetic.fastDebounce_3 = window.requestAnimationFrame(function() {
                        fireStart();
                    });
                });
            });
        } else {
            fireStart();
        }
    });
    t.UIGesture.listen.onSwipeLock(function(e) {
        if (t.UIConfig.fast) {
            t.UIKinetic.isPressed = true;

            window.cancelAnimationFrame(t.UIKinetic.fastDebounce_1);
            window.cancelAnimationFrame(t.UIKinetic.fastDebounce_2);
            window.cancelAnimationFrame(t.UIKinetic.fastDebounce_3);
        }

        t.UIGesture.swipeAxis(t.UIConfig.kineticX, t.UIConfig.kineticY);
        t.UIGesture.updateConfig({
            maxDelta: t.UIConfig.maxDelta,
            deltaSpeed: t.UIConfig.sensivity
        });

        t.UIKinetic.deltaX = t.UIConfig.kineticX ? e.deltaX: 0;
        t.UIKinetic.deltaY = t.UIConfig.kineticY ? e.deltaY: 0;
        t.UIKinetic.velX = t.UIKinetic.deltaX;
        t.UIKinetic.velY = t.UIKinetic.deltaY;

        t.UIAnimation.active(false);
        t.UIAnimation.anim();
    });
    t.UIGesture.listen.onFlingLock(function(e) {
        t.UIKinetic.isPressed = false;

        t.UIKinetic.fastX = (e.deltaX != 0 ? (e.deltaX > 0 ? Math.max(0, t.UIKinetic.fastX): -Math.max(0, -t.UIKinetic.fastX)): 0) || 0;
        t.UIKinetic.fastY = (e.deltaY != 0 ? (e.deltaY > 0 ? Math.max(0, t.UIKinetic.fastY): -Math.max(0, -t.UIKinetic.fastY)): 0) || 0;

        t.UIKinetic.deltaX = t.UIConfig.kineticX ? e.deltaX + t.UIKinetic.fastX: 0;
        t.UIKinetic.deltaY = t.UIConfig.kineticY ? e.deltaY + t.UIKinetic.fastY: 0;
        t.UIKinetic.velX = t.UIKinetic.deltaX;
        t.UIKinetic.velY = t.UIKinetic.deltaY;

        t.UIAnimation.active(true);
        t.UIAnimation.anim();
    });

    t.UIListener["update"] = function(callback) {
        t.UIListener._event.listenEvent.on("update",
            function() {
                callback({
                    deltaX: t.UIKinetic.deltaX,
                    deltaY: t.UIKinetic.deltaY,
                    velX: t.UIKinetic.velX,
                    velY: t.UIKinetic.velY,
                    frameSync: t.UIKinetic.frameSync,
                    isPressed: t.UIKinetic.isPressed
                });
            });
    }
}
window.HtmlUI.InnerHTML = function(el, rawhtml) {
    el.innerHTML = rawhtml;
    Array.from(el.querySelectorAll("script")).forEach(function(oScript) {
        var nScript = document.createElement("script");
        Array.from(oScript.attributes).forEach(function(attr) {
            nScript.setAttribute(attr.name, attr.value);
        });
        nScript.appendChild(document.createTextNode(oScript.innerHTML));
        if (oScript && oScript.parentNode) {
            oScript.parentNode.replaceChild(nScript, oScript);
        }
    });
}
window.HtmlUI.RawXHR = function(urlXHR = "", autoRun = false, XCharset = false, accessControl = true) {
    var t = this;

    t.UIListener = new HtmlUIListener(["load",
        "error",
        "call",
        "xhrerror",
        "progress",
        "callprogress"]);
    var UIXHR = new XMLHttpRequest();

    t.UIRaw = {
        url: urlXHR,
        status: 0,
        contentType: "",
        response: {},
        progress: {},
        XCharset: XCharset,
        accessControl: accessControl
    }

    UIXHR.onload = function() {
        t.UIRaw.status = UIXHR.status;
        t.UIRaw.response = UIXHR.responseText;
        t.UIRaw.contentType = this.getResponseHeader("content-type");

        if (t.UIRaw.status == 200) {
            t.UIListener._event.listenEvent._execEvent("load");
        } else {
            t.UIListener._event.listenEvent._execEvent("error");
        }
        t.UIListener._event.listenEvent._execEvent("call");
        t.UIListener._event.listenEvent._execEvent("callprogress");
    }
    UIXHR.onerror = function() {
        t.UIRaw.contentType = this.getResponseHeader("content-type");
        t.UIListener._event.listenEvent._execEvent("xhrerror");
    }
    UIXHR.onprogress = function(e) {
        t.UIRaw.response = UIXHR.responseText;
        t.UIRaw.progress = e;
        t.UIRaw.contentType = this.getResponseHeader("content-type");
        t.UIListener._event.listenEvent._execEvent("progress");
        t.UIListener._event.listenEvent._execEvent("callprogress");
    }

    t.UIAction = {}
    t.UIAction.update = function() {
        try {
            UIXHR.open("GET", t.UIRaw.url && t.UIRaw.url != "" ? t.UIRaw.url: null, true);
            if (t.UIRaw.accessControl) {
            UIXHR.setRequestHeader("Access-Control-Allow-Headers", "*");
            UIXHR.setRequestHeader("Access-Control-Allow-Origin", "*");
        }
            if (t.UIRaw.XCharset) UIXHR.overrideMimeType("text/plain; charset=x-user-defined");
            else UIXHR.overrideMimeType("text/plain");
            UIXHR.send();
        } catch (e) {
            t.UIListener._event.listenEvent._execEvent("xhrerror");
        }
    }
    t.UIAction.changeURL = function(urlXHR, XCharset = false, accessControl = true) {
        t.UIRaw.url = urlXHR;
        t.UIRaw.XCharset = XCharset;
        t.UIRaw.accessControl = accessControl;
    }

    t.UIListener["load"] = function(callback) {
        t.UIListener._event.listenEvent.on("load", function() {
            callback(t.UIRaw.response, t.UIRaw.status, t.UIRaw.contentType);
        });
    }
    t.UIListener["error"] = function(callback) {
        t.UIListener._event.listenEvent.on("error", function() {
            callback(t.UIRaw.response, t.UIRaw.status, t.UIRaw.contentType);
        });
    }
    t.UIListener["call"] = function(callback) {
        t.UIListener._event.listenEvent.on("call", function() {
            callback(t.UIRaw.response, t.UIRaw.status, t.UIRaw.contentType);
        });
    }
    t.UIListener["xhrerror"] = function(callback) {
        t.UIListener._event.listenEvent.on("xhrerror", function() {
            callback();
        });
    }
    t.UIListener["progress"] = function(callback) {
        t.UIListener._event.listenEvent.on("progress", function() {
            callback(t.UIRaw.progress, t.UIRaw.contentType);
        });
    }
    t.UIListener["callprogress"] = function(callback) {
        t.UIListener._event.listenEvent.on("callprogress", function() {
            callback(t.UIRaw.progress, t.UIRaw.response, t.UIRaw.status, t.UIRaw.contentType);
        });
    }

    if (autoRun == true && urlXHR != "") {
        t.UIAction.update();
    }
}
window.HtmlUI.FileXHR = function(urlXHR = "", mimeType, autoRun = false, arrayBuffer = false, accessControl = true) {
    var t = this;

    t.UIListener = new HtmlUIListener(["load", "error", "call", "xhrerror", "progress", "callprogress"]);
    var UIXHR = new XMLHttpRequest();

    t.UIFile = {
        url: urlXHR,
        status: 0,
        response: {},
        progress: {},
        mimeType: mimeType,
        contentType: "",
        base64: "",
        isArrayBuffer: arrayBuffer,
        accessControl: accessControl
    }

    UIXHR.onload = function() {
        t.UIFile.status = UIXHR.status;
        t.UIFile.contentType = this.getResponseHeader("content-type");

        var UIUint8Array = new Uint8Array(this.response);
        var UI_i = UIUint8Array.length;
        var UIBiStr = new Array(UI_i);
        while (UI_i--) {
            UIBiStr[UI_i] = String.fromCharCode(UIUint8Array[UI_i]);
        }
        var UIData = UIBiStr.join("");
        var UIBase64 = window.btoa(UIData);

        t.UIFile.base64 = UIBase64;
        if (t.UIFile.isArrayBuffer) {
            t.UIFile.response = this.response;
        } else {
            t.UIFile.response = `data:${t.UIFile.mimeType};base64,${UIBase64}`;
        }

        if (t.UIFile.status == 200) {
            t.UIListener._event.listenEvent._execEvent("load");
        } else {
            t.UIListener._event.listenEvent._execEvent("error");
        }
        t.UIListener._event.listenEvent._execEvent("call");
        t.UIListener._event.listenEvent._execEvent("callprogress");
    }
    UIXHR.onerror = function() {
        t.UIFile.contentType = this.getResponseHeader("content-type");
        t.UIListener._event.listenEvent._execEvent("xhrerror");
    }
    UIXHR.onprogress = function(e) {
        t.UIFile.contentType = this.getResponseHeader("content-type");
        if (t.UIFile.isArrayBuffer) {
            t.UIFile.response = this.response;
        } else {
            t.UIFile.response = [];
        }

        t.UIFile.progress = e;
        t.UIListener._event.listenEvent._execEvent("progress");
        t.UIListener._event.listenEvent._execEvent("callprogress");
    }

    t.UIAction = {}
    t.UIAction.update = function() {
        UIXHR.open("GET", t.UIFile.url && t.UIFile.url != "" ? t.UIFile.url: null, true);
        UIXHR.responseType = "arraybuffer";
        if (t.UIFile.accessControl) {
            UIXHR.setRequestHeader("Access-Control-Allow-Headers", "*");
            UIXHR.setRequestHeader("Access-Control-Allow-Origin", "*");
        }
        UIXHR.send();
    }
    t.UIAction.changeURL = function(urlXHR, mimeType, arrayBuffer = false, accessControl = true) {
        t.UIFile.isArrayBuffer = arrayBuffer;
        t.UIFile.url = urlXHR;
        t.UIFile.accessControl = accessControl;
    }

    t.UIListener["load"] = function(callback) {
        t.UIListener._event.listenEvent.on("load", function() {
            callback({
                response: t.UIFile.response, status: t.UIFile.status, base64: t.UIFile.base64, contentType: t.UIFile.contentType
            });
        });
    }
    t.UIListener["error"] = function(callback) {
        t.UIListener._event.listenEvent.on("error", function() {
            callback(t.UIFile.status, t.UIFile.contentType);
        });
    }
    t.UIListener["call"] = function(callback) {
        t.UIListener._event.listenEvent.on("call", function() {
            callback({
                response: t.UIFile.status == 200 ? t.UIFile.response: null, status: t.UIFile.status, base64: t.UIFile.status == 200 ? t.UIFile.base64: null, contentType: t.UIFile.contentType
            });
        });
    }
    t.UIListener["xhrerror"] = function(callback) {
        t.UIListener._event.listenEvent.on("xhrerror", function() {
            callback();
        });
    }
    t.UIListener["progress"] = function(callback) {
        t.UIListener._event.listenEvent.on("progress", function() {
            callback(t.UIFile.progress, t.UIFile.contentType);
        });
    }
    t.UIListener["callprogress"] = function(callback) {
        t.UIListener._event.listenEvent.on("callprogress", function() {
            callback(t.UIFile.progress, t.UIFile.response, t.UIFile.status, t.UIFile.contentType);
        });
    }

    if (autoRun == true && urlXHR != "") {
        t.UIAction.update();
    }
}
window.HtmlUI.FileBlobXHR = function(urlXHR = "", autoRun = false, accessControl = true) {
    var t = this;

    t.UIListener = new HtmlUIListener(["load", "error", "call", "xhrerror", "progress"]);
    var UIXHR = new XMLHttpRequest();

    t.UIFile = {
        url: urlXHR,
        status: 0,
        response: {},
        progress: {},
        blob: null,
        accessControl: accessControl,
        contentType: ""
    }

    UIXHR.onload = function() {
        t.UIFile.status = UIXHR.status;
        t.UIFile.contentType = this.getResponseHeader("content-type");

        t.UIFile.blob = this.response;
        t.UIFile.response = URL.createObjectURL(t.UIFile.blob);

        if (t.UIFile.status == 200) {
            t.UIListener._event.listenEvent._execEvent("load");
            t.UIListener._event.listenEvent._execEvent("call");
        } else {
            t.UIListener._event.listenEvent._execEvent("error");
            t.UIListener._event.listenEvent._execEvent("call");
        }
    }
    UIXHR.onerror = function() {
        t.UIFile.contentType = this.getResponseHeader("content-type");
        t.UIListener._event.listenEvent._execEvent("xhrerror");
    }
    UIXHR.onprogress = function(e) {
        t.UIFile.contentType = this.getResponseHeader("content-type");
        t.UIFile.progress = e;
        t.UIListener._event.listenEvent._execEvent("progress");
    }

    t.UIAction = {}
    t.UIAction.update = function() {
        UIXHR.open("GET", t.UIFile.url && t.UIFile.url != "" ? t.UIFile.url: null, true);
        UIXHR.responseType = "blob";
        if (t.UIFile.accessControl) {
            UIXHR.setRequestHeader("Access-Control-Allow-Headers", "*");
            UIXHR.setRequestHeader("Access-Control-Allow-Origin", "*");
        }
        UIXHR.send();
    }
    t.UIAction.changeURL = function(urlXHR, accessControl = true) {
        t.UIFile.url = urlXHR;
        t.UIFile.accessControl = accessControl;
    }

    t.UIListener["load"] = function(callback) {
        t.UIListener._event.listenEvent.on("load", function() {
            callback({
                response: t.UIFile.response, status: t.UIFile.status, base64: t.UIFile.blob, contentType: t.UIFile.contentType
            });
        });
    }
    t.UIListener["error"] = function(callback) {
        t.UIListener._event.listenEvent.on("error", function() {
            callback(t.UIFile.status, t.UIFile.contentType);
        });
    }
    t.UIListener["call"] = function(callback) {
        t.UIListener._event.listenEvent.on("call", function() {
            callback({
                response: t.UIFile.status == 200 ? t.UIFile.response: null, status: t.UIFile.status, blob: t.UIFile.status == 200 ? t.UIFile.blob: null, contentType: t.UIFile.contentType
            });
        });
    }
    t.UIListener["xhrerror"] = function(callback) {
        t.UIListener._event.listenEvent.on("xhrerror", function() {
            callback();
        });
    }
    t.UIListener["progress"] = function(callback) {
        t.UIListener._event.listenEvent.on("progress", function() {
            callback(t.UIFile.progress, t.UIFile.contentType);
        });
    }

    if (autoRun == true && urlXHR != "") {
        t.UIAction.update();
    }
}
window.HtmlUI.AMPMode = function(components) {
    var UIAMPV0 = document.createElement("script");
    UIAMPV0.setAttribute("async", "");
    UIAMPV0.setAttribute("src", "https://cdn.ampproject.org/v0.js");
    UIAMPV0.addEventListener("load", function() {
        console.debug("[HtmlUI AMPMode]", `AMP Main "v0.js" bulided`);

        components.forEach(function(e) {
            var UIAMPComponent = document.createElement("script");
            var componentName = e.split(" ")[0];
            var componentVersion = e.split(" ")[1] || "0.1";
            UIAMPComponent.setAttribute("async", "");
            UIAMPComponent.setAttribute("custom-element", componentName);
            UIAMPComponent.setAttribute("src", `https://cdn.ampproject.org/v0/${componentName}-${componentVersion}.js#Powered-by-HtmlUI`);

            UIAMPComponent.addEventListener("load", function() {
                console.debug("[HtmlUI AMPMode]", `AMP Component "${componentName}" on version ${componentVersion} successful loaded`);
            });
            UIAMPComponent.addEventListener("error", function() {
                throw new Error(`[HtmlUI AMPMode] Can't load AMP Component "${componentName}" on version ${componentVersion}`);
            });

            document.head.appendChild(UIAMPComponent);
        });
    });
    UIAMPV0.addEventListener("error", function() {
        throw new Error(`[HtmlUI AMPMode] Can't bulid AMP Main "v0.js"`);
    });
    document.head.appendChild(UIAMPV0);
}
window.HtmlUI.OverflowScroll = function(el, config = {}) {
    var t = this,
    _defaultInterpolator = HtmlUI.Math.splineCurve(function(e) {
        return 1 - Math.pow(1 - e, 7.5);
    }, 100);
    t.UIElement = {}

    t.UIElement.main = HtmlUIBuild(el);
    t.UIGesture = new SuperGesture(t.UIElement.main);

    t.UIListener = new HtmlUIListener(["scroll"]);

    t.UIConfig = {
        friction: 0.01,
        sensivity: 1,
        curve: function(e) {
            return _defaultInterpolator(e);
        },
        scrollX: true,
        scrollY: true,
        kineticMode: false,
        fastScroll: false,
        maxVelocity: Infinity,
        powerFriction: Math.log(7.5),
        disableStyleHtmlUIBuild: false
    }
    HtmlUIConfig(t.UIConfig, config);

    if (!t.UIConfig.kineticMode) {
        t.UIElement.main.classList.add("htmlui-overflow-scroll");
    }

    if (t.UIConfig.disableStyleHtmlUIBuild && !t.UIConfig.kineticMode) {
        t.UIElement.main.classList.remove("htmlui-style");
        t.UIElement.main.style.setProperty("touch-action", "none", "important");
    }

    t.UIOverflowScroll = {
        startTime: 0,
        deltaTime: 0,
        deltaTime1: 0,
        step: 0,
        duration: 0,
        duration1: 0,
        interpolator: 0,
        interpolator1: 0,
        interpolator2: 0,
        deltaX: 0,
        deltaY: 0,
        velX: 0,
        velY: 0,
        vel2X: 0,
        vel2Y: 0,
        fastX: 0,
        fastY: 0,
        fastDebounce_1: null,
        fastDebounce_2: null,
        fastDebounce_3: null,
        deltaStep: 0,
        isPressed: false,
        _x: 0,
        _y: 0,
        xV: 0,
        yV: 0,
        xV2: 0,
        yV2: 0
    }

    t.UIAnimation = new HtmlUIAnimation(function(e) {
        t.UIOverflowScroll.duration = HtmlUIClamp(1, Infinity, Math.abs(t.UIOverflowScroll.duration));
        if (t.UIOverflowScroll.isPressed) {
            t.UIOverflowScroll.startTime = e.time;
            t.UIOverflowScroll.deltaTime = e.time - t.UIOverflowScroll.deltaTime1;
            t.UIOverflowScroll.deltaTime1 = e.time;
        } else {
            t.UIOverflowScroll.step = HtmlUIClamp(0, 1, (e.time - t.UIOverflowScroll.startTime) / t.UIOverflowScroll.duration);
            t.UIOverflowScroll.interpolator1 = t.UIConfig.curve(t.UIOverflowScroll.step, t.UIOverflowScroll.duration, t) || 0;
            t.UIOverflowScroll.interpolator = t.UIOverflowScroll.interpolator1 - t.UIOverflowScroll.interpolator2;
            t.UIOverflowScroll.interpolator2 = t.UIOverflowScroll.interpolator1;

            t.UIOverflowScroll.deltaStep = t.UIOverflowScroll.interpolator / (t.UIConfig.curve((1000 / 60) / t.UIOverflowScroll.duration, t.UIOverflowScroll.duration, t) || (t.UIOverflowScroll.deltaTime / t.UIOverflowScroll.duration));

            if (!t.UIOverflowScroll.isPressed && (t.UIOverflowScroll.velX != 0 || t.UIOverflowScroll.velY != 0)) {
                if (t.UIConfig.fastScroll) {
                    t.UIOverflowScroll.fastX = t.UIOverflowScroll.velX / (e.frameSync || 1);
                    t.UIOverflowScroll.fastY = t.UIOverflowScroll.velY / (e.frameSync || 1);
                } else {
                    t.UIOverflowScroll.fastX = 0;
                    t.UIOverflowScroll.fastY = 0;
                }
            }

            t.UIOverflowScroll.velX = HtmlUIClamp(-t.UIConfig.maxVelocity, t.UIConfig.maxVelocity, t.UIOverflowScroll.deltaX * t.UIOverflowScroll.deltaStep || 0);
            t.UIOverflowScroll.velY = HtmlUIClamp(-t.UIConfig.maxVelocity, t.UIConfig.maxVelocity, t.UIOverflowScroll.deltaY * t.UIOverflowScroll.deltaStep || 0);
            t.UIOverflowScroll.vel2X = t.UIOverflowScroll.velX;
            t.UIOverflowScroll.vel2Y = t.UIOverflowScroll.velY;

            if (t.UIOverflowScroll.deltaStep == 0 && t.UIOverflowScroll.step == 1) {
                t.UIOverflowScroll._x = 0;
                t.UIOverflowScroll.xV = 0;
                t.UIOverflowScroll.xV2 = 0;

                t.UIOverflowScroll._y = 0;
                t.UIOverflowScroll.yV = 0;
                t.UIOverflowScroll.yV2 = 0;

                t.UIAnimation.active(false);
            }
        }
        if (!t.UIConfig.kineticMode) {
            t.UIOverflowScroll._x += t.UIOverflowScroll.velX;
            t.UIOverflowScroll.xV = Math.round(t.UIOverflowScroll._x * 2) / 2 - t.UIOverflowScroll.xV2;
            t.UIOverflowScroll.xV2 = Math.round(t.UIOverflowScroll._x * 2) / 2;

            t.UIOverflowScroll._y += t.UIOverflowScroll.velY;
            t.UIOverflowScroll.yV = Math.round(t.UIOverflowScroll._y * 2) / 2 - t.UIOverflowScroll.yV2;
            t.UIOverflowScroll.yV2 = Math.round(t.UIOverflowScroll._y * 2) / 2;

            t.UIOverflowScroll.vel2X = t.UIOverflowScroll.xV;
            t.UIOverflowScroll.vel2Y = t.UIOverflowScroll.yV;
            t.UIElement.main.scrollBy({
                left: 0 - t.UIOverflowScroll.vel2X,
                top: 0 - t.UIOverflowScroll.vel2Y,
                behavior: "instant"
            });
        }

        t.UIListener._event.listenEvent._execEvent("scroll");
    });

    var calculateFling = function(event) {
        t.UIOverflowScroll.fastX = (event.deltaX != 0 ? (event.deltaX > 0 ? Math.max(0, t.UIOverflowScroll.fastX): -Math.max(0, -t.UIOverflowScroll.fastX)): 0) || 0;
        t.UIOverflowScroll.fastY = (event.deltaY != 0 ? (event.deltaY > 0 ? Math.max(0, t.UIOverflowScroll.fastY): -Math.max(0, -t.UIOverflowScroll.fastY)): 0) || 0;
        t.UIOverflowScroll.deltaX = t.UIConfig.scrollX ? (event.deltaX + t.UIOverflowScroll.fastX): 0;
        t.UIOverflowScroll.deltaY = t.UIConfig.scrollY ? (event.deltaY + t.UIOverflowScroll.fastY): 0;

        t.UIOverflowScroll.duration1 = Math.abs(Math.abs(t.UIOverflowScroll.deltaX) > Math.abs(t.UIOverflowScroll.deltaY) ? t.UIOverflowScroll.deltaX: t.UIOverflowScroll.deltaY);
        t.UIOverflowScroll.duration = (t.UIOverflowScroll.duration1 / (1 + Math.pow(t.UIOverflowScroll.duration1, 0.5 * t.UIConfig.powerFriction))) * (Math.pow(t.UIConfig.powerFriction, 2) * 8 / t.UIConfig.friction);

        if (t.UIConfig.fastScroll) {
            t.UIOverflowScroll.step = 0;
            t.UIOverflowScroll.interpolator1 = t.UIConfig.curve(t.UIOverflowScroll.step, t.UIOverflowScroll.duration, t);
            t.UIOverflowScroll.interpolator = t.UIOverflowScroll.interpolator1 - t.UIOverflowScroll.interpolator2;
            t.UIOverflowScroll.interpolator2 = t.UIOverflowScroll.interpolator1;
        }
    }

    t.UIGesture.listen.onStart(function(e) {
        var fireStart = function() {
            t.UIAnimation.active(false);
            t.UIOverflowScroll.isPressed = true;
            t.UIOverflowScroll.step = 0;
            t.UIOverflowScroll.interpolator1 = t.UIConfig.curve(t.UIOverflowScroll.step, t.UIOverflowScroll.duration, t);
            t.UIOverflowScroll.interpolator = t.UIOverflowScroll.interpolator1 - t.UIOverflowScroll.interpolator2;
            t.UIOverflowScroll.interpolator2 = t.UIOverflowScroll.interpolator1;
        }
        if (t.UIConfig.fastScroll) {
            t.UIOverflowScroll.fastDebounce_1 = window.requestAnimationFrame(function() {
                t.UIOverflowScroll.fastDebounce_2 = window.requestAnimationFrame(function() {
                    t.UIOverflowScroll.fastDebounce_3 = window.requestAnimationFrame(function() {
                        fireStart();
                    });
                });
            });
        } else {
            fireStart();
        }
    });
    t.UIGesture.listen.onSwipeLock(function(e) {
        if (t.UIConfig.fastScroll) {
            t.UIOverflowScroll.isPressed = true;

            window.cancelAnimationFrame(t.UIOverflowScroll.fastDebounce_1);
            window.cancelAnimationFrame(t.UIOverflowScroll.fastDebounce_2);
            window.cancelAnimationFrame(t.UIOverflowScroll.fastDebounce_3);
        }

        t.UIGesture.swipeAxis(t.UIConfig.scrollX, t.UIConfig.scrollY);
        t.UIOverflowScroll.velX = t.UIConfig.scrollX ? e.deltaX: 0;
        t.UIOverflowScroll.velY = t.UIConfig.scrollY ? e.deltaY: 0;

        t.UIGesture.updateConfig({
            maxDelta: (Math.abs(t.UIOverflowScroll.velX) > Math.abs(t.UIOverflowScroll.velY) ? t.UIElement.main.clientWidth: t.UIElement.main.clientHeight) / 4,
            deltaSpeed: t.UIConfig.sensivity
        });

        t.UIAnimation.active(false);
        t.UIAnimation.anim();
    });
    t.UIGesture.listen.onFlingLock(function(e) {
        t.UIOverflowScroll.isPressed = false;

        calculateFling(e);

        if (!t.UIAnimation.isAnim) {
            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        }
    });

    t.UIElement.main.addEventListener("scroll",
        function() {
            if (!t.UIConfig.kineticMode && !t.UIAnimation.isAnim) t.UIListener._event.listenEvent._execEvent("scroll");
        });

    t.UIListener["scroll"] = function(callback) {
        t.UIListener._event.listenEvent.on("scroll",
            function() {
                callback({
                    scrollLeft: !t.UIConfig.kineticMode ? t.UIElement.main.scrollLeft: 0,
                    scrollTop: !t.UIConfig.kineticMode ? t.UIElement.main.scrollTop: 0,
                    velX: t.UIOverflowScroll.velX,
                    velY: t.UIOverflowScroll.velY,
                    kineticMode: t.UIConfig.kineticMode,
                    isPressed: t.UIOverflowScroll.isPressed,
                    main: t.UIElement.main,
                    duration: t.UIOverflowScroll.duration
                });
            });
    }
}
window.HtmlUI.Overscroll = function(UIScrollView, config = {}) {
    var t = this;
    t.UIKinetic = UIScrollView;
    if (!t.UIKinetic.UIKinetic) {
        t.UIKinetic.UIConfig.kineticMode = true;
    }

    t.UIElement = {}

    t.UIElement.main = t.UIKinetic.UIElement.main;
    t.UIElement.main.classList.add("htmlui-overscroll");
    var restoreHTML = t.UIElement.main.innerHTML;
    t.UIElement.main.innerHTML = "";

    t.UIElement.layer = document.createElement("htmlui-content-overflow-scroll-layer");
    HtmlUI.Layout(t.UIElement.layer, "fill");
    t.UIElement.main.appendChild(t.UIElement.layer);

    t.UIElement.content = document.createElement("htmlui-content-overflow-scroll");
    HtmlUI.Layout(t.UIElement.content, "fill");
    HtmlUI.InnerHTML(t.UIElement.content, restoreHTML);
    t.UIElement.layer.appendChild(t.UIElement.content);

    t.UIElement.effect = {
        glow: document.createElement("htmlui-overscroll-glow-effect")
    }
    t.UIElement.main.appendChild(t.UIElement.effect.glow);

    t.UIListener = new HtmlUIListener(["scroll"]);

    t.UIConfig = {
        effect: "stretch",
        glowColor: "black",
        glowOpacity: 0.5,
        alwaysOverscroll: true,
        alwaysImproveAnimation: false
    }
    HtmlUIConfig(t.UIConfig, config);

    t.UIOverscroll = {
        x: 0,
        y: 0,
        velX: 0,
        velY: 0,
        vel2X: 0,
        vel2Y: 0,
        activeOverscrollX: false,
        activeOverscrollY: false,
        isPressed: false,
        isAnimate: false
    }

    t.UIElement.layer.style.cssText = "left: 0px; top: 0px" + (t.UIConfig.effect == "stretch" ? "; transform: scale(1, 1)": "");

    t.UIAnimation = new HtmlUIAnimation(function(e) {
        t.UIOverscroll.isAnimate = true;
        var contentX = Math.max(0, t.UIElement.content.scrollWidth - t.UIElement.content.clientWidth);
        var contentY = Math.max(0, t.UIElement.content.scrollHeight - t.UIElement.content.clientHeight);
        if (t.UIConfig.effect == "stretch" || t.UIConfig.effect == "bounce") {
            if (t.UIOverscroll.activeOverscrollX) {
                if (!t.UIOverscroll.isPressed) {
                    t.UIOverscroll.x += t.UIOverscroll.vel2X * e.frameSync;
                    var bounceRate = t.UIConfig.effect == "stretch" ? 0.3: 0.2;
                    var bounceBackRate = t.UIConfig.effect == "stretch" ? 0.2: 0.125;
                    t.UIOverscroll.vel2X += (0 - t.UIOverscroll.vel2X) * Math.min(1, bounceRate * e.frameSync);

                    t.UIOverscroll.x += (HtmlUIClamp(0, contentX, t.UIOverscroll.x) - t.UIOverscroll.x) * Math.min(1, bounceBackRate * e.frameSync);
                }
            }
            if (t.UIOverscroll.activeOverscrollY) {
                if (!t.UIOverscroll.isPressed) {
                    t.UIOverscroll.y += t.UIOverscroll.vel2Y * e.frameSync;
                    var bounceRate = t.UIConfig.effect == "stretch" ? 0.3: 0.2;
                    var bounceBackRate = t.UIConfig.effect == "stretch" ? 0.2: 0.125;
                    t.UIOverscroll.vel2Y += (0 - t.UIOverscroll.vel2Y) * Math.min(1, bounceRate * e.frameSync);

                    t.UIOverscroll.y += (HtmlUIClamp(0, contentY, t.UIOverscroll.y) - t.UIOverscroll.y) * Math.min(1, bounceBackRate * e.frameSync);
                }
            }

            if (t.UIOverscroll.x > -0.1 && t.UIOverscroll.x < contentX + 0.1 && t.UIOverscroll.y > -0.1 && t.UIOverscroll.y < contentY + 0.1) {
                t.UIOverscroll.velX = 0;
                t.UIOverscroll.vel2X = 0;
                t.UIOverscroll.x = HtmlUIClamp(0, contentX, t.UIOverscroll.x);

                t.UIOverscroll.velY = 0;
                t.UIOverscroll.vel2Y = 0;
                t.UIOverscroll.y = HtmlUIClamp(0, contentY, t.UIOverscroll.y);

                t.UIOverscroll.isAnimate = false;

                t.UIOverscroll.activeOverscrollX = false;
                t.UIOverscroll.activeOverscrollY = false;
                t.UIAnimation.active(false);
            }

            if (contentX == 0 && !t.UIConfig.alwaysOverscroll) t.UIOverscroll.x = HtmlUIClamp(0, contentX, t.UIOverscroll.x);
            if (contentY == 0 && !t.UIConfig.alwaysOverscroll) t.UIOverscroll.y = HtmlUIClamp(0, contentY, t.UIOverscroll.y);

            if (t.UIConfig.effect == "stretch") {
                t.UIElement.layer.style.transformOrigin = `
                ${t.UIOverscroll.x < 0 ? 0: 100}%
                ${t.UIOverscroll.y < 0 ? 0: 100}%
                0
                `;
                t.UIElement.layer.style.willChange = t.UIOverscroll.activeOverscrollX || t.UIOverscroll.activeOverscrollY || t.UIConfig.alwaysImproveAnimation ? "transform": "";
                t.UIElement.layer.style.transform = `
                scaleX(${1 + Math.max(0, t.UIOverscroll.x < 0 ? -t.UIOverscroll.x: t.UIOverscroll.x - contentX) / (t.UIElement.main.clientWidth / 0.25)})
                scaleY(${1 + Math.max(0, t.UIOverscroll.y < 0 ? -t.UIOverscroll.y: t.UIOverscroll.y - contentY) / (t.UIElement.main.clientHeight / 0.25)})
                `;
            } else {
                t.UIElement.layer.style.willChange = t.UIOverscroll.activeOverscrollX || t.UIOverscroll.activeOverscrollY || t.UIConfig.alwaysImproveAnimation ? "transform": "";
                t.UIElement.layer.style.transform = "";
                t.UIElement.layer.style.left = `${t.UIOverscroll.x < 0 ? -Math.min(0, t.UIOverscroll.x): -Math.max(0, t.UIOverscroll.x - contentX)}px`;
                t.UIElement.layer.style.top = `${t.UIOverscroll.y < 0 ? -Math.min(0, t.UIOverscroll.y): -Math.max(0, t.UIOverscroll.y - contentY)}px`;
                if (!t.UIKinetic.UIAnimation.isAnim && !(t.UIOverscroll.activeOverscrollX || t.UIOverscroll.activeOverscrollY)) {
                    t.UIOverscroll.isAnimate = false;
                    t.UIAnimation.active(false);
                }
            }
        } else {
            t.UIOverscroll.velX = 0;
            t.UIOverscroll.vel2X = 0;
            t.UIOverscroll.velY = 0;
            t.UIOverscroll.vel2Y = 0;

            t.UIOverscroll.x = HtmlUIClamp(0, contentX, t.UIOverscroll.x);
            t.UIOverscroll.y = HtmlUIClamp(0, contentY, t.UIOverscroll.y);
        }
        t.UIListener._event.listenEvent._execEvent("scroll");
    });

    t.UIKinetic.UIGesture.listen.onEnd(function() {
        if (!t.UIAnimation.isAnim && (t.UIOverscroll.activeOverscrollX || t.UIOverscroll.activeOverscrollY)) {
            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        }
    });

    t.UIOverscroll.scrollListener = t.UIKinetic.UIKinetic ? t.UIKinetic.UIListener.update: t.UIKinetic.UIListener.scroll;
    t.UIOverscroll.scrollListener(function(e) {
        t.UIOverscroll.isPressed = e.isPressed;
        if (t.UIOverscroll.isPressed) {
            t.UIOverscroll.activeOverscrollX = (t.UIOverscroll.x < 0) || (t.UIOverscroll.x > Math.max(0, t.UIElement.content.scrollWidth - t.UIElement.content.clientWidth));
            t.UIOverscroll.activeOverscrollY = (t.UIOverscroll.y < 0) || (t.UIOverscroll.y > Math.max(0, t.UIElement.content.scrollHeight - t.UIElement.content.clientHeight));
        }

        if (!t.UIOverscroll.activeOverscrollX || t.UIOverscroll.isPressed) {
            t.UIOverscroll.activeOverscrollX = (t.UIOverscroll.x < 0) || (t.UIOverscroll.x > Math.max(0, t.UIElement.content.scrollWidth - t.UIElement.content.clientWidth));

            t.UIOverscroll.isAnimate = true;
            t.UIOverscroll.velX = 0 - (e.velX / (t.UIOverscroll.activeOverscrollX ? 4: 1));
            t.UIOverscroll.x += t.UIOverscroll.velX || 0;
        }

        if (!t.UIOverscroll.activeOverscrollY || t.UIOverscroll.isPressed) {
            t.UIOverscroll.activeOverscrollY = (t.UIOverscroll.y < 0) || (t.UIOverscroll.y > Math.max(0, t.UIElement.content.scrollHeight - t.UIElement.content.clientHeight));

            t.UIOverscroll.isAnimate = true;
            t.UIOverscroll.velY = 0 - (e.velY / (t.UIOverscroll.activeOverscrollY ? 4: 1));
            t.UIOverscroll.y += t.UIOverscroll.velY || 0;
        }

        t.UIElement.content.scrollTo(t.UIOverscroll.x, t.UIOverscroll.y);

        if (t.UIOverscroll.activeOverscrollX || t.UIOverscroll.activeOverscrollY) t.UIKinetic.UIAnimation.active(false);

        if ((t.UIOverscroll.activeOverscrollX || t.UIOverscroll.activeOverscrollY || t.UIOverscroll.isPressed) && !t.UIAnimation.isAnim && (t.UIOverscroll.activeOverscrollX || t.UIOverscroll.activeOverscrollY)) {
            if (t.UIOverscroll.activeOverscrollX) {
                var limitVelX = t.UIConfig.effect == "stretch" ? t.UIElement.content.clientWidth / 8: t.UIElement.content.clientWidth / 8;
                var velSpeedX = 1 / (t.UIConfig.effect == "stretch" ? 16: 4);
                t.UIOverscroll.vel2X = (t.UIConfig.effect == "stretch" ? 1: 0.5) * HtmlUIClamp(-limitVelX, limitVelX, (t.UIOverscroll.velX / (t.UIKinetic.UIAnimation.frameSync || 1)) / velSpeedX);
            }
            if (t.UIOverscroll.activeOverscrollY) {
                var limitVelY = t.UIConfig.effect == "stretch" ? t.UIElement.content.clientHeight / 8: t.UIElement.content.clientHeight / 8;
                var velSpeedY = 1 / (t.UIConfig.effect == "stretch" ? 16: 4);
                t.UIOverscroll.vel2Y = (t.UIConfig.effect == "stretch" ? 1: 0.5) * HtmlUIClamp(-limitVelY, limitVelY, (t.UIOverscroll.velY / (t.UIKinetic.UIAnimation.frameSync || 1)) / velSpeedY);
            }

            t.UIAnimation.active(!t.UIOverscroll.isPressed);
            t.UIAnimation.anim();
        } else {
            if (!(t.UIOverscroll.activeOverscrollX || t.UIOverscroll.activeOverscrollY)) {
                t.UIAnimation.active(false);
            }
        }
        t.UIListener._event.listenEvent._execEvent("scroll");
    });

    t.UIElement.content.addEventListener("scroll",
        function() {
            if (!t.UIOverscroll.isAnimate) {
                t.UIOverscroll.x = this.scrollLeft;
                t.UIOverscroll.y = this.scrollTop;
                t.UIListener._event.listenEvent._execEvent("scroll");
            }
        });

    t.UIListener["scroll"] = function(callback) {
        t.UIListener._event.listenEvent.on("scroll",
            function() {
                callback({
                    x: t.UIOverscroll.x,
                    y: t.UIOverscroll.y,
                    velX: t.UIOverscroll.velX,
                    velY: t.UIOverscroll.velY,
                    isPressed: t.UIOverscroll.isPressed,

                    contentWidth: Math.max(0, t.UIElement.content.scrollWidth - t.UIElement.content.clientWidth),
                    contentHeight: Math.max(0, t.UIElement.content.scrollHeight - t.UIElement.content.clientHeight),
                    scrollWidth: t.UIElement.content.scrollWidth,
                    scrollHeight: t.UIElement.content.scrollHeight,
                    clientWidth: t.UIElement.content.clientWidth,
                    clientHeight: t.UIElement.content.clientHeight
                });
            });
    }

    HtmlUIResize(t.UIElement.main,
        function() {
            if (!t.UIAnimation.isAnim) {
                var contentX = Math.max(0, t.UIElement.content.scrollWidth - t.UIElement.content.clientWidth);
                var contentY = Math.max(0, t.UIElement.content.scrollHeight - t.UIElement.content.clientHeight)

                t.UIOverscroll.x = HtmlUIClamp(0, contentX, t.UIOverscroll.x);
                t.UIOverscroll.y = HtmlUIClamp(0, contentY, t.UIOverscroll.y);

                t.UIAnimation.active(true);
                t.UIAnimation.anim();
            }
        });
}

window.HtmlUI.Storage = function() {
    var t = this;

    t.UIState = {}
    t.UIState.add = function(name, value) {
        if (!localStorage["__HtmlUIStorage_" + name]) {
            localStorage["__HtmlUIStorage_" + name] = value;
        }
    }
    t.UIState.delete = function(name) {
        delete localStorage["__HtmlUIStorage_" + name];
    }
    t.UIState.deleteAll = function() {
        for (var e in localStorage) {
            if (/__HtmlUIStorage_/g.test(e)) {
                delete localStorage[e];
            }
        }
    }
    t.UIState.set = function(name, value) {
        localStorage["__HtmlUIStorage_" + name] = value;
    }
    t.UIState.setJSON = function(name, value) {
        localStorage["__HtmlUIStorage_" + name] = JSON.stringify(value || {});
    }

    t.UIState.get = function(name) {
        return localStorage["__HtmlUIStorage_" + name];
    }
    t.UIState.getJSON = function(name) {
        return JSON.parse(t.UIState.get(name) || "{}");
    }
    t.UIState.getByte = function(name) {
        return localStorage["__HtmlUIStorage_" + name].length;
    }
}

window.HtmlUI.Animator = function(callback, config) {
    var t = this;

    t.UIConfig = {
        duration: 1000,
        curve: function(e) {
            return e;
        },
        reversed: false
    }
    HtmlUIConfig(t.UIConfig, config);

    t.UIAnimator = {
        startTime: 0,
        time: 0,
        isAnim: false,
        range: 0,
        value: 0
    }

    t.UIAnimation = new HtmlUIAnimation(function(e) {

        t.UIAnimator.time = e.time - t.UIAnimator.startTime;
        t.UIAnimator.range = HtmlUIClamp(0, 1, t.UIConfig.reversed ? 1 - (t.UIAnimator.time / t.UIConfig.duration): (t.UIAnimator.time / t.UIConfig.duration));
        t.UIAnimator.value = t.UIConfig.curve(t.UIAnimator.range, t.UIConfig.duration, t);

        if ((t.UIAnimator.range >= 1 && !t.UIConfig.reversed) || (t.UIAnimator.range <= 0 && t.UIConfig.reversed)) {
            t.UIAnimator.isAnim = false;
            t.UIAnimation.active(false);
        }

        callback({
            range: t.UIAnimator.range,
            value: t.UIAnimator.value,
            time: t.UIAnimator.time,
            duration: t.UIConfig.duration,
            fn: {
                distance: function(start, end, reversed = false) {
                    return reversed ? end + ((start - end) * t.UIAnimator.value): start + ((end - start) * t.UIAnimator.value);
                },
                distanceAngle: function(start, end, reversed = false) {
                    var disAngle = function(val) {
                        return val > 0 ? Math.abs(val) % 360: 360 - (Math.abs(val) % 360);
                    }
                    return disAngle(reversed ? end + ((start - end) * t.UIAnimator.value): start + ((end - start) * t.UIAnimator.value));
                },
                distanceStep: function(start, end, step = 1, reversed = false) {
                    step = step / Math.abs(end - start);
                    var stepValue = Math.round(t.UIAnimator.value / step) * step;
                    return reversed ? end + ((start - end) * stepValue): start + ((end - start) * stepValue);
                },
                distanceStepAngle: function(start, end, step = 1, reversed = false) {
                    step = step / Math.abs(end - start);
                    var stepValue = Math.round(t.UIAnimator.value / step) * step;
                    var disAngle = function(val) {
                        return val > 0 ? Math.abs(val) % 360: 360 - (Math.abs(val) % 360);
                    }
                    return disAngle(reversed ? end + ((start - end) * stepValue): start + ((end - start) * stepValue));
                }
            }
        });
    });

    t.UIPlayer = {};
    t.UIPlayer.start = function() {
        t.UIAnimator.startTime = performance.now();
        if (!t.UIAnimator.isAnim) {
            t.UIAnimator.isAnim = true;

            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        }
    }
    t.UIPlayer.stop = function() {
        if (t.UIAnimator.isAnim) {
            t.UIAnimator.isAnim = false;

            t.UIAnimation.active(false);
        }
    }

    t.UIState = {};
    t.UIState.setDuration = function(duration) {
        t.UIConfig.duration = duration;
    }
    t.UIState.getDuration = function() {
        return t.UIConfig.duration;
    }
    t.UIState.setCurve = function(curve) {
        t.UIConfig.curve = curve;
    }
    t.UIState.getCurve = function() {
        return t.UIConfig.curve;
    }
    t.UIState.getStartTime = function() {
        return t.UIAnimator.startTime;
    }
    t.UIState.getTime = function() {
        return t.UIAnimator.time;
    }
    t.UIState.getRange = function() {
        return t.UIAnimator.range;
    }
    t.UIState.getValue = function() {
        return t.UIAnimator.value;
    }
    t.UIState.getIsAnim = function() {
        return t.UIAnimator.isAnim;
    }
}
window.HtmlUI.DynamicOverlay = function(el, elGesture = null, config = {}) {
    var t = this;
    t.UIElement = {};

    t.UIElement.main = HtmlUIBuild(el);
    t.UIElement.gesture = elGesture != null ? (typeof elGesture == "string" ? document.querySelector(elGesture): elGesture): t.UIElement.main
    t.UIGesture = new SuperGesture(t.UIElement.gesture);
    t.UIListener = new HtmlUIListener(["beforeStart", "start", "update", "end"]);

    t.UIConfig = {
        dynamicRate: 0.25,
        dynamicBackRate: 0.15,
        sensivity: 1,
        threshold: 16
    };
    HtmlUIConfig(t.UIConfig, config);
    t.UIGesture.updateConfig({
        deltaSpeed: t.UIConfig.sensivity
    });

    t.UIDOverlay = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        scaleX: 1,
        scaleY: 1,

        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        startScaleX: 1,
        startScaleY: 1,

        endX: 0,
        endY: 0,
        endWidth: 0,
        endHeight: 0,
        endScaleX: 1,
        endScaleY: 1,

        deltaX: 0,
        deltaY: 0,
        velocityX: 0,
        velocityY: 0,
        isPressed: false,
        isOutThreshold: false,

        targetX: 0,
        targetY: 0,
        targetWidth: 0,
        targetHeight: 0,
        targetScaleX: 1,
        targetScaleY: 1,

        classStyles: {
            beforestart: "do-beforeStart",
            start: "do-start",
            update: "do-update",
            end: "do-end"
        },
        classStylesState: "BEFORESTART",
        previousClassStylesState: "",

        gestureActive: true
    };

    t.UIAnimation = new HtmlUIAnimation(function(e) {
        if (t.UIDOverlay.isPressed) {
            t.UIDOverlay.x += t.UIDOverlay.velocityX;
            t.UIDOverlay.y += t.UIDOverlay.velocityY;
            t.UIDOverlay.classStylesState = "BEFORESTART";
            t.UIListener._event.listenEvent._execEvent("beforeStart");
        } else {
            t.UIDOverlay.velocityX = t.UIDOverlay.deltaX * e.frameSync;
            t.UIDOverlay.velocityY = t.UIDOverlay.deltaY * e.frameSync;
            t.UIDOverlay.x += ((t.UIDOverlay.targetX - t.UIDOverlay.x) * Math.min(1, e.frameSync * t.UIConfig.dynamicBackRate)) + t.UIDOverlay.velocityX;
            t.UIDOverlay.y += ((t.UIDOverlay.targetY - t.UIDOverlay.y) * Math.min(1, e.frameSync * t.UIConfig.dynamicBackRate)) + t.UIDOverlay.velocityY;

            t.UIDOverlay.deltaX += (0 - t.UIDOverlay.deltaX) * Math.min(1, e.frameSync * t.UIConfig.dynamicRate);
            t.UIDOverlay.deltaY += (0 - t.UIDOverlay.deltaY) * Math.min(1, e.frameSync * t.UIConfig.dynamicRate);

            if (t.UIDOverlay.width != null) {
                t.UIDOverlay.width += (t.UIDOverlay.targetWidth - t.UIDOverlay.width) * Math.min(1, e.frameSync * t.UIConfig.dynamicBackRate);
            }
            if (t.UIDOverlay.height != null) {
                t.UIDOverlay.height += (t.UIDOverlay.targetHeight - t.UIDOverlay.height) * Math.min(1, e.frameSync * t.UIConfig.dynamicBackRate);
            }

            t.UIDOverlay.scaleX += (t.UIDOverlay.targetScaleX - t.UIDOverlay.scaleX) * Math.min(1, e.frameSync * t.UIConfig.dynamicBackRate);
            t.UIDOverlay.scaleY += (t.UIDOverlay.targetScaleY - t.UIDOverlay.scaleY) * Math.min(1, e.frameSync * t.UIConfig.dynamicBackRate);

            t.UIDOverlay.classStylesState = "UPDATE";
            if (Math.abs((t.UIDOverlay.targetWidth - t.UIDOverlay.width) || 0) < 0.01 && Math.abs((t.UIDOverlay.targetHeight - t.UIDOverlay.height) || 0) < 0.01 && Math.abs(t.UIDOverlay.targetX - t.UIDOverlay.x) < 0.01 && Math.abs(t.UIDOverlay.targetY - t.UIDOverlay.y) < 0.01 && Math.abs(t.UIDOverlay.targetScaleX - t.UIDOverlay.scaleX) < 0.01 && Math.abs(t.UIDOverlay.targetScaleY - t.UIDOverlay.scaleY) < 0.01) {
                t.UIDOverlay.x = t.UIDOverlay.targetX;
                t.UIDOverlay.y = t.UIDOverlay.targetY;
                t.UIDOverlay.width = t.UIDOverlay.targetWidth;
                t.UIDOverlay.height = t.UIDOverlay.targetHeight;
                t.UIDOverlay.scaleX = t.UIDOverlay.targetScaleX;
                t.UIDOverlay.scaleY = t.UIDOverlay.targetScaleY;

                t.UIAnimation.active(false);
                t.UIDOverlay.classStylesState = "END";
                t.UIListener._event.listenEvent._execEvent("end");
            }
        }

        if (t.UIDOverlay.width != null) {
            t.UIElement.main.style.width = t.UIDOverlay.width + "px";
        }
        if (t.UIDOverlay.height != null) {
            t.UIElement.main.style.height = t.UIDOverlay.height + "px";
        }
        t.UIElement.main.style.transform = `
        translate(${t.UIDOverlay.x}px, ${t.UIDOverlay.y}px) scale(${t.UIDOverlay.scaleX}, ${t.UIDOverlay.scaleY})
        `;

        if (t.UIDOverlay.classStylesState != t.UIDOverlay.previousClassStylesState) {
            t.UIElement.main.classList.remove(t.UIDOverlay.classStyles[t.UIDOverlay.previousClassStylesState.toLowerCase()] || "null");
            t.UIDOverlay.previousClassStylesState = t.UIDOverlay.classStylesState;
            t.UIElement.main.classList.add(t.UIDOverlay.classStyles[t.UIDOverlay.classStylesState.toLowerCase()]);
        }

        t.UIListener._event.listenEvent._execEvent("update");
    });

    t.UIGesture.listen.onStart(function(e) {
        if (!t.UIDOverlay.gestureActive) return;
        t.UIDOverlay.isPressed = true;
        t.UIDOverlay.deltaX = 0;
        t.UIDOverlay.deltaY = 0;
        t.UIDOverlay.velocityX = 0;
        t.UIDOverlay.velocityY = 0;

        t.UIAnimation.active(false);
    });
    t.UIGesture.listen.onSwipe(function(e) {
        if (!t.UIDOverlay.gestureActive) return;
        t.UIDOverlay.velocityX = e.deltaX;
        t.UIDOverlay.velocityY = e.deltaY;

        t.UIAnimation.active(false);
        t.UIAnimation.anim();
    });
    t.UIGesture.listen.onFling(function(e) {
        if (!t.UIDOverlay.gestureActive) return;
        t.UIDOverlay.isPressed = false;
        t.UIDOverlay.deltaX = t.UIDOverlay.velocityX = e.deltaX;
        t.UIDOverlay.deltaY = t.UIDOverlay.velocityY = e.deltaY;

        t.UIDOverlay.isOutThreshold = Math.abs(t.UIDOverlay.startX - t.UIDOverlay.x) > t.UIConfig.threshold || Math.abs(t.UIDOverlay.startY - t.UIDOverlay.y) > t.UIConfig.threshold;
        t.UIDOverlay.targetX = t.UIDOverlay[t.UIDOverlay.isOutThreshold ? "endX": "startX"] || 0;
        t.UIDOverlay.targetY = t.UIDOverlay[t.UIDOverlay.isOutThreshold ? "endY": "startY"] || 0;
        t.UIDOverlay.targetWidth = t.UIDOverlay[t.UIDOverlay.isOutThreshold ? "endWidth": "startWidth"] || 0;
        t.UIDOverlay.targetHeight = t.UIDOverlay[t.UIDOverlay.isOutThreshold ? "endHeight": "startHeight"] || 0;
        t.UIDOverlay.targetScaleX = t.UIDOverlay[t.UIDOverlay.isOutThreshold ? "endScaleX": "startScaleX"] || 1;
        t.UIDOverlay.targetScaleY = t.UIDOverlay[t.UIDOverlay.isOutThreshold ? "endScaleY": "startScaleY"] || 1;

        if (t.UIDOverlay.isOutThreshold) {
            t.UIListener._event.listenEvent._execEvent("start");
        }

        t.UIAnimation.active(true);
        t.UIAnimation.anim();
    });

    t.UIState = {};
    t.UIState.runDynamic = function() {
        t.UIDOverlay.targetX = t.UIDOverlay.targetX = t.UIDOverlay.endX;
        t.UIDOverlay.targetY = t.UIDOverlay.targetY = t.UIDOverlay.endY;
        t.UIDOverlay.targetWidth = t.UIDOverlay.targetWidth = t.UIDOverlay.endWidth;
        t.UIDOverlay.targetHeight = t.UIDOverlay.targetHeight = t.UIDOverlay.endHeight;
        t.UIDOverlay.targetScaleX = t.UIDOverlay.targetScaleX = t.UIDOverlay.endScaleX;
        t.UIDOverlay.targetScaleY = t.UIDOverlay.targetScaleY = t.UIDOverlay.endScaleY;

        if (!t.UIAnimation.isAnim) {
            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        }
    }
    t.UIState.resetPosition = function(smooth = false) {
        if (smooth) {
            t.UIDOverlay.targetX = t.UIDOverlay.startX;
            t.UIDOverlay.targetY = t.UIDOverlay.startY;
            t.UIDOverlay.targetWidth = t.UIDOverlay.startWidth;
            t.UIDOverlay.targetHeight = t.UIDOverlay.startHeight;
            t.UIDOverlay.targetScaleX = t.UIDOverlay.startScaleX;
            t.UIDOverlay.targetScaleY = t.UIDOverlay.startScaleY;
            if (!t.UIAnimation.isAnim) {
                t.UIAnimation.active(true);
                t.UIAnimation.anim();
            }
        } else {
            t.UIDOverlay.x = t.UIDOverlay.targetX = t.UIDOverlay.startX;
            t.UIDOverlay.y = t.UIDOverlay.targetY = t.UIDOverlay.startY;
            t.UIDOverlay.width = t.UIDOverlay.targetWidth = t.UIDOverlay.startWidth;
            t.UIDOverlay.height = t.UIDOverlay.targetHeight = t.UIDOverlay.startHeight;
            t.UIDOverlay.scaleX = t.UIDOverlay.targetScaleX = t.UIDOverlay.startScaleX;
            t.UIDOverlay.scaleY = t.UIDOverlay.targetScaleY = t.UIDOverlay.startScaleY;

            t.UIAnimation.active(false);
            t.UIAnimation.anim();
        }
    }
    t.UIState.setSensivity = function(sensivity = 1) {
        t.UIGesture.updateConfig({
            deltaSpeed: sensivity
        });
    }
    t.UIState.setClassStyles = function(classStyles) {
        for (var styles in classStyles) {
            t.UIDOverlay.classStyles[styles] = classStyles[styles];
        }
    }
    t.UIState.setStartPosition = function(x = 0, y = 0, width = null, height = null, scaleX = 1, scaleY = 1) {
        t.UIDOverlay.startX = t.UIDOverlay.x = x;
        t.UIDOverlay.startY = t.UIDOverlay.y = y;
        t.UIDOverlay.startWidth = t.UIDOverlay.width = (width != null ? width: t.UIElement.main.clientWidth);
        t.UIDOverlay.startHeight = t.UIDOverlay.height = (height != null ? height: t.UIElement.main.clientHeight);
        t.UIDOverlay.startScaleX = t.UIDOverlay.scaleX = scaleX;
        t.UIDOverlay.startScaleY = t.UIDOverlay.scaleY = scaleY;
    }
    t.UIState.setEndPosition = function(x = 0, y = 0, width = null, height = null, scaleX = 1, scaleY = 1) {
        t.UIDOverlay.endX = x;
        t.UIDOverlay.endY = y;
        t.UIDOverlay.endWidth = width != null ? width: t.UIElement.main.clientWidth;
        t.UIDOverlay.endHeight = height != null ? height: t.UIElement.main.clientHeight;
        t.UIDOverlay.endScaleX = scaleX;
        t.UIDOverlay.endScaleY = scaleY;
    }
    t.UIState.enableGesture = function(enable = true) {
        t.UIDOverlay.gestureActive = enable;
    }

    t.UIListener["beforeStart"] = function(callback) {
        t.UIListener._event.listenEvent.on("beforeStart", function() {
            callback(t.UIDOverlay);
        });
    }
    t.UIListener["start"] = function(callback) {
        t.UIListener._event.listenEvent.on("start", function() {
            callback(t.UIDOverlay);
        });
    }
    t.UIListener["update"] = function(callback) {
        t.UIListener._event.listenEvent.on("update", function() {
            callback(t.UIDOverlay);
        });
    }
    t.UIListener["end"] = function(callback) {
        t.UIListener._event.listenEvent.on("end", function() {
            callback(t.UIDOverlay);
        });
    }
}
window.HtmlUI.CountDown = function(config = {}) {
    var t = this;

    t.UIListener = new HtmlUIListener(["update", "finished"]);

    t.UIConfig = {
        end_time: 0,
        autoStart: true
    }
    HtmlUIConfig(t.UIConfig, config);

    t.UICountDown = {
        currentTime: 0,
        time: 0,
        endTime: 0,
        finished: false
    }

    var UITwoDigits = function(value) {
        return value < 10 ? "0" + Math.floor(value): Math.floor(value);
    }

    t.UIInterval = new HtmlUIInterval(function(e) {
        t.UICountDown.time = Math.floor(e.date);
        t.UICountDown.endTime = t.UIConfig.end_time;
        t.UICountDown.currentTime = Math.max(0, t.UICountDown.endTime - t.UICountDown.time) / 1000;
        t.UICountDown.finished = t.UICountDown.currentTime == 0;

        if (t.UICountDown.currentTime == 0) {
            t.UIInterval.stop();
            t.UIListener._event.listenEvent._execEvent("finished");
        }

        t.UIListener._event.listenEvent._execEvent("update");
    },
        1000);
    if (t.UIConfig.autoStart) setTimeout(function() {
        t.UIInterval.start()
    });

    t.UIListener["update"] = function(callback) {
        t.UIListener._event.listenEvent.on("update", function() {
            callback({
                countdown: t.UICountDown,
                format: {
                    ddhhmm: `${UITwoDigits(t.UICountDown.currentTime / 60 / 60 / 24)}:${UITwoDigits((t.UICountDown.currentTime / 60 / 60)%24)}:${UITwoDigits((t.UICountDown.currentTime / 60)%60)}`,
                    ddhhmmss: `${UITwoDigits(t.UICountDown.currentTime / 60 / 60 / 24)}:${UITwoDigits((t.UICountDown.currentTime / 60 / 60)%24)}:${UITwoDigits((t.UICountDown.currentTime / 60)%60)}:${UITwoDigits(t.UICountDown.currentTime%60)}`,
                    hhmm: `${UITwoDigits(t.UICountDown.currentTime / 60 / 60)}:${UITwoDigits(t.UICountDown.currentTime / 60)}`,
                    hhmmss: `${UITwoDigits(t.UICountDown.currentTime / 60 / 60)}:${UITwoDigits((t.UICountDown.currentTime / 60)%60)}:${UITwoDigits(t.UICountDown.currentTime%60)}`
                }
            });
        });
    }
    t.UIListener["finished"] = function(callback) {
        t.UIListener._event.listenEvent.on("finished", function() {
            callback(t.UICountDown);
        });
    }

    t.UIState = {
        updateEndTime: function(time) {
            t.UIConfig.end_time = time;
            t.UIInterval.start();
        },
        start: function() {
            t.UIInterval.start();
        },
        stop: function() {
            t.UIInterval.stop();
        },
    }
}
window.HtmlUI.Script = function(el = document.body) {
    var t = this;

    t.UIElement = {};
    t.UIElement.main = el == document.body ? document.body: HtmlUIBuild(el);

    t.UIScript = {
        inlineMode: false,
        url: "",
        replaceRaw: [],
        scripts: []
    }

    var UIGenerateScript = function(url, inlineMode, replaceRaw) {
        if (inlineMode) {
            var _xhrRaw = new HtmlUI.RawXHR(url, true);
            var _replaceRaw = replaceRaw;
            _xhrRaw.UIListener.call(function(e) {
                t.UIScript.scripts.push({
                    url: url,
                    inlineMode: inlineMode,
                    replaceRaw: replaceRaw
                });

                var _script = document.createElement("script");
                _script.setAttribute("inline-mode-src", url);
                if (_replaceRaw && _replaceRaw.length >= 1) {
                    var _newRaw = e;
                    _replaceRaw.forEach(function(UIArray) {
                        _newRaw = _newRaw.replace(UIArray[0], UIArray[1]);
                    });

                    _script.appendChild(document.createTextNode(_newRaw));
                } else _script.innerHTML = new String(e);
                _script.setAttribute("htmlui-script", "");
                t.UIElement.main.appendChild(_script);
            });
        } else {
            var _script = document.createElement("script");
            _script.setAttribute("src", url);
            _script.addEventListener("load", function() {
                t.UIScript.scripts.push({
                    url: url,
                    inlineMode: inlineMode,
                    replaceRaw: replaceRaw
                });
            });
            _script.setAttribute("htmlui-script", "");
            t.UIElement.main.appendChild(_script);
        }
    }

    t.UIState = {
        addScript: function(url, inlineMode = false, replaceRaw = []) {
            t.UIScript.url = url;
            t.UIScript.inlineMode = inlineMode;
            t.UIScript.replaceRaw = replaceRaw;
            UIGenerateScript(t.UIScript.url, t.UIScript.inlineMode, t.UIScript.replaceRaw);
        },
        getScripts: function() {
            return t.UIScript.scripts;
        }
    }
}
window.HtmlUI.InnerHTMLEnhanced = function(el, rawhtml, enhancedConfig = {}) {
    el.innerHTML = rawhtml;

    var UIConfig = {
        script_inline_mode: true,
        script_replace_raw: []
    }
    HtmlUIConfig(UIConfig, enhancedConfig);

    el.querySelectorAll("script").forEach(function(e) {
        if ((e.src != "" && e.src != null) || e.hasAttribute("src")) {
            var scriptContainer = document.createElement("div");
            scriptContainer.setAttribute("htmlui-innerhtml-enhanced-script", "");
            new HtmlUI.Script(scriptContainer).UIState.addScript(
                e.src || e.getAttribute("src"),
                UIConfig.script_inline_mode,
                UIConfig.script_replace_raw
            );
            e.parentNode.replaceChild(scriptContainer, e);
        } else {
            var nScript = document.createElement("script");
            Array.from(e.attributes).forEach(function(attr) {
                nScript.setAttribute(attr.name, attr.value);
            });
            nScript.appendChild(document.createTextNode(e.innerHTML));
            if (e && e.parentNode) {
                e.parentNode.replaceChild(nScript, e);
            }
        }
    });
}
window.HtmlUI.FileLoader = function() {
    var t = this;

    t.UIListener = new HtmlUIListener(["load",
        "progress"]);

    t.UIFile = {
        files: [],
        response: null,
        status: null,
        contentType: "",
        url: "",
        bytes: 0,
        loadedBytes: 0
    }

    var UIXHR = new XMLHttpRequest();
    var UILoad = function(url, responseType, startByte, endByte) {
        t.UIFile.url = url;
        UIXHR.open("GET",
            t.UIFile.url,
            true);
        if (startByte != null && endByte != null) UIXHR.setRequestHeader("Range", `bytes=${startByte}-${endByte}`);
        UIXHR.responseType = responseType;
        UIXHR.send();
    }

    UIXHR.addEventListener("load", function(e) {
        t.UIFile.contentType = this.getResponseHeader("content-type");
        t.UIFile.response = this.response;
        t.UIFile.status = this.status;
        t.UIFile.bytes = e.total || null;
        t.UIFile.loadedBytes = e.loaded;

        t.UIFile.files.push({
            url: t.UIFile.url,
            bytes: e.lengthComputable ? e.total: null,
            response: t.UIFile.response,
            status: t.UIFile.status
        });

        t.UIListener._event.listenEvent._execEvent("load");
    });

    UIXHR.addEventListener("progress", function(e) {
        t.UIFile.contentType = this.getResponseHeader("content-type");
        t.UIFile.response = this.response;
        t.UIFile.status = this.status;
        t.UIFile.bytes = e.total || null;
        t.UIFile.loadedBytes = e.loaded;

        t.UIListener._event.listenEvent._execEvent("progress");
    });

    t.UIState = {};
    t.UIState.loadFile = function(url, responseType = "txt", config = {}) {
        UILoad(url, responseType, config.startByte, config.endByte);
    }
    t.UIState.getFiles = function() {
        return t.UIFile.files;
    }
    t.UIState.clearAll = function() {
        t.UIFile.files = [];
    }

    t.UIListener["load"] = function(callback) {
        t.UIListener._event.listenEvent.on("load", function() {
            callback({
                url: t.UIFile.url,
                response: t.UIFile.response,
                status: t.UIFile.status,
                bytes: t.UIFile.bytes,
                contentType: t.UIFile.contentType
            });
        });
    }

    t.UIListener["progress"] = function(callback) {
        t.UIListener._event.listenEvent.on("progress", function() {
            callback({
                url: t.UIFile.url,
                response: t.UIFile.response,
                status: t.UIFile.status,
                bytes: t.UIFile.bytes,
                loaded: t.UIFile.loadedBytes,
                contentType: t.UIFile.contentType
            });
        });
    }
}
window.HtmlUI.ImageLoader = function() {
    var t = this;

    t.UIListener = new HtmlUIListener(["load", "update", "partial"]);

    t.UIImage = {
        currentArrayBuffer: [],
        arrayBuffer: [],
        status: null,
        bytes: 0,
        loadedBytes: 0,
        totalBytes: 0,
        url: "",
        partialBytes: 0,
        details: {},
        status_img: "",
        isSvg: false,
        blob: null,
        contentType: ""
    }

    var UIXHR = new XMLHttpRequest();
    var UIUpdate = function(byte = Infinity) {
        t.UIImage.currentArrayBuffer = [];
        if (t.UIImage.isSvg) {
            var _byte8 = new Uint8Array(t.UIImage.arrayBuffer);
            t.UIImage.totalBytes = _byte8.length;
            t.UIImage.loadedBytes = HtmlUIClamp(0, Math.floor(byte), t.UIImage.totalBytes);;
            var _svgData = "";
            for (var i = 0; i < t.UIImage.loadedBytes; i++) {
                _svgData += String.fromCharCode(_byte8[i]);
            }

            t.UIImage.currentArrayBuffer = [new String(_svgData)];
            t.UIImage.blob = new Blob([t.UIImage.currentArrayBuffer], {
                type: "image/svg+xml"
            });
        } else {
            var _byte8 = new Uint8Array(t.UIImage.arrayBuffer);
            t.UIImage.totalBytes = _byte8.length;
            t.UIImage.currentArrayBuffer = [];
            t.UIImage.loadedBytes = HtmlUIClamp(0, Math.floor(byte), t.UIImage.totalBytes);
            for (var i = 0; i < t.UIImage.loadedBytes; i++) {
                t.UIImage.currentArrayBuffer.push(_byte8[i]);
            }
            t.UIImage.currentArrayBuffer = new Uint8Array(t.UIImage.currentArrayBuffer);
            t.UIImage.blob = new Blob([t.UIImage.currentArrayBuffer]);
        }

        t.UIImage.status_img = t.UIImage.loadedBytes == t.UIImage.totalBytes ? "LOADED": "PARTIAL LOAD";

        t.UIImage.details = {
            url: t.UIImage.url,
            total_byte: t.UIImage.totalBytes,
            loaded_byte: t.UIImage.loadedBytes,
            status: t.UIImage.status_img
        }

        t.UIListener._event.listenEvent._execEvent("update");
    }

    var UILoad = function(url) {
        t.UIImage.url = url;
        UIXHR.open("GET", t.UIImage.url, true);
        UIXHR.responseType = "arraybuffer";
        UIXHR.send();
    }

    UIXHR.addEventListener("load", function(e) {
        var contentType = this.getResponseHeader("content-type");
        t.UIImage.contentType = contentType;
        if (/jpeg|jpg|gif|webp|png|svg|avif/i.test(contentType)) {
            t.UIState.setPartialBytes(0);
            t.UIImage.arrayBuffer = this.response;
            t.UIImage.status = this.status;
            t.UIImage.bytes = e.total || e.loaded;
            t.UIImage.isSvg = /svg/i.test(contentType);
            UIUpdate();

            t.UIListener._event.listenEvent._execEvent("load");
        } else {
            if (t.UIImage.url != "") {
                throw new TypeError(`[HtmlUI ImageLoader] Unsupported MIME format (${contentType}) from url "${t.UIImage.url}". Only support MIME formats: image/jpeg, image/jpg, image/gif, image/webp, image/png, image/svg+xml, and image/avif.`);
            }
        }
    });

    t.UIState = {};
    t.UIState.loadImage = function(url) {
        UILoad(url);
    }
    t.UIState.partialImage = function(byte = Infinity) {
        UIUpdate(byte);
        t.UIListener._event.listenEvent._execEvent("partial");
    }
    t.UIState.partialImageBy = function(byte = 0) {
        t.UIImage.partialBytes = HtmlUIClamp(0,
            t.UIImage.totalBytes || 0,
            t.UIImage.partialBytes + byte);
        UIUpdate(t.UIImage.partialBytes);
        t.UIListener._event.listenEvent._execEvent("partial");
    }
    t.UIState.setPartialBytes = function(byte = Infinity) {
        t.UIImage.partialBytes = HtmlUIClamp(0,
            t.UIImage.totalBytes || 0,
            Math.floor(byte));
    }

    t.UIListener["load"] = function(callback) {
        t.UIListener._event.listenEvent.on("load",
            function() {
                callback({
                    arrayBuffer: t.UIImage.arrayBuffer,
                    status: t.UIImage.status,
                    bytes: t.UIImage.bytes,
                    url: t.UIImage.url,
                    details: t.UIImage.details,
                    isSvg: t.UIImage.isSvg,
                    blob: t.UIImage.blob,
                    type: t.UIImage.contentType
                });
            });
    }
    t.UIListener["update"] = function(callback) {
        t.UIListener._event.listenEvent.on("update",
            function() {
                callback({
                    arrayBuffer: t.UIImage.arrayBuffer,
                    currentArrayBuffer: t.UIImage.currentArrayBuffer,
                    status: t.UIImage.status,
                    bytes: t.UIImage.bytes,
                    loadedBytes: t.UIImage.loadedBytes,
                    totalBytes: t.UIImage.totalBytes,
                    url: t.UIImage.url,
                    details: t.UIImage.details,
                    isSvg: t.UIImage.isSvg,
                    blob: t.UIImage.blob,
                    type: t.UIImage.contentType
                });
            });
    }
    t.UIListener["partial"] = function(callback) {
        t.UIListener._event.listenEvent.on("partial",
            function() {
                callback({
                    arrayBuffer: t.UIImage.arrayBuffer,
                    currentArrayBuffer: t.UIImage.currentArrayBuffer,
                    status: t.UIImage.status,
                    bytes: t.UIImage.bytes,
                    loadedBytes: t.UIImage.loadedBytes,
                    totalBytes: t.UIImage.totalBytes,
                    url: t.UIImage.url,
                    details: t.UIImage.details,
                    isSvg: t.UIImage.isSvg,
                    blob: t.UIImage.blob,
                    type: t.UIImage.contentType
                });
            });
    }
}
window.HtmlUI.Query = function(queryName, query, index = null, queryFrom = document) {
    queryName = queryName.toLowerCase();

    if (queryName == "selector") return index != null ? queryFrom.querySelectorAll(query)[index]: queryFrom.querySelector(query);
    else if (queryName == "selectorall") return queryFrom.querySelectorAll(query);
    else if (queryName == "id") return queryFrom.getElementById(query);
    else if (queryName == "tag") return index != null ? queryFrom.getElementsByTagName(query)[index]: queryFrom.getElementsByTagName(query);
    else if (queryName == "name") return index != null ? queryFrom.getElementsByName(query)[index]: queryFrom.getElementsByName(query);
    else if (queryName == "class") return index != null ? queryFrom.getElementsByClassName(query)[index]: queryFrom.getElementsByClassName(query);
}
window.HtmlUI.QueryActivity = function(activity, query, index, selectorall = false) {
    if (query) {
        return HtmlUI.Query(selectorall ? "selectorall": "selector", query, index, HtmlUI.Query("selector", `htmlui-main[activity=${activity}]`));
    } else {
        return HtmlUI.Query("selector", `htmlui-main[activity=${activity}]`);
    }
}
window.HtmlUI.Mustache = function(el) {
    var t = this;

    t.UIElement = {};
    t.UIElement.main = HtmlUIBuild(el);
    t.UIElement.main.classList.add("htmlui-mustache");
    t.UIElement.content = document.createElement("div");
    t.UIElement.content.classList.add("htmlui-mustache-content");
    t.UIElement.main.appendChild(t.UIElement.content);

    t.UIJSON = new HtmlUI.JSON();

    t.UIListener = new HtmlUIListener(["rendered"]);

    t.UIMustache = {
        init: typeof Mustache == "object" ? Mustache: Mustache(),
        raw: "",
        rendered: null,
        isXHR: false,
        inlineJSON: {},
        customScroll: null,
        contentCustomScroll: null,
        responseJSON: {},
        contentEl: t.UIElement.content
    }

    t.UIElement.template = HtmlUI.Query("selector", "template[type=htmlui-mustache]", null, t.UIElement.main);
    if (t.UIElement.template) {
        t.UIMustache.raw = t.UIElement.template.innerHTML;
    }

    var UIMustacheContent = function(json) {
        t.UIMustache.responseJSON = json;
        t.UIMustache.rendered = t.UIMustache.init.render(t.UIMustache.raw, t.UIMustache.responseJSON);
        HtmlUI.InnerHTML(t.UIMustache.contentCustomScroll || t.UIElement.content, t.UIMustache.rendered);

        t.UIListener._event.listenEvent._execEvent("rendered");
    }

    t.UIJSON.UIListener.load(function(response) {
        UIMustacheContent(response);
    });

    t.UIState = {};
    t.UIState.template = function(rawMustache) {
        t.UIMustache.raw = rawMustache;
    }
    t.UIState.loadJSON = function(url) {
        if (/htmlui-mustache:/i.test(url)) {
            var rawJSON = HtmlUI.Query("selector", `[htmlui-mustache=${url.replace("htmlui-mustache:", "")}]`);
            if (rawJSON.getAttribute("type") == "application/json" && rawJSON.tagName == "SCRIPT") {
                try {
                    t.UIState.inlineJSON(JSON.parse(rawJSON.innerHTML));
                }
                catch(e) {
                    throw new TypeError(`[HtmlUI Mustache] Invalid JSON: ${e.message}`);
                }
            } else {
                throw new TypeError(`[HtmlUI Mustache] Unsupported type "${rawJSON.type}". Must type supported only "application/json".`);
            }
        } else {
            t.UIMustache.isXHR = true;
            t.UIJSON.UIAction.changeURL(url);
        }
    }
    t.UIState.inlineJSON = function(json) {
        t.UIMustache.isXHR = false;
        t.UIMustache.inlineJSON = json;
    }
    t.UIState.render = function() {
        if (t.UIMustache.isXHR) {
            t.UIJSON.UIAction.update();
        } else {
            UIMustacheContent(t.UIMustache.inlineJSON);
        }
    }
    t.UIState.setLayout = function(layout) {
        HtmlUI.Layout(t.UIMustache.contentEl, layout);
    }
    t.UIState.customScrollView = function(UIScrollView) {
        UIScrollView = UIScrollView(t.UIElement.content);

        t.UIMustache.customScroll = UIScrollView;
        t.UIMustache.contentCustomScroll = t.UIMustache.customScroll.UIElement.content || t.UIMustache.customScroll.UIElement.main;
        t.UIMustache.contentEl = t.UIMustache.contentCustomScroll;
    }
    t.UIState.clear = function() {
        HtmlUI.InnerHTML(t.UIMustache.contentEl, "");
    }

    t.UIListener["rendered"] = function(callback) {
        t.UIListener._event.listenEvent.on("rendered", function() {
            callback({
                contentEl: t.UIMustache.contentEl,
                rendered: t.UIMustache.rendered,
                responseJSON: t.UIMustache.responseJSON,
                querySelector: function(selector, from) {
                    return HtmlUI.Query("selector", selector, null, from || t.UIMustache.contentEl);
                }
            });
        });
    }
}
window.HtmlUI.Form = function(action_XHR_URL = "", method = "POST") {
    var t = this;

    t.UIListener = new HtmlUIListener(["load", "error"]);

    var UIXHR = new XMLHttpRequest();

    t.UIForm = {
        status: 0,
        response: null,
        url: action_XHR_URL,
        formData: {}
    }

    var UIUpdate = function() {
        UIXHR.open(method, t.UIForm.url, true);

        var formData = new FormData();
        for (var formName in t.UIForm.formData) {
            formData.append(formName, t.UIForm.formData[formName]);
        }

        UIXHR.send(formData);
    }

    UIXHR.addEventListener("load", function(e) {
        t.UIForm.status = this.status;
        t.UIForm.response = this.response;

        t.UIListener._event.listenEvent._execEvent("load");
    });
    UIXHR.addEventListener("error", function(e) {
        t.UIListener._event.listenEvent._execEvent("error");
    });

    t.UIAction = {};
    t.UIAction.changeURL = function(url) {
        t.UIForm.url = url;
    }
    t.UIAction.formData = function(formData) {
        t.UIForm.formData = formData;
    }
    t.UIAction.send = function() {
        UIUpdate();
    }

    t.UIListener["load"] = function(callback) {
        t.UIListener._event.listenEvent.on("load", function() {
            callback({
                status: t.UIForm.status,
                response: t.UIForm.response,
                url: t.UIForm.url
            });
        });
    }
    t.UIListener["error"] = function(callback) {
        t.UIListener._event.listenEvent.on("error", function() {
            callback({
                url: t.UIForm.url
            });
        });
    }
}
window.HtmlUI.ScrollView2 = function(el, config = {}) {
    var t = this;
    t.UIElement = {};

    t.UIElement.main = HtmlUIBuild(el);
    t.UIGesture = new SuperGesture(t.UIElement.main);
    t.UIElement.main.classList.add("htmlui-scroller");
    var UIHtmlRaw = t.UIElement.main.innerHTML;
    var startX = t.UIElement.main.scrollLeft;
    var startY = t.UIElement.main.scrollTop;

    t.UIConfig = {
        scrollX: true,
        scrollY: true,
        friction: 0.0225,
        bounceRate: 0.25,
        bounceBackRate: 0.15,
        dynamicBounce: true,
        dynamicBounceRate: 0.25,
        minDelta: 0.01,
        bounce: true,
        transform: false,
        sensivity: 1,
        fastScroll: false,
        improveAnimation: false,
        bounceDistanceLimits: 32,
        lerp3_m: 0.02,
        hardware: false,
        content: null
    }
    HtmlUIConfig(t.UIConfig, config);

    if (!t.UIConfig.content) {
        t.UIElement.main.innerHTML = "";

        t.UIElement.content = document.createElement("htmlui-scroller-content");
        t.UIElement.content.innerHTML = UIHtmlRaw;
        t.UIElement.main.appendChild(t.UIElement.content);
    } else {
        t.UIElement.content = typeof t.UIConfig.content == "string" ? HtmlUI.Query("selector", t.UIConfig.content): t.UIConfig.content;
    }

    var UIUpdateDimension = function() {
        t.UIDimension = HtmlUIDimension(t.UIElement.main, t.UIElement.content);
    }
    UIUpdateDimension();

    t.UIListener = new HtmlUIListener(["scroll"]);

    t.UIScroll = {
        x: startX,
        y: startY,
        deltaX: 0,
        deltaY: 0,
        boundX: 0,
        boundY: 0,
        velX: 0,
        velY: 0,
        smoothScroll: false,
        smoothX: 0,
        smoothY: 0,
        smoothRate: 0,
        isPressed: false,
        dynamicBounceX: 0,
        dynamicBounceY: 0,
        dynamicSmoothScroll: false,
        dynamicSmoothScrollRate: 0,
        fastX: 0,
        fastY: 0,
        fastDebounce_1: null,
        fastDebounce_2: null,
        fastDebounce_3: null
    }
    var UIVelDeltaX = new HtmlUIDelta(),
    UIVelDeltaY = new HtmlUIDelta();

    t.UIAnimation = new HtmlUIAnimation(function(e) {
        UIUpdateDimension();

        if (((Math.abs(t.UIScroll.deltaX) > t.UIConfig.minDelta || Math.abs(t.UIScroll.deltaY) > t.UIConfig.minDelta) || (t.UIScroll.x < -0.01 || t.UIScroll.x > t.UIDimension.contentWidth + 0.01) || (t.UIScroll.y < -0.01 || t.UIScroll.y > t.UIDimension.contentHeight + 0.01)) && e.isAnim) {
            if (t.UIScroll.x >= 0 && t.UIScroll.x <= t.UIDimension.contentWidth) {
                t.UIScroll.dynamicBounceX = 0;

                t.UIScroll.x = !t.UIConfig.bounce ? HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x - t.UIScroll.deltaX * e.frameSync): t.UIScroll.x - t.UIScroll.deltaX * e.frameSync;
                t.UIScroll.deltaX = (
                    t.UIConfig.lerp3_m != false ?
                    HtmlUI.Math.lerp3(t.UIScroll.deltaX, 0, t.UIConfig.friction * e.frameSync, (typeof t.UIConfig.lerp3_m == "number" ? t.UIConfig.lerp3_m: 0.0375) * e.frameSync):
                    HtmlUI.Math.lerp(t.UIScroll.deltaX, 0, t.UIConfig.friction * e.frameSync)
                );
            } else {
                t.UIScroll.dynamicBounceX += (t.UIConfig.bounceBackRate - t.UIScroll.dynamicBounceX) * Math.min(1, t.UIConfig.dynamicBounceRate * e.frameSync);

                var _cx = HtmlUIClamp(0, Infinity, t.UIDimension.contentWidth);
                t.UIScroll.x = (
                    HtmlUIClamp(
                        t.UIScroll.x < _cx / 2 ? -Infinity: _cx,
                        t.UIScroll.x > _cx / 2 ? Infinity: 0,
                        HtmlUI.Math.lerp3(t.UIScroll.x, HtmlUIClamp(0, _cx, t.UIScroll.x), (t.UIConfig.dynamicBounce ? t.UIScroll.dynamicBounceX: t.UIConfig.bounceBackRate) * e.frameSync, 0.125 * e.frameSync) -
                        t.UIScroll.deltaX * e.frameSync
                    )
                );
                t.UIScroll.deltaX = HtmlUIClamp(
                    -t.UIDimension.el.clientWidth / t.UIConfig.bounceDistanceLimits,
                    t.UIDimension.el.clientWidth / t.UIConfig.bounceDistanceLimits,
                    HtmlUI.Math.lerp(t.UIScroll.deltaX, 0, t.UIConfig.bounceRate * e.frameSync)
                );
            }

            if (t.UIScroll.y >= 0 && t.UIScroll.y <= t.UIDimension.contentHeight) {
                t.UIScroll.dynamicBounceY = 0;

                t.UIScroll.y = !t.UIConfig.bounce ? HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y - t.UIScroll.deltaY * e.frameSync): t.UIScroll.y - t.UIScroll.deltaY * e.frameSync;
                t.UIScroll.deltaY = (
                    t.UIConfig.lerp3_m != false ?
                    HtmlUI.Math.lerp3(t.UIScroll.deltaY, 0, t.UIConfig.friction * e.frameSync, (typeof t.UIConfig.lerp3_m == "number" ? t.UIConfig.lerp3_m: 0.0375) * e.frameSync):
                    HtmlUI.Math.lerp(t.UIScroll.deltaY, 0, t.UIConfig.friction * e.frameSync)
                );
            } else {
                t.UIScroll.dynamicBounceY += (t.UIConfig.bounceBackRate - t.UIScroll.dynamicBounceY) * Math.min(1, t.UIConfig.dynamicBounceRate * e.frameSync);

                var _cy = HtmlUIClamp(0, Infinity, t.UIDimension.contentHeight);
                t.UIScroll.y = (
                    HtmlUIClamp(
                        t.UIScroll.y < _cy / 2 ? -Infinity: _cy,
                        t.UIScroll.y > _cy / 2 ? Infinity: 0,
                        HtmlUI.Math.lerp3(t.UIScroll.y, HtmlUIClamp(0, _cy, t.UIScroll.y), (t.UIConfig.dynamicBounce ? t.UIScroll.dynamicBounceY: t.UIConfig.bounceBackRate) * e.frameSync, 0.125 * e.frameSync) -
                        t.UIScroll.deltaY * e.frameSync
                    )
                );
                t.UIScroll.deltaY = HtmlUIClamp(
                    -t.UIDimension.el.clientHeight / t.UIConfig.bounceDistanceLimits,
                    t.UIDimension.el.clientHeight / t.UIConfig.bounceDistanceLimits,
                    HtmlUI.Math.lerp(t.UIScroll.deltaY, 0, t.UIConfig.bounceRate * e.frameSync)
                );
            }
        } else {
            if (!t.UIScroll.smoothScroll && e.isAnim) {
                t.UIScroll.deltaX = 0;
                t.UIScroll.deltaY = 0;
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x);
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y);
                t.UIAnimation.active(false);
            }
        }

        if (t.UIScroll.smoothScroll) {
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_1);
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_2);
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_3);

            if (t.UIScroll.dynamicSmoothScroll) {
                t.UIScroll.dynamicBounceX += (1 - t.UIScroll.dynamicBounceX) * Math.min(1, t.UIScroll.dynamicSmoothScrollRate * e.frameSync);
                t.UIScroll.dynamicBounceY += (1 - t.UIScroll.dynamicBounceY) * Math.min(1, t.UIScroll.dynamicSmoothScrollRate * e.frameSync);
            }

            t.UIScroll.deltaX = 0;
            t.UIScroll.deltaY = 0;
            var smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.smoothX);
            var smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.smoothY);

            if ((t.UIScroll.x > smoothX - 0.1 && t.UIScroll.x < smoothX + 0.1) && (t.UIScroll.y > smoothY - 0.1 && t.UIScroll.y < smoothY + 0.1)) {
                t.UIScroll.x = smoothX;
                t.UIScroll.y = smoothY;
                t.UIAnimation.active(false);
                t.UIScroll.smoothScroll = false;
            } else {
                if (t.UIScroll.dynamicSmoothScroll) {
                    t.UIScroll.x += (smoothX - t.UIScroll.x) * Math.min(1, t.UIScroll.smoothRate * e.frameSync * t.UIScroll.dynamicBounceX);
                    t.UIScroll.y += (smoothY - t.UIScroll.y) * Math.min(1, t.UIScroll.smoothRate * e.frameSync * t.UIScroll.dynamicBounceY);
                } else {
                    t.UIScroll.x += (smoothX - t.UIScroll.x) * Math.min(1, t.UIScroll.smoothRate * e.frameSync);
                    t.UIScroll.y += (smoothY - t.UIScroll.y) * Math.min(1, t.UIScroll.smoothRate * e.frameSync);
                }
            }
        }

        if (t.UIScroll.isPressed) {
            if (t.UIConfig.fastScroll) {
                t.UIScroll.fastX = t.UIScroll.deltaX;
                t.UIScroll.fastY = t.UIScroll.deltaY;
            } else {
                t.UIScroll.fastX = 0;
                t.UIScroll.fastY = 0;
            }
        }

        t.UIScroll.velX = UIVelDeltaX.set(t.UIScroll.x);
        t.UIScroll.velY = UIVelDeltaY.set(t.UIScroll.y);

        t.UIElement.content.style.willChange = (
            (
                ((t.UIScroll.velX != 0 || t.UIScroll.deltaY != 0) && (t.UIScroll.x != 0 && t.UIScroll.x != t.UIDimension.contentWidth)) ||
                ((t.UIScroll.velY != 0 || t.UIScroll.deltaY != 0) && (t.UIScroll.y != 0 && t.UIScroll.y != t.UIDimension.contentHeight))
            ) || t.UIScroll.isPressed
        ) && t.UIConfig.improveAnimation ? "transform": "";

        t.UIElement.main.scrollLeft = 0;
        t.UIElement.main.scrollTop = 0;
        HtmlUISetPosition(t.UIElement.content, -t.UIScroll.x, -t.UIScroll.y, t.UIConfig.transform, t.UIConfig.hardware);

        t.UIListener._event.listenEvent._execEvent("scroll");
    });

    t.UIAction = {
        scrollTo: function(x, y, smooth = false,
            dynamic = false) {
            t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
            if (t.UIScroll.dynamicSmoothScroll) {
                t.UIScroll.dynamicBounceX = 0;
                t.UIScroll.dynamicBounceY = 0;
                t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
            }

            UIUpdateDimension();
            t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;
            if ((smooth ? true: false)) {
                t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
            } else {
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
            }

            t.UIScroll.smoothScroll = smooth ? true: false;
            if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                t.UIAnimation.active(smooth ? true: false);
                t.UIAnimation.anim();
            }
        },
        scrollBy: function(x, y, smooth = false, dynamic = false) {
            t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
            if (t.UIScroll.dynamicSmoothScroll) {
                t.UIScroll.dynamicBounceX = 0;
                t.UIScroll.dynamicBounceY = 0;
                t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
            }

            UIUpdateDimension();
            t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;
            if ((smooth ? true: false)) {
                t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x + x);
                t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y + y);
            } else {
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x + x);
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y + y);
            }

            t.UIScroll.smoothScroll = smooth ? true: false;
            if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                t.UIAnimation.active(smooth ? true: false);
                t.UIAnimation.anim();
            }
        },
        scrollIntoView: function(el, smooth = false, direction = "center", dynamic = false) {
            if (!el) return;

            t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
            if (t.UIScroll.dynamicSmoothScroll) {
                t.UIScroll.dynamicBounceX = 0;
                t.UIScroll.dynamicBounceY = 0;
                t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
            }

            UIUpdateDimension();
            t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;

            var mainScroll = t.UIElement.content.getBoundingClientRect();
            var targetScroll = el.getBoundingClientRect();

            var x = 0 - (mainScroll.left - targetScroll.left);
            var y = 0 - (mainScroll.top - targetScroll.top);

            if (direction == "left top") {
                x += 0;
                y += 0;
            } else if (direction == "center top") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                y += 0;
            } else if (direction == "right top") {
                x += -t.UIDimension.el.clientWidth - el.offsetWidth;
                y += 0;
            } else if (direction == "left center") {
                x += 0;
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
            } else if (direction == "center") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
            } else if (direction == "right center") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth);
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
            } else if (direction == "left bottom") {
                x += 0;
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
            } else if (direction == "center bottom") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
            } else if (direction == "right bottom") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth);
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
            }

            if ((smooth ? true: false)) {
                t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
            } else {
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
            }

            t.UIScroll.smoothScroll = smooth ? true: false;
            if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                t.UIAnimation.active(smooth ? true: false);
                t.UIAnimation.anim();
            }
        },
        refresh: function() {
            if (!t.UIAnimation.isAnim) {
                t.UIAnimation.active(false);
                t.UIAnimation.anim();
            }
        },
        navigationScrollToTop: function(HtmlUINav, preventTriggerEl = []) {
            var _trigger = true;
            if (HtmlUINav.tagName != "HTMLUI-NAV" || HtmlUINav.parentNode.tagName != "HTMLUI-MAIN") return;
            HtmlUINav.addEventListener("click", function(e) {
                var trigger = _trigger;
                preventTriggerEl.forEach(function(el) {
                    if (e.target == el || e.target.parentElement == el || e.target.parentNode == el) {
                        trigger = false;
                    }
                });
                if (trigger) {
                    t.UIAction.scrollTo(t.UIScroll.x, 0, true, 0.0375);
                }
            });

            return {
                disable: function(v) {
                    _trigger = typeof v == "boolean" ? !v: true;
                }
            }
        }
    }

    t.UIGesture.listen.onStart(function(e) {
        var fireStart = function() {
            t.UIScroll.smoothScroll = false;
            t.UIScroll.isPressed = true;

            t.UIAnimation.active(false);
        }
        if (t.UIConfig.fastScroll) {
            t.UIScroll.fastDebounce_1 = window.requestAnimationFrame(function() {
                t.UIScroll.fastDebounce_2 = window.requestAnimationFrame(function() {
                    t.UIScroll.fastDebounce_3 = window.requestAnimationFrame(function() {
                        fireStart();
                    });
                });
            });
        } else {
            fireStart();
        }
    });
    t.UIGesture.listen.onSwipeLock(function(e) {
        if (t.UIConfig.fastScroll) {
            t.UIScroll.isPressed = true;

            window.cancelAnimationFrame(t.UIScroll.fastDebounce_1);
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_2);
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_3);
        }

        t.UIGesture.swipeAxis(t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? true: false, t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? true: false);
        t.UIGesture.updateConfig({
            maxDelta: (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? t.UIDimension.el.clientWidth: t.UIDimension.el.clientHeight) / 4
        });

        t.UIScroll.boundX = (t.UIScroll.x < 0 ? (e.deltaX > 0 ? Math.max(0, -t.UIScroll.x): 0): (e.deltaX < 0 ? Math.max(0, t.UIScroll.x - t.UIDimension.contentWidth): 0)) / (t.UIDimension.el.clientWidth / 16);
        t.UIScroll.boundY = (t.UIScroll.y < 0 ? (e.deltaY > 0 ? Math.max(0, -t.UIScroll.y): 0): (e.deltaY < 0 ? Math.max(0, t.UIScroll.y - t.UIDimension.contentHeight): 0)) / (t.UIDimension.el.clientHeight / 16);

        if (t.UIConfig.bounce) {
            t.UIScroll.x -= t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX): 0;
            t.UIScroll.y -= t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY): 0;
        } else {
            t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x - (t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX): 0));
            t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y - (t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY): 0));
        }

        t.UIScroll.smoothScroll = false;
        t.UIAnimation.active(false);
        t.UIAnimation.anim();
    });
    t.UIGesture.listen.onFlingLock(function(e) {
        t.UIScroll.fastX = (e.deltaX != 0 ? (e.deltaX > 0 ? Math.max(0, t.UIScroll.fastX): -Math.max(0, -t.UIScroll.fastX)): 0) || 0;
        t.UIScroll.fastY = (e.deltaY != 0 ? (e.deltaY > 0 ? Math.max(0, t.UIScroll.fastY): -Math.max(0, -t.UIScroll.fastY)): 0) || 0;
        t.UIScroll.deltaX = t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX) * t.UIConfig.sensivity + t.UIScroll.fastX: 0;
        t.UIScroll.deltaY = t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY) * t.UIConfig.sensivity + t.UIScroll.fastY: 0;

        t.UIScroll.isPressed = false;

        t.UIScroll.dynamicBounceX = 0;
        t.UIScroll.dynamicBounceY = 0;

        if (!t.UIAnimation.isAnim) {
            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        }
    });

    t.UIListener["scroll"] = function(callback) {
        t.UIListener._event.listenEvent.on("scroll",
            function() {
                callback({
                    x: t.UIScroll.x,
                    y: t.UIScroll.y,
                    distanceX: t.UIScroll.velX,
                    distanceY: t.UIScroll.velY,
                    deltaX: t.UIScroll.deltaX,
                    deltaY: t.UIScroll.deltaY,
                    clientWidth: t.UIDimension.el.clientWidth,
                    clientHeight: t.UIDimension.el.clientHeight,
                    scrollWidth: t.UIDimension.el2.scrollWidth,
                    scrollHeight: t.UIDimension.el2.scrollHeight,
                    contentWidth: t.UIDimension.contentWidth,
                    contentHeight: t.UIDimension.contentHeight,
                    isPressed: t.UIScroll.isPressed
                });
            });
    }

    HtmlUIResize(t.UIElement.main,
        function() {
            if (!t.UIAnimation.isAnim) {
                t.UIAction.scrollTo(t.UIScroll.x, t.UIScroll.y, false);
            }
        });
    HtmlUIResize(t.UIElement.content,
        function() {
            if (!t.UIAnimation.isAnim) {
                t.UIAction.scrollTo(t.UIScroll.x, t.UIScroll.y, false);
            }
        });

    t.UIAction.refresh();
}
window.HtmlUI.DynamicColor = function(config = {}) {
    var t = this;

    t.UIDynamicColor = new DynamicColor();

    t.UIConfig = {
        width: 20,
        height: 20
    }
    HtmlUIConfig(t.UIConfig,
        config);

    t.UIDynamic = {
        colors: [],
        mName: "",
        mOptions: {},
        mDeleted: false,
        mHasChanged: false
    }

    var UIGenerateColor = function() {
        if (!t.UIDynamic.mDeleted && !t.UIDynamic.mHasChanged) {
            t.UIDynamicColor.generateDynamic(function(color) {
                t.UIDynamic.colors.push({
                    name: t.UIDynamic.mName,
                    options: t.UIDynamic.mOptions,
                    hasGenerated: false,
                    hasDeleted: false,
                    dataColor: color,
                    dataColorResult: {}
                });
            });
        }
        t.UIDynamic.mHasChanged = false;

        t.UIDynamic.colors.forEach(function(data) {
            var UIMutation;
            if (!data.hasGenerated) {
                data.hasGenerated = true;

                if (!data.hasDeleted) {
                    var UIUpdate = function() {
                        var _color = {};
                        var _color2 = data.dataColor;
                        var _dark = data.options.darkMode || data.options.element.hasAttribute("accent-dark-mode");

                        for (var c in _color2) {
                            if (_dark) {
                                if (/accent[^Dark|Ori]/i.test(c) && c != "accentFromColor") {
                                    _color[c] = _color2[c.replace("accent", "accentDark")];
                                } else if (/accentDark/i.test(c)) {
                                    _color[c] = _color2[c.replace("accentDark", "accent")];
                                } else {
                                    _color[c] = _color2[c];
                                }
                            } else {
                                _color = _color2;
                            }
                        }

                        for (var c in _color) {
                            data.options.element.querySelectorAll(`.color-${c}${data.options.id ? "-" + data.options.id: ""}`).forEach(function(el) {
                                el.style.setProperty("background-color", _color[c].css.replace(")", ", ") + (Number(el.getAttribute("accent-bg-opacity")) || 1) + ")");
                                el.style.setProperty("color", (_color[c].accents > 255 / 2 ?
                                    (_color[_dark ? "accent10": "accentDark10"] || {
                                        css: ""
                                    }).css:
                                    (_color[_dark ? "accentDark10": "accent10"] || {
                                        css: ""
                                    }).css)
                                    .replace(")", ", ") +
                                    (Number(el.getAttribute("accent-font-opacity")) || 1) + ")"
                                );
                            });

                            data.options.element.querySelectorAll(`.font-${c}${data.options.id ? "-" + data.options.id: ""}`).forEach(function(el) {
                                el.style.setProperty("color", _color[c].css.replace(")", ", ") + (Number(el.getAttribute("accent-font-opacity")) || 1) + ")");
                            });

                            data.options.element.querySelectorAll(`.bg-${c}${data.options.id ? "-" + data.options.id: ""}`).forEach(function(el) {
                                el.style.setProperty("background-color", _color[c].css.replace(")", ", ") + (Number(el.getAttribute("accent-bg-opacity")) || 1) + ")");
                            });
                        }

                        data.options.element.querySelectorAll(`[accent-attr${data.options.id ? "-" + data.options.id: ""}]`).forEach(function(el) {
                            var _attrs = el.getAttribute(`accent-attr${data.options.id ? "-" + data.options.id: ""}`).split("|");
                            _attrs.forEach(function(attr) {
                                var _attr = attr.split("=");

                                var _attrName = _attr[0];
                                var _attrValue = _attr[1];

                                for (var c in _color) {
                                    _attrValue = _attrValue.replace(new RegExp(`<${c}>`, "g"), (_color[c].css || "").replace(/\s|\n/g, ""));
                                }

                                el.setAttribute(_attrName, _attrValue);
                            });
                        });

                        data.options.element.querySelectorAll(`[accent-style${data.options.id ? "-" + data.options.id: ""}]`).forEach(function(el) {
                            var _style = el.getAttribute(`accent-style${data.options.id ? "-" + data.options.id: ""}`);

                            for (var c in _color) {
                                _style = _style.replace(new RegExp(`<${c}>`, "g"), (_color[c].css || "").replace(/\s|\n/g, ""));
                            }

                            el.setAttribute("style", _style);
                        });

                        data.options.element.querySelectorAll(`style[accent-css${data.options.id ? "-" + data.options.id: ""}]`).forEach(function(el) {
                            var _css = el.getAttribute("accent-previous-css") || el.textContent;
                            if (!el.hasAttribute("accent-previous-css")) {
                                el.setAttribute("accent-previous-css", _css);
                            }

                            for (var c in _color) {
                                _css = _css.replace(new RegExp(`<${c}>`, "g"), (_color[c].css || "").replace(/\s|\n/g, ""));
                            }

                            el.textContent = _css;
                        });

                        data.dataColorResult = _color;
                    }
                    UIUpdate();

                    UIMutation = new MutationObserver(function() {
                        setTimeout(UIUpdate, 300);
                    });
                    UIMutation.observe(data.options.element,
                        {
                            childList: true,
                            subtree: true
                        });
                }

                if (data.hasDeleted) {
                    UIMutation.disconnect();
                    delete data;
                    delete UIMutation;
                }
            }
        });
    }

    t.UIState = {};
    t.UIState.matchColor = function(name, options = {}) {
        t.UIDynamic.mDeleted = false;
        t.UIDynamic.mName = name;

        var UIConfig = {
            byCanvas: null,
            byRGB: [0, 0, 0],
            x: Math.round(t.UIConfig.width / 2),
            y: Math.round(t.UIConfig.height / 2),
            element: document.body || document.documentElement,
            darkMode: false,
            id: null
        }
        HtmlUIConfig(UIConfig,
            options);
        t.UIDynamicColor.setColorRGB(UIConfig.byCanvas ? null: UIConfig.byRGB);
        t.UIDynamicColor.setSource(UIConfig.byCanvas ? UIConfig.byCanvas: null);
        t.UIDynamic.mOptions = UIConfig;

        t.UIDynamicColor.addColor(name,
            UIConfig.x,
            UIConfig.y);

        UIGenerateColor();
    }
    t.UIState.setOptions = function(name, options) {
        t.UIDynamic.mHasChanged = true;
        t.UIDynamic.colors.forEach(function(data) {
            if (data.name == name) {
                HtmlUIConfig(data.options, options);
            }
        });
    }
    t.UIState.deleteColor = function(name) {
        t.UIDynamic.mDeleted = true;
        t.UIDynamic.colors.forEach(function(data) {
            if (data.name == name) {
                data.hasGenerated = false;
                data.hasDeleted = true;
                UIGenerateColor();
            }
        });
    }
}
window.HtmlUI.ImageWriter = function(config = {}) {
    var t = this;

    t.UIListener = new HtmlUIListener(["write"]);

    t.UIConfig = {
        format: "image/png",
        resolution: 100,
        quality: 100
    }
    HtmlUIConfig(t.UIConfig,
        config);

    t.UIImage = {
        isURL: false,
        isSvg: false,
        imageLoader: new HtmlUI.ImageLoader(),
        blobBefore: [],
        arrayBuffer: [],
    }

    var UIWriter = function() {
        var _image = new Image();
        _image.src = URL.createObjectURL(
            t.UIImage.isSvg ? new Blob([t.UIImage.blobBefore], {
                type: "image/svg+xml"
            }):
            new Blob([t.UIImage.blobBefore])
        );

        _image.addEventListener("load",
            function() {
                var _canvas = document.createElement("canvas");
                var _ctx = _canvas.getContext("2d");
                var _resolution = HtmlUI.Math.clamp01(t.UIConfig.resolution / 100);

                _canvas.width = this.naturalWidth * _resolution;
                _canvas.height = this.naturalHeight * _resolution;

                _ctx.drawImage(_image, 0, 0, _canvas.width, _canvas.height);

                _canvas.toBlob(function(res) {
                    var arrayBuffer;
                    var fileReader = new FileReader();
                    fileReader.onload = function(event) {
                        arrayBuffer = event.target.result;
                        t.UIImage.arrayBuffer = arrayBuffer;

                        t.UIListener._event.listenEvent._execEvent("write");

                        delete _canvas;
                        delete _ctx;
                        delete _image;
                    };
                    fileReader.readAsArrayBuffer(res);
                }, t.UIConfig.format, t.UIConfig.quality / 100);

                URL.revokeObjectURL(this.src);
            });
    }

    t.UIImage.imageLoader.UIListener.load(function(event) {
        t.UIImage.isSvg = event.isSvg;
        t.UIImage.blobBefore = event.arrayBuffer;
        UIWriter();
    });

    t.UIState = {};
    t.UIState.loadResource = function(bufferOrUrl) {
        if (typeof bufferOrUrl == "string") {
            t.UIImage.imageLoader.UIState.loadImage(bufferOrUrl);
        } else {
            t.UIImage.isSvg = false;
            t.UIImage.blobBefore = bufferOrUrl;
            UIWriter();
        }
    }
    t.UIState.setFormat = function(format) {
        t.UIConfig.format = format;
    }
    t.UIState.setResolution = function(resolution) {
        t.UIConfig.resolution = resolution;
    }

    t.UIListener["write"] = function(callback) {
        t.UIListener._event.listenEvent.on("write", function() {
            callback({
                arrayBuffer: t.UIImage.arrayBuffer,
                isSvg: t.UIImage.isSvg
            });
        });
    }
}
window.HtmlUI.LiveXHR = function(config = {}) {
    var t = this;

    t.UIListener = new HtmlUIListener(["update", "live", "xhrerror"]);

    t.UIConfig = {
        url: "",
        interval: 10000,
        autoRun: false,
        xhr: new HtmlUI.RawXHR(),
        runSameResponse: false
    }
    HtmlUIConfig(t.UIConfig, config);

    t.UILive = {
        objectResponse: {},
        prevObjectResponse: {},
        intervalFn: null
    }

    t.UILive.intervalFn = new HtmlUIInterval(function(e) {
        t.UIConfig.xhr.UIAction.update();
    }, t.UIConfig.interval);

    t.UIConfig.xhr.UIListener.call(function(a) {
        t.UILive.objectResponse = typeof a == "object" ? a.response: a;
        if (t.UIConfig.runSameResponse || t.UILive.objectResponse != t.UILive.prevObjectResponse) {
            t.UILive.prevObjectResponse = t.UILive.objectResponse;

            t.UIListener._event.listenEvent._execEvent("update");
        }
        t.UIListener._event.listenEvent._execEvent("live");
    });

    t.UIConfig.xhr.UIListener.xhrerror(function() {
        t.UIAction.stopLive();
        t.UIListener._event.listenEvent._execEvent("xhrerror");
    });

    t.UIAction = {};
    t.UIAction.changeURL = function(url) {
        t.UIConfig.xhr.UIAction.changeURL(url);
    }
    t.UIAction.runLive = function() {
        if (!t.UILive.intervalFn.isRunning) {
            t.UILive.intervalFn.start();
        }
    }
    t.UIAction.stopLive = function() {
        t.UILive.intervalFn.stop();
    }
    t.UIAction.setTimeInterval = function(time) {
        t.UILive.intervalFn.time = time;
    }

    t.UIListener["update"] = function(callback) {
        t.UIListener._event.listenEvent.on("update", function() {
            callback(t.UILive.objectResponse);
        })
    }
    t.UIListener["live"] = function(callback) {
        t.UIListener._event.listenEvent.on("live", function() {
            callback(t.UILive.objectResponse);
        })
    }
    t.UIListener["xhrerror"] = function(callback) {
        t.UIListener._event.listenEvent.on("xhrerror", function() {
            callback();
        })
    }

    t.UIAction.changeURL(t.UIConfig.url);
    if (t.UIConfig.autoRun) {
        t.UIAction.runLive();
    }
}
window.HtmlUI.SVG = function() {
    var t = this;

    t.UIListener = new HtmlUIListener(["generate"]);

    t.UISVG = {
        options: {
            svg_width: null,
            svg_height: null,
            svg_view_box: null,
            svg_fill_color: null,
            childs: [],
            remove_css_style: false,
            preserve_aspect_ratio: true,
            background_color: null
        },
        raw: new HtmlUI.RawXHR(),
        rawText: "",
        rawResult: "",
        changedOptions: {},

        pendingGenerate: false,
        pendingSVG: false
    }
    t.UISVG.changedOptions = t.UISVG.options;

    var UIUpdate = function() {
        var _childs = document.createElement("div");
        _childs.innerHTML = t.UISVG.rawText;

        var _svg = _childs.querySelector("svg");
        if (!_svg && _childs.querySelectorAll("svg").length != 1) return;
        _svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        var _opt = t.UISVG.changedOptions;
        if (_opt.svg_width) _svg.setAttribute("width", _opt.svg_width);
        if (_opt.svg_height) _svg.setAttribute("height", _opt.svg_height);
        if (_opt.svg_view_box) _svg.setAttribute("viewBox", _opt.svg_view_box);
        if (_opt.svg_fill_color) _svg.setAttribute("fill", _opt.svg_fill_color);
        if (_opt.preserve_aspect_ratio) {
            _svg.removeAttribute("preserveAspectRatio");
        } else {
            _svg.setAttribute("preserveAspectRatio", "none");
        }
        if (_opt.remove_css_style) {
            _svg.querySelectorAll("style").forEach(function(el) {
                el.parentNode.removeChild(el);
            });
        }

        _opt.childs.forEach(function(e) {
            if (!e.query || !e.attrs) return;

            var _svgGen = e.query.split(" >> ");
            var _svgQueryEl = _svgGen[0];
            var _svgQueryIndex = _svgGen[1] && /all/i.test(_svgGen[1]) ? "all": (_svgGen[1] || "0");
            var _svgQueryIndexs = [];
            if (_svgQueryIndex != "all") {
                _svgQueryIndex.split(",").forEach(function(index) {
                    var _el = _svg.querySelectorAll(_svgQueryEl)[Number(index.replace(/\n/g, ""))];
                    if (_el) _svgQueryIndexs.push(_el);
                });
            }
            var _svgChilds = _svgQueryIndex != "all" ? _svgQueryIndexs: _svg.querySelectorAll(_svgQueryEl);

            _svgChilds.forEach(function(el) {
                for (var attrs in e.attrs) {
                    el.setAttribute(attrs, e.attrs[attrs]);
                }
            });
        });

        if (_opt.background_color) {
            var _svgBG = document.createElement("rect");
            _svg.insertBefore(_svgBG, _svg.childNodes[0]);
            var _svgBGWidth = 0,
            _svgBGHeight = 0;

            _svgBG.setAttribute("fill", _opt.background_color);
            if (_svg.hasAttribute("viewBox")) {
                var _viewBox = _svg.getAttribute("viewBox").split(" ");
                _svgBGWidth = _viewBox[2];
                _svgBGHeight = _viewBox[3];
            } else {
                if (_svg.hasAttribute("width")) {
                    _svgBGWidth = parseFloat(_svg.getAttribute("width"));
                } else {
                    _svgBGWidth = _svg.clientWidth;
                }

                if (_svg.hasAttribute("height")) {
                    _svgBGHeight = parseFloat(_svg.getAttribute("height"));
                } else {
                    _svgBGHeight = _svg.clientHeight;
                }
            }

            _svgBG.setAttribute("width", _svgBGWidth);
            _svgBG.setAttribute("height", _svgBGHeight);
        }


        t.UISVG.rawResult = _svg.outerHTML;
        window.requestAnimationFrame(function() {
            t.UIListener._event.listenEvent._execEvent("generate");
        });

        delete _childs;
        delete _opt;
        delete _svg;
    }

    t.UISVG.raw.UIListener.call(function(res) {
        t.UISVG.rawText = res;
        if (t.UISVG.pendingGenerate) {
            t.UISVG.pendingGenerate = false;
            if (t.UISVG.pendingSVG) UIUpdate();
            t.UISVG.pendingSVG = false;
        }
    });

    t.UIState = {};
    t.UIState.load = function(url) {
        t.UISVG.raw.UIAction.changeURL(url);
        t.UISVG.raw.UIAction.update();
        t.UISVG.pendingGenerate = true;
    }
    t.UIState.create = function(svg) {
        t.UISVG.rawText = svg;
        t.UISVG.pendingGenerate = false;
    }
    t.UIState.options = function(options) {
        var _options = t.UISVG.options;
        HtmlUIConfig(_options,
            options);
        t.UISVG.changedOptions = _options;
    }
    t.UIState.generate = function() {
        if (!t.UISVG.pendingGenerate) {
            t.UISVG.pendingSVG = false;
            UIUpdate();
        } else {
            t.UISVG.pendingSVG = true;
        }
    }

    t.UIState.getResult = function() {
        return t.UISVG.rawResult;
    }
    t.UIState.getResultURL = function() {
        return "data:image/svg+xml;utf-8," + encodeURIComponent(t.UISVG.rawResult);
    }

    t.UIListener["generate"] = function(callback) {
        t.UIListener._event.listenEvent.on("generate", function() {
            callback({
                result: t.UIState.getResult(),
                resultURL: t.UIState.getResultURL()
            });
        });
    }
}
window.HtmlUI.PanZoom = function(el, config = {}) {
    var t = this;

    t.UIElement = {};
    t.UIElement.main = HtmlUIBuild(el);
    t.UIElement.main.classList.add("htmlui-pan-zoom");
    var UIContent = function() {
        var _content = t.UIElement.main.querySelectorAll("*")[0];
        if (!_content) throw new Error("[HtmlUI PanZoom] Can't find element for content");
        t.UIElement.content = _content;
        t.UIElement.content.classList.add("htmlui-pan-zoom-content");
    }
    UIContent();

    t.UIListener = new HtmlUIListener(["update"]);

    t.UIConfig = {
        initialX: 0,
        initialY: 0,
        initialScale: 1,
        maxScale: 2,
        maxScaleByRatio: true,
        friction: 0.0375,
        bounceRate: 0.2,
        bounce: true,
        minDelta: 0.1,

        doubleTap: true,
        pinchZoom: true,
        measureMutation: false
    }
    HtmlUIConfig(t.UIConfig, config);

    t.UIPanZoom = {
        maxScale: 0,

        width: 0,
        height: 0,
        scale: HtmlUIClamp(1, Infinity, t.UIConfig.initialScale),
        x: 0,
        y: 0,

        deltaX: 0,
        deltaY: 0,

        boundX: 1,
        boundY: 1,

        startX: 0,
        startY: 0,
        startScale: 1,
        endX: 0,
        endY: 0,
        endScale: 1,

        mainRatio: 0,
        contentRatio: 0,

        mainWidth: 0,
        mainHeight: 0,
        contentWidth: 0,
        contentHeight: 0,

        centerX: 0,
        centerY: 0,

        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,

        minZoomX: 0,
        minZoomY: 0,
        maxZoomX: 0,
        maxZoomY: 0,

        motion: false,
        bounds: false,
        isPressed: false,
        hasZoom: false
    }

    t.UIGesture = new SuperGesture(t.UIElement.main);

    var UIMinMaxPos = function(mainSize, size, scale) {
        return HtmlUIClamp(-Infinity, 0, (mainSize - size * scale) / 2);
    }

    var UIMeasure = function() {
        t.UIPanZoom.mainWidth = t.UIElement.main.clientWidth;
        t.UIPanZoom.mainHeight = t.UIElement.main.clientHeight;

        t.UIPanZoom.contentWidth = t.UIElement.content.naturalWidth || t.UIElement.content.videoWidth || t.UIElement.content.scrollWidth;
        t.UIPanZoom.contentHeight = t.UIElement.content.naturalHeight || t.UIElement.content.videoHeight || t.UIElement.content.scrollHeight;

        t.UIPanZoom.mainRatio = t.UIPanZoom.mainWidth / t.UIPanZoom.mainHeight;
        t.UIPanZoom.contentRatio = t.UIPanZoom.contentWidth / t.UIPanZoom.contentHeight;

        if (t.UIPanZoom.mainRatio > t.UIPanZoom.contentRatio) {
            t.UIPanZoom.width = t.UIPanZoom.mainHeight * t.UIPanZoom.contentRatio;
            t.UIPanZoom.height = t.UIPanZoom.mainHeight;
        } else {
            t.UIPanZoom.width = t.UIPanZoom.mainWidth;
            t.UIPanZoom.height = t.UIPanZoom.mainWidth / t.UIPanZoom.contentRatio;
        }

        t.UIPanZoom.centerX = (t.UIPanZoom.mainWidth - t.UIPanZoom.width) / 2;
        t.UIPanZoom.centerY = (t.UIPanZoom.mainHeight - t.UIPanZoom.height) / 2;

        t.UIPanZoom.maxScale = HtmlUIClamp(t.UIConfig.maxScaleByRatio ? HtmlUIClamp(1, Infinity, t.UIPanZoom.mainRatio > t.UIPanZoom.contentRatio ? t.UIPanZoom.mainRatio / t.UIPanZoom.contentRatio: t.UIPanZoom.contentRatio / t.UIPanZoom.mainRatio): 1, Infinity, t.UIConfig.maxScale);

        t.UIPanZoom.minZoomX = UIMinMaxPos(t.UIPanZoom.mainWidth, t.UIPanZoom.width, t.UIPanZoom.maxScale);
        t.UIPanZoom.minZoomY = UIMinMaxPos(t.UIPanZoom.mainHeight, t.UIPanZoom.height, t.UIPanZoom.maxScale);
        t.UIPanZoom.maxZoomX = -t.UIPanZoom.minZoomX;
        t.UIPanZoom.maxZoomY = -t.UIPanZoom.minZoomY;
    }

    var UIUpdate = function(frameSync = 1) {
        t.UIPanZoom.minX = UIMinMaxPos(t.UIPanZoom.mainWidth, t.UIPanZoom.width, t.UIPanZoom.scale);
        t.UIPanZoom.minY = UIMinMaxPos(t.UIPanZoom.mainHeight, t.UIPanZoom.height, t.UIPanZoom.scale);
        t.UIPanZoom.maxX = -t.UIPanZoom.minX;
        t.UIPanZoom.maxY = -t.UIPanZoom.minY;
        t.UIPanZoom.hasZoom = t.UIPanZoom.scale > 1;
        t.UIGesture.swipeAxis(t.UIPanZoom.hasZoom, t.UIPanZoom.hasZoom);

        if (t.UIPanZoom.hasZoom) t.UIElement.main.classList.add("has-zoom");
        else t.UIElement.main.classList.remove("has-zoom");

        if (t.UIPanZoom.motion && !t.UIPanZoom.isPressed) {
            if (t.UIPanZoom.x < t.UIPanZoom.minX || t.UIPanZoom.x > t.UIPanZoom.maxX) {
                t.UIPanZoom.x = HtmlUI.Math.lerp(t.UIPanZoom.x + t.UIPanZoom.deltaX * frameSync, HtmlUIClamp(t.UIPanZoom.minX, t.UIPanZoom.maxX, t.UIPanZoom.x), t.UIConfig.bounceRate / 1.25 * frameSync);
                t.UIPanZoom.deltaX = HtmlUI.Math.lerp(t.UIPanZoom.deltaX, 0, t.UIConfig.bounceRate * 1.25 * frameSync);
            } else {
                t.UIPanZoom.x += t.UIPanZoom.deltaX * frameSync;
                t.UIPanZoom.deltaX = HtmlUI.Math.lerp(t.UIPanZoom.deltaX, 0, t.UIConfig.friction * frameSync);
            }
            if (t.UIPanZoom.y < t.UIPanZoom.minY || t.UIPanZoom.y > t.UIPanZoom.maxY) {
                t.UIPanZoom.y = HtmlUI.Math.lerp(t.UIPanZoom.y + t.UIPanZoom.deltaY * frameSync, HtmlUIClamp(t.UIPanZoom.minY, t.UIPanZoom.maxY, t.UIPanZoom.y), t.UIConfig.bounceRate / 1.25 * frameSync);
                t.UIPanZoom.deltaY = HtmlUI.Math.lerp(t.UIPanZoom.deltaY, 0, t.UIConfig.bounceRate * 1.25 * frameSync);
            } else {
                t.UIPanZoom.y += t.UIPanZoom.deltaY * frameSync;
                t.UIPanZoom.deltaY = HtmlUI.Math.lerp(t.UIPanZoom.deltaY, 0, t.UIConfig.friction * frameSync);
            }

            if ((Math.abs(t.UIPanZoom.deltaX) > Math.abs(t.UIPanZoom.deltaY) ? Math.abs(t.UIPanZoom.deltaX): Math.abs(t.UIPanZoom.deltaY)) < t.UIConfig.minDelta) {
                t.UIPanZoom.deltaX = 0;
                t.UIPanZoom.deltaY = 0;
            }

            t.UIPanZoom.bounds = t.UIPanZoom.x < t.UIPanZoom.minX || t.UIPanZoom.x > t.UIPanZoom.maxX || t.UIPanZoom.y < t.UIPanZoom.minY || t.UIPanZoom.y > t.UIPanZoom.maxY;

            if (t.UIPanZoom.deltaX == 0 && t.UIPanZoom.deltaY == 0 && (t.UIPanZoom.x > t.UIPanZoom.minX - 0.1 && t.UIPanZoom.x < t.UIPanZoom.maxX + 0.1 && t.UIPanZoom.y > t.UIPanZoom.minY - 0.1 && t.UIPanZoom.y < t.UIPanZoom.maxY + 0.1)) {
                t.UIPanZoom.x = HtmlUIClamp(t.UIPanZoom.minX, t.UIPanZoom.maxX, t.UIPanZoom.x);
                t.UIPanZoom.y = HtmlUIClamp(t.UIPanZoom.minY, t.UIPanZoom.maxY, t.UIPanZoom.y);
                t.UIPanZoom.motion = false;
                t.UIAnimation.active(false);
            }
        }

        if (!t.UIConfig.bounce && !(t.UIAnimator && t.UIAnimator.UIAnimation.isAnim)) {
            t.UIPanZoom.x = HtmlUIClamp(t.UIPanZoom.minX, t.UIPanZoom.maxX, t.UIPanZoom.x);
            t.UIPanZoom.y = HtmlUIClamp(t.UIPanZoom.minY, t.UIPanZoom.maxY, t.UIPanZoom.y);

            if (t.UIPanZoom.x <= t.UIPanZoom.minX || t.UIPanZoom.x >= t.UIPanZoom.maxX) t.UIPanZoom.deltaX = 0;
            if (t.UIPanZoom.y <= t.UIPanZoom.minY || t.UIPanZoom.y >= t.UIPanZoom.maxY) t.UIPanZoom.deltaY = 0;
        }

        t.UIElement.content.style.setProperty("width", `${t.UIPanZoom.width}px`, "important");
        t.UIElement.content.style.setProperty("height", `${t.UIPanZoom.height}px`, "important");
        t.UIElement.content.style.setProperty("left", `${t.UIPanZoom.centerX}px`, "important");
        t.UIElement.content.style.setProperty("top", `${t.UIPanZoom.centerY}px`, "important");
        t.UIElement.content.style.setProperty("transform", `translate(${t.UIPanZoom.x}px, ${t.UIPanZoom.y}px) scale(${t.UIPanZoom.scale})`, "important");

        t.UIListener._event.listenEvent._execEvent("update");
    }

    t.UIAnimation = new HtmlUIAnimation(function(e) {
        UIUpdate(e.frameSync);
    });

    t.UIAnimator = new HtmlUI.Animator(function(e) {
        t.UIPanZoom.x = e.fn.distance(t.UIPanZoom.startX, t.UIPanZoom.endX);
        t.UIPanZoom.y = e.fn.distance(t.UIPanZoom.startY, t.UIPanZoom.endY);
        t.UIPanZoom.scale = e.fn.distance(t.UIPanZoom.startScale, t.UIPanZoom.endScale);
        t.UIPanZoom.motion = false;
        t.UIAnimation.active(false);

        UIUpdate();
    });

    var UIPrevMeasureMutation = null,
    UIMMeasure = null;
    var UIMeasureMutation = function() {
        if (UIMMeasure) {
            UIPrevMeasureMutation = UIMMeasure;
            UIPrevMeasureMutation.disconnect();
        }
        UIMMeasure = new MutationObserver(function() {
            if (t.UIConfig.measureMutation) {
                UIMeasure();
                UIUpdate();
            }
        });
        UIMMeasure.observe(t.UIElement.content,
            {
                childList: true,
                subtree: true
            });
    }
    UIMeasureMutation();

    var UIAnimStart = function(x, y, scale, duration = 425,
        curve = function(t) {
            return 1 - Math.pow(1 - t, 5);
        }) {
        t.UIPanZoom.startX = t.UIPanZoom.x;
        t.UIPanZoom.startY = t.UIPanZoom.y;
        t.UIPanZoom.startScale = t.UIPanZoom.scale;
        t.UIPanZoom.endX = x;
        t.UIPanZoom.endY = y;
        t.UIPanZoom.endScale = scale;
        t.UIAnimator.UIState.setCurve(curve);
        t.UIAnimator.UIState.setDuration(duration);

        t.UIAnimator.UIPlayer.start();
    }

    var UIRefresh = function() {
        UIMeasure();

        t.UIAnimator.UIPlayer.stop();
        t.UIAnimation.active(false);

        t.UIPanZoom.motion = false;
        t.UIPanZoom.scale = HtmlUIClamp(1,
            Infinity,
            t.UIConfig.initialScale);
        var mZoomX = UIMinMaxPos(t.UIPanZoom.mainWidth,
            t.UIPanZoom.width,
            t.UIPanZoom.scale);
        var mZoomY = UIMinMaxPos(t.UIPanZoom.mainHeight,
            t.UIPanZoom.height,
            t.UIPanZoom.scale);
        t.UIPanZoom.x = HtmlUIClamp(mZoomX,
            -mZoomX,
            t.UIConfig.initialX);
        t.UIPanZoom.y = HtmlUIClamp(mZoomY,
            -mZoomY,
            t.UIConfig.initialY);

        UIUpdate();
    }
    UIRefresh();

    var UIContentMedia = function() {
        if (/IMG|IMAGE/i.test(t.UIElement.content.tagName)) {
            t.UIElement.content.addEventListener("load", function() {
                UIRefresh();
                t.UIElement.content.classList.add("media");
                t.UIElement.content.setAttribute("draggable", "false");
            });
        } else if (/VIDEO|AUDIO/i.test(t.UIElement.content.tagName)) {
            t.UIElement.content.addEventListener("loadedmetadata", function() {
                UIRefresh();
                t.UIElement.content.classList.add("media");
                t.UIElement.content.setAttribute("draggable", "false");
            });
        }
    }
    UIContentMedia();

    HtmlUIResize(t.UIElement.main, UIRefresh);

    t.UIGesture.listen.onStart(function(e) {
        t.UIPanZoom.motion = false;
        t.UIPanZoom.isPressed = true;
        t.UIAnimation.active(false);
    });
    t.UIGesture.listen.onSwipe(function(e) {
        t.UIPanZoom.boundX = 1 + (t.UIPanZoom.x > 0 ? (e.deltaX > 0 ? Math.max(0, t.UIPanZoom.x - t.UIPanZoom.maxX): 0): (e.deltaX < 0 ? Math.max(0, t.UIPanZoom.minX - t.UIPanZoom.x): 0)) / (t.UIPanZoom.mainWidth / 10);
        t.UIPanZoom.boundY = 1 + (t.UIPanZoom.y > 0 ? (e.deltaY > 0 ? Math.max(0, t.UIPanZoom.y - t.UIPanZoom.maxY): 0): (e.deltaY < 0 ? Math.max(0, t.UIPanZoom.minY - t.UIPanZoom.y): 0)) / (t.UIPanZoom.mainHeight / 10);
        if (t.UIPanZoom.hasZoom) {
            t.UIPanZoom.x += e.deltaX / t.UIPanZoom.boundX;
            t.UIPanZoom.y += e.deltaY / t.UIPanZoom.boundY;
            UIUpdate();
        }
    });
    t.UIGesture.listen.onFling(function(e) {
        t.UIPanZoom.isPressed = false;
        t.UIPanZoom.deltaX = HtmlUIClamp(-t.UIPanZoom.mainWidth / 4, t.UIPanZoom.mainWidth / 4, e.deltaX / t.UIPanZoom.boundX);
        t.UIPanZoom.deltaY = HtmlUIClamp(-t.UIPanZoom.mainHeight / 4, t.UIPanZoom.mainHeight / 4, e.deltaY / t.UIPanZoom.boundY);

        t.UIPanZoom.motion = true;
        if ((e.deltaX != 0 || e.deltaY != 0 || t.UIPanZoom.bounds) && !t.UIAnimation.isAnim && t.UIPanZoom.hasZoom) {
            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        }
    });
    t.UIGesture.listen.onDoubleTap(function(e) {
        if (t.UIConfig.doubleTap && !t.UIAnimator.UIAnimation.isAnim) {
            var UIRect = t.UIElement.main.getBoundingClientRect();
            var zoomX = HtmlUIClamp(t.UIPanZoom.minZoomX, t.UIPanZoom.maxZoomX, (1 - ((e.startX - UIRect.left) / t.UIPanZoom.mainWidth) * 2) * t.UIPanZoom.maxZoomX * (t.UIPanZoom.mainWidth / t.UIPanZoom.width));
            var zoomY = HtmlUIClamp(t.UIPanZoom.minZoomY, t.UIPanZoom.maxZoomY, (1 - ((e.startY - UIRect.top) / t.UIPanZoom.mainHeight) * 2) * t.UIPanZoom.maxZoomY * (t.UIPanZoom.mainHeight / t.UIPanZoom.height));
            if (t.UIPanZoom.hasZoom) {
                UIAnimStart(0, 0, 1);
            } else {
                UIAnimStart(zoomX, zoomY, t.UIPanZoom.maxScale);
            }
        }
    });

    t.UIState = {};
    t.UIState.setTransform = function(x, y, scale, duration = 425,
        curve = function(t) {
            return 1 - Math.pow(1 - t, 5);
        }) {
        scale = HtmlUIClamp(1,
            Infinity,
            scale || t.UIPanZoom.scale);
        var mZoomX = UIMinMaxPos(t.UIPanZoom.mainWidth,
            t.UIPanZoom.width,
            scale);
        var mZoomY = UIMinMaxPos(t.UIPanZoom.mainHeight,
            t.UIPanZoom.height,
            scale);
        x = HtmlUIClamp(mZoomX,
            -mZoomX,
            x);
        y = HtmlUIClamp(mZoomY,
            -mZoomY,
            y);

        UIAnimStart(x,
            y,
            scale,
            duration,
            curve);
    }
    t.UIState.getTransform = function() {
        return {
            x: t.UIPanZoom.x,
            y: t.UIPanZoom.y,
            scale: t.UIPanZoom.scale
        }
    }
    t.UIState.setMaxScale = function(maxScale = 4) {
        t.UIConfig.maxScale = HtmlUIClamp(1,
            Infinity,
            maxScale);
        UIMeasure();
    }
    t.UIState.reset = function() {
        UIRefresh();
    }
    t.UIState.updateContent = function() {
        UIContent();
        UIContentMedia();
        UIMeasureMutation();
    }

    t.UIListener["update"] = function(callback) {
        t.UIListener._event.listenEvent.on("update",
            function() {
                callback(t.UIPanZoom);
            });
    }
}
window.HtmlUI.DatabaseStorage = function(databaseName) {
    const t = this;
    const _indexedDB = window.indexedDB ? function() {
        return window.indexedDB
    } : function() {
        console.error("[HtmlUI DatabaseStorage] Unsupported indexedDB"); return;
    }
    databaseName = databaseName != null ? databaseName + "-": "";

    t.UIListener = new HtmlUIListener(["ready"]);

    const _createObjectStore = (db) => {
        t.indexedDB.database = db;
        db.onerror = (err) => {
            console.error("[HtmlUI DatabaseStorage]",
                err)
        }
        t.indexedDB.database.createObjectStore("HtmlUI-DatabaseStorage");
    }

    t.indexedDB = {
        request: _indexedDB().open("HtmlUI-DatabaseStorage",
            4),
        database: null
    }

    t.indexedDB.request.onupgradeneeded = (event) => {
        _createObjectStore(event.target.result);
    }
    t.indexedDB.request.onsuccess = (event) => {
        t.indexedDB.database = t.indexedDB.request.result;
        t.indexedDB.database.onerror = (err) => {
            console.error("[HtmlUI DatabaseStorage]",
                err)
        }

        t.UIListener._event.listenEvent._execEvent("ready");
    }

    const _save = (name,
        data,
        callback) => {
        let transaction = t.indexedDB.database.transaction(["HtmlUI-DatabaseStorage"],
            "readwrite");
        transaction.objectStore("HtmlUI-DatabaseStorage").put(data,
            name);
        transaction.oncomplete = callback ? callback: null;
    }

    t.UIState = {}
    t.UIState.delete = (name) => {
        let transaction = t.indexedDB.database.transaction(["HtmlUI-DatabaseStorage"],
            "readwrite");
        transaction.objectStore("HtmlUI-DatabaseStorage").delete(`${databaseName}database_${name}`);
    }
    t.UIState.deleteAll = (callback) => {
        t.indexedDB.database.close();
        const requestDelete = _indexedDB().deleteDatabase("HtmlUI-DatabaseStorage");

        if (callback) {
            requestDelete.onsuccess = callback;
            requestDelete.onerror = callback;
            requestDelete.onblocked = callback;
        }
    }
    t.UIState.save = (name, data, callback) => {
        _save(`${databaseName}database_${name}`, data, () => {
            if (callback) callback();
        });
    }
    t.UIState.get = (name) => {
        return new Promise((resolve, reject) => {
            let transaction = t.indexedDB.database.transaction(["HtmlUI-DatabaseStorage"], "readwrite");
            transaction.objectStore("HtmlUI-DatabaseStorage").get(`${databaseName}database_${name}`).onsuccess = (event) => {
                const result = event.target.result;
                if (!result) reject("Not Found");
                else {
                    const returnObj = {
                        getData: () => {
                            return result;
                        },
                        getURL: (callback) => {
                            let _result = null,
                            _type = null;
                            if (result instanceof ArrayBuffer) {
                                let _arraybuffer = new Uint8Array(result),
                                _stringByte = "";
                                _arraybuffer.forEach((byte) => {
                                    _stringByte += String.fromCharCode(byte);
                                });
                                _result = _stringByte;
                                _type = "application/octet-stream";
                                callback(`data:${_type};base64,${btoa(_result)}`);
                            } else if (result instanceof Blob) {
                                let _reader = new FileReader(),
                                _stringByte = "";
                                _reader.onload = () => {
                                    _result = _reader.result;
                                    new Uint8Array(_result).forEach(function(byte) {
                                        _stringByte += String.fromCharCode(byte & 255);
                                    })
                                    _type = "application/octet-stream";
                                    callback(`data:${_type};base64,${btoa(_stringByte)}`);
                                }
                                _reader.readAsArrayBuffer(result);
                            } else {
                                if (typeof result == "object") {
                                    _result = JSON.stringify(result);
                                    _type = "application/json";
                                } else {
                                    _result = new String(result);
                                    _type = "text/plain";
                                }
                                callback(`data:${_type},${encodeURIComponent(_result)}`);
                            }
                        }
                    }
                    resolve(returnObj);
                }
            }
        });
    }

    t.UIListener["ready"] = (callback) => {
        t.UIListener._event.listenEvent.on("ready",
            () => {
                callback();
            });
    }
}
window.HtmlUI.OverflowSnapScroll = function(el, config = {}) {
    var t = this;
    t.UIElement = {};
    t.UIElement.main = HtmlUIBuild(el);

    t.UIGesture = new SuperGesture(t.UIElement.main);

    t.UIListener = new HtmlUIListener(["scroll"]);

    t.UIConfig = {
        disableStyleHtmlUIBuild: false,
        friction: 0.0375,
        minDelta: 0.1,
        elastic: 0.1,

        offsetLeft: 0,
        offsetRight: 0,
        offsetTop: 0,
        offsetBottom: 0,

        snapX: true,
        snapY: true,

        typeX: "mandatory",
        typeY: "mandatory"
    }
    HtmlUIConfig(t.UIConfig,
        config);

    if (t.UIConfig.disableStyleHtmlUIBuild) t.UIElement.main.classList.remove("htmlui-style");
    if (!/mandatory|proximity/i.test(t.UIConfig.typeX)) t.UIConfig.typeX = "mandatory";
    if (!/mandatory|proximity/i.test(t.UIConfig.typeY)) t.UIConfig.typeY = "mandatory";

    t.UIOverflowSnapScroll = {
        deltaX: 0,
        deltaY: 0,
        velX: 0,
        velY: 0,
        x: t.UIElement.main.scrollLeft,
        y: t.UIElement.main.scrollTop,

        contentWidth: 0,
        contentHeight: 0,
        contentX: 0,
        contentY: 0,
        childX: 0,
        childY: 0,
        targetX: 0,
        targetY: 0,

        mainContentWidth: 0,
        mainContentHeight: 0,

        childs: [],
        columns: [],

        mandatoryX: true,
        mandatoryY: true,
        mandatoryElasticX: 0,
        mandatoryElasticY: 0,

        isPressed: false
    }

    var UIChilds = function() {
        var childs = HtmlUI.Query("selectorall", "*", null, t.UIElement.main);

        t.UIOverflowSnapScroll.childs = [];
        var __m = t.UIElement.main;
        childs.forEach(function(UIChild) {
            var __cs = window.getComputedStyle(UIChild);
            if (__m == UIChild.parentElement && !/absolute|fixed/i.test(__cs.getPropertyValue("position"))) {
                t.UIOverflowSnapScroll.childs.push({
                    child: UIChild,
                    offsetX: UIChild.offsetLeft - __m.offsetLeft,
                    offsetY: UIChild.offsetTop - __m.offsetTop,
                    width: UIChild.offsetWidth,
                    height: UIChild.offsetHeight
                });
            }
        });

        t.UIOverflowSnapScroll.columns = [{
            position: t.UIOverflowSnapScroll.childs[0].offsetY,
            size: t.UIOverflowSnapScroll.childs[0].height,
            rows: []
        }];
        var prevChildY = null, rows = [], columnCount = 0;
        var _c = t.UIOverflowSnapScroll.childs, firstColumn = true;
        for (var i = 0; i < _c.length; i++) {
            var __c = _c[i];

            firstColumn = __c.offsetY == _c[0].offsetY;
            if (firstColumn) {
                t.UIOverflowSnapScroll.columns[0].rows.push({
                    position: __c.offsetX,
                    size: __c.width
                })
            } else {
                if (__c.offsetY != prevChildY) {
                    columnCount++;
                    t.UIOverflowSnapScroll.columns.push({
                        position: __c.offsetY,
                        size: __c.height,
                        rows: [{
                            position: __c.offsetX,
                            size: __c.width
                        }]
                    });
                    prevChildY = __c.offsetY;
                } else {
                    t.UIOverflowSnapScroll.columns[columnCount].rows.push({
                        position: __c.offsetX,
                        size: __c.width
                    });
                }
            }
        }
    }
    setTimeout(UIChilds, 100);
    new MutationObserver(UIChilds).observe(t.UIElement.main, {
        childList: true, subtree: true
    });
    new ResizeObserver(UIChilds).observe(t.UIElement.main);

    t.UIElement.main.classList.add("htmlui-overflow-snap-scroll");

    var UIDelta = function(current, target, delta) {
        return Math.abs(current - target) > delta;
    }

    t.UIAnimation = new HtmlUIAnimation(function(event) {
        t.UIOverflowSnapScroll.mainContentWidth = HtmlUIClamp(0, Infinity, t.UIElement.main.scrollWidth - t.UIElement.main.clientWidth);
        t.UIOverflowSnapScroll.mainContentHeight = HtmlUIClamp(0, Infinity, t.UIElement.main.scrollHeight - t.UIElement.main.clientHeight);

        t.UIOverflowSnapScroll.childY = HtmlUIClamp(0, t.UIOverflowSnapScroll.columns.length - 1, t.UIOverflowSnapScroll.childY);
        t.UIOverflowSnapScroll.childX = HtmlUIClamp(0, t.UIOverflowSnapScroll.columns[t.UIOverflowSnapScroll.childY].rows.length - 1, t.UIOverflowSnapScroll.childX);

        t.UIOverflowSnapScroll.contentWidth = t.UIOverflowSnapScroll.columns[t.UIOverflowSnapScroll.childY].rows[t.UIOverflowSnapScroll.childX].size || 1;
        t.UIOverflowSnapScroll.contentHeight = t.UIOverflowSnapScroll.columns[t.UIOverflowSnapScroll.childY].size || 1;

        t.UIOverflowSnapScroll.contentX = t.UIOverflowSnapScroll.columns[t.UIOverflowSnapScroll.childY].rows[t.UIOverflowSnapScroll.childX].position
        t.UIOverflowSnapScroll.targetX = HtmlUIClamp(0, t.UIOverflowSnapScroll.mainContentWidth,
            t.UIOverflowSnapScroll.contentX + t.UIConfig.offsetLeft - t.UIConfig.offsetRight
        );
        t.UIOverflowSnapScroll.contentY = t.UIOverflowSnapScroll.columns[t.UIOverflowSnapScroll.childY].position;
        t.UIOverflowSnapScroll.targetY = HtmlUIClamp(0, t.UIOverflowSnapScroll.mainContentHeight,
            t.UIOverflowSnapScroll.contentY + t.UIConfig.offsetTop - t.UIConfig.offsetBottom
        );

        if (!t.UIOverflowSnapScroll.isPressed) {
            if (
                !UIDelta(t.UIOverflowSnapScroll.x, t.UIOverflowSnapScroll.targetX, 0.001) &&
                !UIDelta(t.UIOverflowSnapScroll.y, t.UIOverflowSnapScroll.targetY, 0.001) &&
                !t.UIOverflowSnapScroll.isPressed
            ) {
                t.UIOverflowSnapScroll.deltaX = 0;
                t.UIOverflowSnapScroll.deltaY = 0;
                t.UIOverflowSnapScroll.velX = 0;
                t.UIOverflowSnapScroll.velY = 0;
                t.UIOverflowSnapScroll.x = t.UIOverflowSnapScroll.targetX;
                t.UIOverflowSnapScroll.y = t.UIOverflowSnapScroll.targetY;
                t.UIAnimation.active(false);
            }

            if (t.UIOverflowSnapScroll.mandatoryX) {
                t.UIOverflowSnapScroll.x = HtmlUI.Math.lerp(t.UIOverflowSnapScroll.x + t.UIOverflowSnapScroll.mandatoryElasticX / 8 * event.frameSync, t.UIOverflowSnapScroll.targetX, t.UIConfig.elastic * event.frameSync);
                if (t.UIOverflowSnapScroll.childX != 0 && t.UIOverflowSnapScroll.childX != t.UIOverflowSnapScroll.columns[t.UIOverflowSnapScroll.childY].rows.length - 1) {
                    t.UIOverflowSnapScroll.mandatoryElasticX = HtmlUI.Math.lerp(
                        t.UIOverflowSnapScroll.mandatoryElasticX,
                        t.UIOverflowSnapScroll.targetX - t.UIOverflowSnapScroll.x,
                        t.UIConfig.elastic * event.frameSync
                    );
                } else {
                    t.UIOverflowSnapScroll.mandatoryElasticX = 0;
                }
            } else {
                t.UIOverflowSnapScroll.x += t.UIOverflowSnapScroll.velX;
                t.UIOverflowSnapScroll.deltaX = HtmlUI.Math.lerp(t.UIOverflowSnapScroll.deltaX, 0, event.frameSync * t.UIConfig.friction);
                t.UIOverflowSnapScroll.velX = t.UIOverflowSnapScroll.deltaX * event.frameSync;
            }
            if (t.UIOverflowSnapScroll.mandatoryY) {
                t.UIOverflowSnapScroll.y = HtmlUI.Math.lerp(t.UIOverflowSnapScroll.y + t.UIOverflowSnapScroll.mandatoryElasticY / 8 * event.frameSync, t.UIOverflowSnapScroll.targetY, t.UIConfig.elastic * event.frameSync);
                if (t.UIOverflowSnapScroll.childY != 0 && t.UIOverflowSnapScroll.childY != t.UIOverflowSnapScroll.columns.length - 1) {
                    t.UIOverflowSnapScroll.mandatoryElasticY = HtmlUI.Math.lerp(
                        t.UIOverflowSnapScroll.mandatoryElasticY,
                        t.UIOverflowSnapScroll.targetY - t.UIOverflowSnapScroll.y,
                        t.UIConfig.elastic * event.frameSync
                    );
                } else {
                    t.UIOverflowSnapScroll.mandatoryElasticY = 0;
                }
            } else {
                t.UIOverflowSnapScroll.y += t.UIOverflowSnapScroll.velY;
                t.UIOverflowSnapScroll.deltaY = HtmlUI.Math.lerp(t.UIOverflowSnapScroll.deltaY, 0, event.frameSync * t.UIConfig.friction);
                t.UIOverflowSnapScroll.velY = t.UIOverflowSnapScroll.deltaY * event.frameSync;
            }
        }

        if (!t.UIOverflowSnapScroll.mandatoryX && !UIDelta(t.UIOverflowSnapScroll.deltaX, 0, t.UIConfig.minDelta)) {
            t.UIOverflowSnapScroll.deltaX = 0;
            t.UIOverflowSnapScroll.mandatoryX = true;
        }
        if (!t.UIOverflowSnapScroll.mandatoryY && !UIDelta(t.UIOverflowSnapScroll.deltaY, 0, t.UIConfig.minDelta)) {
            t.UIOverflowSnapScroll.deltaY = 0;
            t.UIOverflowSnapScroll.mandatoryY = true;
        }

        t.UIOverflowSnapScroll.x = HtmlUIClamp(0, t.UIOverflowSnapScroll.mainContentWidth, t.UIOverflowSnapScroll.x);
        t.UIOverflowSnapScroll.y = HtmlUIClamp(0, t.UIOverflowSnapScroll.mainContentHeight, t.UIOverflowSnapScroll.y);

        if (!t.UIOverflowSnapScroll.mandatoryX || t.UIOverflowSnapScroll.isPressed) {
            if (t.UIOverflowSnapScroll.x < t.UIOverflowSnapScroll.targetX - t.UIOverflowSnapScroll.contentWidth / 2) t.UIOverflowSnapScroll.childX--;
            if (t.UIOverflowSnapScroll.x > t.UIOverflowSnapScroll.targetX + t.UIOverflowSnapScroll.contentWidth / 2) t.UIOverflowSnapScroll.childX++;
        }
        if (!t.UIOverflowSnapScroll.mandatoryY || t.UIOverflowSnapScroll.isPressed) {
            if (t.UIOverflowSnapScroll.y < t.UIOverflowSnapScroll.targetY - t.UIOverflowSnapScroll.contentHeight / 2) t.UIOverflowSnapScroll.childY--;
            if (t.UIOverflowSnapScroll.y > t.UIOverflowSnapScroll.targetY + t.UIOverflowSnapScroll.contentHeight / 2) t.UIOverflowSnapScroll.childY++;
        }

        if (t.UIAnimation.isAnim || t.UIOverflowSnapScroll.isPressed) t.UIElement.main.scrollTo(t.UIOverflowSnapScroll.x, t.UIOverflowSnapScroll.y);

        t.UIListener._event.listenEvent._execEvent("scroll");
    });

    t.UIElement.main.addEventListener("scroll",
        function() {
            if (t.UIAnimation.isAnim || t.UIOverflowSnapScroll.isPressed) return;
            t.UIOverflowSnapScroll.x = t.UIElement.main.scrollLeft;
            t.UIOverflowSnapScroll.y = t.UIElement.main.scrollTop;

            t.UIAnimation.active(false);
            t.UIAnimation.anim();
        });


    t.UIGesture.listen.onStart(function(event) {
        t.UIOverflowSnapScroll.isPressed = true;

        t.UIOverflowSnapScroll.deltaX = 0;
        t.UIOverflowSnapScroll.deltaY = 0;
        t.UIOverflowSnapScroll.mandatoryElasticX = 0;
        t.UIOverflowSnapScroll.mandatoryElasticY = 0;

        t.UIAnimation.active(false);

        t.UIGesture.swipeAxis(
            t.UIOverflowSnapScroll.mainContentWidth != 0 && t.UIConfig.snapX,
            t.UIOverflowSnapScroll.mainContentHeight != 0 && t.UIConfig.snapY
        );
    });

    t.UIGesture.listen.onSwipeLock(function(event) {
        t.UIOverflowSnapScroll.x += t.UIConfig.snapX ? -event.deltaX: 0;
        t.UIOverflowSnapScroll.y += t.UIConfig.snapY ? -event.deltaY: 0;

        t.UIAnimation.active(false);
        t.UIAnimation.anim();
    });

    t.UIGesture.listen.onFlingLock(function(event) {
        t.UIOverflowSnapScroll.isPressed = false;

        event.deltaX = t.UIConfig.snapX ? event.deltaX: 0;
        event.deltaY = t.UIConfig.snapY ? event.deltaY: 0;

        t.UIOverflowSnapScroll.mandatoryX = t.UIConfig.typeX == "mandatory";
        t.UIOverflowSnapScroll.mandatoryY = t.UIConfig.typeY == "mandatory";
        if (t.UIOverflowSnapScroll.mandatoryX) {
            t.UIOverflowSnapScroll.childX += Math.round(-event.deltaX / (t.UIOverflowSnapScroll.contentWidth / 8));
        } else t.UIOverflowSnapScroll.deltaX += -event.deltaX;
        if (t.UIOverflowSnapScroll.mandatoryY) {
            t.UIOverflowSnapScroll.childY += Math.round(-event.deltaY / (t.UIOverflowSnapScroll.contentHeight / 8));
        } else t.UIOverflowSnapScroll.deltaY += -event.deltaY;

        if (!t.UIAnimation.isAnim) {
            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        }
    });

    t.UIListener["scroll"] = function(callback) {
        t.UIListener._event.listenEvent.on("scroll",
            function() {
                callback({
                    x: t.UIOverflowSnapScroll.x,
                    y: t.UIOverflowSnapScroll.y,
                    content: {
                        target: {
                            x: t.UIOverflowSnapScroll.targetX,
                            y: t.UIOverflowSnapScroll.targetY
                        },
                        position: {
                            x: t.UIOverflowSnapScroll.contentX,
                            y: t.UIOverflowSnapScroll.contentY
                        },
                        size: {
                            width: t.UIOverflowSnapScroll.contentWidth,
                            height: t.UIOverflowSnapScroll.contentHeight
                        }
                    },
                    snap: {
                        x: t.UIOverflowSnapScroll.childX,
                        y: t.UIOverflowSnapScroll.childY
                    }
                })
            });
    }
}
window.HtmlUI.ScrollView3 = function(el, config = {}) {
    var t = this;
    t.UIElement = {};

    t.UIElement.main = HtmlUIBuild(el);
    t.UIGesture = new SuperGesture(t.UIElement.main);
    t.UIElement.main.classList.add("htmlui-scroller");
    var UIHtmlRaw = t.UIElement.main.innerHTML;
    var startX = t.UIElement.main.scrollLeft;
    var startY = t.UIElement.main.scrollTop;

    t.UIConfig = {
        scrollX: true,
        scrollY: true,
        friction: 0.04,
        bounceRate: 0.1,
        superBounce: 3,
        minDelta: 0.25,
        bounce: true,
        transform: false,
        sensivity: 1,
        fastScroll: false,
        improveAnimation: false,
        bounceDistanceLimits: 16,
        hardware: false,
        content: null
    }
    HtmlUIConfig(t.UIConfig,
        config);

    if (!t.UIConfig.content) {
        t.UIElement.main.innerHTML = "";

        t.UIElement.content = document.createElement("htmlui-scroller-content");
        t.UIElement.content.innerHTML = UIHtmlRaw;
        t.UIElement.main.appendChild(t.UIElement.content);
    } else {
        t.UIElement.content = typeof t.UIConfig.content == "string" ? HtmlUI.Query("selector", t.UIConfig.content): t.UIConfig.content;
    }

    var UIUpdateDimension = function() {
        t.UIDimension = HtmlUIDimension(t.UIElement.main, t.UIElement.content);
    }
    UIUpdateDimension();

    t.UIListener = new HtmlUIListener(["scroll"]);

    t.UIScroll = {
        x: startX,
        y: startY,
        deltaX: 0,
        deltaY: 0,
        boundX: 0,
        boundY: 0,
        velX: 0,
        velY: 0,
        smoothScroll: false,
        smoothX: 0,
        smoothY: 0,
        smoothRate: 0,
        isPressed: false,
        dynamicSmoothScroll: false,
        dynamicSmoothScrollRate: 0,
        dynamicBounceX: 0,
        dynamicBounceY: 0,
        fastX: 0,
        fastY: 0,
        fastDebounce_1: null,
        fastDebounce_2: null,
        fastDebounce_3: null
    }
    var UIVelDeltaX = new HtmlUIDelta(),
    UIVelDeltaY = new HtmlUIDelta();

    t.UIAnimation = new HtmlUIAnimation(function(e) {
        UIUpdateDimension();

        if (((Math.abs(t.UIScroll.deltaX) > t.UIConfig.minDelta || Math.abs(t.UIScroll.deltaY) > t.UIConfig.minDelta) || (t.UIScroll.x < -0.1 || t.UIScroll.x > t.UIDimension.contentWidth + 0.1) || (t.UIScroll.y < -0.1 || t.UIScroll.y > t.UIDimension.contentHeight + 0.1)) && e.isAnim) {
            if (t.UIScroll.x >= 0 && t.UIScroll.x <= t.UIDimension.contentWidth) {
                t.UIScroll.x = !t.UIConfig.bounce ? HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x - t.UIScroll.deltaX * e.frameSync): t.UIScroll.x - t.UIScroll.deltaX * e.frameSync;
                t.UIScroll.deltaX += (0 - t.UIScroll.deltaX) * Math.min(1, t.UIConfig.friction * e.frameSync);
            } else {
                t.UIScroll.x -= t.UIScroll.deltaX * e.frameSync;
                t.UIScroll.x = HtmlUI.Math.clamp(t.UIScroll.x < t.UIDimension.contentWidth / 2 ? -Infinity : t.UIDimension.contentWidth,
                    t.UIScroll.x > t.UIDimension.contentWidth / 2 ? Infinity : 0,
                    HtmlUI.Math.lerp3(t.UIScroll.x, HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x), t.UIConfig.bounceRate * e.frameSync, 0.1 * e.frameSync));
                t.UIScroll.deltaX = HtmlUIClamp(-t.UIDimension.el.clientWidth / (t.UIConfig.bounceDistanceLimits * e.frameSync), t.UIDimension.el.clientWidth / (t.UIConfig.bounceDistanceLimits * e.frameSync), HtmlUI.Math.lerp3(t.UIScroll.deltaX, 0, t.UIConfig.bounceRate * e.frameSync, t.UIConfig.superBounce * e.frameSync));
            }

            if (t.UIScroll.y >= 0 && t.UIScroll.y <= t.UIDimension.contentHeight) {
                t.UIScroll.y = !t.UIConfig.bounce ? HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y - t.UIScroll.deltaY * e.frameSync): t.UIScroll.y - t.UIScroll.deltaY * e.frameSync;
                t.UIScroll.deltaY += (0 - t.UIScroll.deltaY) * Math.min(1, t.UIConfig.friction * e.frameSync);
            } else {
                t.UIScroll.y -= t.UIScroll.deltaY * e.frameSync;
                t.UIScroll.y = HtmlUI.Math.clamp(t.UIScroll.y < t.UIDimension.contentHeight / 2 ? -Infinity : t.UIDimension.contentHeight, 
					t.UIScroll.y > t.UIDimension.contentHeight / 2 ? Infinity : 0,
					HtmlUI.Math.lerp3(t.UIScroll.y, HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y), t.UIConfig.bounceRate * e.frameSync, 0.1 * e.frameSync));
                t.UIScroll.deltaY = HtmlUIClamp(-t.UIDimension.el.clientHeight / (t.UIConfig.bounceDistanceLimits * e.frameSync), t.UIDimension.el.clientHeight / (t.UIConfig.bounceDistanceLimits * e.frameSync), HtmlUI.Math.lerp3(t.UIScroll.deltaY, 0, t.UIConfig.bounceRate * e.frameSync, t.UIConfig.superBounce * e.frameSync));
            }
        } else {
            if (!t.UIScroll.smoothScroll && e.isAnim) {
                t.UIScroll.deltaX = 0;
                t.UIScroll.deltaY = 0;
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x);
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y);
                t.UIAnimation.active(false);
            }
        }

        if (t.UIScroll.smoothScroll) {
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_1);
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_2);
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_3);

            if (t.UIScroll.dynamicSmoothScroll) {
                t.UIScroll.dynamicBounceX += (1 - t.UIScroll.dynamicBounceX) * Math.min(1, t.UIScroll.dynamicSmoothScrollRate * e.frameSync);
                t.UIScroll.dynamicBounceY += (1 - t.UIScroll.dynamicBounceY) * Math.min(1, t.UIScroll.dynamicSmoothScrollRate * e.frameSync);
            }

            t.UIScroll.deltaX = 0;
            t.UIScroll.deltaY = 0;
            var smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.smoothX);
            var smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.smoothY);

            if ((t.UIScroll.x > smoothX - 0.1 && t.UIScroll.x < smoothX + 0.1) && (t.UIScroll.y > smoothY - 0.1 && t.UIScroll.y < smoothY + 0.1)) {
                t.UIScroll.x = smoothX;
                t.UIScroll.y = smoothY;
                t.UIAnimation.active(false);
                t.UIScroll.smoothScroll = false;
            } else {
                if (t.UIScroll.dynamicSmoothScroll) {
                    t.UIScroll.x += (smoothX - t.UIScroll.x) * Math.min(1, t.UIScroll.smoothRate * e.frameSync * t.UIScroll.dynamicBounceX);
                    t.UIScroll.y += (smoothY - t.UIScroll.y) * Math.min(1, t.UIScroll.smoothRate * e.frameSync * t.UIScroll.dynamicBounceY);
                } else {
                    t.UIScroll.x += (smoothX - t.UIScroll.x) * Math.min(1, t.UIScroll.smoothRate * e.frameSync);
                    t.UIScroll.y += (smoothY - t.UIScroll.y) * Math.min(1, t.UIScroll.smoothRate * e.frameSync);
                }
            }
        }

        if (t.UIScroll.isPressed) {
            if (t.UIConfig.fastScroll) {
                t.UIScroll.fastX = t.UIScroll.deltaX;
                t.UIScroll.fastY = t.UIScroll.deltaY;
            } else {
                t.UIScroll.fastX = 0;
                t.UIScroll.fastY = 0;
            }
        }

        t.UIScroll.velX = UIVelDeltaX.set(t.UIScroll.x);
        t.UIScroll.velY = UIVelDeltaY.set(t.UIScroll.y);

        t.UIElement.content.style.willChange = (
            (
                ((t.UIScroll.velX != 0 || t.UIScroll.deltaY != 0) && (t.UIScroll.x != 0 && t.UIScroll.x != t.UIDimension.contentWidth)) ||
                ((t.UIScroll.velY != 0 || t.UIScroll.deltaY != 0) && (t.UIScroll.y != 0 && t.UIScroll.y != t.UIDimension.contentHeight))
            ) || t.UIScroll.isPressed
        ) && t.UIConfig.improveAnimation ? "transform": "";

        t.UIElement.main.scrollLeft = 0;
        t.UIElement.main.scrollTop = 0;
        HtmlUISetPosition(t.UIElement.content, -t.UIScroll.x, -t.UIScroll.y, t.UIConfig.transform, t.UIConfig.hardware);

        t.UIListener._event.listenEvent._execEvent("scroll");
    });

    t.UIAction = {
        scrollTo: function(x, y, smooth = false,
            dynamic = false) {
            t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
            if (t.UIScroll.dynamicSmoothScroll) {
                t.UIScroll.dynamicBounceX = 0;
                t.UIScroll.dynamicBounceY = 0;
                t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
            }

            UIUpdateDimension();
            t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;
            if ((smooth ? true: false)) {
                t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
            } else {
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
            }

            t.UIScroll.smoothScroll = smooth ? true: false;
            if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                t.UIAnimation.active(smooth ? true: false);
                t.UIAnimation.anim();
            }
        },
        scrollBy: function(x, y, smooth = false, dynamic = false) {
            t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
            if (t.UIScroll.dynamicSmoothScroll) {
                t.UIScroll.dynamicBounceX = 0;
                t.UIScroll.dynamicBounceY = 0;
                t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
            }

            UIUpdateDimension();
            t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;
            if ((smooth ? true: false)) {
                t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x + x);
                t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y + y);
            } else {
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x + x);
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y + y);
            }

            t.UIScroll.smoothScroll = smooth ? true: false;
            if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                t.UIAnimation.active(smooth ? true: false);
                t.UIAnimation.anim();
            }
        },
        scrollIntoView: function(el, smooth = false, direction = "center", dynamic = false) {
            if (!el) return;

            t.UIScroll.dynamicSmoothScroll = dynamic == true || typeof dynamic == "number";
            if (t.UIScroll.dynamicSmoothScroll) {
                t.UIScroll.dynamicBounceX = 0;
                t.UIScroll.dynamicBounceY = 0;
                t.UIScroll.dynamicSmoothScrollRate = typeof dynamic == "number" ? dynamic: t.UIConfig.dynamicBounceRate;
            }

            UIUpdateDimension();
            t.UIScroll.smoothRate = typeof smooth == "number" ? smooth: 0.0375 * 4;

            var mainScroll = t.UIElement.content.getBoundingClientRect();
            var targetScroll = el.getBoundingClientRect();

            var x = 0 - (mainScroll.left - targetScroll.left);
            var y = 0 - (mainScroll.top - targetScroll.top);

            if (direction == "left top") {
                x += 0;
                y += 0;
            } else if (direction == "center top") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                y += 0;
            } else if (direction == "right top") {
                x += -t.UIDimension.el.clientWidth - el.offsetWidth;
                y += 0;
            } else if (direction == "left center") {
                x += 0;
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
            } else if (direction == "center") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
            } else if (direction == "right center") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth);
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight) / 2;
            } else if (direction == "left bottom") {
                x += 0;
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
            } else if (direction == "center bottom") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth) / 2;
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
            } else if (direction == "right bottom") {
                x += -(t.UIDimension.el.clientWidth - el.offsetWidth);
                y += -(t.UIDimension.el.clientHeight - el.offsetHeight);
            }

            if ((smooth ? true: false)) {
                t.UIScroll.smoothX = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                t.UIScroll.smoothY = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
            } else {
                t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, x);
                t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, y);
            }

            t.UIScroll.smoothScroll = smooth ? true: false;
            if (!t.UIAnimation.isAnim && !t.UIAnimation.smoothScroll) {
                t.UIAnimation.active(smooth ? true: false);
                t.UIAnimation.anim();
            }
        },
        refresh: function() {
            if (!t.UIAnimation.isAnim) {
                t.UIAnimation.active(false);
                t.UIAnimation.anim();
            }
        },
        navigationScrollToTop: function(HtmlUINav, preventTriggerEl = []) {
            var _trigger = true;
            if (HtmlUINav.tagName != "HTMLUI-NAV" || HtmlUINav.parentNode.tagName != "HTMLUI-MAIN") return;
            HtmlUINav.addEventListener("click", function(e) {
                var trigger = _trigger;
                preventTriggerEl.forEach(function(el) {
                    if (e.target == el || e.target.parentElement == el || e.target.parentNode == el) {
                        trigger = false;
                    }
                });
                if (trigger) {
                    t.UIAction.scrollTo(t.UIScroll.x, 0, true, 0.0375);
                }
            });

            return {
                disable: function(v) {
                    _trigger = typeof v == "boolean" ? !v: true;
                }
            }
        }
    }

    t.UIGesture.listen.onStart(function(e) {
        var fireStart = function() {
            t.UIScroll.smoothScroll = false;
            t.UIScroll.isPressed = true;

            t.UIAnimation.active(false);
        }
        if (t.UIConfig.fastScroll) {
            t.UIScroll.fastDebounce_1 = window.requestAnimationFrame(function() {
                t.UIScroll.fastDebounce_2 = window.requestAnimationFrame(function() {
                    t.UIScroll.fastDebounce_3 = window.requestAnimationFrame(function() {
                        fireStart();
                    });
                });
            });
        } else {
            fireStart();
        }
    });
    t.UIGesture.listen.onSwipeLock(function(e) {
        if (t.UIConfig.fastScroll) {
            t.UIScroll.isPressed = true;

            window.cancelAnimationFrame(t.UIScroll.fastDebounce_1);
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_2);
            window.cancelAnimationFrame(t.UIScroll.fastDebounce_3);
        }

        t.UIGesture.swipeAxis(t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? true: false, t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? true: false);
        t.UIGesture.updateConfig({
            maxDelta: (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? t.UIDimension.el.clientWidth: t.UIDimension.el.clientHeight) / 4
        });

        t.UIScroll.boundX = (t.UIScroll.x < 0 ? (e.deltaX > 0 ? Math.max(0, -t.UIScroll.x): 0): (e.deltaX < 0 ? Math.max(0, t.UIScroll.x - t.UIDimension.contentWidth): 0)) / (t.UIDimension.el.clientWidth / 16);
        t.UIScroll.boundY = (t.UIScroll.y < 0 ? (e.deltaY > 0 ? Math.max(0, -t.UIScroll.y): 0): (e.deltaY < 0 ? Math.max(0, t.UIScroll.y - t.UIDimension.contentHeight): 0)) / (t.UIDimension.el.clientHeight / 16);

        if (t.UIConfig.bounce) {
            t.UIScroll.x -= t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX): 0;
            t.UIScroll.y -= t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY): 0;
        } else {
            t.UIScroll.x = HtmlUIClamp(0, t.UIDimension.contentWidth, t.UIScroll.x - (t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX): 0));
            t.UIScroll.y = HtmlUIClamp(0, t.UIDimension.contentHeight, t.UIScroll.y - (t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY): 0));
        }

        t.UIScroll.smoothScroll = false;
        t.UIAnimation.active(false);
        t.UIAnimation.anim();
    });
    t.UIGesture.listen.onFlingLock(function(e) {
        t.UIScroll.fastX = (e.deltaX != 0 ? (e.deltaX > 0 ? Math.max(0, t.UIScroll.fastX): -Math.max(0, -t.UIScroll.fastX)): 0) || 0;
        t.UIScroll.fastY = (e.deltaY != 0 ? (e.deltaY > 0 ? Math.max(0, t.UIScroll.fastY): -Math.max(0, -t.UIScroll.fastY)): 0) || 0;
        t.UIScroll.deltaX = t.UIDimension.contentWidth != 0 && t.UIConfig.scrollX ? e.deltaX / (1 + t.UIScroll.boundX) * t.UIConfig.sensivity + t.UIScroll.fastX: 0;
        t.UIScroll.deltaY = t.UIDimension.contentHeight != 0 && t.UIConfig.scrollY ? e.deltaY / (1 + t.UIScroll.boundY) * t.UIConfig.sensivity + t.UIScroll.fastY: 0;

        t.UIScroll.isPressed = false;

        t.UIScroll.dynamicBounceX = 0;
        t.UIScroll.dynamicBounceY = 0;

        if (!t.UIAnimation.isAnim) {
            t.UIAnimation.active(true);
            t.UIAnimation.anim();
        }
    });

    t.UIListener["scroll"] = function(callback) {
        t.UIListener._event.listenEvent.on("scroll",
            function() {
                callback({
                    x: t.UIScroll.x,
                    y: t.UIScroll.y,
                    distanceX: t.UIScroll.velX,
                    distanceY: t.UIScroll.velY,
                    deltaX: t.UIScroll.deltaX,
                    deltaY: t.UIScroll.deltaY,
                    clientWidth: t.UIDimension.el.clientWidth,
                    clientHeight: t.UIDimension.el.clientHeight,
                    scrollWidth: t.UIDimension.el2.scrollWidth,
                    scrollHeight: t.UIDimension.el2.scrollHeight,
                    contentWidth: t.UIDimension.contentWidth,
                    contentHeight: t.UIDimension.contentHeight,
                    isPressed: t.UIScroll.isPressed
                });
            });
    }

    HtmlUIResize(t.UIElement.main,
        function() {
            if (!t.UIAnimation.isAnim) {
                t.UIAction.scrollTo(t.UIScroll.x, t.UIScroll.y, false);
            }
        });
    HtmlUIResize(t.UIElement.content,
        function() {
            if (!t.UIAnimation.isAnim) {
                t.UIAction.scrollTo(t.UIScroll.x, t.UIScroll.y, false);
            }
        });

    t.UIAction.refresh();
}
/** **/

//Popup
window.HtmlUI.Toast = function(config = {}) {
    var t = this;

    t.UIElement = {};
    t.UIElement.toast = document.createElement("htmlui-toast");
    t.UIElement.icon = document.createElement("img");
    t.UIElement.icon.classList.add("htmlui-toast-icon");
    t.UIElement.displayText = document.createElement("htmlui-toast-display-text");
    t.UIElement.toast.appendChild(t.UIElement.icon);
    t.UIElement.toast.appendChild(t.UIElement.displayText);
    document.documentElement.appendChild(t.UIElement.toast);

    t.UIConfig = {
        icon: null,
        fontSize: "medium",
        maxHeight: 360,
        maxWidthPercent: 75,
        theme: {
            rounded: 16,
            bgColor: "white",
            fontColor: "#555",
            opacity: 0.875
        },
        duration: 2000,
        position: "bottom",
        animationStyle: "fade"
    }
}
/** **/

//Math
window.HtmlUI.Math = {};

window.HtmlUI.Math.clamp = function(min, max, value) {
    return HtmlUIClamp(min,
        max,
        value);
}
window.HtmlUI.Math.clamp01 = function(value) {
    return HtmlUI.Math.clamp(0,
        1,
        value);
}
window.HtmlUI.Math.repeat = function(value, repeat) {
    var UIRepeat = Math.floor(value / repeat) * repeat;
    return value - UIRepeat;
}
window.HtmlUI.Math.integer = function(value) {
    var maxInteger = Math.MAX_SAFE_INTEGER;
    return HtmlUI.Math.clamp(-maxInteger,
        maxInteger,
        Math.round(value));
}
window.HtmlUI.Math.double = function(value) {
    return Math.round(value * 100) / 100;
}
window.HtmlUI.Math.float = function(value) {
    return value;
}
window.HtmlUI.Math.distance = function(start, end, value) {
    return start + (end - start) * value;
}
window.HtmlUI.Math.curve = function(curveFn, range) {
    return curveFn(HtmlUI.Math.clamp01(range));
}
window.HtmlUI.Math.splineCurve = function(curveFn, samples = 100) {
    var spline_values = [];
    for (var i = 0; i <= samples; i++) {
        spline_values.push(HtmlUI.Math.curve(curveFn, i / samples));
    }

    return function(range) {
        range = HtmlUI.Math.clamp01(range);
        var index = Math.floor(samples * range);

        return HtmlUI.Math.distance(
            spline_values[index],
            spline_values[HtmlUI.Math.clamp(0, samples, index + 1)],
            HtmlUI.Math.repeat(range, 1 / samples) * samples
        );
    }
}
window.HtmlUI.Math.lerp = function(a, b, t = 1) {
    return a + (b - a) * HtmlUI.Math.clamp01(t);
}
window.HtmlUI.Math.lerp2 = function(a, b, t = 1) {
    return a + (b - a) * t;
}
window.HtmlUI.Math.lerp3 = function(a, b, t = 1, m = 0) {
    var v = 0;

    t = HtmlUI.Math.clamp01(t);
    m = m > 0 ? m / t: 0;
    if (Math.abs(a - b) > m * t) {
        if (a < b) {
            v = HtmlUI.Math.lerp(a, b + m, t);
        } else if (a > b) {
            v = HtmlUI.Math.lerp(a, b - m, t);
        } else {
            v = HtmlUI.Math.lerp(a, b, t);
        }
    } else {
        v = b;
    }

    return v;
}
window.HtmlUI.Math.random = function(min = 0, max = 1) {
    return HtmlUI.Math.distance(min, max, Math.random());
}
window.HtmlUI.Math.step = function(value, steps = 1) {
    return Math.round(value / steps) * steps;
}
window.HtmlUI.Math.point = function(points = []) {
    var len = points.length - 1;

    return function(range) {
        range = HtmlUI.Math.clamp01(range);
        var index = Math.floor(len * range);

        return HtmlUI.Math.distance(
            points[index],
            points[HtmlUI.Math.clamp(0, len, index + 1)],
            HtmlUI.Math.repeat(range, 1 / len) * len
        );
    }
}
/** **/

//URL
window.HtmlUI.URL = {};

window.HtmlUI.URL.matchHash = function(hashUrl) {
    var UIHash = new String(hashUrl).split("#")[1],
    UIHashMatched = {};
    if (!UIHash) return {};

    var UIHashMatch = UIHash.split(";");
    UIHashMatch.forEach(function(match) {
        if (/\=/i.test(match)) {
            var _hash = match.split("=");

            var hashName = _hash[0];
            var hashValues = _hash[1].split(",");

            UIHashMatched[hashName] = hashValues;
        }
    });

    return UIHashMatched;
}
window.HtmlUI.URL.matchParam = function(paramUrl) {
    var UIParam = new String(paramUrl).split("?")[1], UIParamMatched = {};
    if (!UIParam) return {};

    var UIParamMatch = UIParam.split("&");
    UIParamMatch.forEach(function(match) {
        if (/\=/i.test(match)) {
            var _param = match.split("=");

            var paramName = _param[0];
            var paramValues = _param[1].split(",");

            UIParamMatched[paramName] = paramValues;
        }
    });

    return UIParamMatched;
}
window.HtmlUI.URL.matchURL = function(url, defaultProtocol, putDomain = "", alwaysHTTPS = false) {
    var _currentProtocol = (defaultProtocol || location.href).split("://");

    url = !/\:\/\//i.test(url) && url.charAt(0) == "/" && url.charAt(1) == "/" ? url.replace(/\/\//i,
        ""): url;
    url = (
        (/\:\/\//i.test(url) && (url.split("://")[1] || "").split("/")[0]) ||
        (/\:\/\//i.test(url) && url.split("://")[0])
    ) ? url: _currentProtocol[0] + "://" + url;
    var UIHash = url.split("#");
    var UIParam = url.split("?");
    var UIURL = (
        UIParam && UIParam.length >= 2 ? UIParam[0]:
        UIHash && UIHash.length >= 2 ? UIHash[0]:
        url
    ).split("://");

    var protocolName = alwaysHTTPS ? "https://": (UIURL[0] + "://");

    var _url = (UIURL[1] || UIURL[0]).split("/");

    var domainName = url[0] && _url[0] != "" ? _url[0]: putDomain;

    var portURL = "";
    if (/\:/i.test(domainName)) {
        portURL = domainName.split(":")[1];
    }

    var pageURL = "",
    hashURL = "",
    paramURL = "";
    for (var i = 1; i < _url.length; i++) {
        pageURL += "/" + _url[i];
    }
    if (UIHash && UIHash.length >= 2) {
        hashURL = "#" + UIHash[1];
    }
    if (UIParam && UIParam.length >= 2) {
        paramURL = "?" + UIParam[1];
    }

    return {
        protocol: protocolName,
        domain: domainName,
        port: portURL,
        page: pageURL,
        hash: hashURL,
        param: paramURL
    }
}
/** **/

//Crypto (Async only)
window.HtmlUI.Crypto = {};

window.HtmlUI.Crypto.sha256 = async function(value) {
    const msgBuffer = new TextEncoder().encode(value);

    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return "sha256-" + hashHex;
}
window.HtmlUI.Crypto.sha384 = async function(value) {
    const msgBuffer = new TextEncoder().encode(value);

    const hashBuffer = await crypto.subtle.digest('SHA-384', msgBuffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return "sha384-" + hashHex;
}
window.HtmlUI.Crypto.sha512 = async function(value) {
    const msgBuffer = new TextEncoder().encode(value);

    const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return "sha512-" + hashHex;
}
/** **/

//Activities
var HtmlUI_ActivityArray = [],
HtmlUI_ActivityArrayHistory = [],
HtmlUI_ActivityData = {},
HtmlUI_ActivityListener = new HtmlUIListener(["open", "close", "closed"]),
HtmlUI_ActivityIsOpen = false,
HtmlUI_ActivityTransitionType = "right-side";
HtmlUI_ActivityPrev = "";

var HtmlUI_ActivityAnimTransition = new HtmlUI.Animator(function(e) {
    var e2 = HtmlUI_ActivityArrayHistory;
    if (HtmlUI_ActivityIsOpen) {
        if (HtmlUI_ActivityTransitionType == "right-side") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateX(${e.fn.distance(window.innerWidth, 0)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateX(${e.fn.distance(0, -window.innerWidth / 3)}px)`, "important");
        } else if (HtmlUI_ActivityTransitionType == "left-side") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateX(${e.fn.distance(-window.innerWidth, 0)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateX(${e.fn.distance(0, window.innerWidth / 3)}px)`, "important");
        } else if (HtmlUI_ActivityTransitionType == "top-side") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateY(${e.fn.distance(-window.innerHeight, 0)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateY(${e.fn.distance(0, window.innerHeight / 3)}px)`, "important");
        } else if (HtmlUI_ActivityTransitionType == "bottom-side") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateY(${e.fn.distance(window.innerHeight, 0)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateY(${e.fn.distance(0, -window.innerHeight / 3)}px)`, "important");
        } else if (HtmlUI_ActivityTransitionType == "zoom-in") {
            e2[e2.length - 1].el.style.setProperty("transform", `scale(${e.fn.distance(0.75, 1)})`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `scale(${e.fn.distance(1, 1.25)})`, "important");
            e2[e2.length - 1].el.style.setProperty("opacity", `${e.fn.distance(0, 2)}`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("opacity", "1", "important");
        } else if (HtmlUI_ActivityTransitionType == "android-13") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateX(${e.fn.distance(window.innerWidth / 12, 0)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateX(${e.fn.distance(0, -window.innerWidth / 12)}px)`, "important");
            e2[e2.length - 1].el.style.setProperty("opacity", `${e.fn.distance(0, 2)}`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("opacity", "1", "important");
        }
        e2[e2.length - 1].el.style.setProperty("z-index", "2", "important");
        e2[Math.max(0, e2.length - 2)].el.style.setProperty("z-index", "0", "important");

        e2[Math.max(0, e2.length - 2)].el.style.setProperty("visibility", e.range == 1 ? "hidden": "visible", "important");
        if (e.range == 1) {
            e2[Math.max(0, e2.length - 2)].el.classList.add("hidden");
        }
        e2[e2.length - 1].el.style.setProperty("visibility", "visible", "important");
        e2[e2.length - 1].el.classList.remove("hidden");
    } else {
        if (HtmlUI_ActivityTransitionType == "right-side") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateX(${e.fn.distance(window.innerWidth, 0, true)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateX(${e.fn.distance(0, -window.innerWidth / 3, true)}px)`, "important");
        } else if (HtmlUI_ActivityTransitionType == "left-side") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateX(${e.fn.distance(-window.innerWidth, 0, true)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateX(${e.fn.distance(0, window.innerWidth / 3, true)}px)`, "important");
        } else if (HtmlUI_ActivityTransitionType == "top-side") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateY(${e.fn.distance(-window.innerHeight, 0, true)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateY(${e.fn.distance(0, window.innerHeight / 3, true)}px)`, "important");
        } else if (HtmlUI_ActivityTransitionType == "bottom-side") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateY(${e.fn.distance(window.innerHeight, 0, true)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateY(${e.fn.distance(0, -window.innerHeight / 3, true)}px)`, "important");
        } else if (HtmlUI_ActivityTransitionType == "zoom-in") {
            e2[e2.length - 1].el.style.setProperty("transform", `scale(${e.fn.distance(0.75, 1, true)})`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `scale(${e.fn.distance(1, 1.25, true)})`, "important");
            e2[e2.length - 1].el.style.setProperty("opacity", `${e.fn.distance(0, 2, true)}`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("opacity", `${e.fn.distance(2, 0, true)}`, "important");
        } else if (HtmlUI_ActivityTransitionType == "android-13") {
            e2[e2.length - 1].el.style.setProperty("transform", `translateX(${e.fn.distance(window.innerWidth / 12, 0, true)}px)`, "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("transform", `translateX(${e.fn.distance(0, -window.innerWidth / 12, true)}px)`, "important");
            e2[e2.length - 1].el.style.setProperty("opacity", "1", "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("opacity", `${e.fn.distance(0, 2)}`, "important");
        }
        if (/zoom-in|zoom-out|android-13/i.test(HtmlUI_ActivityTransitionType)) {
            e2[e2.length - 1].el.style.setProperty("z-index", "0", "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("z-index", "2", "important");
        } else {
            e2[e2.length - 1].el.style.setProperty("z-index", "2", "important");
            e2[Math.max(0, e2.length - 2)].el.style.setProperty("z-index", "0", "important");
        }

        e2[Math.max(0, e2.length - 2)].el.style.setProperty("visibility", "visible", "important");
        e2[Math.max(0, e2.length - 2)].el.classList.remove("hidden");
        e2[e2.length - 1].el.style.setProperty("visibility", e.range == 1 ? "hidden": "visible", "important");
        if (e.range == 1) {
            e2[e2.length - 1].el.classList.add("hidden");
        }


        if (e.range == 1) {
            HtmlUI_ActivityArrayHistory.pop();
            HtmlUI_ActivityListener._event.listenEvent._execEvent("closed");
        }
    }
}, {
    curve: function(e) {
        return 1 - Math.pow(1 - e, /zoom-in|zoom-out/i.test(HtmlUI_ActivityTransitionType) ? 12: 6);
    }
});

var HtmlUI_ActivityRun = function(open) {
    HtmlUI_ActivityAnimTransition.UIState.setDuration(/zoom-in|zoom-out/i.test(HtmlUI_ActivityTransitionType) ? 750: 600);
    HtmlUI_ActivityIsOpen = open;
    HtmlUI_ActivityAnimTransition.UIPlayer.start();
}

var HtmlUI_ActivityMutation = new MutationObserver(function() {
    HtmlUI_ActivityArray = HtmlUI.Query("selectorall", "htmlui-main[activity]");
});
HtmlUI_ActivityMutation.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
});

window.HtmlUI_Activity_Open = function(activity, data) {
    if (HtmlUI_ActivityAnimTransition.UIAnimator.isAnim) return;

    let HtmlUI_ActivityMain = HtmlUI.Query("selector", "htmlui-main[main-activity]");
    if (HtmlUI_ActivityMain && HtmlUI_ActivityMain.getAttribute("main-activity") != "true") {
        HtmlUI_ActivityArrayHistory.push({
            activity: HtmlUI_ActivityMain.getAttribute("activity"), el: HtmlUI_ActivityMain, data: {}});
        HtmlUI_ActivityMain.setAttribute("main-activity", "true");
    }

    HtmlUI_ActivityArray.forEach(function(e) {
        if (e.getAttribute("activity") == activity) {
            HtmlUI_ActivityData = {
                activity: activity,
                data: data
            };
            if (activity != HtmlUI_ActivityPrev) {
                HtmlUI_ActivityArrayHistory.push({
                    activity: activity, el: e, data: data
                });
                HtmlUI_ActivityRun(true);
                HtmlUI_ActivityPrev = activity;
            } else {
                var _history = HtmlUI_ActivityArrayHistory;
                _history[_history.length - 1] = {
                    activity: activity,
                    el: e,
                    data: data
                }
                HtmlUI_ActivityArrayHistory = _history;
            }
            HtmlUI_ActivityListener._event.listenEvent._execEvent("open");
        }
    });
}
window.HtmlUI_Activity_Close = function() {
    if (HtmlUI_ActivityAnimTransition.UIAnimator.isAnim || HtmlUI_ActivityArrayHistory.length <= 1) return;

    var _history = HtmlUI_ActivityArrayHistory;
    HtmlUI_ActivityData = {
        activity: _history[_history.length - 1].activity,
        data: _history[_history.length - 1].data
    }

    HtmlUI_ActivityPrev = _history[Math.max(0, _history.length - 2)].activity;

    HtmlUI_ActivityRun(false);
    HtmlUI_ActivityListener._event.listenEvent._execEvent("close");
}

HtmlUI_ActivityListener["open"] = function(callback) {
    HtmlUI_ActivityListener._event.listenEvent.on("open", function() {
        callback(HtmlUI_ActivityData);
    });
}
HtmlUI_ActivityListener["close"] = function(callback) {
    HtmlUI_ActivityListener._event.listenEvent.on("close", function() {
        callback(HtmlUI_ActivityData);
    });
}
HtmlUI_ActivityListener["closed"] = function(callback) {
    HtmlUI_ActivityListener._event.listenEvent.on("closed", function() {
        callback(HtmlUI_ActivityData);
    });
}
/** **/