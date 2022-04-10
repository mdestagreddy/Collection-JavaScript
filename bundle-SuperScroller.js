function SuperGesture(el, config = {}) {
	var t = this;
	t.el = typeof el == "string" ? document.querySelector(el) : el;
	
	var clamp = function(min, max, value) {
		return Math.max(min, Math.min(max, value));
	}
	
	t.config = {
		deltaSpeed: 1,
		maxDelta: 500,
		multiTouch: true,
		preventOtherGesture: true,
		rotate: "auto"
	}
	for (var c in config) {
		t.config[c] = config[c];
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
		if ( !_event._events[type] ) {
		_event._events[type] = [];
		}
		
		_event._events[type].push(fn);
		},
		_execEvent: function(type) {
		if ( !_event._events[type] ) { return; }
		
		var i = 0;
		l = _event._events[type].length;
		
		if ( !l ) { return; }
		
		for ( ; i < l; i++ ) {
		_event._events[type][i].apply(_event, [].slice.call(arguments, 1));
		}
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
			for (var n = 9; n > event.touches.length - 1; n--) {
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
			for (var n = 9; n > event.touches.length - 1; n--) {
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
				var matrix = window.getComputedStyle(t.el).getPropertyValue("transform"), angle = 0;
				
				if (matrix != "none") {
					var values = matrix.split("(")[1].split(")")[0].split(",");
					var a = values[0];
					var b = values[1];
					angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
				}
				return angle;
			},
			rotDeg: function(deg) {
				var a = 0, b = 0, c = 0, d = 0;
				deg = deg%360;
				
				if (deg >= 45 && deg <= 135) {
					a = 90;
					b = 1;
					c = -1;
					d = 1;
				}
				else if (deg >= 135 && deg <= 225) {
					a = 180;
					b = -1;
					c = -1;
					d = 0;
				}
				else if (deg >= 225 && deg <= 315) {
					a = 270;
					b = -1;
					c = 1;
					d = 1;
				}
				else {
					a = 0;
					b = 1;
					c = 1;
					d = 0;
				}
				
				return {deg: a, revX: b, revY: c, sw: d}
			}
		},
		start: {x: 0, y: 0},
		move: {x: 0, y: 0},
		delta: {prevX: 0, prevY: 0, x: 0, y: 0, deltaTime: 0, time: 0, startTime: 0},
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
				return (!gesture.rotate.x.sw ? (t.config.multiTouch ? multiPoint.x(e) : e.changedTouches[0].clientX) : (t.config.multiTouch ? multiPoint.y(e) : e.changedTouches[0].clientY)) * gesture.rotate.x.revX;
			}
			else {
				return (gesture.rotate.x.sw ? e.clientX : e.clientY) * gesture.rotate.x.revX;
			}
		},
		pointY: function(e) {
			gesture.rotate.y = gesture.rotate.rotDeg(gesture.rotate.angle + 180);
			
			if (e.changedTouches && e.changedTouches.length >= 1) {
				return (gesture.rotate.y.sw ? (t.config.multiTouch ? multiPoint.x(e) : e.changedTouches[0].clientX) : (t.config.multiTouch ? multiPoint.y(e) : e.changedTouches[0].clientY)) * gesture.rotate.y.revY;
			}
			else {
				return (gesture.rotate.y.sw ? e.clientX : e.clientY) * gesture.rotate.y.revY;
			}
		}
	}
	gesture.listeners = function(el, name, callback) {
		var mName = name.split(" ");
		
		for (var i = 0; i < mName.length; i++) {
			var eName = new String(mName[mName.length - i - 1]);
			el.addEventListener(eName, function(event) {
				gesture.events[eName] = event;
				
				callback(event);
			});
		}
	}
	
	gesture.listeners(t.el, "touchstart mousedown", function(e) {	
		if (!gesture.pointPress) {
			gesture.time.start = performance.now();
			gesture.rotate.angle = 180 + (t.config.rotate == "auto" ? gesture.rotate.getRotateTransform() : (typeof t.config.rotate == "number" ? (t.config.rotate < 0 ? 360 - ((0 - t.config.rotate)%360) : (t.config.rotate%360)) : 0));
			
			mPoint.x = e.changedTouches && e.changedTouches.length >= 1 ? e.changedTouches[0].clientX : e.clientX;
			mPoint.y = e.changedTouches && e.changedTouches.length >= 1 ? e.changedTouches[0].clientY : e.clientY;
			
			gesture.start.x = gesture.pointX(e);
			gesture.start.y = gesture.pointY(e);
			gesture.move.x = gesture.startX;
			gesture.move.y = gesture.startY;
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
			if (t.config.preventOtherGesture) {
				e.stopPropagation();
			}
		}
	});
	
	gesture.listeners(t.el, "touchmove mousemove", function(e) {
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
			
			gesture.move.x = gesture.pointX(e);
			gesture.move.y = gesture.pointY(e);
			
			if (!gesture.relativeMove) {
				gesture.relativeMove = true;
				gesture.start.x = gesture.move.x;
				gesture.start.y = gesture.move.y;
			}
			nx = gesture.move.x - gesture.start.x;
			ny = gesture.move.y - gesture.start.y
			gesture.delta.x = nx - gesture.delta.prevX;
			gesture.delta.prevX = nx;			gesture.delta.y = ny - gesture.delta.prevY;
			gesture.delta.prevY = ny;
			
			_event.listenEvent._execEvent("move");
			if (t.config.preventOtherGesture) {
				e.stopPropagation();
			}
		}
	});
	
	gesture.listeners(t.el, "touchend pointerup mouseleave", function(e) {	
		if (gesture.pointPress) {
			gesture.time.current = performance.now();
			gesture.pointPress = false;
			
			if (!gesture.moved) {
				_event.listenEvent._execEvent("tap");
				
				gesture.doubleTap.count += 1;
				if (gesture.doubleTap.count == 1) {
					gesture.doubleTap.startTime = performance.now();
				}
				else {
					gesture.doubleTap.time = performance.now();
					if (gesture.doubleTap.time - gesture.doubleTap.startTime > 300) {
						gesture.doubleTap.count = 0;
						gesture.doubleTap.startTime = performance.now();
					}	
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
	
	t.listen.onStart = function(obj) {
		_event.listenEvent.on("start", function() {
		obj({
			x: gesture.start.x,
			y: gesture.start.y,
			isPress: gesture.pointPress,
			time: gesture.time.start,
			events: gesture.events
		});
		});
	}
	t.listen.onSwipe = function(obj) {
		_event.listenEvent.on("move", function() {	
		obj({
			x: gesture.move.x,
			y: gesture.move.y,
			startX: gesture.start.x,
			startY: gesture.start.y,
			deltaX: gesture.delta.x,
			deltaY: gesture.delta.y,
			isPress: gesture.pointPress,
			time: gesture.time.current,
			deltaTime: gesture.delta.deltaTime,
			events: gesture.events
		});
		});
	}
	t.listen.onFling = function(obj) {
		_event.listenEvent.on("end", function() {
		obj({
			x: gesture.move.x,
			y: gesture.move.y,
			startX: gesture.start.x,
			startY: gesture.start.y,
			deltaX: clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.x / gesture.delta.deltaTime) > 1 ? gesture.delta.x / gesture.delta.deltaTime : 0) * t.config.deltaSpeed),
			deltaY: clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.y / gesture.delta.deltaTime) > 1 ? gesture.delta.y / gesture.delta.deltaTime : 0) * t.config.deltaSpeed),
			isPress: gesture.pointPress,
			time: gesture.time.current,
			deltaTime: gesture.delta.deltaTime,
			events: gesture.events
		});
		});
	}
	t.listen.onEnd = function(obj) {
		_event.listenEvent.on("end", function() {
		obj({
			isPress: gesture.pointPress,
			time: gesture.time.current,
			deltaTime: gesture.delta.deltaTime,
			events: gesture.events
		});
		});
	}
	t.listen.onTap = function(obj) {
		_event.listenEvent.on("tap", function() {
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
		_event.listenEvent.on("dbltap", function() {
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
		_event.listenEvent.on("move", function() {
 			if (!gesture.swipe.x.moved && gesture.delta.x != 0) {
				gesture.swipe.x.moved = true;
				if (Math.abs(gesture.delta.x) > Math.abs(gesture.delta.y)) {
					gesture.swipe.x.active = true;
				}
			}
			if (gesture.swipe.x.active) {
				obj({
					x: gesture.move.x,
					y: gesture.move.y,
					startX: gesture.start.x,
					startY: gesture.start.y,
					deltaX: gesture.delta.x,
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
		_event.listenEvent.on("move", function() {
			if (!gesture.swipe.y.moved && gesture.delta.y != 0) {
				gesture.swipe.y.moved = true;
				if (Math.abs(gesture.delta.y) > Math.abs(gesture.delta.x)) {
					gesture.swipe.y.active = true;
				}
			}
			if (gesture.swipe.y.active) {
				obj({
					x: gesture.move.x,
					y: gesture.move.y,
					startX: gesture.start.x,
					startY: gesture.start.y,
					deltaX: 0,
					deltaY: gesture.delta.y,
					isPress: gesture.pointPress,
					time: gesture.time.current,
					deltaTime: gesture.delta.deltaTime,
					events: gesture.events
				});
			}
	 	});
	}
	t.listen.onFlingX = function(obj) {
		_event.listenEvent.on("end", function() {
			if (gesture.swipe.x.active) {
				obj({
					x: gesture.move.x,
					y: gesture.move.y,
					startX: gesture.start.x,
					startY: gesture.start.y,
					deltaX: clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.x / gesture.delta.deltaTime) > 1 ? gesture.delta.x / gesture.delta.deltaTime : 0) * t.config.deltaSpeed),
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
		_event.listenEvent.on("end", function() {
			if (gesture.swipe.y.active) {
				obj({
					x: gesture.move.x,
					y: gesture.move.y,
					startX: gesture.start.x,
					startY: gesture.start.y,
					deltaX: 0,
					deltaY: clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.y / gesture.delta.deltaTime) > 1 ? gesture.delta.y / gesture.delta.deltaTime : 0) * t.config.deltaSpeed),
					isPress: gesture.pointPress,
					time: gesture.time.current,
					deltaTime: gesture.delta.deltaTime,
					events: gesture.events
				});
			}
		});
	}
	t.listen.onSwipeLock = function(obj) {
		_event.listenEvent.on("move", function() {
 			if (!gesture.swipe.x.moved && gesture.delta.y != 0) {
	 				gesture.swipe.x.moved = true;
	 			if (Math.abs(gesture.delta.x) > Math.abs(gesture.delta.y)) {
 					gesture.swipe.x.active = true;
				}
 			}
 			
 			if (!gesture.swipe.y.moved && gesture.delta.y != 0) {
 				gesture.swipe.y.moved = true;
	 			if (Math.abs(gesture.delta.y) > Math.abs(gesture.delta.x)) {
		 			gesture.swipe.y.active = true;
 				}
 			}
 			
 			obj({
	 			x: gesture.move.x,
 				y: gesture.move.y,
	 			startX: gesture.start.x,
 				startY: gesture.start.y,
	 			deltaX: gesture.swipe.x.active ? gesture.delta.x : 0,
 				deltaY: gesture.swipe.y.active ? gesture.delta.y : 0,
	 			isPress: gesture.pointPress,
	 			time: gesture.time.current,
	 			deltaTime: gesture.delta.deltaTime,
				events: gesture.events
 			});
 		});
	}
	t.listen.onFlingLock = function(obj) {
		_event.listenEvent.on("end", function() {
			obj({
				x: gesture.move.x,
				y: gesture.move.y,
				startX: gesture.start.x,
				startY: gesture.start.y,
				deltaX: gesture.swipe.x.active ? clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.x / gesture.delta.deltaTime) > 1 ? gesture.delta.x / gesture.delta.deltaTime : 0) * t.config.deltaSpeed) : 0,
				deltaY: gesture.swipe.y.active ? clamp(-t.config.maxDelta, t.config.maxDelta, (Math.abs(gesture.delta.y / gesture.delta.deltaTime) > 1 ? gesture.delta.y / gesture.delta.deltaTime : 0) * t.config.deltaSpeed) : 0,
				isPress: gesture.pointPress,
				time: gesture.time.current,
				deltaTime: gesture.delta.deltaTime,
				events: gesture.events
			});
		});
	}
}



/**
  @2022 mdestagreddy Github
**/

/**Create function */
//Error Message for Animator Library Function
function AnimatorDevError(errorName, message) {
  console.error(message);
  return new (errorName)(message);
}

//Minimum and maximum value
function AnimatorClamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

//Get axis x and y for gestures
function AnimatorAxisGesture(ev, dir) {
  if (dir == "x") {
    return ev.touches ? ev.changedTouches[0].clientX : ev.clientX;
  }
  if (dir == "y") {
    return ev.touches ? ev.changedTouches[0].clientY : ev.clientY;
  }
}

//Multiple event listeners
function AnimatorEventListeners(el, events, func) {
  let stringToArray = events.toLowerCase().split(" ");
  for (let i in stringToArray) {
    el.addEventListener(stringToArray[i], func);
  }
}

//From to value
function AnimatorFromTo(from, to, step) {
  return from + (to - from) * step;
}

//Get matrix from transform
function AnimatorGetTransformMatrix(el) {
  return window.getComputedStyle(typeof el == "string" ? document.querySelector(el) : el).getPropertyValue('transform').split(')')[0].split(', ');
}

//Animation using requestAnimationFrame
function Animator(obj = {}) {
  let t = this;
  let callFunc;
  
  t.obj = {
    curve: [0.25, 0, 0.5, 1],
    duration: 1000,
    reverse: false,
    loop: false,
    delay: 0,
    timeSync: true
  }
  for (var n in obj) {
    t.obj[n] = obj[n];
  }
  
  t._events = {}
  t.on = function(type, fn) {
    if ( !t._events[type] ) {
      t._events[type] = [];
    }
    
    t._events[type].push(fn);
  }
  t.off = function(type, fn) {
    if ( !t._events[type] ) { return; }
    
    var index = t._events[type].indexOf(fn);
    
    if ( index > -1 ) {
      t._events[type].splice(index, 1);
    }
  }
  t._execEvent = function(type) {
    if ( !t._events[type] ) { return; }
    
    var i = 0;
    l = t._events[type].length;
    
    if ( !l ) { return; }
    
    for ( ; i < l; i++ ) {
      t._events[type][i].apply(t, [].slice.call(arguments, 1));
    }
  }
  
  if (typeof t.obj.loop == "number") {
    t.loop = Math.max(1, Number(t.obj.loop));
  }
  else {
    t.loop = t.obj.loop == true ? Infinity : 1;
  }
  
  t.anim = {
    startTime: 0,
    time: 0,
    current: 0,
    success: false,
    isAnimating: false,
    curve: undefined,
    cache: -t.obj.delay / t.obj.duration,
    unsyncTime: 0
  }
  t.value = 0;
  t.currentTime = 0;
  t.duration = 0;
  
  t.update = (o) => {
    for (var n in o) {
      t.obj[n] = o[n];
    }
  }
  t.start = () => {
    callFunc = () => {
      if (typeof t.obj.loop == "number") {
        t.loop = Math.max(1, Number(t.obj.loop));
      }
      else {
        t.loop = t.obj.loop == true ? Infinity : 1;
      }
      t.anim.curve = BezierCurve(t.obj.curve);
      t.anim.unsyncTime += 1000 / 60;
      
      t.anim.time = t.anim.cache + ((t.obj.timeSync ? performance.now() : t.anim.unsyncTime) - t.anim.startTime) / t.obj.duration
      t.anim.current = t.anim.curve.get(Math.max(0, Math.min(1, t.obj.reverse == true ? 1 - (Math.min(t.loop, t.anim.time) == t.loop ? 1 : Math.max(0, t.anim.time)%1) : (Math.min(t.loop, t.anim.time) == t.loop ? 1 : Math.max(0, t.anim.time)%1))));
      t.value = t.anim.current;
      t.duration = (t.obj.duration / 1000) * t.loop;
      t.currentTime = Math.min(t.loop, t.anim.time) * (t.obj.duration / 1000);
      
      t._execEvent("animation.running");
      if (t.anim.time > t.loop) {
        t.anim.isAnimating = false;
        t.anim.success = true;
        t.anim.cache = -t.obj.delay / t.obj.duration;
        if (t.anim.success == true) {
          t._execEvent("animation.success");
        }
        t._execEvent("animation.end");
        return;
      }
      
      if (t.anim.isAnimating == true) {
        window.requestAnimationFrame(callFunc);
      }
    }
    t.anim.unsyncTime = performance.now();
    t.anim.startTime = t.obj.timeSync ? performance.now() : t.anim.unsyncTime;
    if (t.anim.isAnimating != true) {
      t.anim.isAnimating = true;
      t.anim.success = false;
      callFunc();
      t._execEvent("animation.start");
    }
    else {
      t.anim.cache = -t.obj.delay / t.obj.duration;
    }
  }
  t.pause = () => {
    if (t.anim.isAnimating == true) {
      t.anim.isAnimating = false;
      t.anim.success = false;
      window.requestAnimationFrame(() => {
        t.anim.cache = t.anim.time;
      });
      t._execEvent("animation.pause");
    }
  }
  t.stop = () => {
    if (t.anim.isAnimating == true || t.anim.cache > 0 || t.anim.cache < 0) {
      t.anim.isAnimating = false;
      t.anim.success = false;
      window.requestAnimationFrame(() => {
        t.anim.cache = -t.obj.delay / t.obj.duration;
      });
      t._execEvent("animation.end");
    }
  }
}

/** Collection Animator Library */
//Custom Scroll using Animator
function Animator_scroller(el, obj) {
  let elem = typeof el == "string" ? document.querySelector(el) : el;
  let inner = elem.querySelector("*");
  if (!inner) {
    throw AnimatorDevError(Error, "Can't find element child.");
  }
  elem.style.display = "block";
  elem.style.overflow = "hidden";
  elem.style.touchAction = "none";
  inner.style.overflow = "visible";
  
  obj = obj ? obj : {};
  let t = this;
  
  t.animator = new Animator();
  
  t.obj = {
    deceleration: obj.deceleration ? obj.deceleration : 0.034,
    speed: obj.speed ? obj.speed : 1,
    curve: obj.curve ? obj.curve : [0, 0, 0.15, 1],
    scrollX: obj.scrollX != null ? obj.scrollX : true,
    scrollY: obj.scrollY != null ? obj.scrollY : true
  }
  t.obj.deceleration = AnimatorClamp(0.025, 0.25, t.obj.deceleration);
  t.obj.speed = AnimatorClamp(0.5, 4, t.obj.speed);
  t.animator.update({
    curve: t.obj.curve
  });
  
  t.el = {
    container: elem,
    content: inner
  }
  
  t.dimension = {
    container: { width: elem.clientWidth, height: elem.clientHeight },
    content: { width: inner.scrollWidth, height: inner.scrollHeight },
    view: { width: 0, height: 0 }
  }
  t.pos = {
    x: 0,
    y: 0
  }
  t.gesture = {    
    x: 0, y: 0,
    
    startX: 0, startY: 0,
    
    pointX: 0, pointY: 0,
    
    velocityX: 0, velocityY: 0,
    
    moved: false,
    
    turned: false,
    
    prevX: 0, prevY: 0,
  }
  t.anim = {
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
  }
  
  AnimatorEventListeners(elem, "touchstart mousedown", (event) => {
    if (!t.gesture.turned) {
      t.animator.stop();
    
      t.gesture.startX = AnimatorAxisGesture(event, "x");
      t.gesture.startY = AnimatorAxisGesture(event, "y");
    
      t.gesture.x = t.gesture.startX;
      t.gesture.y = t.gesture.startY;
    
      t.gesture.pointX = t.pos.x;
      t.gesture.pointY = t.pos.y;
      
      t.gesture.prevX = t.pos.x;
      t.gesture.prevY = t.pos.y;
      
      t.gesture.velocityX = 0;
      t.gesture.velocityY = 0;
      
      t.gesture.turned = true;
      event.stopPropagation();
    }
  });
  AnimatorEventListeners(elem, "touchmove mousemove", (event) => {
    if (event.touches) { t.animator.stop(); t.gesture.turned = true; }
    if (t.gesture.turned) {
      t.gesture.x = AnimatorAxisGesture(event, "x");
      t.gesture.y = AnimatorAxisGesture(event, "y");
      
      if ((Math.abs(t.gesture.startX - t.gesture.x) > 0 ||
      Math.abs(t.gesture.startY - t.gesture.y) > 0) &&
      t.gesture.moved != true) {
        t.gesture.moved = true;
        t.gesture.pointX = t.pos.x;
        t.gesture.pointY = t.pos.y;
        t.gesture.startX = t.gesture.x;
        t.gesture.startY = t.gesture.y;
      }
      
      t.gesture.velocityX = (t.pos.x - t.gesture.prevX) * t.obj.speed;
      t.gesture.velocityY = (t.pos.y - t.gesture.prevY) * t.obj.speed;
      t.gesture.prevX = t.pos.x;
      t.gesture.prevY = t.pos.y;
      
      ae(
        t.gesture.pointX + (t.gesture.startX - t.gesture.x),
        t.gesture.pointY + (t.gesture.startY - t.gesture.y),
        1
      );
      event.stopPropagation();
    }
  });
  AnimatorEventListeners(elem, "touchend mouseleave mouseup", (event) => {  
    t.gesture.moved = false;
    t.gesture.turned = false;
    
    if (Math.abs(t.gesture.velocityX) < 4 && Math.abs(t.gesture.velocityY) < 4) {
      return;
    }
    
    t.anim.startX = t.pos.x;
    t.anim.startY = t.pos.y;
    t.anim.x = t.anim.startX + 
    (t.gesture.velocityX > 0 ? Math.pow(t.gesture.velocityX, 1.05) : 0 - Math.pow(-t.gesture.velocityX, 1.05)) * 0.625 / t.obj.deceleration;
    t.anim.y = t.anim.startY + 
    (t.gesture.velocityY > 0 ? Math.pow(t.gesture.velocityY, 1.05) : 0 - Math.pow(-t.gesture.velocityY, 1.05)) * 0.625 / t.obj.deceleration;
    t.animator.update({
      duration: AnimatorClamp(750, Infinity, Math.abs(Math.abs(t.gesture.velocityX) > Math.abs(t.gesture.velocityY) ? t.gesture.velocityX : t.gesture.velocityY) * 0.625 / t.obj.deceleration)
    });
    t.animator.update({
      duration: t.animator.obj.duration / (1 + (t.animator.obj.duration * t.obj.deceleration / 768)),
      curve: t.obj.curve
    });
    
    t.animator.start();
    event.stopPropagation();
  });
  
  t.animator.on("animation.running", () => {
    ae(
      t.anim.startX + ((t.anim.x - t.anim.startX) * t.animator.value),
      t.anim.startY + ((t.anim.y - t.anim.startY) * t.animator.value),
      1
    );
  });
  
  let resizeContainer = new ResizeObserver((entries) => {
    window.requestAnimationFrame(() => {
      ae(0, 0, 2);
    });
  });
  resizeContainer.observe(elem);
  let resizeContent = new ResizeObserver((entries) => {
    window.requestAnimationFrame(() => {
      ae(0, 0, 2);
    });
  });
  resizeContent.observe(inner);
  
  Object.defineProperties(t, {
    scrollLeft: {
      get: () => { return 0 - t.pos.x },
      set: (val) => { ae(val, t.pos.y, 0) },
      enumerable: true,
      configurable: true
    },
    scrollTop: {
      get: () => { return 0 - t.pos.y },
      set: (val) => { ae(t.pos.x, val, 0) },
      enumerable: true,
      configurable: true
    }
  });
  
  function ae(x = t.pos.x, y = t.pos.y, mode = 0) {
    if (mode == 2) {
      t.dimension.container.width = elem.clientWidth;
      t.dimension.container.height = elem.clientHeight;
      t.dimension.content.width = inner.scrollWidth;
      t.dimension.content.height = inner.scrollHeight;
      t.dimension.view.width = AnimatorClamp(0, Infinity, t.dimension.content.width - t.dimension.container.width);
      t.dimension.view.height = AnimatorClamp(0, Infinity, t.dimension.content.height - t.dimension.container.height);
      t.pos.x = AnimatorClamp(0, t.dimension.view.width, t.pos.x);
      t.pos.y = AnimatorClamp(0, t.dimension.view.height, t.pos.y);
      inner.style.transform = `translate(${0 - t.pos.x}px, ${0 - t.pos.y}px)`;
    }
    else if (mode == 1) {
      if (t.obj.scrollX && t.dimension.view.width != 0) {
        t.pos.x = AnimatorClamp(0, t.dimension.view.width, x);
      }
      if (t.obj.scrollY && t.dimension.view.height != 0) {
        t.pos.y = AnimatorClamp(0, t.dimension.view.height, y);
      }
      inner.style.transform = `translate(${0 - t.pos.x}px, ${0 - t.pos.y}px)`;
    }
    else {
      t.pos.x = AnimatorClamp(0, t.dimension.view.width, t.pos.x);
      t.pos.y = AnimatorClamp(0, t.dimension.view.height, t.pos.y);
      inner.style.transform = `translate(${0 - t.pos.x}px, ${0 - t.pos.y}px)`;
    }
    elem.scrollTo(0, 0);
  }
  ae(0, 0, 2);
}

//Fixed element set to position and size 
function Animator_fixedSetTo(tag, obj) {
  let t = this;
  t.obj = {
    animator: obj.animator ? obj.animator : {},
    from: {
      x: obj.from && obj.from.x ? obj.from.x : 0,
      y: obj.from && obj.from.y ? obj.from.y : 0,
      scale: obj.from && obj.from.scale != null ? obj.from.scale : 1,
      width: obj.from && obj.from.width ? obj.from.width : 0,
      height: obj.from && obj.from.height ? obj.from.height : 0,
      angle: {
        x: obj.from && obj.from.angle && obj.from.angle.x ? obj.from.angle.x : 0,
        y: obj.from && obj.from.angle && obj.from.angle.y ? obj.from.angle.y : 0,
        z: obj.from && obj.from.angle && obj.from.angle.z ? obj.from.angle.z : 0
      },
      borderRadius: {
        rightTop: obj.from && obj.from.borderRadius && obj.from.borderRadius.rightTop ? obj.from.borderRadius.rightTop : 0,
        rightBottom: obj.from && obj.from.borderRadius && obj.from.borderRadius.rightBottom ? obj.from.borderRadius.rightBottom : 0,
        leftBottom: obj.from && obj.from.borderRadius && obj.from.borderRadius.leftBottom ? obj.from.borderRadius.leftBottom : 0,
        leftTop: obj.from && obj.from.borderRadius && obj.from.borderRadius.leftTop ? obj.from.borderRadius.leftTop : 0,
      },
      opacity: obj.from && obj.from.opacity != null ? obj.from.opacity : 1
    },
    to: {
      x: obj.to && obj.to.x ? obj.to.x : 0,
      y: obj.to && obj.to.y ? obj.to.y : 0,
      scale: obj.to && obj.to.scale != null ? obj.to.scale : 1,
      width: obj.to && obj.to.width ? obj.to.width : 0,
      height: obj.to && obj.to.height ? obj.to.height : 0,
      angle: {
        x: obj.to && obj.to.angle && obj.to.angle.x ? obj.to.angle.x : 0,
        y: obj.to && obj.to.angle && obj.to.angle.y ? obj.to.angle.y : 0,
        z: obj.to && obj.to.angle && obj.to.angle.z ? obj.to.angle.z : 0
      },
      borderRadius: {
        rightTop: obj.to && obj.to.borderRadius && obj.to.borderRadius.rightTop ? obj.to.borderRadius.rightTop : 0,
        rightBottom: obj.to && obj.to.borderRadius && obj.to.borderRadius.rightBottom ? obj.to.borderRadius.rightBottom : 0,
        leftBottom: obj.to && obj.to.borderRadius && obj.to.borderRadius.leftBottom ? obj.to.borderRadius.leftBottom : 0,
        leftTop: obj.to && obj.to.borderRadius && obj.to.borderRadius.leftTop ? obj.to.borderRadius.leftTop : 0,
      },
      opacity: obj.to && obj.to.opacity != null ? obj.to.opacity : 1
    },
    zIndex: obj.zIndex ? obj.zIndex : 1000,
    prop: obj.prop ? obj.prop : {},
    css: obj.css ? obj.css : {},
    attribute: obj.attribute ? obj.attribute : {}
  }
  t.animator = new Animator(t.obj.animator);
  
  t.cssEl = document.createElement(tag);
  
  for (let prop in t.obj.prop) {
    t.cssEl[prop] = t.obj.prop[prop];
  }
  for (let css in t.obj.css) {
    t.cssEl.style[css] = t.obj.css[css];
  }
  for (let attribute in t.obj.attribute) {
    t.cssEl.setAttribute(attribute, t.obj.attribute[attribute]);
  }
  t.cssEl.style.position = "absolute";
  t.cssEl.style.left = "0px";
  t.cssEl.style.top = "0px";
  t.cssEl.style.zIndex = t.obj.zIndex; 
  
  document.body.appendChild(t.cssEl);
  
  t.animator.on("animation.running", function() {
    t.cssEl.style.width = `${AnimatorFromTo(t.obj.from.width, t.obj.to.width, this.value)}px`;
    t.cssEl.style.height = `${AnimatorFromTo(t.obj.from.height, t.obj.to.height, this.value)}px`;
    t.cssEl.style.transform = `
      translateX(${AnimatorFromTo(t.obj.from.x, t.obj.to.x, this.value)}px) 
      translateY(${AnimatorFromTo(t.obj.from.y, t.obj.to.y, this.value)}px) 
      rotateX(${AnimatorFromTo(t.obj.from.angle.x, t.obj.to.angle.x, this.value)}deg) 
      rotateY(${AnimatorFromTo(t.obj.from.angle.y, t.obj.to.angle.y, this.value)}deg) 
      rotateZ(${AnimatorFromTo(t.obj.from.angle.z, t.obj.to.angle.z, this.value)}deg) 
      scale(${AnimatorFromTo(t.obj.from.scale, t.obj.to.scale, this.value)})
    `;
    t.cssEl.style.borderRadius = `${AnimatorFromTo(t.obj.from.borderRadius.leftTop, t.obj.to.borderRadius.leftTop, this.value)}px ${AnimatorFromTo(t.obj.from.borderRadius.rightTop, t.obj.to.borderRadius.rightTop, this.value)}px ${AnimatorFromTo(t.obj.from.borderRadius.rightBottom, t.obj.to.borderRadius.rightBottom, this.value)}px ${AnimatorFromTo(t.obj.from.borderRadius.leftBottom, t.obj.to.borderRadius.leftBottom, this.value)}px `;
    t.cssEl.style.opacity = `${AnimatorFromTo(t.obj.from.opacity, t.obj.to.opacity, this.value)}`;
  });
  t.animator.on("animation.success", function() {
    document.body.removeChild(t.cssEl);
    t.animator = undefined;
  });
  
  t.animator.start();
  
}

/**
  * Like CSS Transition or Animation timing function (e.g. "ease" and "cubic-bezier(0, 0, 0.5, 1)") but for javascript with requestAnimationFrame, using BezierCurve( {curveName[e.g. "ease"], curveArray[e.g. [0, 0, 0.5, 1]], curveString[e.g. "cubic-bezier: 0, 0, 0.5, 1"]} );
  * Thank you for Gaëtan Renaudeau to calculate cubic-bezier function using BezierEasing.
  * And added correction curve name, string, and array like CSS Transition or Animation timing function.
*/
function BezierCurve(bezier) {
  /**
  * BezierEasing - use bezier curve for transition easing function
  * by Gaëtan Renaudeau 2014 - 2015 – MIT License
  *
  * Credits: is based on Firefox's nsSMILKeySpline.cpp
  * Usage:
  * var spline = BezierEasing([ 0.25, 0.1, 0.25, 1.0 ])
  * spline.get(x) => returns the easing value | x must be in [0, 1] range
  *
  */
  
  // These values are established by empiricism with tests (tradeoff: performance VS precision)
  var NEWTON_ITERATIONS = 4;
  var NEWTON_MIN_SLOPE = 0.001;
  var SUBDIVISION_PRECISION = 0.0000001;
  var SUBDIVISION_MAX_ITERATIONS = 10;
  
  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
  
  var float32ArraySupported = typeof Float32Array === "function";
  
  function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
  function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
  function C (aA1)      { return 3.0 * aA1; }
  
  // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
  function calcBezier (aT, aA1, aA2) {
  return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
  }
  
  // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
  function getSlope (aT, aA1, aA2) {
  return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }
  
  function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
  currentT = aA + (aB - aA) / 2.0;
  currentX = calcBezier(currentT, mX1, mX2) - aX;
  if (currentX > 0.0) {
  aB = currentT;
  } else {
  aA = currentT;
  }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
  }
  
  function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
  for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
  var currentSlope = getSlope(aGuessT, mX1, mX2);
  if (currentSlope === 0.0) return aGuessT;
  var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
  aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
  }
  
  /**
  * points is an array of [ mX1, mY1, mX2, mY2 ]
  */
  function BezierEasing (points, b, c, d) {
  if (arguments.length === 4) {
  return new BezierEasing([ points, b, c, d ]);
  }
  if (!(this instanceof BezierEasing)) return new BezierEasing(points);
  
  if (!points || points.length !== 4) {
  throw new Error("BezierEasing: points must contains 4 values");
  }
  for (var i=0; i<4; ++i) {
  if (typeof points[i] !== "number" || isNaN(points[i]) || !isFinite(points[i])) {
  throw new Error("BezierEasing: points should be integers.");
  }
  }
  if (points[0] < 0 || points[0] > 1 || points[2] < 0 || points[2] > 1) {
  throw new Error("BezierEasing x values must be in [0, 1] range.");
  }
  
  this._str = "BezierEasing("+points+")";
  this._css = "cubic-bezier("+points+")";
  this._p = points;
  this._mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  this._precomputed = false;
  
  this.get = this.get.bind(this);
  }
  
  BezierEasing.prototype = {
  
  get: function (x) {
  var mX1 = this._p[0],
  mY1 = this._p[1],
  mX2 = this._p[2],
  mY2 = this._p[3];
  if (!this._precomputed) this._precompute();
  if (mX1 === mY1 && mX2 === mY2) return x; // linear
  // Because JavaScript number are imprecise, we should guarantee the extremes are right.
  if (x === 0) return 0;
  if (x === 1) return 1;
  return calcBezier(this._getTForX(x), mY1, mY2);
  },
  
  getPoints: function() {
  return this._p;
  },
  
  toString: function () {
  return this._str;
  },
  
  toCSS: function () {
  return this._css;
  },
  
  // Private part
  
  _precompute: function () {
  var mX1 = this._p[0],
  mY1 = this._p[1],
  mX2 = this._p[2],
  mY2 = this._p[3];
  this._precomputed = true;
  if (mX1 !== mY1 || mX2 !== mY2)
  this._calcSampleValues();
  },
  
  _calcSampleValues: function () {
  var mX1 = this._p[0],
  mX2 = this._p[2];
  for (var i = 0; i < kSplineTableSize; ++i) {
  this._mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }
  },
  
  /**
  * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
  */
  _getTForX: function (aX) {
  var mX1 = this._p[0],
  mX2 = this._p[2],
  mSampleValues = this._mSampleValues;
  
  var intervalStart = 0.0;
  var currentSample = 1;
  var lastSample = kSplineTableSize - 1;
  
  for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
  intervalStart += kSampleStepSize;
  }
  --currentSample;
  
  // Interpolate to provide an initial guess for t
  var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample+1] - mSampleValues[currentSample]);
  var guessForT = intervalStart + dist * kSampleStepSize;
  
  var initialSlope = getSlope(guessForT, mX1, mX2);
  if (initialSlope >= NEWTON_MIN_SLOPE) {
  return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
  } else if (initialSlope === 0.0) {
  return guessForT;
  } else {
  return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
  }
  }
  };
  
  // CSS mapping
  BezierEasing.css = {
  "ease":        BezierEasing.ease      = BezierEasing(0.25, 0.1, 0.25, 1.0),
  "linear":      BezierEasing.linear    = BezierEasing(0.00, 0.0, 1.00, 1.0),
  "ease-in":     BezierEasing.easeIn    = BezierEasing(0.42, 0.0, 1.00, 1.0),
  "ease-out":    BezierEasing.easeOut   = BezierEasing(0.00, 0.0, 0.58, 1.0),
  "ease-in-out": BezierEasing.easeInOut = BezierEasing(0.42, 0.0, 0.58, 1.0)
  };
  
  // Generate Bezier
  bezier = bezier ? bezier : "";
  let bezierString = typeof bezier == "string" ? bezier.toLowerCase() : "";
  if (bezierString == "ease") {
    return BezierEasing.ease;
  }
  else if (bezierString == "linear") {
    return BezierEasing.linear;
  }
  else if (bezierString == "ease-in") {
    return BezierEasing.easeIn;
  }
  else if (bezierString == "ease-out") {
    return BezierEasing.easeOut;
  }
  else if (bezierString == "ease-in-out") {
    return BezierEasing.easeInOut;
  }
  else if (typeof bezier == "object" && bezier.length == 4 && bezier[0] >= 0 && bezier[0] <= 1 && bezier[2] >= 0 && bezier[2] <= 1) {
    return BezierEasing(bezier[0], bezier[1], bezier[2], bezier[3]);
  }
  else if (/cubic-bezier:/i.test(bezierString)) {
    let curveStr = bezierString.replace(/cubic-bezier:/i, "").split(",");
    if (curveStr.length == 4 &&
    curveStr[0] >= 0 &&
    curveStr[0] <= 1 &&
    curveStr[2] >= 0 &&
    curveStr[2] <= 1) {
      return BezierEasing(
        Number(curveStr[0]),
        Number(curveStr[1]),
        Number(curveStr[2]),
        Number(curveStr[3])
      );
    }
    else {
      return BezierEasing.ease;
    }
  }
  else {
    return BezierEasing.ease;
  }
}



