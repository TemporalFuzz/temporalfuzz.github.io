var Kamra = {
  loaded: true,
  Loop: {
    fn: null,
    interval: null,
    frameRate: 60
  },
  Canvas: {},
  Draw: {
    rectMode: "CORNER",
    imageMode: "CORNER",
    ellipseMode: "CENTER",
    textLineSpacing: 0.4,
    shapeOpen: false,
  },
  Interface: {
    selected: null
  }
};

var CENTER = "CENTER";
var CORNER = "CORNER";
var RADIUS = "RADIUS";
var CORNERS = "CORNERS";

var MITER = "miter";
var ROUND = "round";
var BEVEL = "bevel";
var SQUARE = "butt";
var PROJECT = "square";

var START = "start";
var END = "end";
var LEFT = "left";
var RIGHT = "right";
var CENTER = "center";

var TOP = "top";
var BOTTOM = "bottom";
var MIDDLE = "middle";
var ALPHABETIC = "alphabetic";
var HANGING = "hanging";

var mouseOver;
var mouseOut;
var mouseMoved;
var mouseDragged;
var mouseClicked;
var mousePressed;
var mouseReleased;

var mouseX = 0;
var mouseY = 0;
var pmouseX = 0;
var pmouseY = 0;

var mouseIsPressed = false;
var pmouseIsPressed = false;

var width = 0;
var height = 0;

var updateCanvas;

/** Animation **/
var Animation = function(config, looped) {
  if(config.transition) {
    if(!Animation.transitions[config.transition]) {
      console.warn("Kamra Warning - Invalid animation transition specified. Defaulted to linear.");
      config.transition = "linear";
    }
  }
  
  this.duration = config.duration || 1000;
  this.startTime = new Date().getTime();
  
  this.startValue = config.start || 0;
  this.finalValue = (config.final === 0 ? 0 : (config.end === 0 ? 0 : (config.end || (config.final || 1))));
  
  this.transition = config.transition || "linear";
  
  this.looped = looped || false;
};

Animation.transitions = {
  linear: function(x) { return x; },
  easeInSine: function(x) { return -Math.sin((x + 1) * Math.PI/2) + 1; },
  easeOutSine: function(x) { return Math.sin(x * Math.PI/2); },
  easeInOutSine: function(x) { return Math.sin((x - 0.5) * Math.PI)/2 + 0.5; },
  easeInQuad: function(x) { return x * x; },
  easeOutQuad: function(x) { return x * (2 - x); },
  easeInOutQuad: function(x) { return x < 0.5 ? (2 * x * x) : (-2 * (--x) * x + 1); },
  easeInCubic: function(x) { return x * x * x; },
  easeOutCubic: function(x) { x--; return x * x * x + 1; },
  easeInOutCubic: function(x) { return x < 0.5 ? (4 * x * x * x) : (4 * (--x) * x * x + 1); },
  easeInQuart: function(x) { return x * x * x * x; },
  easeOutQuart: function(x) { x--; return -x * x * x * x + 1; },
  easeInOutQuart: function(x) { return x < 0.5 ? (8 * x * x * x * x) : (8 * (x - 1) * (x - 1) * (x - 1) * (x - 1) + 1); },
  easeInQuint: function(x) { return x * x * x * x * x; },
  easeOutQuint: function(x) { x--; return x * x * x * x * x + 1; },
  easeInOutQuint: function(x) { return x < 0.5 ? (16 * x * x * x * x * x) : (16 * (--x) * x * x * x * x + 1); },
};
Animation.getValue = function(data) {
  var now = new Date().getTime();
  var startTime = data.startTime;
  var duration = data.duration;
  
  var startValue = data.startValue;
  var endValue = data.finalValue;
  
  var stage;
  
  if(data.looped) {
    stage = Animation.transitions[data.transition](
      ((now - startTime)/duration) % 1
    );
  }
  else {
    stage = Animation.transitions[data.transition](
      ((now - startTime)/duration)
    );
    
    if(stage < 0) return startValue;
    if(stage > 1) return finalValue;
  }
  
  return (startValue + (endValue - startValue) * stage);
};
Animation.prototype.getValue = function() {
  return Animation.getValue(this);
};
Animation.prototype.isExpired = function() {
  return ((new Date().getTime() - this.startTime) >= this.duration);
};

/** AnimationSet **/
var AnimationSet = function(info, looped) {
  this.animInfo = info.slice();
  
  this.looped = looped || false;
  
  if(this.looped) {
    this.animInfoBackup = this.animInfo.slice();
  }
  
  this.currentAnimation = new Animation(this.animInfo.shift());
};
AnimationSet.prototype.getValue = function() {
  while(this.currentAnimation.isExpired()) {
    if(this.animInfo.length !== 0) {
      this.currentAnimation = new Animation(this.animInfo.shift());
    } else if (this.looped) {
      this.animInfo = this.animInfoBackup.slice();
      this.currentAnimation = new Animation(this.animInfo.shift());
    }
  }
  
  return this.currentAnimation.getValue();
};
AnimationSet.prototype.isExpired = function() {
  if(this.animInfo.length === 0 && !this.looped) {
    return this.currentAnimation.isExpired();
  }
  return false;
};

/** Looping Functions **/
var loop = function(fn) {
  if(fn) {
    if(Kamra.Loop.interval) {
      clearInterval(Kamra.Loop.interval);
    }
    Kamra.Loop.fn = fn;
    Kamra.Loop.interval = setInterval(function() {
      Kamra.Loop.fn();
      updateCanvas();
    }, 1000/Kamra.Loop.frameRate);
  }
};
var noLoop = function() {
  if(Kamra.Loop.fn) { 
    clearInterval(Kamra.Loop.interval);
    Kamra.Loop.fn = null;
  }
};
var frameRate = function(newFrameRate) {
  Kamra.Loop.frameRate = newFrameRate || 60;
  if(Kamra.Loop.fn) {
    clearInterval(Kamra.Loop.interval);
    Kamra.Loop.interval = setInterval(function() {
      Kamra.Loop.fn();
      updateCanvas();
    }, 1000/Kamra.Loop.frameRate);
  }
};
var noArrowScroll = function() {
  window.addEventListener("keydown", function(event) {
    if(event.keyCode === 32 ||
       event.keyCode === 37 ||
       event.keyCode === 38 ||
       event.keyCode === 39 ||
       event.keyCode === 40) {
      event.preventDefault();
    }
  });
};

/** INTERFACE **/
/** Interface Basic Class **/
var InterfaceBasic = function(config) {
  this.pos = config.pos || new Vector2(config.x || 0, config.y || 0);
  
  this.width = config.width || config.w || config.size || 100;
  this.height = config.height || config.h || config.size || 100;
};
InterfaceBasic.prototype.down = function() {
  return this.mouseOver() && mouseIsPressed;
};
InterfaceBasic.prototype.pressed = function() {
  return this.mouseOver() && mouseIsPressed && !pmouseIsPressed;
};
InterfaceBasic.prototype.released = function() {
  return this.mouseOver() && pmouseIsPressed && !mouseIsPressed;
};
InterfaceBasic.prototype.select = function() {
  if(this.down() && !Kamra.Interface.selected) {
    Kamra.Interface.selected = this;
  }
};
InterfaceBasic.prototype.display = function() {
  this.select();
  this.draw();
  if(this.update) this.update();
  if(this.drag) this.drag();
};

