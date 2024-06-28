var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d', { willReadFrequently: true });

const BACKGROUND_COLOR = '#000000';
// For Testing:
// const WALL_COLOR = '#39FF14';
// const MAG_COLOR = '#FFA500';
// const ORIGIN_COLOR = MAG_COLOR;
// const PHOTON_HEAD_COLOR = '#E1FF00';
// const PHOTON_TAIL_COLOR = '#00FFB3';

const PHOTON_HEAD_SIZE = 0.7;
const PHOTON_TAIL_SIZE = 0.3;
const NUMBER_TRIANGLES = 6;
const THETA = (Math.PI) / NUMBER_TRIANGLES;
let ANGLE = 0;
let RENDER_INTERVAL_TIME = 33;
const ORIGIN = [400, 275]; // The light source

const MAG = [
  new Magnifier(
    [400,275],  // `MAG` box centre.
    20,         // Side length of the `MAG` box.
    [800,200],  // `magView` box centre.
    250,        // Side length of the `magView` box.
  ),
  new Magnifier(
    [400,525],  // `MAG` box centre.
    20,         // Side length of the `MAG` box.
    [800,600],  // `magView` box centre.
    250,        // Side length of the `magView` box.
  ),
]; // The points to be magnified

function applyColors() {
  WALL_COLOR = document.getElementById("wallColorInput").value;
  PHOTON_HEAD_COLOR = document.getElementById("photonHeadColorInput").value;
  PHOTON_TAIL_COLOR = document.getElementById("photonTailColorInput").value;
  MAG_COLOR = document.getElementById("magnifierColorInput").value;
  ORIGIN_COLOR = document.getElementById("magnifierColorInput").value;
  draw(); // Update canvas with new colors
}

// Function to change number of light rays
function changeNumRays() {
    NUMBER_LIGHT_RAYS = parseInt(document.getElementById("numRaysInput").value)+1;
}

// Function to change rendering speed
function changeSpeed() {
    RENDER_INTERVAL_TIME = parseInt(document.getElementById("speedInput").value);
}

function calculateCoords() {
  COORDS = [];
  COORDS_2 = [];
  if (THETA != (Math.PI)/4) {
    for (let i = 1; i <= (2 * Math.PI) / THETA; i++) {
      if (i % 2 === 0) {
        COORDS.push([
          400 + 250 * Math.sin(i * THETA),
          275 + 250 * Math.cos(i * THETA)
        ]);
      } else {
        COORDS.push([
          400 + (125 / Math.cos(THETA)) * Math.sin(i * THETA),
          275 + (125 / Math.cos(THETA)) * Math.cos(i * THETA)
        ]);
      }
    }
  } else {
    COORDS.push(
      [400+250*Math.sin(2*THETA), 525+250*Math.cos(2*THETA)],
      [400+250*Math.sin(4*THETA), 525+250*Math.cos(4*THETA)],
      [400+250*Math.sin(6*THETA), 525+250*Math.cos(6*THETA)],
      [400+250*Math.sin(8*THETA), 525+250*Math.cos(8*THETA)],
    );
  }
  if (THETA != (Math.PI)/4) {
    for (let i = 1; i <= (2 * Math.PI) / THETA; i++) {
      if (i % 2 === 0) {
        COORDS_2.push([
          400 + 250 * Math.sin(i * THETA),
          525 + 250 * Math.cos(i * THETA)
        ]);
      } else {
        COORDS_2.push([
          400 + (125 / Math.cos(THETA)) * Math.sin(i * THETA),
          525 + (125 / Math.cos(THETA)) * Math.cos(i * THETA)
        ]);
      }
    }
  } else {
    COORDS_2.push(
      [500+250*Math.sin(2*THETA), 500+250*Math.cos(2*THETA)],
      [500+250*Math.sin(4*THETA), 500+250*Math.cos(4*THETA)],
      [500+250*Math.sin(6*THETA), 500+250*Math.cos(6*THETA)],
      [500+250*Math.sin(8*THETA), 500+250*Math.cos(8*THETA)],
    );
  }
  console.log(COORDS);
  console.log(COORDS_2);
}

