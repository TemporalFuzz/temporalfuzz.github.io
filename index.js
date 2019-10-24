var canvasEl = document.getElementById("canvas");
configure(canvasEl);
resize(800, 400);
noArrowScroll();
strokeCap(ROUND);

var Camera = new Vector3(0, 0, 800);

/*var points = [];
var triangles = [];

for(var i = 0; i < 30; i++) {
  points.push(new Vector3( 100,  100, -150 + i * 10));
  points.push(new Vector3( 100, -100, -150 + i * 10));
  points.push(new Vector3(-100,    0, -300 + i * 20));
  
  triangles.push([i * 3, i * 3 + 1, i * 3 + 2, { r: 255 * i/30, g: 0, b: 255 - 255 * i/30, a:255 }]);
}*/

/*var points = [];
var triangles = [];
var a = new Vector3(   0,   50,  -50);
var b = new Vector3(   0,   50,   50);
var c = new Vector3(   0,  200,    0);

for(var i = 0; i < 36; i++) {
  points.push(a.get());
  points.push(b.get());
  points.push(c.get());
  a.rotateZ(3.14159 * 2/36);
  b.rotateZ(3.14159 * 2/36);
  c.rotateZ(3.14159 * 2/36);
}
for(var i = 0; i < 36; i++) {
  triangles.push([i * 3, i * 3 + 1, i * 3 + 2, { r: 255 - Math.abs(255 * i/30), g: 0, b: Math.abs(255 - 255 * i/18), a:255 } ]);
}*/

var points = [];
var triangles = [];
var a = new Vector3(   0,   50,  -50);
var b = new Vector3(   0,   50,   50);
var c = new Vector3(   0,  100,  -50);
var d = new Vector3(   0,  100,   50);

for(var i = 0; i < 36; i++) {
  points.push(a.get());
  points.push(b.get());
  points.push(c.get());
  points.push(d.get());
  a.rotateZ(3.14159 * 2/36);
  b.rotateZ(3.14159 * 2/36);
  c.rotateZ(3.14159 * 2/36);
  d.rotateZ(3.14159 * 2/36);
}
for(var i = 0; i < 36; i++) {
  var segmentColor = { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255, a: 255};
  triangles.push([(i * 4 + 2) % 144, (i * 4 + 3) % 144, (i * 4 + 7) % 144, segmentColor]);
  triangles.push([(i * 4 + 2) % 144, (i * 4 + 6) % 144, (i * 4 + 7) % 144, segmentColor]);
  triangles.push([(i * 4 + 0) % 144, (i * 4 + 1) % 144, (i * 4 + 4) % 144, segmentColor]);
  triangles.push([(i * 4 + 1) % 144, (i * 4 + 4) % 144, (i * 4 + 5) % 144, segmentColor]);
  triangles.push([(i * 4 + 0) % 144, (i * 4 + 2) % 144, (i * 4 + 4) % 144, segmentColor]);
  triangles.push([(i * 4 + 2) % 144, (i * 4 + 4) % 144, (i * 4 + 6) % 144, segmentColor]);
  //triangles.push([(i * 4 + 1) % 144, (i * 4 + 3) % 144, (i * 4 + 5) % 144, segmentColor]);
  //triangles.push([(i * 4 + 3) % 144, (i * 4 + 5) % 144, (i * 4 + 7) % 144, segmentColor]);
}