/** Interface Basic Rectangle Class **/
var InterfaceRectBasic = function(config) {
  InterfaceBasic.call(this, config);
};
InterfaceRectBasic.prototype = Object.create(InterfaceBasic.prototype);
InterfaceRectBasic.prototype.mouseOver = function() {
  return mouseX >= this.pos.x && 
         mouseY >= this.pos.y && 
         mouseX <= this.pos.x + this.width &&
         mouseY <= this.pos.y + this.height;
};
InterfaceRectBasic.prototype.pmouseOver = function() {
  return pmouseX >= this.pos.x && 
         pmouseY >= this.pos.y && 
         pmouseX <= this.pos.x + this.width &&
         pmouseY <= this.pos.y + this.height;
};
InterfaceRectBasic.prototype.draw = function() {
  rect(this.pos.x, this.pos.y, this.width, this.height);
};

/** Interface Rectangle Button Class**/
var RectButton = function(config) {
  InterfaceRectBasic.call(this, config);
  
  this.onHold = config.onHold || function() {};
  this.onHover = config.onHover || function() {};
  this.onPress = config.onPress || function() {};
  this.onRelease = config.onRelease || function() {};
};
RectButton.prototype = Object.create(InterfaceRectBasic.prototype);
RectButton.prototype.update = function() {
  if(this.mouseOver()) this.onHover();
  if(this.down()) this.onHold();
  if(this.pressed()) this.onPress();
  if(this.released()) this.onRelease();
};

/** Interface Rectangle Dragger Class**/
var RectDragger = function(config) {
  RectButton.call(this, config);
  
  this.onMove = config.onMove || function() {};
};
RectDragger.prototype = Object.create(RectButton.prototype);
RectDragger.prototype.drag = function() {
  if(Kamra.Interface.selected === this) {
    if(pmouseX !== mouseX ||
       pmouseY !== mouseY) {
      this.pos.x += mouseX - pmouseX;
      this.pos.y += mouseY - pmouseY;
      
      this.onMove();
    }
  }
};

/** Interface Basic Ellipse Class **/
var InterfaceEllipseBasic = function(config) {
  InterfaceBasic.call(this, config);
};
InterfaceEllipseBasic.prototype = Object.create(InterfaceBasic.prototype);
InterfaceEllipseBasic.prototype.mouseOver = function() {
  return Math.sqrt((mouseX - this.pos.x) * (mouseX - this.pos.x) * this.height/this.width * this.height/this.width +
                   (mouseY - this.pos.y) * (mouseY - this.pos.y)) < this.height/2;
};
InterfaceEllipseBasic.prototype.pmouseOver = function() {
  return Math.sqrt((pmouseX - this.pos.x) * (pmouseX - this.pos.x) * this.height/this.width * this.height/this.width +
                   (pmouseY - this.pos.y) * (pmouseY - this.pos.y)) < this.height/2;
};
InterfaceEllipseBasic.prototype.draw = function() {
  ellipse(this.pos.x, this.pos.y, this.width, this.height);
};

/** Interface Ellipse Button Class**/
var EllipseButton = function(config) {
  InterfaceEllipseBasic.call(this, config);
  
  this.onHold = config.onHold || function() {};
  this.onHover = config.onHover || function() {};
  this.onPress = config.onPress || function() {};
  this.onRelease = config.onRelease || function() {};
};
EllipseButton.prototype = Object.create(InterfaceEllipseBasic.prototype);
EllipseButton.prototype.update = function() {
  if(this.mouseOver()) this.onHover();
  if(this.down()) this.onHold();
  if(this.pressed()) this.onPress();
  if(this.released()) this.onRelease();
};

/** Interface Ellipse Dragger Class**/
var EllipseDragger = function(config) {
  EllipseButton.call(this, config);
  
  this.onMove = config.onMove || function() {};
};
EllipseDragger.prototype = Object.create(EllipseButton.prototype);
EllipseDragger.prototype.drag = function() {
  if(Kamra.Interface.selected === this) {
    if(pmouseX !== mouseX ||
       pmouseY !== mouseY) {
      this.pos.x += (mouseX - pmouseX);
      this.pos.y += (mouseY - pmouseY);
      
      this.onMove();
    }
  }
};

/** Interface Core Functions **/
var updateInterface = function(set) {
  for(var i = set.length - 1; i >= 0; i--) {
    set[i].display();
  }
  for(var i = 0; i < set.length; i++) {
    if(set[i] === Kamra.Interface.selected) {
      set.push(set.splice(i, 1)[0]);
      return;
    }
  }
};
/** END INTERFACE **/

/** CANVAS **/
/** Configure Canvas **/
function configure(canvasElement) {
  if (Kamra.Canvas.configured) {
    console.warn("Kamra Warning - Can only configure once.");
    return;
  }

  Kamra.Canvas.element = canvasElement;
  Kamra.Canvas.configured = true;

  Kamra.Canvas.relWidth = canvasElement.width;
  Kamra.Canvas.relHeight = canvasElement.height;

  Kamra.Canvas.context = canvasElement.getContext("2d");
  Kamra.Canvas.context.fillStyle = "rgba(255, 255, 255, 1.0)";
  
  mouseIsPressed = false;
  pmouseIsPressed = false;
  
  Kamra.Canvas.keys = {};
  Kamra.Canvas.keyIsPressed = false;
  Kamra.Canvas.lastKeyTriggered = null;
  Kamra.Canvas.lastKeyEvent = null;
  
  Kamra.Canvas.element.onmousemove = function(e) {
    var canvasBoundingRect = Kamra.Canvas.element.getBoundingClientRect();
    mouseX = Math.round(toCanvasUnits(e.clientX - canvasBoundingRect.left));
    mouseY = Math.round(toCanvasUnits(e.clientY - canvasBoundingRect.top));
    
    if(mouseMoved) {
      mouseMoved();
    }
    if(mouseIsPressed && mouseDragged) {
      mouseDragged();
    }
  };
  Kamra.Canvas.element.onmousedown = function() {
    mouseIsPressed = true;
    
    if(mousePressed) { mousePressed(); }
  };
  Kamra.Canvas.element.onmouseup = function() {
    mouseIsPressed = false;
    
    if(mouseClicked) { mouseClicked(); }
    if(mouseReleased) { mouseReleased(); }//These are exactly the same in PJS...
  };
  Kamra.Canvas.element.onmouseout = function() {
    if(mouseOut) { mouseOut(); }
  };
  Kamra.Canvas.element.onmouseover = function() {
    if(mouseOver) { mouseOver(); }
  };
  
  document.onkeydown = function(e) {
    if(Kamra.Canvas.keys[e.key.toLowerCase()]) { return; }
    
    Kamra.Canvas.keys[e.key.toLowerCase()] = true;
    
    Kamra.Canvas.keyIsPressed = true;
    Kamra.Canvas.lastKeyDown = e.key.toLowerCase();
    
    if(Kamra.Canvas.keyPressed) { Kamra.Canvas.keyPressed(); }
  };
  document.onkeyup = function(e) {
    if(!Kamra.Canvas.keys[e.key.toLowerCase()]) { return; }
    
    Kamra.Canvas.keys[e.key.toLowerCase()] = false;
    
    Kamra.Canvas.lastKeyUp = e.key.toLowerCase();
    
    var scopeChanger = function() {
      for(var i in Kamra.Canvas.keys) {
        if(Kamra.Canvas.keys[i]) {
          return;
        }
      }
      Kamra.Canvas.keyIsPressed = false;
    }();
    
    if(Kamra.Canvas.keyReleased) { Kamra.Canvas.keyReleased(); }
    if(Kamra.Canvas.keyTyped) { Kamra.Canvas.keyTyped(); }//These are exactly the same too, lol
  };
};