// RESULTS:
// const COORDS = [
//   [472.1687836487032, 400],
//   [616.5063509461097, 400],
//   [544.3375672974064, 275],
//   [616.5063509461097, 150],
//   [472.16878364870325, 150],
//   [400, 25],
//   [327.8312163512968, 150],
//   [183.4936490538904, 150],
//   [255.66243270259358, 275],
//   [183.49364905389024, 400],
//   [327.8312163512967, 400],
//   [400, 525]
// ];

// const COORDS_2 = [
//   [472.1687836487032, 650],
//   [616.5063509461097, 650],
//   [544.3375672974064, 525],
//   [616.5063509461097, 400],
//   [472.16878364870325, 400],
//   [400, 275],
//   [327.8312163512968, 400],
//   [183.4936490538904, 400],
//   [255.66243270259358, 525],
//   [183.49364905389024, 650],
//   [327.8312163512967, 650],
//   [400, 775]
// ]

var boundaries = new Array(); // LineSegment instances representing walls.
var photons = new Array(); // Photon instances representing light.
var renderInterval;

// Streaks of light in the `MAG` box.
// Stores information in the form [Point1, Point2, Color].
var magLines = new Array(); // Streaks of light in the `MAG` box.

// Streaks of light in the canvas.
// Stores information in the form [Point1, Point2, Color].
var tailLines = new Array();

// Recording infrastructure.
var video = new Whammy.Video(RENDER_INTERVAL_TIME);
var currentlyRecording = false;
var recording = document.getElementById('recording');
var downloadButton = document.getElementById('downloadButton');
var statusElement = document.getElementById('status');
var startRecButton = document.getElementById('startRecButton');
var startFrameInput = document.getElementById('startFrameInput');
var endFrameInput = document.getElementById('endFrameInput');
var startFrameValue = undefined;
var endFrameValue = undefined;
var numCapturedFrames = 0;
var totalPhysicsUpdates = 0;

function displayStatus(message) {
  statusElement.innerHTML = message;
}

function startRecording() {
  if (currentlyRecording) {
    return;
  }
  if (!confirm('This feature only works on Firefox right now. Proceed?')) {
    return;
  }
  startFrameInput.disabled = true;
  endFrameInput.disabled = true;
  currentlyRecording = true;
}

function stopRecording() {
  if (!currentlyRecording) {
    return;
  }
  currentlyRecording = false;
  startRecButton.disabled = true;
  startAllButton.disabled = true;
  displayStatus('Compiling video...');
  const timeStart = +new Date;
  video.compile(false, function(output) {
    var url = (window.URL ? URL : webkitURL).createObjectURL(output);
    console.log(url);
    recording.src = url;
    downloadButton.href = recording.src;
    const timeEnd = +new Date;
    console.log(output);
    displayStatus(`Video compile time: ${timeEnd - timeStart}ms. Size ` +
        `${Math.ceil(output.size / 1024)}KB.`);
  });
}

// Initialize the application
window.onload = function() {
  calculateCoords();
  applyColors();
  changeNumRays();
  changeSpeed();
};

function loadBoundaries() {
  boundaries = new Array();
  for (var i = 0; i < COORDS.length; ++i) {
    nxtIdx = (i + 1) % COORDS.length;
    boundaries.push(new LineSegment(
      COORDS[i][0],
      COORDS[i][1],
      COORDS[nxtIdx][0],
      COORDS[nxtIdx][1]
    ));
  }

  for (var i = 0; i < COORDS_2.length; ++i) {
    nxtIdx = (i + 1) % COORDS_2.length;
    boundaries.push(new LineSegment(
      COORDS_2[i][0],
      COORDS_2[i][1],
      COORDS_2[nxtIdx][0],
      COORDS_2[nxtIdx][1]
    ));
  }

  boundaries.splice(18,1);
  boundaries.splice(15,1);
  boundaries.splice(9,1);
  boundaries.splice(0,1);
  
  boundaries.forEach(function(entry) {
    console.log(entry);
  });

}

