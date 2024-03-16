/**
* Original smooth-scrollbar by idiotWu (https://github.com/idiotWu/smooth-scrollbar)
*
* HtmlUI Version
**/

window.Scrollbar = {};
self.scrollbar_self = {
    items: [],
    scrollview: HtmlUI.ScrollView3
};

window.Scrollbar.changeScrollViewVersion = function(scrollViewVersion = 3) {
    switch (scrollViewVersion) {
        case 3:
            self.scrollbar_self.scrollview = HtmlUI.ScrollView3;
            break;
        case 2:
            self.scrollbar_self.scrollview = HtmlUI.ScrollView2;
            break;
        case 1:
            self.scrollbar_self.scrollview = HtmlUI.ScrollView;
            break;
        default:
            self.scrollbar_self.scrollview = HtmlUI.ScrollView3;
            break;
    }
}

window.Scrollbar.init = function(element, options = {}) {
    var isInitialized = false,
    definedObj = null;
    element = typeof element == "string" ? document.querySelector(element): element;
    self.scrollbar_self.items.forEach(function(item) {
        if (element.getAttribute("scrollbar-id") == item.scrollbar_id) {
            isInitialized = true;
            definedObj = item;
        }
    });
    if (!isInitialized) {
        var obj = {};
        obj.self = {};

        obj.self.listeners = {};
        obj.self.smoothScrollListener = function() {};

        obj.self.opt = {
            damping: 0.04,
            renderByPixels: true,
            alwaysShowTracks: false
        }
        for (var o in options) {
            obj.self.opt[o] = options[o]
        }

        obj.self.originalHTML = element.innerHTML;
        obj.self.originalAttributes = element.attributes;

        obj.self.scroll = new self.scrollbar_self.scrollview(element, {
            friction: obj.self.opt.damping,
            transform: true,
            improveAnimation: obj.self.opt.renderByPixels
        });
        obj.self.scrollbar = new HtmlUI.Scrollbar(obj.self.scroll, {
            autoHide: !obj.self.opt.alwaysShowTracks
        });
        obj.self.smoothStartX = 0; obj.self.smoothTargetX = 0;
        obj.self.smoothStartY = 0; obj.self.smoothTergetY = 0;
        obj.self.smoothScroll = new HtmlUI.Animator(function(event) {
            obj.self.scroll.UIAction.scrollTo(
                event.fn.distance(obj.self.smoothStartX, obj.self.smoothTargetX),
                event.fn.distance(obj.self.smoothStartY, obj.self.smoothTargetY),
                false
            );
            if (event.range == 1) {
                obj.self.smoothScrollListener();
            }
        });
        obj.self.scroll.UIElement.main.setAttribute("scrollbar-id",
            Math.round(HtmlUI.Math.random(0, 100000000)));
        obj.scrollbar_id = obj.self.scroll.UIElement.main.getAttribute("scrollbar-id");

        obj.self.scroll.UIListener.scroll(function(event) {
            for (var listen in obj.self.listeners) {
                obj.self.listeners[listen].apply(obj, [{
                    offset: {
                        x: event.x,
                        y: event.y
                    },
                    limit: {
                        x: event.contentWidth,
                        y: event.contentHeight
                    }
                }]);
            }
        });

        obj.containerEl = obj.self.scroll.UIElement.main;
        obj.contentEl = obj.self.scroll.UIElement.content;

        obj.options = {};
        Object.defineProperties(obj.options,
            {
                damping: {
                    set: function(damping) {
                        obj.self.scroll.UIConfig.friction = damping;
                    },
                    get: function() {
                        return obj.self.scroll.UIConfig.friction;
                    },
                    enumerable: true,
                    configurable: true
                },
                renderByPixels: {
                    set: function(renderByPixels) {
                        obj.self.scroll.UIConfig.improveAnimation = renderByPixels;
                    },
                    get: function() {
                        return obj.self.scroll.UIConfig.improveAnimation;
                    },
                    enumerable: true,
                    configurable: true
                },
                alwaysShowTracks: {
                    set: function(alwaysShowTracks) {
                        obj.self.scrollbar.UIConfig.autoHide = !alwaysShowTracks;
                    },
                    get: function() {
                        return !obj.self.scrollbar.UIConfig.autoHide;
                    },
                    enumerable: true,
                    configurable: true
                },
            })

        Object.defineProperties(obj,
            {
                scrollLeft: {
                    set: function(scrollLeft) {
                        obj.self.scroll.UIScroll.x = HtmlUI.Math.clamp(0, obj.self.scroll.UIDimension.contentWidth, scrollLeft);
                        if (!obj.self.scroll.UIAnimation.isAnim) {
                            obj.self.scroll.UIAnimation.active(false);
                            obj.self.scroll.UIAnimation.anim();
                        }
                    },
                    get: function() {
                        return obj.self.scroll.UIScroll.x;
                    },
                    enumerable: true,
                    configurable: true
                },
                scrollTop: {
                    set: function(scrollTop) {
                        obj.self.scroll.UIScroll.y = HtmlUI.Math.clamp(0, obj.self.scroll.UIDimension.contentHeight, scrollTop);
                        if (!obj.self.scroll.UIAnimation.isAnim) {
                            obj.self.scroll.UIAnimation.active(false);
                            obj.self.scroll.UIAnimation.anim();
                        }
                    },
                    get: function() {
                        return obj.self.scroll.UIScroll.y;
                    },
                    enumerable: true,
                    configurable: true
                }
            });

        obj.offset = {};
        Object.defineProperties(obj.offset,
            {
                x: {
                    get: function() {
                        return obj.self.scroll.UIScroll.x;
                    },
                    enumerable: true
                },
                y: {
                    get: function() {
                        return obj.self.scroll.UIScroll.y;
                    },
                    enumerable: true
                }
            });

        obj.limit = {};
        Object.defineProperties(obj.limit,
            {
                x: {
                    get: function() {
                        return obj.self.scroll.UIDimension.contentWidth;
                    },
                    enumerable: true
                },
                y: {
                    get: function() {
                        return obj.self.scroll.UIDimension.contentHeight;
                    },
                    enumerable: true
                }
            });

        obj.size = {
            container: {},
            content: {}
        }
        Object.defineProperties(obj.size.container,
            {
                width: {
                    get: function() {
                        return obj.self.scroll.UIDimension.el.clientWidth;
                    },
                    enumerable: true
                },
                height: {
                    get: function() {
                        return obj.self.scroll.UIDimension.el.clientHeight;
                    },
                    enumerable: true
                }
            });
        Object.defineProperties(obj.size.content,
            {
                width: {
                    get: function() {
                        return obj.self.scroll.UIDimension.el2.scrollWidth;
                    },
                    enumerable: true
                },
                height: {
                    get: function() {
                        return obj.self.scroll.UIDimension.el2.scrollHeight;
                    },
                    enumerable: true
                }
            });

        obj.getSize = function() {
            return {
                container: {
                    width: obj.self.scroll.UIDimension.el.clientWidth,
                    height: obj.self.scroll.UIDimension.el.clientHeight
                },
                content: {
                    width: obj.self.scroll.UIDimension.el2.scrollWidth,
                    height: obj.self.scroll.UIDimension.el2.scrollHeight
                }
            }
        }

        obj.update = function() {
            if (!obj.self.scroll.UIAnimation.isAnim) {
                obj.self.scroll.scrollTo(obj.self.scroll.UIScroll.x, obj.self.scroll.UIScroll.y, false);
            }
        }

        obj.setPosition = function(x, y) {
            obj.self.scroll.UIAction.scrollTo(x, y, false);
        }

        obj.addMomentum = function(x, y) {
            obj.self.scroll.UIScroll.deltaX -= x;
            obj.self.scroll.UIScroll.deltaY -= y;
            if (!obj.self.scroll.UIAnimation.isAnim) {
                obj.self.scroll.UIAnimation.active(true);
                obj.self.scroll.UIAnimation.anim();
            }
        }
        obj.setMomentum = function(x, y) {
            obj.self.scroll.UIScroll.deltaX = -x;
            obj.self.scroll.UIScroll.deltaY = -y;
            if (!obj.self.scroll.UIAnimation.isAnim) {
                obj.self.scroll.UIAnimation.active(true);
                obj.self.scroll.UIAnimation.anim();
            }
        }

        obj.addListener = function(listener) {
            obj.self.listeners[new String(listener)] = listener;
        }
        obj.removeListener = function(listener) {
            delete obj.self.listeners[new String(listener)];
        }

        obj.scrollTo = function(x, y, duration, options = {}) {
            obj.self.smoothScroll.UIState.setDuration(duration || 0);
            obj.self.smoothScroll.UIState.setCurve(options.easing || function(range) {
                return 1 - Math.pow(1 - range, 4);
            });
            obj.self.smoothScrollListener = options.callback || function() {}

            obj.self.smoothStartX = obj.scrollLeft;
            obj.self.smoothStartY = obj.scrollTop;
            obj.self.smoothTargetX = HtmlUI.Math.clamp(0, obj.limit.x, x);
            obj.self.smoothTargetY = HtmlUI.Math.clamp(0, obj.limit.y, y);

            if (obj.self.smoothTargetX != obj.self.smoothStartX ||
                obj.self.smoothTargetY != obj.self.smoothStartY) obj.self.smoothScroll.UIPlayer.start();
        }
        obj.scrollIntoView = function(element, options = {}) {
            var opt = {
                alignToTop: true,
                onlyScrollIfNeeded: false,
                offsetLeft: 0,
                offsetTop: 0,
                offsetBottom: 0
            }
            for (var o in options) {
                opt[o] = options[o];
            }

            var scrollRect = obj.self.scroll.UIElement.main.getBoundingClientRect();
            var targetRect = element.getBoundingClientRect();
            var targetX = 0,
            targetY = 0;

            targetX = obj.scrollTop + (targetRect.left - scrollRect.left);
            if (targetRect.top - scrollRect.top >= -element.offsetHeight &&
                targetRect.top - scrollRect.top <= obj.size.container.height || !opt.onlyScrollIfNeeded) {
                if (opt.alignToTop) {
                    targetY = obj.scrollTop;
                    if (obj.size.container.height >= element.offsetHeight) {
                        if (targetRect.top - scrollRect.top < 0) {
                            targetY += targetRect.top - scrollRect.top;
                        } else if (targetRect.top - scrollRect.top > obj.size.container.height - element.offsetHeight) {
                            targetY += targetRect.top - scrollRect.top - obj.size.container.height + element.offsetHeight;
                        }
                    } else {
                        if (targetRect.top - scrollRect.top < -(element.offsetHeight - obj.size.container.height)) {
                            targetY += targetRect.top - scrollRect.top + element.offsetHeight - obj.size.container.height;
                        } else if (targetRect.top - scrollRect.top > 0) {
                            targetY += targetRect.top - scrollRect.top;
                        }
                    }
                } else {
                    targetY = obj.scrollTop + (targetRect.top - scrollRect.top);
                }
            } else {
                return;
            }
            targetX += opt.offsetLeft;
            targetY += opt.offsetTop - opt.offsetBottom;

            obj.scrollTo(targetX, targetY, 500);
        }

        obj.isVisible = function(element) {
            var scrollRect = obj.self.scroll.UIElement.main.getBoundingClientRect();
            var visibleRect = element.getBoundingClientRect();

            return (visibleRect.left - scrollRect.left > -element.offsetWidth && visibleRect.left - scrollRect.left < obj.size.container.width) &&
            (visibleRect.top - scrollRect.top > -element.offsetHeight && visibleRect.top - scrollRect.top < obj.size.container.height);
        }

        obj.destroy = function() {
            window.Scrollbar.destroy(obj.containerEl);
        }

        self.scrollbar_self.items.push(obj);
        return obj;
    } else {
        return definedObj;
    }
}