/*var points = [];
var triangles = [];
var a = new Vector3(   0,   75,  -50);
var b = new Vector3(   0,   75,   50);
var c = new Vector3(   0,  100,  -70);
var d = new Vector3(   0,  100,   70);

for(var i = 0; i < 36; i++) {
  points.push(a.get());
  points.push(b.get());
  points.push(c.get());
  points.push(d.get());
  a.rotateZ(3.14159 * 2/36);
  b.rotateZ(3.14159 * 2/36);
  c.rotateZ(3.14159 * 2/36);
  d.rotateZ(3.14159 * 2/36);
}

for(var i = 0; i < 36; i++) {
  var segmentColor = { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255, a: 255};
  
  triangles.push([(i * 4 + 2) % 144, (i * 4 + 3) % 144, (i * 4 + 6) % 144, segmentColor]);
  triangles.push([(i * 4 + 3) % 144, (i * 4 + 6) % 144, (i * 4 + 7) % 144, segmentColor]);
  triangles.push([(i * 4 + 0) % 144, (i * 4 + 1) % 144, (i * 4 + 4) % 144, segmentColor]);
  triangles.push([(i * 4 + 1) % 144, (i * 4 + 4) % 144, (i * 4 + 5) % 144, segmentColor]);
  var segmentColor = { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255, a: 255};
  
  triangles.push([(i * 4 + 1) % 144, (i * 4 + 3) % 144, (i * 4 + 7) % 144, segmentColor]);
  triangles.push([(i * 4 + 1) % 144, (i * 4 + 5) % 144, (i * 4 + 7) % 144, segmentColor]);
  triangles.push([(i * 4 + 0) % 144, (i * 4 + 2) % 144, (i * 4 + 6) % 144, segmentColor]);
  triangles.push([(i * 4 + 0) % 144, (i * 4 + 4) % 144, (i * 4 + 6) % 144, segmentColor]);
}*/

/*var points = [
  new Vector3( 100,  100,    0),
  new Vector3(-100,  100,    0),
  new Vector3(   0, -100,    0),
  new Vector3(   0,   20,  150),
  new Vector3(   0,   20, -150),
];
var triangles = [
  //[0, 1, 2, 0],
  //[0, 1, 3, 50],
  //[0, 2, 3, 100],
  //[1, 2, 3, 150],
  //[0, 1, 4, 100],
  //[0, 2, 4, 150],
  //[1, 2, 4, 50],
];*/


//the messy one
/*var points = [
  new Vector3(  25,    0, -100),
  new Vector3( -25,    0, -100),
  new Vector3(   0,    0,  100),
  
  new Vector3( -25,  -50,   0),
  new Vector3(  25,  -50,   0),
  new Vector3(-150,   50,   100)
];
var triangles = [
  [0, 1, 2, 200],
  [3, 4, 5, 100]
];*/


/*points.push(new Vector3( -50,   50,    0));
points.push(new Vector3(  50,   50,    0));
points.push(new Vector3(   0,  -50,    0));

triangles.push([144, 145, 146, 0]);*/

/*var points = [
  new Vector3( 100,  100,    5),
  new Vector3( 100, -100,    5),
  new Vector3(-100,    0,   15),
  new Vector3( 100,  100,    0),
  new Vector3( 100, -100,    0),
  new Vector3(-100,    0,    0),
  new Vector3( 100,  100,   -5),
  new Vector3( 100, -100,   -5),
  new Vector3(-100,    0,  -15),
];
var triangles = [
  [0, 1, 2, 50],
  [3, 4, 5, 100],
  [6, 7, 8, 150],
];*/

/*var points = [
  new Vector3( 100,  100,    0),
  new Vector3( 100, -100,    0),
  new Vector3(-100,    0,    0),
  new Vector3(   0,   50,   50),
  new Vector3( 100,    0,  100),
  new Vector3(-100,    0,  100),
  new Vector3(   0, -100,  -50),
  new Vector3( 100,    0, -100),
  new Vector3(-100,    0, -100),
];

var triangles = [

  [0, 1, 2, 0],
  [3, 4, 5, 150],
  //[6, 7, 8, 150]
];*/

var randomizeArray = function(a) {
  var temp = a.slice();
  var out = [];
  
  while(temp.length > 0) {
    var taken = Math.floor(Math.random() * temp.length);
    out.push(temp.splice(taken, 1)[0]);
  }
  
  return out;
};

//triangles = randomizeArray(triangles);

function findLargest(a) {
  var largest = a[0];
  for(var i = 1; i < a.length; i++) {
    if(a[i] > largest) {
      largest = a[i];
    }
  }
  return largest;
}

function findSmallest(a) {
  var smallest = a[0];
  for(var i = 1; i < a.length; i++) {
    if(a[i] < smallest) {
      smallest = a[i];
    }
  }
  return smallest;
}