function createPhotons() {
  photons = new Array();
  // Testing photons:
  // photons.push(new Photon(ORIGIN[0], ORIGIN[1], Math.PI * (1 / 6),
  //     0.151, 0.175, 'red', 'red'));
  // photons.push(new Photon(ORIGIN[0], ORIGIN[1], -Math.PI * (1 / 6),
  //     0.151, 0.175, 'red', 'red'));
  var photonRadius = 15;
  for (var i = 0; i < NUMBER_LIGHT_RAYS; ++i) {
    if (NUMBER_LIGHT_RAYS <= 470) {
      var fractionOfAngle = (i / NUMBER_LIGHT_RAYS) * (Math.PI * (5 / 3)) - (Math.PI * (4 / 3));
    } else {
      var fractionOfAngle = (i / NUMBER_LIGHT_RAYS) * (Math.PI * (4.96 / 3)) - (Math.PI * (3.98 / 3));
    }
    //photons.push(new Photon(
    photons.push(new MultiMagPhoton(
      ORIGIN[0] + Math.cos(fractionOfAngle) * photonRadius,
      ORIGIN[1] + Math.sin(fractionOfAngle) * photonRadius,
      fractionOfAngle,
      THETA/Math.PI,
      THETA/Math.PI,
      PHOTON_HEAD_COLOR,
      PHOTON_TAIL_COLOR,
      MAG.length
    ));
  }
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.fillStyle = color; 
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function drawSemiCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.fillStyle = color; 
  ctx.arc(x, y, radius, 1.5, 1.5 * Math.PI);
  ctx.fill();
}

function drawSquare(x, y, sideLength, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(x - sideLength / 2, y - sideLength / 2, sideLength, sideLength);
  ctx.closePath();
}

