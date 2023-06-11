window.SNetworkSpeed = {};

window.SNetworkSpeed.styles = document.createElement("style");
window.SNetworkSpeed.styles.innerHTML = `
    .snetworkspeed-container {
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        min-width: 180px !important;
        min-height: 420px !important;
        width: 180px;
        height: 420px;
        position: relative !important;
        user-select: none !important;
        font-family: sans-serif;
        background-color: white;
        border: 2px solid rgba(128, 128, 128, 0.25);
        border-radius: 8px;
    }
    .snetworkspeed-container > snetworkspeed-analog {
        display: block !important;
        width: 100% !important;
        height: 180px !important;
        position: relative !important;
        flex-shrink: 0;
    }
    .snetworkspeed-container > snetworkspeed-analog > snetworkspeed-analog-border {
        border-left: 12px solid #ACF;
        border-top: 12px solid #ACF;
        border-right: 12px solid #ACF;
        border-bottom: 12px solid transparent;
        border-radius: 100% !important;
        transform: translate(-50%, -50%) !important;
        transform-origin: 50% !important;
        display: block !important;
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        width: calc(180px - 48px) !important;
        height: calc(180px - 48px) !important;
    }
    .snetworkspeed-container > snetworkspeed-analog > snetworkspeed-number-counts {
        display: block !important;
        position: absolute !important;
        width: calc(180px - 48px - 8px) !important;
        height: calc(180px - 48px - 8px) !important;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    .snetworkspeed-container > snetworkspeed-analog > snetworkspeed-number-counts > snetworkspeed-number-counts-num {
        width: auto !important;
        height: calc(180px - 48px - 8px) !important;
        transform-origin: 50% 50% !important;
        position: absolute !important;
        left: 50% !important;
        top: 50% !important;
        display: inline-block !important;
        font-size: 12px;
        font-weight: 600;
    }
    .snetworkspeed-container > snetworkspeed-analog > snetworkspeed-ring-arrow {
        display: block !important;
        width: 18px !important;
        height: 18px !important;
        background-color: #6AF;
        border-radius: 100%;
        position: absolute !important;
        left: calc(50% - 9px) !important;
        top: calc(50% - 9px) !important;
        transform-origin: 9px 9px !important;
        transition: 0ms !important;
    }
    .snetworkspeed-container > snetworkspeed-analog > snetworkspeed-ring-arrow > snetworkspeed-arrow {
        width: calc(90px - 24px + 10.5px) !important;
        height: 6px !important;
        background-color: #6AF;
        border-radius: 6px;
        position: relative !important;
        left: calc(-90px + 24px - 2.5px) !important;
        top: 6px !important;
        display: block !important;
        opacity: 0.875 !important;
    }
    .snetworkspeed-container > snetworkspeed-digital {
        display: flex !important;
        flex-direction: column;
        width: 100% !important;
        height: calc(100% * 0.56) !important;
        position: relative !important;
    }
    .snetworkspeed-container > snetworkspeed-digital > snetworkspeed-digital-num {
        width: calc(100% - 12px) !important;
        height: calc(70px - 12px - 2px) !important;
        padding: 6px !important;
        align-items: center;
        display: flex !important;
        flex-direction: column !important;
        border-bottom: 2px solid rgba(128, 128, 128, 0.25);
        flex-shrink: 0;
    }
    .snetworkspeed-container > snetworkspeed-digital > snetworkspeed-digital-num > snetworkspeed-digital-num-speed {
        font-size: 30px;
        font-weight: 300;
        display: block !important;
        white-space: nowrap;
    }
    .snetworkspeed-container > snetworkspeed-digital > snetworkspeed-digital-num > snetworkspeed-digital-num-ping {
        font-size: 18px;
        font-weight: 400;
        display: block !important;
    }
    .snetworkspeed-container > snetworkspeed-digital > snetworkspeed-digital-status {
        width: calc(100% - 12px) !important;
        height: calc(100% - 12px - 70px - 6px) !important;
        padding: 6px !important;
        overflow: auto !important;
        font-size: 14px !important;
    }
`;
(document.head || document.documentElement).insertBefore(window.SNetworkSpeed.styles, (document.head || document.documentElement).childNodes[0]);