/** Unit Conversion **/
/** Internal-only functions
    Do not use or edit these **/
function toPixels(n) {
  return n * Kamra.Canvas.element.width/Kamra.Canvas.relWidth;
};
function toCanvasUnits(n) {
  return n * Kamra.Canvas.relHeight/Kamra.Canvas.element.height;
}

/** Resize Canvas **/
function resize(relWidth, relHeight) {
  var envWidth = window.innerWidth;
  var envHeight = window.innerHeight;
  
  if(!envWidth  || envWidth  === 0) envWidth  = document.documentElement.clientWidth;
  if(!envHeight || envHeight === 0) envHeight = document.documentElement.clientHeight;
  
  if (!Kamra.Canvas.configured) {
    console.warn("Kamra warning - Attempted to resize when not configured");
    return;
  }

  Kamra.Canvas.relWidth = relWidth;
  Kamra.Canvas.relHeight = relHeight;

  if (envWidth / envHeight < relWidth / relHeight) {
    Kamra.Canvas.element.width = envWidth;
    Kamra.Canvas.element.height = relHeight / relWidth * envWidth;
  }
  else {
    Kamra.Canvas.element.width = relWidth / relHeight * envHeight;
    Kamra.Canvas.element.height = envHeight;
  }
  
  width = relWidth;
  height = relHeight;
};
function updateCanvas() {
  if(!Kamra.Canvas.configured) {
    return;
  }
  
  pmouseIsPressed = mouseIsPressed;
  pmouseX = mouseX;
  pmouseY = mouseY;
  
  if(!mouseIsPressed) { Kamra.Interface.selected = null; }
};
/** END CANVAS **/

/** DRAW **/
/** Color Commands**/
fill = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use color commands when in shape mode.");
    return;
  }
  
  if(arguments.length >= 1) {
    if(typeof arguments[0] === "object") {
      Kamra.Canvas.context.fillStyle = "rgba(" + arguments[0].r + ", " + arguments[0].g + ", " + arguments[0].b + ", " + ((arguments[0].a || 255)/255) + ")";
      return;
    }
  }
  
  switch(arguments.length) {
    case 0: Kamra.Canvas.context.fillStyle = "#FFFFFF"; break;
    case 1: Kamra.Canvas.context.fillStyle = "rgb(" + arguments[0] + ", " + arguments[0] + ", " + arguments[0] + ")"; break;
    case 2: Kamra.Canvas.context.fillStyle = "rgba(" + arguments[0] + ", " + arguments[0] + ", " + arguments[0] + ", " + (arguments[1]/255) + ")"; break;
    case 3: Kamra.Canvas.context.fillStyle = "rgb(" + arguments[0] + ", " + arguments[1] + ", " + arguments[2] + ")"; break;
    case 4: Kamra.Canvas.context.fillStyle = "rgba(" + arguments[0] + ", " + arguments[1] + ", " + arguments[2] + ", " + (arguments[3]/255) + ")"; break;
    default: console.warn("Kamra Warning - fill() takes 0 - 4 arguments."); break;
  }
};
stroke = function(r, g, b, a) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use color commands when in shape mode.");
    return;
  }
  
  if(arguments.length >= 1) {
    if(typeof arguments[0] === "object") {
      Kamra.Canvas.context.strokeStyle = "rgba(" + arguments[0].r + ", " + arguments[0].g + ", " + arguments[0].b + ", " + (arguments[0].a/255) + ")";
      return;
    }
  }
  
  switch(arguments.length) {
    case 0: Kamra.Canvas.context.strokeStyle = "#FFFFFF"; break;
    case 1: Kamra.Canvas.context.strokeStyle = "rgb(" + arguments[0] + ", " + arguments[0] + ", " + arguments[0] + ")"; break;
    case 2: Kamra.Canvas.context.strokeStyle = "rgba(" + arguments[0] + ", " + arguments[0] + ", " + arguments[0] + ", " + (arguments[1]/255) + ")"; break;
    case 3: Kamra.Canvas.context.strokeStyle = "rgb(" + arguments[0] + ", " + arguments[1] + ", " + arguments[2] + ")"; break;
    case 4: Kamra.Canvas.context.strokeStyle = "rgba(" + arguments[0] + ", " + arguments[1] + ", " + arguments[2] + ", " + (arguments[3]/255) + ")"; break;
    default: console.warn("Kamra Warning - stroke() takes 0 - 4 arguments.");
  }
};