window.Scrollbar.initAll = function(options = {}) {
    document.querySelectorAll("[data-scrollbar]:not([scrollbar-id])").forEach(function(element) {
        Scrollbar.init(element, options);
    });
}

window.Scrollbar.has = function(element) {
    var isScrollbar = false;
    self.scrollbar_self.items.forEach(function(item) {
        if (item.containerEl == element) {
            isScrollbar = true;
        }
    });

    return isScrollbar;
}

window.Scrollbar.get = function(element) {
    var definedObj = undefined;
    self.scrollbar_self.items.forEach(function(item) {
        if (item.containerEl == element) {
            definedObj = item;
        }
    });

    return definedObj;
}

window.Scrollbar.getAll = function() {
    return self.scrollbar_self.items;
}

window.Scrollbar.destroy = function(element) {
    self.scrollbar_self.items.forEach(function(item) {
        if (item.containerEl == element) {
            Array.from(item.containerEl.attributes).forEach(function(attr) {
                item.containerEl.removeAttribute(attr.name);
            });
            Array.from(item.self.originalAttributes).forEach(function(attr) {
                item.containerEl.setAttribute(attr.name, attr.value);
            });
            item.containerEl.innerHTML = item.self.originalHTML;

            delete item;
        }
    });
}

window.Scrollbar.destroyAll = function() {
    self.scrollbar_self.items.forEach(function(item) {
        Scrollbar.destroy(item.containerEl);
    });
}