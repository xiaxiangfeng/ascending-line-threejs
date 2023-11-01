import * as THREE from "three";

class LineGeometry {
  constructor(g, cycleTime) {
    this.curr = [];
    this.prev = [];
    this.next = [];
    this.side = [];
    this.timeOut = [];
    this.geometry = new THREE.BufferGeometry();
    this.timeOut = this.getTimeOut(g.vertices.length, cycleTime);
    this.processLine(g);
    this.process(g);
  }

  compare(a, b) {
    var aa = a * 6;
    var ab = b * 6;
    return (
      this.curr[aa] === this.curr[ab] &&
      this.curr[aa + 1] === this.curr[ab + 1] &&
      this.curr[aa + 2] === this.curr[ab + 2]
    );
  }

  copy(a) {
    var aa = a * 6;
    return [this.curr[aa], this.curr[aa + 1], this.curr[aa + 2]];
  }

  process() {
    this.attributes = {
      curr: new THREE.BufferAttribute(new Float32Array(this.curr), 3),
      prev: new THREE.BufferAttribute(new Float32Array(this.prev), 3),
      next: new THREE.BufferAttribute(new Float32Array(this.next), 3),
      side: new THREE.BufferAttribute(new Float32Array(this.side), 1),
      timeOut: new THREE.BufferAttribute(new Float32Array(this.timeOut), 1),
      index: new THREE.BufferAttribute(new Uint16Array(this.indices), 1),
      position: new THREE.BufferAttribute(new Float32Array(this.curr), 3),
    };
    this.geometry.setAttribute("curr", this.attributes.curr);
    this.geometry.setAttribute("prev", this.attributes.prev);
    this.geometry.setAttribute("position", this.attributes.curr);
    this.geometry.setAttribute("next", this.attributes.next);
    this.geometry.setAttribute("side", this.attributes.side);
    this.geometry.setAttribute("timeOut", this.attributes.timeOut);

    this.geometry.setIndex(this.attributes.index);

    var offset = {
      start: 0,
      index: 0,
      count: this.indices.length,
    };
    this.geometry.groups = [];
    this.geometry.groups.push(offset);
  }

  processLine(g) {
    this.curr = [];

    for (var j = 0; j < g.vertices.length; j++) {
      var v = g.vertices[j];
      this.curr.push(v.x, v.y, v.z);
      this.curr.push(v.x, v.y, v.z);
    }

    var l = this.curr.length / 6;

    this.prev = [];
    this.next = [];
    this.side = [];
    this.indices = [];

    for (var j = 0; j < l; j++) {
      this.side.push(1);
      this.side.push(-1);
    }

    var v;

    if (this.compare(0, l - 1)) {
      v = this.copy(l - 2);
    } else {
      v = this.copy(0);
    }
    this.prev.push(v[0], v[1], v[2]);
    this.prev.push(v[0], v[1], v[2]);

    for (var j = 0; j < l - 1; j++) {
      v = this.copy(j);
      this.prev.push(v[0], v[1], v[2]);
      this.prev.push(v[0], v[1], v[2]);
    }

    for (var j = 1; j < l; j++) {
      v = this.copy(j);
      this.next.push(v[0], v[1], v[2]);
      this.next.push(v[0], v[1], v[2]);
    }

    if (this.compare(l - 1, 0)) {
      v = this.copy(1);
    } else {
      v = this.copy(l - 1);
    }

    this.next.push(v[0], v[1], v[2]);
    this.next.push(v[0], v[1], v[2]);

    for (var j = 0; j < l - 1; j++) {
      var n = j * 2;
      this.indices.push(n, n + 1, n + 2);
      this.indices.push(n + 2, n + 1, n + 3);
    }
  }

  getTimeOut(count, cycleTime) {
    const n = Math.random() + 0.5;
    let timeOutIndex = 0;
    const timeOut = [];
    for (let j = 0; j < count * 2; ++j) {
      timeOut[timeOutIndex++] = (j / (count * 2 - 1)) * cycleTime * n;
    }
    return timeOut;
  }
}

export default LineGeometry;