getFill = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  var hexDigitDec = function(digit) {
    switch(digit.toString().toLowerCase()) {
      case "0": return 0; break;
      case "1": return 1; break;
      case "2": return 2; break;
      case "3": return 3; break;
      case "4": return 4; break;
      case "5": return 5; break;
      case "6": return 6; break;
      case "7": return 7; break;
      case "8": return 8; break;
      case "9": return 9; break;
      case "a": return 10; break;
      case "b": return 11; break;
      case "c": return 12; break;
      case "d": return 13; break;
      case "e": return 14; break;
      case "f": return 15; break;
    }
  };
  
  var fillStyle = Kamra.Canvas.context.fillStyle;
  if(fillStyle[0] === "#") {
    return {
      r: 16 * hexDigitDec(fillStyle[1]) + hexDigitDec(fillStyle[2]),
      g: 16 * hexDigitDec(fillStyle[3]) + hexDigitDec(fillStyle[4]),
      b: 16 * hexDigitDec(fillStyle[5]) + hexDigitDec(fillStyle[6]),
      a: 255
    };
  }
  else {
    fillStyle[0] = fillStyle[0].split("");
    fillStyle[0].splice(0, 5);
    fillStyle[0] = parseFloat(fillStyle[0].join(""));
    fillStyle[1] = parseFloat(fillStyle[1]);
    fillStyle[2] = parseFloat(fillStyle[2]);
    fillStyle[3] = fillStyle[3].split("");
    fillStyle[3].pop();
    fillStyle[3] = parseFloat(fillStyle[3].join(""));
    
    return {
      r: fillStyle[0],
      g: fillStyle[1], 
      b: fillStyle[2],
      a: fillStyle[3] * 255
    };
  }
};
getStroke = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  var hexDigitDec = function(digit) {
    switch(digit.toString().toLowerCase()) {
      case "0": return 0; break;
      case "1": return 1; break;
      case "2": return 2; break;
      case "3": return 3; break;
      case "4": return 4; break;
      case "5": return 5; break;
      case "6": return 6; break;
      case "7": return 7; break;
      case "8": return 8; break;
      case "9": return 9; break;
      case "a": return 10; break;
      case "b": return 11; break;
      case "c": return 12; break;
      case "d": return 13; break;
      case "e": return 14; break;
      case "f": return 15; break;
    }
  };//Converts a hex digit to a decimal number
  
  var strokeStyle = Kamra.Canvas.context.strokeStyle;
  if(strokeStyle[0] === "#") {
    return {
      r: 16 * hexDigitDec(strokeStyle[1]) + hexDigitDec(strokeStyle[2]),
      g: 16 * hexDigitDec(strokeStyle[3]) + hexDigitDec(strokeStyle[4]),
      b: 16 * hexDigitDec(strokeStyle[5]) + hexDigitDec(strokeStyle[6]),
      a: 255
    };
  }
  else {
    strokeStyle[0] = strokeStyle[0].split("");
    strokeStyle[0].splice(0, 5);
    strokeStyle[0] = parseFloat(strokeStyle[0].join(""));
    strokeStyle[1] = parseFloat(strokeStyle[1]);
    strokeStyle[2] = parseFloat(strokeStyle[2]);
    strokeStyle[3] = strokeStyle[3].split("");
    strokeStyle[3].pop();
    strokeStyle[3] = parseFloat(strokeStyle[3].join(""));
    
    return {
      r: strokeStyle[0],
      g: strokeStyle[1], 
      b: strokeStyle[2],
      a: strokeStyle[3] * 255
    };
  }
};

noFill = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  Kamra.Canvas.context.fillStyle = "rgba(0, 0, 0, 0.0)";
};
noStroke = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use color commands when in shape mode.");
    return;
  }
  
  if(arguments.length !== 0) {
    console.warn("Kamra Warning - noStroke() takes 0 arguments.");
  }
  
  Kamra.Canvas.context.strokeStyle = "rgba(0, 0, 0, 0.0)";
};

/** Image Commands **/
get = function(x, y, w, h) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(arguments.length === 4) {
    var imageData = Kamra.Canvas.context.getImageData(toPixels(x), toPixels(y), toPixels(w), toPixels(h));
    var newCanvas = document.createElement("canvas");
    newCanvas.width  = imageData.width;
    newCanvas.height = imageData.height;
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);
    return newCanvas;
  }
  else if(arguments.length === 2) {
    var dataAtPoint = Kamra.Canvas.context.getImageData(toPixels(x), toPixels(y), 1, 1);
    return {
      r: dataAtPoint.data[0],
      g: dataAtPoint.data[1],
      b: dataAtPoint.data[2],
      a: dataAtPoint.data[3] * 255
    };
  }
};

image = function(image, x, y, w, h, sx, sy, sw, sh) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other drawing commands when in shape mode.");
    return;
  }
  
  var realX = x,
      realY = y,
      realW = w,
      realH = h;
  
  switch (Kamra.Draw.imageMode) {
    case CORNERS:
      realW = w - x;
      realH = h - y;
      break;
    case RADIUS:
      realX = x + w / 2;
      realY = y + h / 2;
      realW = w * 2;
      realH = h * 2;
      break;
    case CENTER:
      realX = x - w / 2;
      realY = y - h / 2;
      break;
  }
  
  realX = toPixels(realX);
  realY = toPixels(realY);
  realW = toPixels(realW);
  realH = toPixels(realH);
  
  switch(arguments.length) {
    case 3: Kamra.Canvas.context.drawImage(image, realX, realY); break;
    case 5: Kamra.Canvas.context.drawImage(image, realX, realY, realW, realH); break;
    case 9: Kamra.Canvas.context.drawImage(image, realX, realY, realW, realH, sx, sy, sw, sh); break;
    default: console.warn("Kamra Warning - image() takes 3, 5, or 9 arguments."); break;
  }
};

pixelArt = function(data, keys, quality) {
  var imageWidth = data[0].length;
  var imageHeight = data.length;
  
  var newCanvas = document.createElement("canvas");
  newCanvas.width  = imageWidth * (quality || 4);
  newCanvas.height = imageHeight * (quality || 4);
  var newCanvasContext = newCanvas.getContext("2d");
  
  for(var i = 0; i < imageHeight; i++) {
    for(var j = 0; j < imageWidth; j++) {
      if(keys[data[i][j]]) {
        var color = keys[data[i][j]];
        newCanvasContext.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + (color.a || 255)/255 + ")";
        newCanvasContext.fillRect(j * (quality || 4), i * (quality || 4), (quality || 4), (quality || 4));
      }
    }
  }
  
  return newCanvas;
};

processImages = function(imageSet, onFinish) {
  for(var i in imageSet) {
    imageSet[i] = imageSet[i]();
  }
  onFinish();
};