function drawLine(x1, y1, x2, y2, color, width = PHOTON_TAIL_SIZE) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawLineLeftOrRight(x1, y1, x2, y2, color, width = PHOTON_TAIL_SIZE, side) {
  // Calculate the angle of the line
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  // Calculate the offset distance based on the width
  const offset = width / 2;
  
  // Determine the direction of the offset
  const dx = offset * Math.cos(angle + Math.PI / 2);
  const dy = offset * Math.sin(angle + Math.PI / 2);
  
  // Adjust the coordinates based on the side
  if (side === 'left') {
    x1 += dx;
    y1 += dy;
    x2 += dx;
    y2 += dy;
  } else if (side === 'right') {
    x1 -= dx;
    y1 -= dy;
    x2 -= dx;
    y2 -= dy;
  }

  // Draw the line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawBackground() {
  ctx.beginPath();
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

function drawRoom() {
  for (var i = 0; i < COORDS.length; ++i) {
    if (i !== 0 && i !== 9 && i !== 10 && i !== 11) {
      var nxtIdx = (i + 1) % COORDS.length;
      drawLine(COORDS[i][0], COORDS[i][1], COORDS[nxtIdx][0],
          COORDS[nxtIdx][1], WALL_COLOR, 10);
      drawCircle(COORDS[i][0], COORDS[i][1], 5, WALL_COLOR);
    }
  }
  ctx.beginPath();
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.moveTo(COORDS[0][0], COORDS[0][1]);
  for (var i = 0; i < COORDS.length; ++i) {
    nxtIdx = (i + 1) % COORDS.length;
    ctx.lineTo(COORDS[nxtIdx][0], COORDS[nxtIdx][1]);
  }
  ctx.closePath();
  ctx.fill();
}

function drawRoom2() {
  for (var i = 0; i < COORDS_2.length; ++i) {
    if (i !== 3 && i !== 4 && i !==5 && i !== 6) {
      var nxtIdx = (i + 1) % COORDS_2.length;
      if (i !== 2 && i !== 7) { //DRAWN AT THE BOTTOM CUZ OF BUG
      // if (true) { Try using this to understand the bug
        drawLine(COORDS_2[i][0], COORDS_2[i][1], COORDS_2[nxtIdx][0],
            COORDS_2[nxtIdx][1], WALL_COLOR, 10);
      }
      if (i !== 7) {
      // if (true) { Try using this to understand the bug
        drawCircle(COORDS_2[i][0], COORDS_2[i][1], 5, WALL_COLOR);
      }
      else {
        drawSemiCircle(COORDS_2[i][0], COORDS_2[i][1], 5, WALL_COLOR);
      }
    }
  }
  ctx.beginPath();
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.moveTo(COORDS_2[0][0], COORDS_2[0][1]);
  for (var i = 0; i < COORDS_2.length; ++i) {
    nxtIdx = (i + 1) % COORDS_2.length;
    ctx.lineTo(COORDS_2[nxtIdx][0], COORDS_2[nxtIdx][1]);
  }
  ctx.closePath();
  ctx.fill();


  var i = 11
  var nxtIdx_new = (i + 1) % COORDS.length;
  drawLineLeftOrRight(COORDS[i][0]+1.25, COORDS[i][1]-2.5, COORDS[nxtIdx_new][0],
          COORDS[nxtIdx_new][1], WALL_COLOR, 5, "right");
  drawCircle(COORDS[nxtIdx_new][0]-3, COORDS[nxtIdx_new][1], 2.5, WALL_COLOR);
  i = 4
  nxtIdx_new = (i + 1) % COORDS_2.length;
  drawLineLeftOrRight(COORDS_2[i][0], COORDS_2[i][1], COORDS_2[nxtIdx_new][0]+1.25,
          COORDS_2[nxtIdx_new][1]+2.5, WALL_COLOR, 5, "right");


  var j = 10
  var nxtIdx_new_2 = (j + 1) % COORDS.length;
  drawLineLeftOrRight(COORDS[j][0], COORDS[j][1], COORDS[nxtIdx_new_2][0]-1.25,
          COORDS[nxtIdx_new_2][1]-2.5, WALL_COLOR, 5, "right");
  drawCircle(COORDS[j][0]+3, COORDS[j][1], 2.5, WALL_COLOR);
  j = 5
  nxtIdx_new_2 = (j + 1) % COORDS_2.length;
  drawLineLeftOrRight(COORDS_2[j][0]-1.25, COORDS_2[j][1]+2.5, COORDS_2[nxtIdx_new_2][0],
          COORDS_2[nxtIdx_new_2][1], WALL_COLOR, 5, "right");

  //DRAWN HERE CUZ OF BUG:
  drawLine(COORDS_2[2][0]+2, COORDS_2[2][1]+2, COORDS_2[3][0]+2,
          COORDS_2[3][1]+2, WALL_COLOR, 5);
  drawLine(COORDS_2[7][0]-3, COORDS_2[7][1], COORDS_2[8][0]-3,
          COORDS_2[8][1], WALL_COLOR, 5);
}

function drawPointsOfInterest() {
  drawCircle(ORIGIN[0], ORIGIN[1], 2, ORIGIN_COLOR);
  for (var i = 0; i < MAG.length; ++i) {
    drawCircle(MAG[i].mag[0], MAG[i].mag[1], 2, MAG_COLOR);
    drawCircle(MAG[i].mag[0], MAG[i].mag[1], 0.7, BACKGROUND_COLOR);
  }
}

function drawPhotons() {
  for (var i = 0; i < tailLines.length; ++i) {
    drawLine(
      tailLines[i][0][0],
      tailLines[i][0][1],
      tailLines[i][1][0],
      tailLines[i][1][1],
      tailLines[i][2]
    );
  }
  for (var i = 0; i < photons.length; ++i) {
    var len = photons[i].contactPoints.length;
    drawLine(
      photons[i].contactPoints[len - 1][0],
      photons[i].contactPoints[len - 1][1],
      photons[i].x,
      photons[i].y,
      photons[i].tailColor
    );
  }
  for (var i = 0; i < photons.length; ++i) {
    if (photons[i].active) {
      drawCircle(photons[i].x, photons[i].y, PHOTON_HEAD_SIZE, photons[i].headColor);
    }
  }
}

function drawSpecialMagLines() {
  MAG.forEach((mag, index) => {
    const [centerX, centerY] = mag.magView;
    const side = mag.magViewSide;
    const halfSide = side / 2;

    if (index === 0) {
      // For the first magnification box, draw lines to the bottom corners
      const bottomLeft = [centerX - (1/Math.sqrt(3))*halfSide, centerY + halfSide];
      const bottomRight = [centerX + (1/Math.sqrt(3))*halfSide, centerY + halfSide];

      drawLineLeftOrRight(centerX-1.25, centerY+2.5, bottomLeft[0]+0.75, bottomLeft[1]-1.5, WALL_COLOR, 6, "right");
      drawLineLeftOrRight(centerX+1.25, centerY+2.5, bottomRight[0]-0.75, bottomRight[1]-1.5, WALL_COLOR, 6, "left");

    } else if (index === 1) {
      // For the second magnification box, draw lines to the top corners
      const topLeft = [centerX - (1/Math.sqrt(3))*halfSide, centerY - halfSide];
      const topRight = [centerX + (1/Math.sqrt(3))*halfSide, centerY - halfSide];

      drawLineLeftOrRight(centerX-1.25, centerY-2.5, topLeft[0]+0.75, topLeft[1]+1.5, WALL_COLOR, 6, "left");
      drawLineLeftOrRight(centerX+1.25, centerY-2.5, topRight[0]-0.75, topRight[1]+1.5, WALL_COLOR, 6, "right");
    }
  });
}

function drawMag() {
  drawSpecialMagLines();
  // Draw the circles.
  i=0
  //for (var i = 0; i < MAG.length; ++i) {
    drawCircle(MAG[i].magView[0], MAG[i].magView[1]+5, 3, MAG_COLOR);
    drawCircle(MAG[i].magView[0], MAG[i].magView[1]+5, 1.5,
        BACKGROUND_COLOR);
  //}
  i=1
    drawCircle(MAG[i].magView[0], MAG[i].magView[1]-5, 3, MAG_COLOR);
    drawCircle(MAG[i].magView[0], MAG[i].magView[1]-5, 1.5,
        BACKGROUND_COLOR);
  // Draw lines from past photons.
  for (var i = 0; i < magLines.length; ++i) {
    drawLine(
      magLines[i][0][0],
      magLines[i][0][1],
      magLines[i][1][0],
      magLines[i][1][1],
      magLines[i][2],
      2
    );
  }
  // Draw each magnifier.
  for (var mag = 0; mag < MAG.length; ++mag) {
    // Draw the photons.
    for (var i = 0; i < photons.length; ++i) {
      if (MAG[mag].magSquare.contains(photons[i].x, photons[i].y)) {
        var viewerPos = MAG[mag].translate(photons[i].x, photons[i].y);
        drawCircle(viewerPos[0], viewerPos[1], 3, photons[i].headColor);
        drawLine(photons[i].magEntry[mag][0], photons[i].magEntry[mag][1],
            viewerPos[0], viewerPos[1], photons[i].tailColor, 2);
      }
    }
    // Draw the box around the point in the room.
    for (var i = 0; i < MAG[mag].magBox.length; ++i) {
      var nxtIdx = (i + 1) % MAG[mag].magBox.length;
      drawLine(MAG[mag].magBox[i][0], MAG[mag].magBox[i][1],
          MAG[mag].magBox[nxtIdx][0], MAG[mag].magBox[nxtIdx][1],
          MAG_COLOR, 2);
      drawCircle(MAG[mag].magBox[i][0], MAG[mag].magBox[i][1], 1,
          MAG_COLOR);
    }
    // Draw the viewer bounds.
    for (var i = 0; i < MAG[mag].magViewBox.length; ++i) {
      var nxtIdx = (i + 1) % MAG[mag].magViewBox.length;
      drawLine(MAG[mag].magViewBox[i][0], MAG[mag].magViewBox[i][1],
          MAG[mag].magViewBox[nxtIdx][0], MAG[mag].magViewBox[nxtIdx][1],
          MAG_COLOR, 2);
      drawCircle(MAG[mag].magViewBox[i][0], MAG[mag].magViewBox[i][1], 1,
          MAG_COLOR);
    }
  }
}

function draw() {
  drawBackground();
  drawRoom();
  drawRoom2();
  drawPhotons();
  drawPointsOfInterest();
  drawMag();
}

function updatePhotonCount() {
  const activePhotonCount = Math.min(photons.filter(photon => photon.active).length, NUMBER_LIGHT_RAYS-1);
  document.getElementById('activePhotonCount').innerText = activePhotonCount;
}

function updatePositions() {
  // Delete photons that hit corners.
  for (var i = photons.length - 1; i >= 0; --i) {
    for (var point = 0; point < COORDS.length; ++point) {
      if (photons[i].checkPointCollision(
            COORDS[point][0], COORDS[point][1])) {
        photons[i].deactivate();
        break;
      }
    }
  }
  // Bounce photons off edges.
  for (var i = 0; i < photons.length; ++i) {
    for (var edge = 0; edge < boundaries.length; ++edge) {
      if (edge !== photons[i].lastBounce &&
          photons[i].checkLineCollision(boundaries[edge])) {
        photons[i].lastBounce = edge;
        photons[i].bounceOffSegment(boundaries[edge]);
        var cpLen = photons[i].contactPoints.length;
        tailLines.push([
          photons[i].contactPoints[cpLen - 1],
          photons[i].contactPoints[cpLen - 2],
          photons[i].tailColor
        ]);
        for (var mag = 0; mag < MAG.length; ++mag) {
          if (MAG[mag].magSquare.contains(photons[i].x, photons[i].y)) {
            // Bouncing inside the mag.
            // Maths copied from updateMags.
            var viewerPos = MAG[mag].translate(
              photons[i].x,
              photons[i].y
            );
            photons[i].lastMagPoint[mag] = [viewerPos[0], viewerPos[1]];
            magLines.push([
              photons[i].magEntry[mag],
              photons[i].lastMagPoint[mag],
              photons[i].tailColor,
            ]);
            photons[i].magEntry[mag] = [viewerPos[0], viewerPos[1]];
          }
        }
        break;
      }
    }
  }
  // Move the photons.
  for (var i = 0; i < photons.length; ++i) {
    photons[i].updatePosition();
  }

  // Update the active photon count.
  updatePhotonCount();
}

function updateMag() {
  for (var mag = 0; mag < MAG.length; ++mag) {
    for (var i = 0; i < photons.length; ++i) {
      if (MAG[mag].magSquare.contains(photons[i].x, photons[i].y)) {
        var viewerPos = MAG[mag].translate(photons[i].x, photons[i].y);
        if (photons[i].magEntry[mag] === null) {
          // Just entered the square.
          photons[i].magEntry[mag] = [viewerPos[0], viewerPos[1]];
        }
        photons[i].lastMagPoint[mag] = [viewerPos[0], viewerPos[1]];
      } else if (!MAG[mag].magSquare.contains(photons[i].x, photons[i].y)
          && photons[i].magEntry[mag] !== null) {
        // Just left the square.
        magLines.push([
          photons[i].magEntry[mag],
          photons[i].lastMagPoint[mag],
          photons[i].tailColor,
        ]);
        photons[i].magEntry[mag] = null;
        photons[i].lastMagPoint[mag] = null;
      }
    }
  }
}

function updatePhysics() {
  ++totalPhysicsUpdates;
  for (var i = 0; i < 10; ++i) {
    updatePositions();
    updateMag();
  }
}

function setupCanvas() {
  magLines = new Array();
  tailLines = new Array();
  loadBoundaries();
  createPhotons();
}

function updateScreen() {
  updatePhysics();
  draw();
  if (currentlyRecording) {
    if (totalPhysicsUpdates > endFrameValue) {
      stopRecording();
      return;
    }
    video.add(ctx);
    ++numCapturedFrames;
    if (numCapturedFrames % RENDER_INTERVAL_TIME == 0) {
      var secs = numCapturedFrames / RENDER_INTERVAL_TIME;
      displayStatus(
        `Recording: captured ${secs} second(s) of film so far...`
      );
    }
  }
}

function startAnimation() {
  setupCanvas();
  clearInterval(renderInterval);
  renderInterval = setInterval(updateScreen, RENDER_INTERVAL_TIME);
}

function startAnimationAndRecording() {
  if (currentlyRecording) {
    return;
  }
  if (isNaN(parseInt(startFrameInput.value)) ||
      isNaN(parseInt(endFrameInput.value))) {
    alert('Non-integer value in the frame range boxes.');
    return;
  }
  clearInterval(renderInterval);
  startRecording();
  if (!currentlyRecording) {
    // The user cancelled the operation
    return;
  }
  startFrameValue = parseInt(startFrameInput.value);
  endFrameValue = parseInt(endFrameInput.value);
  setupCanvas();
  for (var i = 0; i < startFrameValue; ++i) {
    updatePhysics();
  }
  renderInterval = setInterval(updateScreen, RENDER_INTERVAL_TIME);
}

function stopAnimation() {
  clearInterval(renderInterval);
}