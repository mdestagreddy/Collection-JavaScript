function SuperGesture(el, config = {}) {
    var t = this;
    t.el = typeof el == "string" ? document.querySelector(el): el;

    var clamp = function(min, max, value) {
        return Math.max(min, Math.min(max, value));
    }

    t.config = {
        deltaSpeed: 1,
        maxDelta: 500,
        multiTouch: true,
        preventOtherGesture: true,
        rotate: "auto",
        bubbleGesture: false,
        pointerOnly: false
    }
    for (var c in config) {
        t.config[c] = config[c];
    }

    t.updateConfig = function(configObject) {
        for (var o in configObject) {
            t.config[o] = configObject[o];
        }
    }

    var axisSwipe = {
        x: true,
        y: true
    }
    t.swipeAxis = function(x, y) {
        axisSwipe.x = x != null ? x: axisSwipe.x;
        axisSwipe.y = y != null ? y: axisSwipe.y;
    }

    t.listen = {
        onStart: function() {},
        onSwipe: function() {},
        onFling: function() {},
        onEnd: function() {},
        onTap: function() {},
        onDoubleTap: function() {},
        onSwipeX: function() {},
        onSwipeY: function() {},
        onFlingX: function() {},
        onFlingY: function() {},
        onSwipeLock: function() {},
        onFlingLock: function() {}
    }
    var _event = {};
    _event._events = {};
    _event.listenEvent = {
        on: function(type, fn) {
            if (!_event._events[type]) {
                _event._events[type] = [];
            }

            _event._events[type].push(fn);
        },
        _execEvent: function(type) {
            if (!_event._events[type]) {
                return;
            }

            var i = 0;
            l = _event._events[type].length;

            if (!l) {
                return;
            }

            _event._events[type].forEach(function(ev) {
                ev.apply(_event, [].slice.call(arguments, 1));
            });
        }
    }

    var mPoints = [];
    var mPoint = {
        x: 0,
        y: 0
    }
    for (var i = 0; i < 10; i++) {
        mPoints.push({
            prevX: 0,
            prevY: 0,
            x: 0,
            y: 0,
            pressedX: false,
            pressedY: false
        });
    }
    var multiPoint = {
        x: function(event) {
            for (var i = 0; i < event.touches.length; i++) {
                var touch = event.touches[i];
                mPoints[i].x = touch.clientX;
                if (mPoints[i].pressedX) {
                    mPoint.x += (mPoints[i].x - mPoints[i].prevX) / event.changedTouches.length;
                }
                mPoints[i].prevX = mPoints[i].x;
                mPoints[i].pressedX = true;
            }
            for (var n = 9; n > event.touches.length; n--) {
                mPoints[n].x = 0;
                mPoints[n].prevX = 0;
                mPoints[n].pressedX = false;
            }

            return mPoint.x;
        },
        y: function(event) {
            for (var i = 0; i < event.touches.length; i++) {
                var touch = event.touches[i];
                mPoints[i].y = touch.clientY;
                if (mPoints[i].pressedY) {
                    mPoint.y += (mPoints[i].y - mPoints[i].prevY) / event.changedTouches.length;
                }
                mPoints[i].prevY = mPoints[i].y;
                mPoints[i].pressedY = true;
            }
            for (var n = 9; n > event.touches.length; n--) {
                mPoints[n].y = 0;
                mPoints[n].prevY = 0;
                mPoints[n].pressedY = false;
            }

            return mPoint.y;
        }
    }

    var gesture = {
        time: {
            start: 0,
            current: 0
        },
        rotate: {
            x: 0,
            y: 0,
            angle: 0,
            getRotateTransform: function() {
                var matrix = window.getComputedStyle(t.el).getPropertyValue("transform"),
                angle = 0;

                if (matrix != "none") {
                    var values = matrix.split("(")[1].split(")")[0].split(",");
                    var a = values[0];
                    var b = values[1];
                    angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
                }
                return angle;
            },
            rotDeg: function(deg) {
                var a = 0,
                b = 0,
                c = 0,
                d = 0;
                deg = deg%360;

                if (deg >= 45 && deg <= 135) {
                    a = 90;
                    b = 1;
                    c = -1;
                    d = 1;
                } else if (deg >= 135 && deg <= 225) {
                    a = 180;
                    b = -1;
                    c = -1;
                    d = 0;
                } else if (deg >= 225 && deg <= 315) {
                    a = 270;
                    b = -1;
                    c = 1;
                    d = 1;
                } else {
                    a = 0;
                    b = 1;
                    c = 1;
                    d = 0;
                }

                return {
                    deg: a,
                    revX: b,
                    revY: c,
                    sw: d
                }
            }
        },
        start: {
            x: 0,
            y: 0
        },
        move: {
            x: 0,
            y: 0
        },
        delta: {
            prevX: 0,
            prevY: 0,
            x: 0,
            y: 0,
            deltaTime: 0,
            time: 0,
            startTime: 0,
            prevTime: 0
        },
        pointPress: false,
        moved: false,
        relativeMove: false,
        events: {},
        doubleTap: {
            count: 0,
            time: 0,
            startTime: 0
        },
        swipe: {
            x: {
                active: false,
                moved: false
            },
            y: {
                active: false,
                moved: false
            }
        },
        pointX: function(e) {
            gesture.rotate.x = gesture.rotate.rotDeg(gesture.rotate.angle + 180);

            if (e.changedTouches && e.changedTouches.length >= 1) {
                return (!gesture.rotate.x.sw ? (t.config.multiTouch ? multiPoint.x(e): e.changedTouches[0].clientX): (t.config.multiTouch ? multiPoint.y(e): e.changedTouches[0].clientY)) * gesture.rotate.x.revX || 0;
            } else {
                return (!gesture.rotate.x.sw ? e.clientX: e.clientY) * gesture.rotate.x.revX || 0;
            }
        },
        pointY: function(e) {
            gesture.rotate.y = gesture.rotate.rotDeg(gesture.rotate.angle + 180);

            if (e.changedTouches && e.changedTouches.length >= 1) {
                return (gesture.rotate.y.sw ? (t.config.multiTouch ? multiPoint.x(e): e.changedTouches[0].clientX): (t.config.multiTouch ? multiPoint.y(e): e.changedTouches[0].clientY)) * gesture.rotate.y.revY || 0;
            } else {
                return (gesture.rotate.y.sw ? e.clientX: e.clientY) * gesture.rotate.y.revY || 0;
            }
        }
    }
    gesture.events_listener = [];
    gesture.listeners = function(el, name, callback) {
        var mName = name.split(" ");

        for (var i = 0; i < mName.length; i++) {
            var eName = new String(mName[mName.length - i - 1]);
            var handler = function(event) {
                gesture.events[eName] = event;
                callback(event);
            }
            gesture.events_listener.push({
                name: eName,
                fn: handler,
                bubble: t.config.bubbleGesture
            });
            el.addEventListener(eName, handler, t.config.bubbleGesture);
        }
    }
    gesture.unlisten_all = function() {
        gesture.events_listener.forEach(function(events) {
            el.removeEventListener(events.name, events.fn, events.bubble);
        });
        gesture.events_listener = [];
    }

    var bulidGesture = function() {
        gesture.listeners(t.el, t.config.pointerOnly ? "pointerdown": "touchstart pointerdown", function(e) {
            if (!gesture.pointPress) {
                gesture.time.start = performance.now();
                gesture.rotate.angle = 180 + (t.config.rotate == "auto" ? gesture.rotate.getRotateTransform(): (typeof t.config.rotate == "number" ? (t.config.rotate < 0 ? 360 - ((0 - t.config.rotate)%360): (t.config.rotate%360)): 0));

                mPoint.x = e.changedTouches && e.changedTouches.length >= 1 ? e.changedTouches[0].clientX: e.clientX;
                mPoint.y = e.changedTouches && e.changedTouches.length >= 1 ? e.changedTouches[0].clientY: e.clientY;

                gesture.start.x = gesture.pointX(e) || 0;
                gesture.start.y = gesture.pointY(e) || 0;
                gesture.move.x = gesture.start.x;
                gesture.move.y = gesture.start.y;
                gesture.delta.x = 0;
                gesture.delta.y = 0;
                gesture.delta.prevX = 0;
                gesture.delta.prevY = 0;
                gesture.pointPress = true;
                gesture.moved = false;
                gesture.swipe.x.active = false;
                gesture.swipe.x.moved = false;
                gesture.swipe.y.active = false;
                gesture.swipe.y.moved = false;

                _event.listenEvent._execEvent("start");
            }
        });

        gesture.listeners(t.el,
            t.config.pointerOnly ? "pointermove": "touchmove mousemove",
            function(e) {
                if (gesture.pointPress) {
                    gesture.time.current = performance.now();
                    if (gesture.time.current - gesture.time.start > 300 && !gesture.moved) {
                        gesture.moved = true;
                        return;
                    }

                    gesture.delta.time = gesture.time.current;
                    gesture.delta.deltaTime = (gesture.delta.time - gesture.delta.prevTime) / (1000 / 60);
                    gesture.delta.prevTime = gesture.delta.time;

                    gesture.moved = true;

                    gesture.move.x = gesture.pointX(e) || 0;
                    gesture.move.y = gesture.pointY(e) || 0;

                    if (!gesture.relativeMove) {
                        gesture.relativeMove = true;
                        gesture.start.x = gesture.move.x;
                        gesture.start.y = gesture.move.y;
                    }
                    nx = gesture.move.x - gesture.start.x;
                    ny = gesture.move.y - gesture.start.y;
                    gesture.delta.x = nx - gesture.delta.prevX;
                    gesture.delta.prevX = nx;
                    gesture.delta.y = ny - gesture.delta.prevY;
                    gesture.delta.prevY = ny;

                    if (!gesture.swipe.x.moved && Math.abs(gesture.delta.x) != 0) {
                        gesture.swipe.x.moved = true;
                        if (Math.abs(gesture.delta.x) > Math.abs(gesture.delta.y)) {
                            gesture.swipe.x.active = true;
                        }
                    }

                    if (!gesture.swipe.y.moved && Math.abs(gesture.delta.y) != 0) {
                        gesture.swipe.y.moved = true;
                        if (Math.abs(gesture.delta.y) > Math.abs(gesture.delta.x)) {
                            gesture.swipe.y.active = true;
                        }
                    }

                    _event.listenEvent._execEvent("move");
                    if (t.config.preventOtherGesture && ((gesture.swipe.x.active && axisSwipe.x) || (gesture.swipe.y.active && axisSwipe.y))) {
                        e.stopPropagation();
                    }
                }
            });

        gesture.listeners(t.el,
            "touchend mouseleave pointerup",
            function(e) {
                if (gesture.pointPress) {
                    gesture.time.current = performance.now();
                    gesture.pointPress = false;

                    if (!gesture.moved) {
                        _event.listenEvent._execEvent("tap");

                        gesture.doubleTap.count += 1;
                        if (gesture.doubleTap.count == 1) {
                            gesture.doubleTap.startTime = performance.now();
                        }
                        gesture.doubleTap.time = performance.now();
                        if (gesture.doubleTap.time - gesture.doubleTap.startTime > 300) {
                            gesture.doubleTap.count = 0;
                        }
                        if (gesture.doubleTap.count >= 2) {
                            gesture.doubleTap.count = 0;
                            _event.listenEvent._execEvent("dbltap");
                        }
                    }

                    gesture.moved = false;
                    gesture.relativeMove = false;

                    for (var i = 0; i < 10; i++) {
                        mPoints[i] = {
                            prevX: 0,
                            prevY: 0,
                            x: 0,
                            y: 0,
                            pressedX: false,
                            pressedY: false
                        }
                    }

                    mPoint.x = 0;
                    mPoint.y = 0;
                    
                    _event.listenEvent._execEvent("end");
                }
            });
    }
    bulidGesture();

    t.rebulidGesture = function() {
        gesture.unlisten_all();
        bulidGesture();
    }
    t.cleanup = function() {
        gesture.unlisten_all();
    }

    t.listen.onStart = function(obj) {
        _event.listenEvent.on("start",
            function() {
                obj({
                    x: gesture.start.x || 0,
                    y: gesture.start.y || 0,
                    isPress: gesture.pointPress,
                    time: gesture.time.start,
                    events: gesture.events
                });
            });
    }
    t.listen.onSwipe = function(obj) {
        _event.listenEvent.on("move",
            function() {
                obj({
                    x: gesture.move.x,
                    y: gesture.move.y,
                    startX: gesture.start.x,
                    startY: gesture.start.y,
                    deltaX: gesture.delta.x || 0,
                    deltaY: gesture.delta.y || 0,
                    isPress: gesture.pointPress,
                    time: gesture.time.current,
                    deltaTime: gesture.delta.deltaTime,
                    events: gesture.events
                });
            });
    }
    t.listen.onFling = function(obj) {
        _event.listenEvent.on("end",
            function() {
                obj({
                    x: gesture.move.x,
                    y: gesture.move.y,
                    startX: gesture.start.x,
                    startY: gesture.start.y,
                    deltaX: clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.x / gesture.delta.deltaTime) > 1 ? gesture.delta.x / gesture.delta.deltaTime: 0) * t.config.deltaSpeed) || 0,
                    deltaY: clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.y / gesture.delta.deltaTime) > 1 ? gesture.delta.y / gesture.delta.deltaTime: 0) * t.config.deltaSpeed) || 0,
                    isPress: gesture.pointPress,
                    time: gesture.time.current,
                    deltaTime: gesture.delta.deltaTime,
                    events: gesture.events
                });
            });
    }
    t.listen.onEnd = function(obj) {
        _event.listenEvent.on("end",
            function() {
                obj({
                    isPress: gesture.pointPress,
                    time: gesture.time.current,
                    deltaTime: gesture.delta.deltaTime,
                    events: gesture.events
                });
            });
    }
    t.listen.onTap = function(obj) {
        _event.listenEvent.on("tap",
            function() {
                obj({
                    isPress: gesture.pointPress,
                    time: gesture.time.current,
                    x: gesture.move.x,
                    y: gesture.move.y,
                    startX: gesture.start.x,
                    startY: gesture.start.y,
                    events: gesture.events
                });
            });
    }
    t.listen.onDoubleTap = function(obj) {
        _event.listenEvent.on("dbltap",
            function() {
                obj({
                    isPress: gesture.pointPress,
                    time: gesture.time.current,
                    x: gesture.move.x,
                    y: gesture.move.y,
                    startX: gesture.start.x,
                    startY: gesture.start.y,
                    events: gesture.events
                });
            });
    }
    t.listen.onSwipeX = function(obj) {
        _event.listenEvent.on("move",
            function() {
                if (gesture.swipe.x.active) {
                    obj({
                        x: gesture.move.x,
                        y: gesture.move.y,
                        startX: gesture.start.x,
                        startY: gesture.start.y,
                        deltaX: gesture.delta.x || 0,
                        deltaY: 0,
                        isPress: gesture.pointPress,
                        time: gesture.time.current,
                        deltaTime: gesture.delta.deltaTime,
                        events: gesture.events
                    });
                }
            });
    }
    t.listen.onSwipeY = function(obj) {
        _event.listenEvent.on("move",
            function() {
                if (gesture.swipe.y.active) {
                    obj({
                        x: gesture.move.x,
                        y: gesture.move.y,
                        startX: gesture.start.x,
                        startY: gesture.start.y,
                        deltaX: 0,
                        deltaY: gesture.delta.y || 0,
                        isPress: gesture.pointPress,
                        time: gesture.time.current,
                        deltaTime: gesture.delta.deltaTime,
                        events: gesture.events
                    });
                }
            });
    }
    t.listen.onFlingX = function(obj) {
        _event.listenEvent.on("end",
            function() {
                if (gesture.swipe.x.active || !gesture.moved) {
                    obj({
                        x: gesture.move.x,
                        y: gesture.move.y,
                        startX: gesture.start.x,
                        startY: gesture.start.y,
                        deltaX: clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.x / gesture.delta.deltaTime) > 1 ? gesture.delta.x / gesture.delta.deltaTime: 0) * t.config.deltaSpeed) || 0,
                        deltaY: 0,
                        isPress: gesture.pointPress,
                        time: gesture.time.current,
                        deltaTime: gesture.delta.deltaTime,
                        events: gesture.events
                    });
                }
            });
    }
    t.listen.onFlingY = function(obj) {
        _event.listenEvent.on("end",
            function() {
                if (gesture.swipe.y.active || !gesture.moved) {
                    obj({
                        x: gesture.move.x,
                        y: gesture.move.y,
                        startX: gesture.start.x,
                        startY: gesture.start.y,
                        deltaX: 0,
                        deltaY: clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.y / gesture.delta.deltaTime) > 1 ? gesture.delta.y / gesture.delta.deltaTime: 0) * t.config.deltaSpeed) || 0,
                        isPress: gesture.pointPress,
                        time: gesture.time.current,
                        deltaTime: gesture.delta.deltaTime,
                        events: gesture.events
                    });
                }
            });
    }
    t.listen.onSwipeLock = function(obj) {
        _event.listenEvent.on("move",
            function() {
                obj({
                    x: gesture.move.x,
                    y: gesture.move.y,
                    startX: gesture.start.x,
                    startY: gesture.start.y,
                    deltaX: (gesture.swipe.x.active ? gesture.delta.x: 0) || 0,
                    deltaY: (gesture.swipe.y.active ? gesture.delta.y: 0) || 0,
                    isPress: gesture.pointPress,
                    time: gesture.time.current,
                    deltaTime: gesture.delta.deltaTime,
                    events: gesture.events
                });
            });
    }
    t.listen.onFlingLock = function(obj) {
        _event.listenEvent.on("end",
            function() {
                obj({
                    x: gesture.move.x,
                    y: gesture.move.y,
                    startX: gesture.start.x,
                    startY: gesture.start.y,
                    deltaX: (gesture.swipe.x.active ? clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.x / gesture.delta.deltaTime) > 1 ? gesture.delta.x / gesture.delta.deltaTime: 0) * t.config.deltaSpeed): 0) || 0,
                    deltaY: (gesture.swipe.y.active ? clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.y / gesture.delta.deltaTime) > 1 ? gesture.delta.y / gesture.delta.deltaTime: 0) * t.config.deltaSpeed): 0) || 0,
                    isPress: gesture.pointPress,
                    time: gesture.time.current,
                    deltaTime: gesture.delta.deltaTime,
                    events: gesture.events
                });
            });
    }
}