/** Transformation Commands **/
popMatrix = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You cannot use transformation commands in shape mode.");
    return;
  }
  
  var oldFillStyle    = Kamra.Canvas.context.fillStyle;
  var oldStrokeStyle  = Kamra.Canvas.context.strokeStyle;
  var oldLineWidth    = Kamra.Canvas.context.lineWidth;
  var oldLineCap      = Kamra.Canvas.context.lineCap;
  var oldLineJoin     = Kamra.Canvas.context.lineJoin;
  var oldGlobalAlpha  = Kamra.Canvas.context.globalAlpha;
  var oldMiterLimit   = Kamra.Canvas.context.miterLimit;
  var oldFont         = Kamra.Canvas.context.font;
  var oldTextAlign    = Kamra.Canvas.context.textAlign;
  var oldTextBaseline = Kamra.Canvas.context.textBaseline;
  var oldSmoothing    = Kamra.Canvas.context.imageSmoothingEnabled;
  
  Kamra.Canvas.context.restore();
  
  Kamra.Canvas.context.fillStyle    = oldFillStyle;
  Kamra.Canvas.context.strokeStyle  = oldStrokeStyle;
  Kamra.Canvas.context.lineWidth    = oldLineWidth;
  Kamra.Canvas.context.lineCap      = oldLineCap;
  Kamra.Canvas.context.lineJoin     = oldLineJoin;
  Kamra.Canvas.context.globalAlpha  = oldGlobalAlpha;
  Kamra.Canvas.context.miterLimit   = oldMiterLimit;
  Kamra.Canvas.context.font         = oldFont;
  Kamra.Canvas.context.textAlign    = oldTextAlign;
  Kamra.Canvas.context.textBaseline = oldTextBaseline;
  Kamra.Canvas.context.imageSmoothingEnabled = oldSmoothing;
};
pushMatrix = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You cannot use transformation commands in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.save();
};
resetMatrix = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You cannot use transformation commands in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.setTransform(1, 0, 0, 1, 0, 0);
};
rotate = function(t) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use transformation commands when in shape mode.");
    return;
  }
  
  if(arguments.length !== 1) {
    console.warn("Kamra Warning - rotate() takes 1 argument.");
    return;
  }
  
  Kamra.Canvas.context.rotate(t);
};
scale = function(x, y) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use transformation commands when in shape mode.");
    return;
  }
  
  if(arguments.length === 0 || arguments.length > 2) {
    console.warn("Kamra Warning - scale() takes 1 - 2 arguments.");
    return;
  }
  
  Kamra.Canvas.context.scale(x, y || x);
};
skew = function(x, y) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use transformation commands when in shape mode.");
    return;
  }
  
  if(arguments.length === 0 || arguments.length > 2) {
    console.warn("Kamra Warning - skew() takes 1 - 2 arguments.");
    return;
  }
  
  Kamra.Canvas.context.transform(1, x, y || 0, 1, 0, 0);
};
translate = function(x, y) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use transformation commands when in shape mode.");
    return;
  }
  
  if(arguments.length === 0 || arguments.length > 2) {
    console.warn("Kamra Warning - translate() takes 1 - 2 arguments.");
    return;
  }
  
  Kamra.Canvas.context.translate(toPixels(x || 0), toPixels(y || 0));
};

/** Draw Setting Commands **/
loadFont = function(font, onLoad) {
  var newLink = document.createElement("link");
  
  newLink.rel = "stylesheet";
  newLink.href = "https://fonts.googleapis.com/css?family=" + font;
  
  newLink.onload = onLoad;
  
  document.head.appendChild(newLink);
};
loadFontSet = function(fonts, onFinish) {
  var fontsLoaded = 0;
  for(var i = 0; i < fonts.length; i++) {
    var newLink = document.createElement("link");
  
    newLink.rel = "stylesheet";
    newLink.href = "https://fonts.googleapis.com/css?family=" + font;
  
    newLink.onload = function() {
      fontsLoaded++;
      if(fontsLoaded >= fonts.length - 1) {
        if (onFinish) onFinish();
      }
    };
  
    document.head.appendChild(newLink);
  }
};

rectMode = function(newMode) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(newMode === CENTER || newMode === CORNER || newMode === CORNERS || newMode === RADIUS) {
    Kamra.Draw.rectMode = newMode;
  }
};
ellipseMode = function(newMode) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(newMode === CENTER || newMode === CORNER || newMode === CORNERS || newMode === RADIUS) {
    Kamra.Draw.ellipseMode = newMode;
  }
};
imageMode = function(newMode) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(newMode === CENTER || newMode === CORNER || newMode === CORNERS || newMode === RADIUS) {
    Kamra.Draw.imageMode = newMode;
  }
};
strokeCap = function(newCap) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(newCap === ROUND || newCap === SQUARE || newCap === PROJECT) {
    Kamra.Canvas.context.lineCap = newCap;
  }
};
strokeJoin = function(newJoin) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(newJoin === MITER || newJoin === ROUND || newJoin === BEVEL) {
    Kamra.Canvas.context.lineJoin = newJoin;
  }
};
strokeWeight = function(strokeWeight) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use color commands when in shape mode.");
    return;
  }
  
  if(arguments.length > 1) {
    console.warn("Kamra Warning - strokeWeight() takes 0 or 1 arguments.");
  }
  
  Kamra.Canvas.context.lineWidth = toPixels(strokeWeight || 0);
};
textAlign = function(newAlign, yAlign) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(arguments.length > 2) {
    console.warn("Kamra Warning - textAlign() takes 0 - 2 arguments.");
  }
  
  Kamra.Canvas.context.textAlign = newAlign || "left";
  if(yAlign) Kamra.Canvas.context.textBaseline = yAlign;
};
textFont = function(font, size, variant) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  var currentFont = Kamra.Canvas.context.font.split(" ");
  
  Kamra.Canvas.context.font = (variant ? (variant + " ") : "") + Math.round(size ? toPixels(size) : parseInt(currentFont[currentFont.length - 2])) + "px " + font;
};
textLineSpacing = function(newSpacing) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(arguments.length !== 1) {
    console.warn("Kamra Warning - textLineSpacing() takes 1 argument.");
  }
  
  Kamra.Draw.textLineSpacing = (newSpacing === 0 ? 0 : (newSpacing || 0.4));
};
textSize = function(size) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  var currentFont = Kamra.Canvas.context.font.split(" ");
  
  Kamra.Canvas.context.font = (currentFont.length === 3 ? (currentFont[0] + " ") : "") + toPixels(Math.round(size)) + "px " + currentFont[currentFont.length - 1];
};

getRectMode = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  return Kamra.Draw.rectMode;
};
getEllipseMode = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  return Kamra.Draw.ellipseMode;
};
getImageMode = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  return Kamra.Draw.imageMode;
};
getStrokeCap = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  return Kamra.Canvas.context.lineCap;
};
getStrokeJoin = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  return Kamra.Canvas.context.lineJoin;
};
getStrokeWeight = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  return toCanvasUnits(Kamra.Canvas.context.lineWidth || 0);
};
getTextAlign = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(arguments.length > 0) {
    console.warn("Kamra Warning - getTextAlign() takes 0 arguments.");
  }
  
  return Kamra.Canvas.context.textAlign;
};
getTextBaseline = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(arguments.length > 0) {
    console.warn("Kamra Warning - getTextAlign() takes 0 arguments.");
  }
  
  return Kamra.Canvas.context.textBaseline;
};
getTextFont = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  var currentFont = Kamra.Canvas.context.font.split(" ");
  
  return toCanvasUnits(currentFont[currentFont.length - 1]);
};
getTextLineSpacing = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(arguments.length !== 0) {
    console.warn("Kamra Warning - getTextLineSpacing() takes 0 arguments.");
  }
  
  return Kamra.Draw.textLineSpacing;
};
getTextSize = function(size) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  var currentFont = Kamra.Canvas.context.font.split(" ");
  
  return toCanvasUnits(parseInt(currentFont[currentFont.length - 2]));
};

/** Shape Commands **/
background = function(r, g, b, a) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  var oldFill = Kamra.Canvas.context.fillStyle;
  
  Kamra.Canvas.context.save();
  Kamra.Canvas.context.resetTransform();
  
  switch(arguments.length) {
    case 0: 
      Kamra.Canvas.context.clearRect(0, 0, Kamra.Canvas.element.width, Kamra.Canvas.element.height);
      return;
      break;
    case 1: fill(r); break;
    case 2: fill(r, g); break;
    case 3: fill(r, g, b); break;
    case 4: fill(r, g, b, a); break;
  }
  
  Kamra.Canvas.context.fillRect(0, 0, Kamra.Canvas.element.width, Kamra.Canvas.element.height);
  
  Kamra.Canvas.context.restore();
}

