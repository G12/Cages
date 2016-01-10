var Stopwatch = function(elem, options) {
  
  var timer       = createTimer(),
      offset,
      clock,
      interval,
	  element;
  
  // default options
  options = options || {};
  options.delay = options.delay || 1;
 
  // append elements     
  //elem.appendChild(timer);
  element = elem;
  
  // initialize
  reset();
  
  // private functions
  function createTimer() {
    return document.createElement("span");
  }
  
  function start() {
    if (!interval) {
      offset   = Date.now();
      interval = setInterval(update, options.delay);
    }
  }
  
  function stop() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
  
  function reset() {
    clock = 0;
    render(0);
  }
  
  function update() {
    clock += delta();
    render();
  }
  
  function toStr(n)
  {
	  n = Math.floor(n);
	  return n < 10 ? "0" + n : "" + n;
  }
  
  function getTimeStr()
  {
    var h = clock/3600000;
	//decimal parts of hours * 60
	var m = (h % 1)*60;
	//decimal parts of minutes * 60
	var s = (m % 1)*60;
	return Math.floor(h) > 0 ?  toStr(h) + ":" + toStr(m) + ":" + toStr(s) : toStr(m) + ":" + toStr(s); 
  }
  
  function render() {
	element.innerHTML = getTimeStr(); 
  }
  
  function delta() {
    var now = Date.now(),
        d   = now - offset;
    offset = now;
    return d;
  }
  
  // public API
  this.start  = start;
  this.stop   = stop;
  this.reset  = reset;
  this.getTimeStr = getTimeStr;
  
};

/*
var d = document.getElementById("d-timer");
dTimer = new Stopwatch(d, {delay: 1000});
dTimer.start();
*/