//SuperGesture and Animator required
window.addEventListener("error", function(e) {
	if (e.message == "ResizeObserver loop limit exceeded") {
		e.preventDefault();
	}
});

function SuperScroller(el, opt = {}) {
	var t = this;
	t.SG = new SuperGesture(el, {multiTouch: true});
	t.A = new Animator({timeSync: true});
	if (t.SG.el.querySelectorAll("*").length == 0 || t.SG.el.hasAttribute("superscroller-init")) {
		return;
	}	
	
	t.opt = {
		inertia: 0.04,
		bounceTime: 600,
		transform: true,
		transition: true,
		contentEl: null,
		scrollX: true,
		scrollY: true,
		bounce: true,
		scrollbar: true,
		scrollMode: "android" // Some like realme, SAMSUNG, iOS, Android scroll animation
	}
	for (var opts in opt) {
		t.opt[opts] = opt[opts];
	}
	
	t.scrollerMode = {
		curve: [0, 0, 0.2, 1],
		damping: 1,
		duration: 1
	}
	t.setScrollMode = function(name = "android") {
		name = name.toLowerCase();
		if (name == "android") {
			t.scrollerMode.curve = [0, 0, 0.2, 1],
			t.scrollerMode.damping = 1;
			t.scrollerMode.duration = 1;
		}
		else if (name == "realme") {
			t.scrollerMode.curve = [0, 0.25, 0.2, 0.9];
			t.scrollerMode.damping = 0.75;
			t.scrollerMode.duration = 4;
		}
		else if (name == "samsung") {
			t.scrollerMode.curve = [0, 0.25, 0.4, 1];
			t.scrollerMode.damping = 0.5;
			t.scrollerMode.duration = 5;
		}
		else if (name == "microsoft") {
			t.scrollerMode.curve = [0, 0, 0.5, 1];
			t.scrollerMode.damping = 0.75;
			t.scrollerMode.duration = 1;
		}
		else if (name == "macos") {
			t.scrollerMode.curve = [0, 0, 0, 1];
			t.scrollerMode.damping = 1;
			t.scrollerMode.duration = 4;
		}
		else {
			t.scrollerMode.curve = [0, 0, 0.2, 1];
			t.scrollerMode.damping = 1;
			t.scrollerMode.duration = 1;
		}
	}
	t.setScrollMode(t.opt.scrollMode);
	
	t.el = t.SG.el;
	t.contentEl = t.opt.contentEl != null ? (typeof t.opt.contentEl == "string" ? t.el.querySelector(t.opt.contentEl) : t.opt.contentEl) : t.el.querySelector("*");
	t.el.style.cssText += "display: block; overflow: hidden; touch-action: none; position: relative; " + (t.el.tagName == "HTML" ? "max-width: 100vw; max-height: 100vh; " : "");
	t.contentEl.style.cssText += "position: relative; overflow: visible; width: auto; height: auto;";
 	
	var startX = t.el.scrollLeft, startY = t.el.scrollTop;
	t.el.scrollTo(0, 0);
	
	t.pos = {
		x: 0,
		y: 0
	}
	
	t.delta = {
		x: 0,
		y: 0
	}
	
	t.vel = {
		prevX: 0,
		prevY: 0,
		x: 0,
		y: 0,
		addX: 0,
		addY: 0
	}
	t.flingVel = {
		x: 0,
		y: 0
	}
	
	t.anim = {
		start: {
			x: 0, y: 0
		},
		end: {
			x: 0, y: 0
		}
	}
	
	t.scrollbar = {
		el: {
			tracks: {
				x: document.createElement("superscroller-scrollbar-track-x"),
				y: document.createElement("superscroller-scrollbar-track-y")
			},
			thumbs: {
				x: document.createElement("superscroller-scrollbar-thumb-x"),
				y: document.createElement("superscroller-scrollbar-thumb-y")
			}
		},
		x: {
			size: 0,
			move: 0,
			over: 0
		},
		y: {
			size: 0,
			move: 0,
			over: 0
		},
		update: function() {},
		transitionRAF: false
	}
	t.el.appendChild(t.scrollbar.el.tracks.x);
	t.scrollbar.el.tracks.x.appendChild(t.scrollbar.el.thumbs.x);
	t.el.appendChild(t.scrollbar.el.tracks.y);
	t.scrollbar.el.tracks.y.appendChild(t.scrollbar.el.thumbs.y);
	t.scrollbar.el.tracks.x.style.cssText = `
		display: block; 
		position: absolute; 
		left: 2px; 
		bottom: 2px; 
		width: calc(100% - 4px); 
		height: 4px; 
		opacity: 0.5; 
		overflow: hidden; 
		visibility: hidden; 
		z-index: 1; 
	`;
	t.scrollbar.el.thumbs.x.style.cssText = `
		display: block; 
		position: relative; 
		left: 0px; 
		width: 100%; 
		height: 100%; 
		background-color: #888; 
	`;
	t.scrollbar.el.tracks.y.style.cssText = `
		display: block; 
		position: absolute; 
		right: 2px; 
		top: 2px; 
		width: 4px; 
		height: calc(100% - 4px); 
		opacity: 0.5; 
		overflow: hidden; 
		visibility: hidden; 
		z-index: 1; 
	`;
	t.scrollbar.el.thumbs.y.style.cssText = `
		display: block; 
		position: relative; 
		top: 0px; 
		width: 100%; 
		height: 100%; 
		background-color: #888; 
	`;
	
	t.gesture = {
		press: false
	}
	var calcDimensions = function() {
		t.dims = {
			container: {
				x: t.el.clientWidth,
				y: t.el.clientHeight
			},
			content: {
				x: t.contentEl.scrollWidth,
				y: t.contentEl.scrollHeight
			},
			max: {}
		}
		t.dims.max = {
			x: Math.max(0, t.dims.content.x - t.dims.container.x),
 			y: Math.max(0, t.dims.content.y - t.dims.container.y)
		}
	}
	calcDimensions();
	
	var calcPos = function() {
		if (t.opt.transform == true) {
			var currPos = window.getComputedStyle(t.contentEl).getPropertyValue('transform').split(')')[0].split(', ');
			x = +(currPos[12] || currPos[4]);
			y = +(currPos[13] || currPos[5]);
			x = isNaN(x) ? 0 : x;
			y = isNaN(y) ? 0 : y;
		}
		else {
			var currPos = window.getComputedStyle(t.contentEl);
			x = parseFloat(currPos.getPropertyValue('left'), 10);
			y = parseFloat(currPos.getPropertyValue('top'), 10);
		}
		return {
			x: Number(x),
			y: Number(y)
		}
	}
	var clamp = function(min, max, value) {
		return Math.max(min, Math.min(max, value));
	}
	
	t.scrollbar.update = function() {
		calcDimensions();
		if (t.opt.transition && t.scrollbar.transitionRAF) {
			t.pos.x = -calcPos().x;
			t.pos.y = -calcPos().y;
		}
		
		t.vel.x = t.pos.x - t.vel.prevX;
		t.vel.y = t.pos.y - t.vel.prevY;
		t.vel.prevX = t.pos.x;
		t.vel.prevY = t.pos.y;
		
		t.scrollbar.el.tracks.x.style.width = t.dims.max.x != 0 && t.dims.max.y != 0 ? "calc(100% - 10px)" : "calc(100% - 4px)";
		t.scrollbar.el.tracks.y.style.height = t.dims.max.x != 0 && t.dims.max.y != 0 ? "calc(100% - 10px)" : "calc(100% - 4px)";
		
		t.scrollbar.x.over = clamp(0, Infinity, t.pos.x < 0 ? -t.pos.x : t.pos.x - t.dims.max.x);
		t.scrollbar.y.over = clamp(0, Infinity, t.pos.y < 0 ? -t.pos.y : t.pos.y - t.dims.max.y);
		
		t.scrollbar.x.size = Math.max(t.scrollbar.el.tracks.x.clientHeight, clamp(40, t.scrollbar.el.tracks.x.clientWidth, t.scrollbar.el.tracks.x.clientWidth * (t.dims.container.x / t.dims.content.x)) - t.scrollbar.x.over);
		t.scrollbar.y.size = Math.max(t.scrollbar.el.tracks.y.clientWidth, clamp(40, t.scrollbar.el.tracks.y.clientHeight, t.scrollbar.el.tracks.y.clientHeight * (t.dims.container.y / t.dims.content.y)) - t.scrollbar.y.over);
		
		t.scrollbar.x.move = (clamp(0, t.dims.max.x, t.pos.x) / t.dims.max.x) * (t.scrollbar.el.tracks.x.clientWidth - t.scrollbar.x.size);
		t.scrollbar.y.move = (clamp(0, t.dims.max.y, t.pos.y) / t.dims.max.y) * (t.scrollbar.el.tracks.y.clientHeight - t.scrollbar.y.size);
		
		t.scrollbar.el.tracks.x.style.visibility = t.opt.scrollbar && t.dims.max.x != 0 && t.opt.scrollX ? "visible" : "hidden";
		t.scrollbar.el.tracks.y.style.visibility = t.opt.scrollbar && t.dims.max.y != 0 && t.opt.scrollY ? "visible" : "hidden";
		
		t.scrollbar.el.thumbs.x.style.width = t.scrollbar.x.size + "px";
		t.scrollbar.el.thumbs.y.style.height = t.scrollbar.y.size + "px";
		
		t.scrollbar.el.thumbs.x.style.left = t.scrollbar.x.move + "px";
		t.scrollbar.el.thumbs.y.style.top = t.scrollbar.y.move + "px";
		
		if (!t.press) {
			t.vel.addX = t.vel.x * 2;
			t.vel.addY = t.vel.y * 2;
		}
		
		if (t.opt.transition && t.scrollbar.transitionRAF && !t.press && (t.flingVel.x != 0 || t.flingVel.y != 0)) {
			if (t.vel.x != 0 || t.vel.y != 0) {
				t.scrollbar.el.tracks.x.style.transition = "opacity 0ms";
				t.scrollbar.el.tracks.x.style.opacity = "0.5";
				t.scrollbar.el.tracks.y.style.transition = "opacity 0ms";
				t.scrollbar.el.tracks.y.style.opacity = "0.5";
			}
			else {
				t.scrollbar.el.tracks.x.style.transition = "opacity 500ms 250ms";
				t.scrollbar.el.tracks.x.style.opacity = "0";
				t.scrollbar.el.tracks.y.style.transition = "opacity 500ms 250ms";
				t.scrollbar.el.tracks.y.style.opacity = "0";
			}
			window.requestAnimationFrame(t.scrollbar.update);
		}
		else {
			if (t.press) {
				t.scrollbar.el.tracks.x.style.transition = "opacity 0ms";
				t.scrollbar.el.tracks.x.style.opacity = "0.5";
				t.scrollbar.el.tracks.y.style.transition = "opacity 0ms";
				t.scrollbar.el.tracks.y.style.opacity = "0.5";
			}
		}
	}
	
	var setPos = function(x, y, duration = 0, ease = "ease") {
		if (t.opt.transition != true && duration != 0) {
			t.A.update({duration: duration, curve: ease});
			t.contentEl.style.transition = "";
			if (t.opt.transform == true) {
				t.contentEl.style.left = "0px";
				t.contentEl.style.top = "0px";
				t.contentEl.style.transform = `translate(${x}px, ${y}px)`;
			}
			else {
				t.contentEl.style.left = x + "px";
				t.contentEl.style.top = y + "px";
				t.contentEl.style.transform = "";
			}
			return;
		}
		
		var bezier = typeof ease == "object" ? `cubic-bezier(${ease[0]}, ${ease[1]}, ${ease[2]}, ${ease[3]})` : ease;
		if (t.opt.transform == true) {
			t.contentEl.style.transition = `transform ${duration}ms ${bezier}`;
			t.contentEl.style.left = "0px";
			t.contentEl.style.top = "0px";
			t.contentEl.style.transform = `translate(${x}px, ${y}px)`;
		}
		else {
			t.contentEl.style.transition = `left ${duration}ms ${bezier}, top ${duration}ms ${bezier}`;
			t.contentEl.style.left = x + "px";
			t.contentEl.style.top = y + "px";
			t.contentEl.style.transform = "";
		}
		t.scrollbar.update();
	}
	
	t.scrollTo = function(x, y, duration = 0, outside = false, ease) {
		calcDimensions();
		t.anim.start.x = t.pos.x;
		t.anim.start.y = t.pos.y;
		
		t.pos.x = outside ? x : clamp(0, t.dims.max.x, x);
		t.pos.y = outside ? y : clamp(0, t.dims.max.y, y);

		t.anim.end.x = t.pos.x;
		t.anim.end.y = t.pos.y;
		
		setPos(-t.pos.x, -t.pos.y, duration, ease);
 			
 		if (t.opt.transition != true && duration != 0) {
 			t.A.start();
		}
		else {
			t.A.stop();
		}
	}
	t.scrollBy = function(x, y, duration = 0, outside = false, ease) {
		calcDimensions();
		t.anim.start.x = t.pos.x;
		t.anim.start.y = t.pos.y;
		
		var calc = calcPos();
		t.pos.x = outside ? x - calc.x : clamp(0, t.dims.max.x, x - calc.x);
		t.pos.y = outside ? y - calc.y : clamp(0, t.dims.max.y, y - calc.y);
		
		t.anim.end.x = t.pos.x;
		t.anim.end.y = t.pos.y;
		
		setPos(-t.pos.x, -t.pos.y, duration, ease);
 			
 		if (t.opt.transition != true && duration != 0) {
 			t.A.start();
 		}
 		else {
 			t.A.stop();
 		}
	}
	
	var debounce, debounce2, debounce3;
	t.SG.listen.onStart(function(e) {
		debounce = window.requestAnimationFrame(function() {
			debounce2 = window.requestAnimationFrame(function() {
				debounce3 = window.requestAnimationFrame(function() {
					t.scrollbar.transitionRAF = false;
					
					t.scrollTo(-calcPos().x, -calcPos().y, 0, true);
				});
			});
		});
		
		t.el.scrollTo(0, 0);
	});
	t.SG.listen.onSwipeLock(function(e) {
		window.cancelAnimationFrame(debounce);
		window.cancelAnimationFrame(debounce2);
		window.cancelAnimationFrame(debounce3);
		
		t.scrollbar.transitionRAF = false;
		t.press = true;
		t.delta.x = t.dims.max.x != 0 && t.opt.scrollX ? e.deltaX : 0,
		t.delta.y = t.dims.max.y != 0 && t.opt.scrollY ? e.deltaY : 0;
		ux = 1 + (t.pos.x < 0 ? (t.delta.x > 0 ? Math.max(0, 0 - t.pos.x) : 0) : (t.delta.x < 0 ? Math.max(0, t.pos.x - t.dims.max.x) : 0)) / (t.dims.container.x / 10);
		uy = 1 + (t.pos.y < 0 ? (t.delta.y > 0 ? Math.max(0, 0 - t.pos.y) : 0) : (t.delta.y < 0 ? Math.max(0, t.pos.y - t.dims.max.y) : 0)) / (t.dims.container.y / 10);
		
		t.scrollTo(t.pos.x - t.delta.x / ux, t.pos.y - t.delta.y / uy, 0, t.opt.bounce);
	});
	t.SG.listen.onFlingLock(function(e) {
		t.press = false;
		t.scrollbar.transitionRAF = true;
		
		t.flingVel.x = e.deltaX;
		t.flingVel.y = e.deltaY;
		
		t.vel.addX = e.deltaX == 0 ? 0 : (e.deltaX < 0 ? Math.max(0, t.vel.addX) : -Math.max(0, -t.vel.addX));
 		t.vel.addY = e.deltaY == 0 ? 0 : (e.deltaY < 0 ? Math.max(0, t.vel.addY) : -Math.max(0, -t.vel.addY));
		t.delta.x = t.dims.max.x != 0 && t.opt.scrollX ? e.deltaX - t.vel.addX : 0;
		t.delta.y = t.dims.max.y != 0 && t.opt.scrollY ? e.deltaY - t.vel.addY : 0;
		t.vel.addX = t.delta.x * 2;
		t.vel.addY = t.delta.y * 2;
		
		if (t.pos.x < 0 || t.pos.y < 0 || t.pos.x > t.dims.max.x || t.pos.y > t.dims.max.y) {
			t.scrollTo(t.pos.x, t.pos.y, t.opt.bounceTime, false, [0.3, 0.8, 0.3, 1]);
			
			return;
		}
		var xx = -(t.dims.max.x == 0 ? 0 : t.delta.x * 6 * (0.15 / t.opt.inertia)) * (1 / t.scrollerMode.damping);
		var yy = -(t.dims.max.y == 0 ? 0 : t.delta.y * 6 * (0.15 / t.opt.inertia)) * (1 / t.scrollerMode.damping);
		
		if (t.pos.x + xx < 0 || t.pos.y + yy < 0 || t.pos.x + xx > t.dims.max.x || t.pos.y + yy > t.dims.max.y) {
			var disVel = Math.abs(Math.abs(t.delta.x) > Math.abs(t.delta.y) ? t.delta.x : t.delta.y);				
			if (t.pos.x + xx < 0 || t.pos.x + xx > t.dims.max.x) {
				var durrX = Math.abs(t.delta.x < 0 ? t.pos.x - t.dims.max.x : 0 - t.pos.x) / (disVel / 80);
				var durrY = 0;
			}
			else {
				var durrX = 0;
				var durrY = Math.abs(t.delta.y < 0 ? t.pos.y - t.dims.max.y : 0 - t.pos.y) / (disVel / 80);
			}
			
			t.scrollTo(clamp(0, t.dims.max.x, t.pos.x + xx) + xx / ((80 / (t.opt.inertia / 0.04)) / (t.scrollerMode.damping / 1)), clamp(0, t.dims.max.y, t.pos.y + yy) + yy / ((80 / (t.opt.inertia / 0.04)) / (t.scrollerMode.damping / 1)), (durrX + durrY) * (t.scrollerMode.damping / 1), t.opt.bounce, [0, 0, 0.4, 1]);
			
			return;
		}
		var durr = (Math.abs(Math.abs(t.delta.x) > Math.abs(t.delta.y) ? t.delta.x : t.delta.y)) * t.scrollerMode.duration;
		var duration = (durr / Math.pow(durr, 1 / 1.75)) * 240 / (t.opt.inertia / 0.04);
		t.scrollBy(xx, yy, duration, true, t.scrollerMode.curve);
	});
	t.contentEl.addEventListener("transitionend", function() {
		t.pos.x = -calcPos().x;
		t.pos.y = -calcPos().y;
		if ((t.pos.x < 0 || t.pos.y < 0 || t.pos.x > t.dims.max.x || t.pos.y > t.dims.max.y) && !t.press && t.opt.transition) {
			t.scrollTo(t.pos.x, t.pos.y, t.opt.bounceTime, false, [0.3, 0.8, 0.3, 1]);
		}
		else {
			t.scrollbar.transitionRAF = false;
			t.scrollbar.el.tracks.x.style.transition = "opacity 500ms 250ms";
			t.scrollbar.el.tracks.x.style.opacity = "0";
			t.scrollbar.el.tracks.y.style.transition = "opacity 500ms 250ms";
			t.scrollbar.el.tracks.y.style.opacity = "0";
		}
	});
	t.A.on("animation.end", function() {
		if ((t.pos.x < 0 || t.pos.y < 0 || t.pos.x > t.dims.max.x || t.pos.y > t.dims.max.y) && !t.press && !t.opt.transition) {
			t.scrollTo(t.pos.x, t.pos.y, t.opt.bounceTime, false, [0.3, 0.8, 0.3, 1]);
		}
		else {
			t.scrollbar.el.tracks.x.style.transition = "opacity 500ms 250ms";
			t.scrollbar.el.tracks.x.style.opacity = "0";
			t.scrollbar.el.tracks.y.style.transition = "opacity 500ms 250ms";
			t.scrollbar.el.tracks.y.style.opacity = "0";
		}
	});
	
	t.A.on("animation.running", function() {
		if (t.opt.transition) { return; }
		t.pos.x = t.anim.start.x + (t.anim.end.x - t.anim.start.x) * this.value;
 		t.pos.y = t.anim.start.y + (t.anim.end.y - t.anim.start.y) * this.value;
		if (t.opt.transform == true) {
			t.contentEl.style.left = "0px";
			t.contentEl.style.top = "0px";
			t.contentEl.style.transform = `translate(${-t.pos.x}px, ${-t.pos.y}px)`;
		}
		else {
			t.contentEl.style.left = -t.pos.x + "px";
			t.contentEl.style.top = -t.pos.y + "px";
			t.contentEl.style.transform = "";
		}
		t.scrollbar.update();
	});
	
	t.scrollTo(startX, startY);
	t.scrollbar.update();
	
	t.scrollbar.el.tracks.x.style.transition = "opacity 500ms 250ms";
	t.scrollbar.el.tracks.x.style.opacity = "0";
	t.scrollbar.el.tracks.y.style.transition = "opacity 500ms 250ms";
	t.scrollbar.el.tracks.y.style.opacity = "0";
	
	t.el.setAttribute("superscroller-init", "");
}