beginShape = function() {
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - Cannot reinitialize shape.");
    return;
  }
  
  Kamra.Canvas.context.beginPath();
  Kamra.Draw.shapeOpen = true;
};
endShape = function() {
  if(!Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - Cannot end nonexistent shape.");
    return;
  }
  
  Kamra.Canvas.context.fill();
  Kamra.Canvas.context.stroke();
  Kamra.Draw.shapeOpen = false;
};
vertex = function(x, y) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(!Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can only use vertex() in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.lineTo(toPixels(x), toPixels(y));
};
quadVertex = function(cx, cy, x, y) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(!Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can only use quadVertex() in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.quadraticCurveTo(toPixels(cx), toPixels(cy), toPixels(x), toPixels(y));
};
bezierVertex = function(cx1, cy1, cx2, cy2, x, y) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(!Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can only use bezierVertex() in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.bezierCurveTo(toPixels(cx1), toPixels(cy1), toPixels(cx2), toPixels(cy2), toPixels(x), toPixels(y));
};

point = function(x, y) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.beginPath();
  Kamra.Canvas.context.moveTo(toPixels(x), toPixels(y));
  Kamra.Canvas.context.lineTo(toPixels(x), toPixels(y));
  Kamra.Canvas.context.stroke();
};
line = function(x1, y1, x2, y2) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.beginPath();
  Kamra.Canvas.context.moveTo(toPixels(x1), toPixels(y1));
  Kamra.Canvas.context.lineTo(toPixels(x2), toPixels(y2));
  Kamra.Canvas.context.stroke();
};

arc = function(x, y, w, h, start, stop) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  var realX = x,
      realY = y,
      realW = w,
      realH = h;
  
  switch(Kamra.Draw.ellipseMode) {
    case CORNER: 
      realX = x - w/2;
      realY = y - h/2; break;
    case CORNERS:
      realX = (x + w)/2;
      realY = (y + h)/2;
      realW = w - x;
      realH = h - y; break;
    case RADIUS: 
      realW = w * 2;
      realH = h * 2; break;
  }
  
  if(Kamra.Canvas.configured) {
    realX = toPixels(realX);
    realY = toPixels(realY);
    realW = toPixels(realW);
    realH = toPixels(realH);
  }
  
  Kamra.Canvas.context.beginPath();
  Kamra.Canvas.context.ellipse(realX, realY, realW, realH, 0, start, stop);
  Kamra.Canvas.context.lineTo(realX, realY);
  Kamra.Canvas.context.fill();
  
  Kamra.Canvas.context.beginPath();
  Kamra.Canvas.context.ellipse(realX, realY, realW, realH, 0, start, stop);
  Kamra.Canvas.context.stroke();
};
ellipse = function(x, y, w, h) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.beginPath();
  
  var realX = x,
      realY = y,
      realW = w,
      realH = h;
  
  switch(Kamra.Draw.ellipseMode) {
    case CORNER: 
      realX = x - w/2;
      realY = y - h/2; break;
    case CORNERS:
      realX = (x + w)/2;
      realY = (y + h)/2;
      realW = w - x;
      realH = h - y; break;
    case RADIUS: 
      realW = w * 2;
      realH = h * 2; break;
  }
  
  if(Kamra.Canvas.configured) {
    realX = toPixels(realX);
    realY = toPixels(realY);
    realW = toPixels(realW/2);
    realH = toPixels(realH/2);
  }
  
  Kamra.Canvas.context.ellipse(realX, realY, realW, realH, 0, 0, 6.3);
  Kamra.Canvas.context.fill();
  Kamra.Canvas.context.stroke();
};
ellipseSection = function(x, y, w, h, start, stop) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.beginPath();
  
  var realX = x,
      realY = y,
      realW = w,
      realH = h;
  
  switch(Kamra.Draw.ellipseMode) {
    case CORNER: 
      realX = x - w/2;
      realY = y - h/2; break;
    case CORNERS:
      realX = (x + w)/2;
      realY = (y + h)/2;
      realW = w - x;
      realH = h - y; break;
    case RADIUS: 
      realW = w * 2;
      realH = h * 2; break;
  }
  
  if(Kamra.Canvas.configured) {
    realX = toPixels(realX);
    realY = toPixels(realY);
    realW = toPixels(realW);
    realH = toPixels(realH);
  }
  
  Kamra.Canvas.context.ellipse(realX, realY, realW, realH, 0, start, stop);
  Kamra.Canvas.context.fill();
  Kamra.Canvas.context.stroke();
};
poly = function() {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  Kamra.Canvas.context.beginPath();
  Kamra.Canvas.context.moveTo(toPixels(arguments[0]), toPixels(arguments[1]));
  for(var i = 2; i < arguments.length; i += 2) {
    Kamra.Canvas.context.lineTo(toPixels(arguments[i]), toPixels(arguments[i + 1]));
  }
  Kamra.Canvas.context.closePath();
  
  Kamra.Canvas.context.fill();
  Kamra.Canvas.context.stroke();
};
rect = function(x, y, w, h, tl, tr, br, bl) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  if(arguments.length > 8 || arguments.length < 4) {
    console.warn("Kamra Warning - rect() takes 4 - 8 arguments.");
    return;
  }
  
  var realX = x,
    realY = y,
    realW = w,
    realH = h;

  switch (Kamra.Draw.rectMode) {
    case CORNERS:
      realW = w - x;
      realH = h - y;
      break;
    case RADIUS:
      realX = x + w / 2;
      realY = y + h / 2;
      realW = w * 2;
      realH = h * 2;
      break;
    case CENTER:
      realX = x - w / 2;
      realY = y - h / 2;
      break;
  }
  
  realX = toPixels(realX);
  realY = toPixels(realY);
  realW = toPixels(realW);
  realH = toPixels(realH);
  
  tl = tl || 0;
  tr = tr || tl;
  br = br || tl;
  bl = bl || tl;

  Kamra.Canvas.context.beginPath();

  Kamra.Canvas.context.moveTo(realX + toPixels(tl), realY);
  Kamra.Canvas.context.lineTo(realX + realW - toPixels(tr), realY);
  Kamra.Canvas.context.quadraticCurveTo(realX + realW, realY, realX + realW, realY + toPixels(tr));
  Kamra.Canvas.context.lineTo(realX + realW, realY + realH - toPixels(br));
  Kamra.Canvas.context.quadraticCurveTo(realX + realW, realY + realH, realX + realW - toPixels(br), realY + realH);
  Kamra.Canvas.context.lineTo(realX + toPixels(bl), realY + realH);
  Kamra.Canvas.context.quadraticCurveTo(realX, realY + realH, realX, realY + realH - toPixels(bl));
  Kamra.Canvas.context.lineTo(realX, realY + toPixels(tl));
  Kamra.Canvas.context.quadraticCurveTo(realX, realY, realX + toPixels(tl), realY);
  Kamra.Canvas.context.closePath();

  Kamra.Canvas.context.fill();
  Kamra.Canvas.context.stroke();
};

