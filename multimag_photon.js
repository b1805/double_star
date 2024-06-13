class Magnifier {
  constructor(mag, magSide, magView, magViewSide) {
    this.mag = mag;
    this.magSide = magSide;
    this.magView = magView;
    this.magViewSide = magViewSide;
    this.magSquare = new Square(
      mag[0] - magSide / 2,
      mag[1] - magSide / 2,
      magSide
    );
    this.magBox = [
      [mag[0] - magSide / 2, mag[1] - magSide / 2],
      [mag[0] - magSide / 2, mag[1] + magSide / 2],
      [mag[0] + magSide / 2, mag[1] + magSide / 2],
      [mag[0] + magSide / 2, mag[1] - magSide / 2],
    ];
    this.magViewBox = [
      [magView[0] - magViewSide / 2, magView[1] - magViewSide / 2],
      [magView[0] - magViewSide / 2, magView[1] + magViewSide / 2],
      [magView[0] + magViewSide / 2, magView[1] + magViewSide / 2],
      [magView[0] + magViewSide / 2, magView[1] - magViewSide / 2],
    ];
  }

  // Convert coordinates inside `this.mag` to scaled coordinates inside
  // `this.magBox`.
  translate(x, y) {
    var dx = x - this.mag[0];
    var dy = y - this.mag[1];
    return [
      this.magView[0] + (this.magViewSide / this.magSide) * dx,
      this.magView[1] + (this.magViewSide / this.magSide) * dy,
    ];
  }
}

// Represents a photon (light 'particle' that bounces around the room).
// This photon class can keep track of its positions relative to two
// magnifiers.
//
// Parameters:
//   - x: Number, the current x-position.
//   - y: Number, the current y-position.
//   - dir: Number, the current direction we are travelling in, in radians.
//   - collisionRadius: Number, the distance at which the centre of the photon
//                      must be from a line segment for a collision to occur.
//   - headColor: String, the color of the photon's head.
//   - tailColor: String, the color of the photon's tail.
//   - numMags: Number, the number of mags the photon needs to keep track of.
//
class MultiMagPhoton {
  constructor(x, y, dir, speed, collisionRadius, headColor, tailColor, numMags) {
    this.x = x;
    this.y = y;
    this.vecDir = new Vector(speed * Math.cos(dir), speed * Math.sin(dir));
    this.speed = speed;
    this.collisionRadius = collisionRadius;
    this.headColor = headColor;
    this.tailColor = tailColor;
    this.contactPoints = new Array();
    this.contactPoints.push([this.x, this.y]);
    this.magEntry = new Array(numMags).fill(null);
    this.lastMagPoint = new Array(numMags).fill(null);
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  updatePosition() {
    if (this.active) {
      this.x += this.vecDir.x;
      this.y += this.vecDir.y;
    }
  }

  // Returns whether or not the photon collides with the point (a corner).
  checkPointCollision(px, py) {
    if (!this.active) {
      return false;
    }
    var dist = Math.hypot(this.x - px, this.y - py);
    return dist <= Math.max(0.3, this.collisionRadius);
  }

  // Returns whether or not the photon collides with a line segment (a wall).
  checkLineCollision(line) {
    if (!this.active) {
      return false;
    }
    if (this.checkPointCollision(line.x1, line.y1) ||
        this.checkPointCollision(line.x2, line.y2)) {
      return true;
    }
    var vecX = this.x - line.x1;
    var vecY = this.y - line.y1;
    var dot = (vecX * (line.x2 - line.x1) + vecY * (line.y2 - line.y1))
        / (line.length * line.length);
    var closestX = line.x1 + dot * (line.x2 - line.x1);
    var closestY = line.y1 + dot * (line.y2 - line.y1);
    if (dot >= 0 && dot <= 1) {
      // On the line segment.
      var dist = Math.hypot(this.x - closestX, this.y - closestY);
      return dist <= this.collisionRadius;
    }
    return false;
  }

  // Recalculates the direction of the photon based on the normal vector to a
  // line segment.
  bounceOffSegment(line) {
    if (!this.active) {
      return;
    }
    var normalProj = this.vecDir.projOnto(line.normal);
    var parallelProj = this.vecDir.sub(normalProj);
    this.vecDir = parallelProj.sub(normalProj);
    this.contactPoints.push([this.x, this.y]);
  }
}