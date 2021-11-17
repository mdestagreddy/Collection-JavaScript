/**
  @2021 mdestagreddy Github
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
function Animator(obj) {
  obj = obj ? obj : {};
  let t = this;
  let callFunc;
  
  t.obj = {
    curve: obj.curve ? obj.curve : [0.25, 0, 0.5, 1],
    duration: obj.duration ? obj.duration : 1000,
    reverse: obj.reverse ? obj.reverse : false,
    loop: obj.loop ? obj.loop : false,
    delay: obj.delay ? obj.delay : 0
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
    cache: -t.obj.delay / t.obj.duration
  }
  t.value = 0;
  t.currentTime = 0;
  t.duration = 0;
  
  t.update = (o) => {
    t.obj.curve = o.curve ? o.curve : t.obj.curve;
    t.obj.duration = o.duration ? o.duration : t.obj.duration;
    t.obj.reverse = o.reverse != null ? o.reverse : t.obj.reverse;
    t.obj.loop = o.loop != null ? o.loop : t.obj.loop;
    t.obj.delay = o.delay ? o.delay : t.obj.delay;
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
      t.anim.time = t.anim.cache + (performance.now() - t.anim.startTime) / t.obj.duration
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
    t.anim.startTime = performance.now();
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