window.SNetworkSpeed.init = function(el, options = {}) {
    var self = this;
    
    self.element = typeof el == "string" ? document.querySelector(el) : el;
    self.element.classList.add("snetworkspeed-container");
    
    var _analog = document.createElement("snetworkspeed-analog");
    var _analog_border = document.createElement("snetworkspeed-analog-border");
    var _analog_number_counts = document.createElement("snetworkspeed-number-counts");
    var _analog_ring_arrow = document.createElement("snetworkspeed-ring-arrow");
    var _analog_arrow = document.createElement("snetworkspeed-arrow");
    _analog.appendChild(_analog_border);
    _analog.appendChild(_analog_number_counts);
    _analog.appendChild(_analog_ring_arrow);
    _analog_ring_arrow.appendChild(_analog_arrow);
    self.element.appendChild(_analog);
    
    var _digital = document.createElement("snetworkspeed-digital");
    var _digital_num = document.createElement("snetworkspeed-digital-num");
    var _digital_status = document.createElement("snetworkspeed-digital-status");
    _digital.appendChild(_digital_num);
    _digital.appendChild(_digital_status);
    self.element.appendChild(_digital);
    
    
    self.options = {
        unit: "mbps",
        scale: 100,
        timeout: 15000
    }
    for (var opt in options) { self.options[opt] = options[opt] }
    self.options.unit = self.options.unit.toLowerCase();
    if (!/mbps|kb\/s|mb\/s/i.test(self.options.unit)) self.options.unit = "mbps";
    
    self.vars = {
        network: {
            byte: {
                current: 0,
                previous: 0
            },
            speed: 0,
            speed_by_unit: 0,
            speed_average: [],
            ping: {
                timeStamp: 0,
                deltaTime: 0,
                timePrev: 0
            },
            data: {
                loaded: 0,
                total: 0,
                isLength: false
            },
            time: {
                startTime: 0,
                timeStamp: 0,
                remaining: 0
            },
            success: false,
            error: false,
            abort: false,
            timeout: false,
            xhr: null,
            method: "-",
        },
        indicator: {
            speed_analog: {
                rotate: 0,
                number_counts: []
            },
            speed_digital: {
                number: 0,
                unit: ""
            },
            ping_digital: {
                number: 0
            }
        },
        animate: {
            time: {
                timeStamp: 0,
                deltaTime: 0,
                deltaFrame: 0,
                timePrev: 0
            },
            active: false,
            vars: {
                smooth_speed: 0,
                smooth_speed_2: 0,
                lerp_rate: 0,
                lerp_rate_2: 0
            }
        }
    }
    
    var _lerp = function(a, b, t) {
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        return a + (b - a) * t;
    }
    
    var _byte = function(v) {
        var byte_num = "", byte_unit = "";
        if (v >= 1024 * 1024 * 1024 * 1024) {byte_num = (v / 1024 / 1024 / 1024 / 1024).toFixed(1); byte_unit = "TB"}
        else if (v >= 1024 * 1024 * 1024) {byte_num = (v / 1024 / 1024 / 1024).toFixed(1); byte_unit = "GB"}
        else if (v >= 1024 * 1024) {byte_num = (v / 1024 / 1024).toFixed(2); byte_unit = "MB"}
        else if (v >= 1024) {byte_num = (v / 1024).toFixed(2); byte_unit = "KB"}
        else {byte_num = v.toFixed(0); byte_unit = "B"}
        
        return `${byte_num} ${byte_unit}`;
    }
    
    var _time = function(t) {
        var _td = function(t2) {
            return t2 < 10 ? "0" + t2 : t2;
        }
        
        var _h = _td(Math.floor(t / 60 / 60));
        var _m = _td(Math.floor((t / 60)%60));
        var _s = _td(Math.floor(t%60));
        
        return `${_h}:${_m}:${_s}`;
    }
    
    var _animate = function() {
        self.vars.animate.time.timeStamp = performance.now();
        self.vars.animate.time.deltaTime = self.vars.animate.time.timeStamp - self.vars.animate.time.timePrev;
        self.vars.animate.time.deltaFrame = self.vars.animate.time.deltaTime / (1000 / 60);
        self.vars.animate.time.timePrev = self.vars.animate.time.timeStamp;
        
        self.vars.animate.vars.smooth_speed = Math.max(0, _lerp(self.vars.animate.vars.smooth_speed, self.vars.network.speed_by_unit, self.vars.animate.time.deltaFrame * self.vars.animate.vars.lerp_rate) || 0);
        if (!self.vars.network.success || Date.now() > self.vars.network.ping.timeStamp + 500) self.vars.animate.vars.smooth_speed2 = _lerp(self.vars.animate.vars.smooth_speed2, self.vars.animate.vars.smooth_speed, self.vars.animate.time.deltaFrame * self.vars.animate.vars.lerp_rate_2) || 0;
        
        if (self.vars.animate.active && Date.now() > self.vars.network.ping.timeStamp + self.options.timeout && !(self.vars.network.success || self.vars.network.error || self.vars.network.abort || self.vars.network.timeout)) {
            if (self.vars.network.xhr) self.vars.network.xhr.abort();
            self.vars.network.success = false;
            self.vars.network.error = false;
            self.vars.network.abort = false;
            self.vars.network.timeout = true;
        }
        
        var _speed_range = Math.max(0, Math.min(1, self.vars.animate.vars.smooth_speed2 / self.options.scale));
        self.vars.indicator.speed_analog.rotate = -45 + _speed_range * 270;
        _analog_ring_arrow.style.transform = `rotate(${self.vars.indicator.speed_analog.rotate}deg)`;
        
        if (!self.vars.network.success) self.vars.indicator.speed_digital.number = self.vars.animate.vars.smooth_speed2.toFixed(2);
        self.vars.indicator.speed_digital.unit = self.options.unit == "mbps" ? "Mbps" : self.options.unit == "kb/s" ? "KB/s" : self.options.unit == "mb/s" ? "MB/s" : "Mbps";
        self.vars.indicator.ping_digital.number = self.vars.network.ping.deltaTime.toFixed(0);
        _digital_num.innerHTML = `
            <snetworkspeed-digital-num-speed>${self.vars.indicator.speed_digital.number}<span style="font-weight: 600; font-size: 14px"> ${self.vars.indicator.speed_digital.unit}</span></snetworkspeed-digital-num-speed>
            <snetworkspeed-digital-num-ping>${self.vars.indicator.ping_digital.number}<span style="font-weight: 400; font-size: 10px"> ms</span></snetworkspeed-digital-num-speed>
        `;
        
        self.vars.network.time.remaining = ((self.vars.network.data.total - self.vars.network.data.loaded) / self.vars.network.speed);
        self.vars.network.time.remaining = !self.vars.network.time.remaining || self.vars.network.time.remaining == Infinity ? 0 : self.vars.network.time.remaining;
        
        var _status = (
            self.vars.network.success ? "Success" :
            self.vars.network.error ? "Error" :
            self.vars.network.abort ? "Aborted" :
            self.vars.network.timeout ? "Timeout" :
            self.vars.network.byte.current != 0 && self.vars.animate.active ? "Processing" : 
            self.vars.network.byte.current == 0 && self.vars.animate.active ? "Connecting" : "-"
        );
        _digital_status.innerHTML = `
            <span style="font-size: 21px; font-weight: 600">Statistic</span><br>
            <span style="display: inline-block">Status: <span style="font-weight: 600">${_status}</span></span><br>
            <span style="display: inline-block">Method: <span style="font-weight: 600">${self.vars.network.method}</span></span><br>
            <span style="display: inline-block;">Time: <span style="font-weight: 600">${_time(self.vars.network.time.timeStamp)}</span></span><br>
            <span style="display: inline-block; margin-bottom: 12px">Remaining Time: <span style="font-weight: 600">${self.vars.network.data.total != 0 && self.vars.network.data.total != null ? _time(self.vars.network.time.remaining) : "Unspecified"}</span></span><br>
            <span style="font-size: 21px; font-weight: 600">Data${self.vars.network.data.isLength ? (" (" + Math.floor(self.vars.network.data.loaded / self.vars.network.data.total * 100) + "%)") : ""}</span><br>
            <span>${self.vars.network.method == "GET" ? "Received" : "Transfered"}: ${_byte(self.vars.network.data.loaded || 0)}</span><br>
            ${self.vars.network.data.isLength ? '<span>Total: ' + _byte(self.vars.network.data.total || 0) + '</span>' : ""}
        `;
        
        if ((self.vars.network.success || self.vars.network.error || self.vars.network.abort || self.vars.network.timeout) && Date.now() > self.vars.network.ping.timeStamp + 500) {
            self.vars.network.speed = 0;
            self.vars.network.speed_by_unit = 0;
            
            self.vars.animate.vars.lerp_rate = 0.3;
            self.vars.animate.vars.lerp_rate_2 = 0.1;
            
            if (self.vars.animate.vars.smooth_speed2 < 0.001) {
                self.vars.animate.vars.smooth_speed = 0;
                self.vars.animate.vars.smooth_speed2 = 0;
                self.vars.animate.active = false;
            }
        }
        else {
            if (!(self.vars.network.success || self.vars.network.error || self.vars.network.abort || self.vars.network.timeout)) {
                self.vars.network.time.timeStamp = (self.vars.network.data.loaded != 0 ? Date.now() - self.vars.network.time.startTime : 0) / 1000;
            }
            self.vars.animate.vars.lerp_rate = 0.25;
            self.vars.animate.vars.lerp_rate_2 = 0.25;
        }
        
        if (self.vars.animate.active) window.requestAnimationFrame(_animate);
        else {
            self.vars.indicator.speed_analog.number_counts = [];
            for (var i = 0; i < 6; i++) {
                self.vars.indicator.speed_analog.number_counts.push(i / 5 * self.options.scale);
            }
            _analog_number_counts.innerHTML = "";
            self.vars.indicator.speed_analog.number_counts.forEach(function(count) {
                _analog_number_counts.innerHTML += `
                    <snetworkspeed-number-counts-num style="transform: translate(-50%, -50%) rotate(${(count / self.options.scale) * 270 - 135}deg)">
                        <span style="display: inline-block; transform: rotate(${-((count / self.options.scale) * 270 - 135)}deg)">${Math.round(count * 10) / 10}${count == self.options.scale ? "+" : ""}</span>
                    </snetworkspeed-number-counts-num>
                `;
            });
        }
    }
    _animate();
    
    var _run = function() {
        if (self.vars.animate.active) return;
        self.vars.animate.active = true;
        self.vars.animate.time.timePrev = performance.now();
        _animate();
    }
    
    
    self.xhr = function(xhr) {
        var _xhr_load = function() {
            self.vars.network.success = true;
            self.vars.network.error = false;
            self.vars.network.abort = false;
            self.vars.network.timeout = false;
        }
        var _xhr_error = function() {
            self.vars.network.success = false;
            self.vars.network.error = true;
            self.vars.network.abort = false;
            self.vars.network.timeout = false;
        }
        var _xhr_progress = function(event) {
            if (self.vars.network.data.loaded == 0) {
                self.vars.network.time.startTime = Date.now();
                self.vars.animate.vars.lerp_rate = 0;
                self.vars.animate.vars.lerp_rate_2 = 0;
            }
            
            self.vars.network.ping.timeStamp = Date.now();
            self.vars.network.ping.deltaTime = self.vars.network.ping.timeStamp - self.vars.network.ping.timePrev;
            self.vars.network.ping.timePrev = self.vars.network.ping.timeStamp;
            
            self.vars.network.data.loaded = event.loaded;
            self.vars.network.data.total = event.total;
            self.vars.network.data.isLength = self.vars.network.data.total != null && self.vars.network.data.total != 0;
            
            self.vars.network.byte.current = self.vars.network.data.loaded;
            var _speed = ((self.vars.network.byte.current - self.vars.network.byte.previous) / self.vars.network.ping.deltaTime * 1000) || 0;
            if (_speed != 0) self.vars.network.speed_average.push(_speed);
            var _lengthDist = Math.max(0, self.vars.network.speed_average.length - Math.round(1000 / self.vars.network.ping.deltaTime) * 2);
            for (var i = 0; i < _lengthDist; i++) {
                self.vars.network.speed_average.shift();
            }
            self.vars.network.speed = 0;
            self.vars.network.speed_average.forEach(function(speed) {
                self.vars.network.speed += speed / (self.vars.network.speed_average.length || 1);
            });
            
            if (self.options.unit == "mbps") {
                self.vars.network.speed_by_unit = self.vars.network.speed * 8 / 1000 / 1000;
            }
            else if (self.options.unit == "kb/s") {
                self.vars.network.speed_by_unit = self.vars.network.speed / 1000;
            }
            else if (self.options.unit == "mb/s") {
                self.vars.network.speed_by_unit = self.vars.network.speed / 1000 / 1000;
            }
            self.vars.network.byte.previous = self.vars.network.byte.current;
        }
        var open = xhr.open;
        var send = xhr.send;
        var abort = xhr.abort;
        if (self.vars.network.xhr) {
            self.vars.network.xhr.removeEventListener("load", _xhr_load);
            self.vars.network.xhr.removeEventListener("error", _xhr_error);
            self.vars.network.xhr.removeEventListener("progress", _xhr_progress);
            
            self.vars.network.xhr.open = function() {
                open.apply(xhr, arguments);
            }
            self.vars.network.xhr.send = function() {
                send.apply(xhr, arguments);
            }
            self.vars.network.xhr.abort = function() {
                abort.apply(xhr, arguments);
            }
        }
        xhr.addEventListener("load", _xhr_load);
        xhr.addEventListener("error", _xhr_error);
        xhr.addEventListener("progress", _xhr_progress);
        
        xhr.open = function() {
            self.vars.network.method = arguments[0].toUpperCase();
            xhr.abort();
            self.vars.network.speed_average = [];
            
            open.apply(xhr, arguments);
        }
        
        xhr.send = function() {
            self.vars.network.speed_average = [];
            self.vars.network.data.loaded = 0;
            self.vars.network.data.total = 0;
            self.vars.network.data.isLength = false;
            
            self.vars.network.byte.current = 0;
            self.vars.network.byte.previous = 0;
            self.vars.network.ping.timeStamp = Date.now();
            self.vars.network.ping.deltaTime = 0;
            self.vars.network.ping.timePrev = self.vars.network.ping.timeStamp;
            
            self.vars.network.speed = 0;
            self.vars.network.speed_by_unit = 0;
            
            self.vars.network.success = false;
            self.vars.network.error = false;
            self.vars.network.abort = false;
            self.vars.network.timeout = false;
            
            send.apply(xhr, arguments);
            _run();
        }
        
        xhr.abort = function() {
            if (!self.vars.network.success) {
                self.vars.network.success = false;
                self.vars.network.error = false;
                self.vars.network.abort = true;
                self.vars.network.timeout = false;
            }
            
            abort.apply(xhr, arguments);
        }
        
        self.vars.network.xhr = xhr;
    }
    self.setOptions = function(options) {
        for (var opt in options) { self.options[opt] = options[opt] }
    }
}

var SNetworkSpeed_Mutation = function() {
    document.querySelectorAll("snetworkspeed:not(.snetworkspeed-container)").forEach(function(el) {
        var _init = new SNetworkSpeed.init(el);
        var _xhr = new XMLHttpRequest();
        _init.xhr(_xhr);
        
        var _attr = function(mutation) {
            if (mutation.attributeName == "options") _init.setOptions(JSON.parse(el.getAttribute("options")));
            if (mutation.attributeName == "src") {
                var _open_split = el.getAttribute("src").split("; ");
                _xhr.open(_open_split[0] || "GET", _open_split[1]);
                _xhr.send(_open_split[2] || null);
            }
        }
        _attr({attributeName: "options"});
        _attr({attributeName: "src"});
        
        new MutationObserver(function(list) {
            list.forEach(_attr);
        }).observe(el, {attributes: true});
    });
}
new MutationObserver(SNetworkSpeed_Mutation).observe(document.body || document.documentElement, {childList: true, subtree: true});

setTimeout(function() {
    if (window.SNetworkSpeed_Ready) window.SNetworkSpeed_Ready();
});