text = function(content, x, y) {
  if(!Kamra.Canvas.configured) {
    console.warn("Kamra Warning - You must use configure(); before you can draw!");
    return;
  }
  
  if(Kamra.Draw.shapeOpen) {
    console.warn("Kamra Warning - You can't use other shape commands when in shape mode.");
    return;
  }
  
  if(arguments.length === 0 || arguments.length > 3) {
    console.warn("Kamra Warning - text() takes 1 - 3 arguments.");
  }
  
  var size = getTextSize();
  
  var enterSplit = content.split("\n");
  
  var adjust = 0;
  if(getTextBaseline().toLowerCase() === "middle") {
    adjust = -0.5 * (enterSplit.length - 1) * size * (1 + Kamra.Draw.textLineSpacing);
  }
  
  
  for(var i = 0; i < enterSplit.length; i++) {
    Kamra.Canvas.context.fillText(enterSplit[i], toPixels(x || 0), adjust + toPixels(y || 0) + i * size * (1 + Kamra.Draw.textLineSpacing));
  }
};
/** END DRAW **/

/** VECTOR2 **/
var Vector2 = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};
Vector2.add = function(toAdd1, toAdd2) {
  return new Vector2(
    toAdd1.x + toAdd2.x,
    toAdd1.y + toAdd2.y
  );
};
Vector2.sub = function(subtractFrom, toSubtract) {
  return new Vector2(
    subtractFrom.x - toSubtract.x,
    subtractFrom.y - toSubtract.y
  );
};
Vector2.mult = function(toMultiply, scaleFactor) {
  return new Vector2(
    toMultiply.x * scaleFactor,
    toMultiply.y * scaleFactor
  );
};
Vector2.div = function(toDivide, inverseFactor) {
  return new Vector2(
    toDivide.x / inverseFactor,
    toDivide.y / inverseFactor
  );
};
Vector2.prototype.add = function(toAdd) {
  this.x += toAdd.x;
  this.y += toAdd.y;
  return this;
};
Vector2.prototype.sub = function(toSubtract) {
  this.x -= toSubtract.x;
  this.y -= toSubtract.y;
  return this;
};
Vector2.prototype.mult = function(scaleFactor) {
  this.x *= scaleFactor;
  this.y *= scaleFactor;
  return this;
};
Vector2.prototype.div = function(inverseFactor) {
  this.x /= inverseFactor;
  this.y /= inverseFactor;
  return this;
};

/** Non-Arithmetic Basic Functions **/
Vector2.array = function(toConvert) {
  return [toConvert.x, toConvert.y];
};
Vector2.prototype.array = function() {
  return [this.x, this.y];
};
Vector2.prototype.get = function() {
  return new Vector2(this.x, this.y);
};
Vector2.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
};

/** Advanced Utility Functions **/
Vector2.rotate = function(toRotate, rotateBy) {
  var cosAngle = Math.cos(rotateBy);
  var sinAngle = Math.sin(rotateBy);
  return new Vector2(
    toRotate.x * cosAngle - toRotate.y * sinAngle,
    toRotate.x * sinAngle + toRotate.y * cosAngle
  );
};
Vector2.prototype.rotate = function(rotateBy) {
  var cosAngle = Math.cos(rotateBy);
  var sinAngle = Math.sin(rotateBy);
  var oldX = this.x;
  this.x = oldX * cosAngle - this.y * sinAngle;
  this.y = oldX * sinAngle + this.y * cosAngle;
};

Vector2.dot = function(toDot1, toDot2) {
  return toDot1.x * toDot2.x + toDot1.y * toDot2.y;
};
Vector2.prototype.dot = function(dotWith) {
  return this.x * dotWith.x + this.y * dotWith.y;
};

Vector2.mag = function(toMeasure) {
  return Math.sqrt(toMeasure.x * toMeasure.x + toMeasure.y * toMeasure.y);
};
Vector2.magSq = function(toMeasure) {
  return toMeasure.x * toMeasure.x + toMeasure.y * toMeasure.y;
};
Vector2.normalize = function(toNormalize) {
  return Vector2.div(toNormalize, toNormalize.mag());
};
Vector2.dist = function(lineEnd1, lineEnd2) {
  return Vector2.sub(lineEnd1, lineEnd2).mag();
};
Vector2.distSq = function(lineEnd1, lineEnd2) {
  return Vector2.magSq(Vector2.sub(lineEnd1, lineEnd2));
};
Vector2.mid = function(lineEnd1, lineEnd2) {
  return new Vector2(
    lineEnd1.x / 2 + lineEnd2.x / 2,
    lineEnd1.y / 2 + lineEnd2.y / 2
  );
};
Vector2.lerp = function(lerpFrom, lerpTo, lerpStage) {
  return new Vector2(
    lerpFrom.x + (lerpTo.x - lerpFrom.x) * lerpStage,
    lerpFrom.y + (lerpTo.y - lerpFrom.y) * lerpStage
  );
};
Vector2.prototype.mag = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
Vector2.prototype.magSq = function() {
  return this.x * this.x + this.y * this.y;
};
Vector2.prototype.normalize = function() {
  this.div(this.mag());
};
Vector2.prototype.dist = function(lineEnd) {
  return Vector2.sub(this, lineEnd).mag();
};
Vector2.prototype.distSq = function(lineEnd) {
  return Vector2.sub(this, lineEnd).magSq();
};
Vector2.prototype.mid = function(lineEnd) {
  return new Vector2(
    this.x / 2 + lineEnd.x / 2,
    this.y / 2 + lineEnd.y / 2
  );
};
Vector2.prototype.lerp = function(lerpWith, lerpStage) {
  return new Vector2(
    this.x + (lerpWith.x - this.x) * lerpStage,
    this.y + (lerpWith.y - this.y) * lerpStage
  );
};