function triangleSharedPoints(a, b) {
  var shared = [];
  for(var i = 0; i < 3; i++) {
    for(var j = 0; j < 3; j++) {
      if(a[i] === b[j]) {
        shared.push(a[i]);
      }
    }
  }
  return shared;
}
/*function inAnotB(a, b) {
  a = a.slice();
  var bad;
  for(var i = a.length - 1; i >= 0; i--) {
    bad = false;
    for(var j = 0; j < b.length; j++) {
      if(a[i] === b[j]) {
        bad = true;
      }
    }
    if(bad) {
      a.splice(i, 1);
    }
  }
  return a;
};*/

function D(p, cross) {
  return cross.x * p.x + cross.y * p.y + cross.z * p.z;
};

function compareTriangles(one, two) {
  /*var zOne = [points[one[0]].z, points[one[1]].z, points[one[2]].z];
  var zTwo = [points[two[0]].z, points[two[1]].z, points[two[2]].z];
  
  if(findSmallest(zTwo) > findLargest(zOne)) {
    return 0;
  }
  if(findSmallest(zOne) > findLargest(zTwo)) {
    return 1;
  }*/
  
  /*var shared = triangleSharedPoints(one, two);
  
  if(shared.length >= 3) {
    return 0;
  }*/
  
  //let oneA = points[one[0]];
  //let oneB = points[one[1]];
  //let oneC = points[one[2]];
  
  let oneLineA = Vector3.sub(points[one[1]], points[one[0]]);
  let oneLineB = Vector3.sub(points[one[2]], points[one[0]]);
  let oneCross = Vector3.cross(oneLineA, oneLineB);
  
  //let twoA = points[two[0]];
  //let twoB = points[two[1]];
  //let twoC = points[two[2]];
  
  let twoLineA = Vector3.sub(points[two[1]], points[one[0]]);
  let twoLineB = Vector3.sub(points[two[2]], points[one[0]]);
  let twoCross = Vector3.cross(twoLineA, twoLineB);
  
  let onePoints = [points[one[0]], points[one[1]], points[one[2]]];
  let twoPoints = [points[two[0]], points[two[1]], points[two[2]]];
  
  let validOnePoints = [];
  let validTwoPoints = [];
  
  let dOneCamera = D(Camera, oneCross);
  let dTwoCamera = D(Camera, twoCross);
  
  var oneResults = [
  //21 22 23
    [0, 0, 0],//11
    [0, 0, 0],//12
    [0, 0, 0] //13
  ];
  var twoResults = [
  //21 22 23
    [0, 0, 0],//11
    [0, 0, 0],//12
    [0, 0, 0] //13
  ];
  /*var results = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];*/
  
  for(var i = 0; i < onePoints.length; i++) {
    let dA = D(onePoints[i], oneCross);
    for(var j = 0; j < twoPoints.length; j++) {
      let dB = D(twoPoints[j], oneCross);
      if(Math.abs(dA - dB) < 0.01) {
        oneResults[i][j] = 0;
      }
      else if((dOneCamera > dA && dA > dB) || (dOneCamera < dA && dA < dB)) {
        oneResults[i][j] = 1;
      }
      else {
        oneResults[i][j] = 2;
      }
    }
  }
  for(var i = 0; i < twoPoints.length; i++) {
    let dA = D(twoPoints[i], twoCross);
    for(var j = 0; j < onePoints.length; j++) {
      let dB = D(onePoints[j], twoCross);
      if(Math.abs(dA - dB) < 0.01) {
        twoResults[i][j] = 0;
      }
      else if((dTwoCamera > dA && dA > dB) || (dOneCamera < dA && dA < dB)) {
        twoResults[i][j] = 2;
      }
      else {
        twoResults[i][j] = 1;
      }
    }
  }
  
  
  /*for(var i = 0; i < 3; i++) {
    console.log(Math.round(D(onePoints[i], oneCross) * 1000)/1000);
    console.log(Math.round(D(onePoints[i], twoCross) * 1000)/1000);
    console.log(Math.round(D(twoPoints[i], oneCross) * 1000)/1000);
    console.log(Math.round(D(twoPoints[i], twoCross) * 1000)/1000);
  }
  
  //Debug
  strokeWeight(5);
  textSize(8);
  fill(0);
  for(var i = 0; i < 3; i++) {
    stroke(255, 0, 0);
    point(onePoints[i]);
    text(i, onePoints[i].x - 10, onePoints[i].y - 10);
    stroke(0, 255, 0);
    point(twoPoints[i]);
    text(i, twoPoints[i].x - 10, twoPoints[i].y - 10);
  }*/
  
  /*console.log("    0  1  2   0  1  2");
  for(var i = 0; i < 3; i++) {
    console.log(i + " | " + oneResults[i].join(", ") + " | " + twoResults[i].join(", "));
  }*/
  
  let oneCount = 0;
  let twoCount = 0;
  
  for(var i = 0; i < oneResults.length; i++) {
    for(var j = 0; j < oneResults[i].length; j++) {
      if(oneResults[i][j] === 1) {
        oneCount++;
      }
      if(oneResults[i][j] === 2) {
        twoCount++;
      }
    }
  }
  for(var i = 0; i < twoResults.length; i++) {
    for(var j = 0; j < twoResults[i].length; j++) {
      if(twoResults[i][j] === 1) {
        oneCount++;
      }
      if(twoResults[i][j] === 2) {
        twoCount++;
      }
    }
  }
  
  if(oneCount === twoCount) {
    return 1;
  }
  
  if(oneCount > twoCount) {
    return 1;
  }
  return 2;
  
  /*let oneCount = 0;
  let twoCount = 0;
  
  for(var i = 0; i < results.length; i++) {
    for(var j = 0; j < results[i].length; j++) {
      if(results[i][j] === 1) {
        oneCount++;
      }
      if(results[i][j] === 2) {
        twoCount++;
      }
    }
  }
  
  if(oneCount === twoCount) {
    return 1;
  }
  
  if(oneCount > twoCount) {
    return 1;
  }
  return 2;*/
  
  /*for(var i = 0; i < onePoints.length; i++) {
    let answer, valid = true;
    let dA = D(onePoints[i], oneCross);
    for(var j = 0; j < twoPoints.length; j++) {
      let dB = D(twoPoints[j], oneCross);
      if((dOneCamera > dA && dA > dB) || (dOneCamera < dA && dA < dB)) {
        if(!answer) {
          answer = 1;
        }
        else if(answer === 2) {
          valid = false;
          break;
        }
      }
      else {
        if(!answer) {
          answer = 2;
        }
        else if(answer === 1) {
          valid = false;
          break;
        }
      }
    }
    if(valid) {
      validOnePoints.push(onePoints[i]);
    }
  }
  
  for(var i = 0; i < twoPoints.length; i++) {
    let answer, valid = true;
    let dA = D(twoPoints[i], twoCross);
    for(var j = 0; j < onePoints.length; j++) {
      let dB = D(onePoints[j], twoCross);
      if((dTwoCamera > dA && dA > dB) || (dTwoCamera < dA && dA < dB)) {
        if(!answer) {
          answer = 2;
        }
        else if(answer === 1) {
          valid = false;
          break;
        }
      }
      else {
        if(!answer) {
          answer = 1;
        }
        else if(answer === 2) {
          valid = false;
          break;
        }
      }
    }
    if(valid) {
      validTwoPoints.push(twoPoints[i]);
    }
  }
  
  if(validOnePoints.length === 0) {
    
  }
  if(validTwoPoints.length === 0) {
    
  }

  stroke(255, 0, 0);
  strokeWeight(5);
  for(var i = 0; i < validOnePoints.length; i++) {
    point(validOnePoints[i]);
  }
  stroke(0, 255, 0);
  strokeWeight(5);
  for(var i = 0; i < validTwoPoints.length; i++) {
    point(validTwoPoints[i]);
  }*/
  
  
  /*let reference, referenceCross, other, otherCross, modifier;
  
  if(Math.abs(oneCross.z) >= Math.abs(twoCross.z)) {
    modifier = 0;
    reference = one;
    referenceCross = oneCross;
    other = two;
    otherCross = twoCross;
  }
  else {
    modifier = 1;
    reference = two;
    referenceCross = twoCross;
    other = one;
    otherCross = oneCross;
  }
  
  
  
  let referencePoints = inAnotB([reference[0], reference[1], reference[2]], [other[0], other[1], other[2]]);
  let referencePoint = points[referencePoints[0]];
  let minDist = Vector3.dist(referencePoint, Camera);
  for(var i = 1; i < referencePoints.length; i++) {
    let dist = Vector3.dist(points[referencePoints[i]], Camera);
    if(dist < minDist) {
      minDist = dist;
      referencePoint = points[referencePoints[i]];
    }
  }
  
  let otherPoints = inAnotB([other[0], other[1], other[2]], [reference[0], reference[1], reference[2]]);
  let otherPoint = points[otherPoints[0]];
  minDist = Vector3.dist(otherPoint, Camera);
  for(var i = 1; i < otherPoints.length; i++) {
    let dist = Vector3.dist(points[otherPoints[i]], Camera);
    if(dist < minDist) {
      minDist = dist;
      otherPoint = points[otherPoints[i]];
    }
  }
  
  let dCamera = D(Camera, referenceCross);
  let dReference = D(referencePoint, referenceCross);
  let dOther = D(otherPoint, referenceCross);
  
  strokeWeight(6);
  stroke(0, 255, 0);
  point(referencePoint);
  stroke(255, 0, 0);
  point(otherPoint);
  
  
  if(dCamera > dReference && dReference > dOther) {
    //console.log(reference[4], other[4], reference[4] + " wins");
    return modifier;
  }
  else if(dCamera < dReference && dReference < dOther) {
    //console.log(reference[4], other[4], reference[4] + " wins");
    return modifier;
  }
  //console.log(reference[4], other[4], other[4] + " wins");
  return 1 - modifier;*/
}

