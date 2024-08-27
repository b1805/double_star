class Vector {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.norm = Math.hypot(x, y);
      this.angle = Math.atan(y / x);
    }
  
    // Returns the dot product with another vector.
    dot(other) {
      return this.x * other.x + this.y * other.y;
    }
  
    // Projects this vector onto another vector.
    projOnto(other) {
      return other.mult(this.dot(other) / (other.norm * other.norm));
    }
  
    // Returns the angle between this vector and another vector.
    angle(other) {
      return Math.acos(this.dot(other) / (this.norm * other.norm));
    }
  
    // Negates this vector.
    negate() {
      return new Vector(-this.x, -this.y);
    }
  
    // Adds this vector to another vector.
    add(other) {
      return new Vector(this.x + other.x, this.y + other.y);
    }
  
    // Subtracts another vector from this vector.
    sub(other) {
      return new Vector(this.x - other.x, this.y - other.y);
    }
  
    // Multiplies this vector by a scalar.
    mult(scalar) {
      return new Vector(this.x * scalar, this.y * scalar);
    }
}
  
// Represents a line segment in 2D space
//
class LineSegment {
    constructor(x1, y1, x2, y2) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.dx = x2 - x1;
      this.dy = y2 - y1;
      this.length = Math.hypot(this.dx, this.dy); // The segment's length.
      this.normal = new Vector(-this.dy, this.dx); // A surface normal vector.
      this.normal = this.normal.mult(this.normal.norm);
      this.lastBounce = -1; // ID of the last reflected wall.
    }
}
  
// Represents a square region in 2D space.
//
// Parameters:
//   - x: Number, top-left x-coordinate.
//   - y: Number, top-left y-coordinate.
//   - 
class Square {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
    }
    
    // Returns true if the point (x, y) is in the square
    contains(x, y) {
      return (
        x >= this.x &&
        x <= this.x + this.size &&
        y >= this.y &&
        y <= this.y + this.size
      );
    }
}