Vector2.prototype.toString = function() {
  return this.x + "," + this.y;
};
/** Point Reflection Over Line **/
Vector2.reflect = function(point, endpoint1, endpoint2) {
  return Vector2.sub(point,
    Vector2.mult(
      Vector2.sub(point, new Vector2(
        (Kamra.Physics.Equation.B(endpoint1, endpoint2) - Kamra.Physics.Equation.TB(Kamra.Physics.Equation.PM(endpoint1, endpoint2), point)) /
        (Kamra.Physics.Equation.PM(endpoint1, endpoint2) - Kamra.Physics.Equation.M(endpoint1, endpoint2)), Kamra.Physics.Equation.M(endpoint1, endpoint2) *
        (Kamra.Physics.Equation.B(endpoint1, endpoint2) - Kamra.Physics.Equation.TB(Kamra.Physics.Equation.PM(endpoint1, endpoint2), point)) /
        (Kamra.Physics.Equation.PM(endpoint1, endpoint2) - Kamra.Physics.Equation.M(endpoint1, endpoint2)) + Kamra.Physics.Equation.B(endpoint1, endpoint2)
      )),
    2)
  );
};
Vector2.prototype.reflect = function(endpoint1, endpoint2) {
  return Vector2.sub(this,
    Vector2.mult(
      Vector2.sub(this, new Vector2(
        (Kamra.Physics.Equation.B(endpoint1, endpoint2) - Kamra.Physics.Equation.TB(Kamra.Physics.Equation.PM(endpoint1, endpoint2), this)) /
        (Kamra.Physics.Equation.PM(endpoint1, endpoint2) - Kamra.Physics.Equation.M(endpoint1, endpoint2)), Kamra.Physics.Equation.M(endpoint1, endpoint2) *
        (Kamra.Physics.Equation.B(endpoint1, endpoint2) - Kamra.Physics.Equation.TB(Kamra.Physics.Equation.PM(endpoint1, endpoint2), this)) /
        (Kamra.Physics.Equation.PM(endpoint1, endpoint2) - Kamra.Physics.Equation.M(endpoint1, endpoint2)) + Kamra.Physics.Equation.B(endpoint1, endpoint2)
      )),
    2)
  );
};
/** END VECTOR2 **/

/** VECTOR3 **/
var Vector3 = function(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
};
Vector3.add = function(toAdd1, toAdd2) {
  return new Vector3(
    toAdd1.x + toAdd2.x,
    toAdd1.y + toAdd2.y,
    toAdd1.z + toAdd2.z
  );
};
Vector3.sub = function(subtractFrom, toSubtract) {
  return new Vector3(
    subtractFrom.x - toSubtract.x,
    subtractFrom.y - toSubtract.y,
    subtractFrom.z - toSubtract.z
  );
};
Vector3.mult = function(toMultiply, scaleFactor) {
  return new Vector3(
    toMultiply.x * scaleFactor,
    toMultiply.y * scaleFactor,
    toMultiply.z * scaleFactor
  );
};
Vector3.div = function(toDivide, inverseFactor) {
  return new Vector3(
    toDivide.x / inverseFactor,
    toDivide.y / inverseFactor,
    toDivide.z / inverseFactor
  );
};
Vector3.prototype.add = function(toAdd) {
  this.x += toAdd.x;
  this.y += toAdd.y;
  this.z += toAdd.z;
  return this;
};
Vector3.prototype.sub = function(toSubtract) {
  this.x -= toSubtract.x;
  this.y -= toSubtract.y;
  this.z -= toSubtract.z;
  return this;
};
Vector3.prototype.mult = function(scaleFactor) {
  this.x *= scaleFactor;
  this.y *= scaleFactor;
  this.z *= scaleFactor;
  return this;
};
Vector3.prototype.div = function(inverseFactor) {
  this.x /= inverseFactor;
  this.y /= inverseFactor;
  this.z /= inverseFactor;
  return this;
};

Vector3.array = function(toConvert) {
  return [toConvert.x, toConvert.y, toConvert.z];
};
Vector3.prototype.array = function() {
  return [this.x, this.y, this.z];
};
Vector3.prototype.set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};
Vector3.prototype.get = function() {
  return new Vector3(this.x, this.y, this.z);
};

Vector3.mag = function(toMeasure) {
  return Math.sqrt(toMeasure.x * toMeasure.x + toMeasure.y * toMeasure.y + toMeasure.z * toMeasure.z);
};
Vector3.magSq = function() {
  return this.x * this.x + this.y * this.y + this.z * this.z;
};
Vector3.normalize = function(toNormalize) {
  return Vector3.div(toNormalize, toNormalize.mag());
};
Vector3.dist = function(lineEnd1, lineEnd2) {
  return Vector3.sub(lineEnd1, lineEnd2).mag();
};
Vector3.distSq = function(lineEnd1, lineEnd2) {
  return Vector3.sub(lineEnd1, lineEnd2).magSq();
};
Vector3.mid = function(lineEnd1, lineEnd2) {
  return new Vector3(
    lineEnd1.x / 2 + lineEnd2.x / 2,
    lineEnd1.y / 2 + lineEnd2.y / 2,
    lineEnd1.z / 2 + lineEnd2.z / 2
  );
};
Vector3.lerp = function(lerpFrom, lerpTo, stage) {
  return new Vector3(
    lerpFrom.x + (lerpFrom.x - lerpTo.x) * stage,
    lerpFrom.y + (lerpFrom.y - lerpTo.y) * stage,
    lerpFrom.z + (lerpFrom.z - lerpTo.z) * stage
  );
};
Vector3.cross = function(cross1, cross2) {
  return new Vector3(
    cross1.y * cross2.z - cross1.z * cross2.y,
    cross1.z * cross2.x - cross1.x * cross2.z,
    cross1.x * cross2.y - cross1.y * cross2.x
  );
};
Vector3.prototype.mag = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};
Vector3.prototype.magSq = function() {
  return this.x * this.x + this.y * this.y + this.z * this.z;
};
Vector3.prototype.normalize = function() {
  this.div(this.mag());
  return this;
};
Vector3.prototype.dist = function(lineEnd) {
  return Vector3.sub(this, lineEnd).mag();
};
Vector3.prototype.distSq = function(lineEnd) {
  return Vector3.sub(this, lineEnd).magSq();
};
Vector3.prototype.mid = function(lineEnd) {
  return new Vector3(
    this.x / 2 + lineEnd.x / 2,
    this.y / 2 + lineEnd.y / 2,
    this.z / 2 + lineEnd.z / 2
  );
};
Vector3.prototype.lerp = function(lerpWith, stage) {
  return new Vector3(
    this.x + (lerpWith.x - this.x) * stage,
    this.y + (lerpWith.y - this.y) * stage,
    this.z + (lerpWith.z - this.z) * stage
  );
};
Vector3.prototype.cross = function(crossWith) {
  return new Vector3(
    this.y * crossWith.z - this.z * crossWith.y,
    this.z * crossWith.x - this.x * crossWith.z,
    this.x * crossWith.y - this.y * crossWith.x
  );
};

Vector3.prototype.rotateX = function(theta) {
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
  
  var ry = this.y * cosTheta - this.z * sinTheta;
  var rz = this.y * sinTheta + this.z * cosTheta;
  
  return this.set(this.x, ry, rz);
};
Vector3.prototype.rotateY = function(theta) {
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
  
  var rx = this.x * cosTheta - this.z * sinTheta;
  var rz = this.x * sinTheta + this.z * cosTheta;
  
  return this.set(rx, this.y, rz);
};
Vector3.prototype.rotateZ = function(theta) {
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
  
  var rx = this.x * cosTheta - this.y * sinTheta;
  var ry = this.x * sinTheta + this.y * cosTheta;
  
  return this.set(rx, ry, this.z);
};
/** END VECTOR3 **/