function sortTriangles(set) {
  if(set.length === 0) {
    return [];
  }
  if(set.length === 1) {
    return [set[0]];
  }
  
  
  if(set.length === 2) {
    if(compareTriangles(set[0], set[1]) === 2) {
      
      return [set[0], set[1]];
    }
    else {
      return [set[1], set[0]];
    }
  }
  let ahead = [];
  let behind = [];
  for(var i = 1; i < set.length; i++) {
    if(compareTriangles(set[0], set[i]) === 1) {
      behind.push(set[i]);
    }
    else {
      ahead.push(set[i]);
    }
  }
  return sortTriangles(behind).concat([set[0]].concat(sortTriangles(ahead)));
};

var ordered = sortTriangles(triangles.slice());

function draw() {
  console.clear();
  background(255);
  pushMatrix();
  translate(Camera.x + width/2, Camera.y + height/2);
  strokeWeight(0.5);
  for(var i = 0; i < ordered.length; i++) {
    fill(ordered[i][3]);
    //stroke(ordered[i][3]);
    stroke(0);
    beginShape();
    for(var j = 0; j < ordered[i].length - 1; j++) {
      var zDif = Camera.z - points[ordered[i][j]].z;
      //vertex(points[ordered[i][j]].x, points[ordered[i][j]].y);
      vertex(points[ordered[i][j]].x * 800/zDif, points[ordered[i][j]].y * 800/zDif);
    }
    var zDif = Camera.z - points[ordered[i][0]].z;
    vertex(points[ordered[i][0]].x * 800/zDif, points[ordered[i][0]].y * 800/zDif);
    endShape();
  }
  /*textSize(16);
  fill(0);
  for(var i = 0; i < points.length; i++) {
    //text(i + ": " + Math.floor(points[i].z) + "", points[i].x, points[i].y - 10);
    var zDif = Camera.z - points[i].z;
    text(i + ": " + Math.floor(points[i].z) + "", points[i].x * 800/zDif, points[i].y * 800/zDif - 10);
  }*/
  ordered = sortTriangles(triangles.slice());
  popMatrix();
};

loop(draw);

mouseDragged = function() {
  for(var i = 0; i < points.length; i++) {
    points[i].rotateX((pmouseY - mouseY)/100);
    points[i].rotateY((pmouseX - mouseX)/100);
  }
}
