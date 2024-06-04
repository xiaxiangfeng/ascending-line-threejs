import * as THREE from "three";

THREE.UniformsLib.ascendingLine = {
  lineWidth: { value: 1.0 },
  FColor: { value: { x: 0.8, y: 0.1, z: 1.0, w: 1 } },
  BackColor: { value: { x: 0.8, y: 0.1, z: 1.0, w: 0.0 } },
  resolution: { value: new THREE.Vector2(1, 1) },
  near: { value: 1.0 },
  far: { value: 1.0 },
  CurrentTime: { value: 0.0 },
  TraceTime: { value: 100.0 },
  CycleTime: { value: 200.0 },
};

THREE.ShaderLib["ascendingLine"] = {
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.common,
    THREE.UniformsLib.lightmap,
    THREE.UniformsLib.normalmap,
    THREE.UniformsLib.lights,
    THREE.UniformsLib.ascendingLine,
  ]),

  vertexShader: `
		attribute vec3 prev;
		attribute vec3 curr;
		attribute vec3 next;
		attribute float side;
		attribute float timeOut;

		uniform vec2 resolution;
		uniform float lineWidth;
		uniform float near;
		uniform float far;
    uniform float CycleTime;
	
		varying float v_TimeOut;
    varying float v_CycleTimeOut;
		
		
		vec4 transform(vec3 coord){
			return projectionMatrix * modelViewMatrix * vec4(coord, 1.0);
		}
		
		vec2 project(vec4 device){
			vec3 device_normal = device.xyz/device.w;
			vec2 clip_pos = (device_normal*0.5+0.5).xy;
			return clip_pos * resolution;
		}
		
		vec4 unproject(vec2 screen, float z, float w){
			vec2 clip_pos = screen/resolution;
			vec2 device_normal = clip_pos*2.0-1.0;
			return vec4(device_normal*w, z, w);
		}
		
		vec4 clipNear(vec4 p1, vec4 p2){
			float n = (p1.w - near) / (p1.w - p2.w);
			return vec4(mix(p1.xy, p2.xy, n), -near, near);
		}
		
		void main() {
			vec4 prevProj = transform(prev.xyz);
			vec4 currProj = transform(curr.xyz);
			vec4 nextProj = transform(next.xyz);

			if (currProj.w < 0.0) {
				if (prevProj.w < 0.0) {
					currProj = clipNear(currProj, nextProj);
				} else {
					currProj = clipNear(currProj, prevProj);
				}
			}

			vec2 prevScreen = project(prevProj);
			vec2 currScreen = project(currProj);
			vec2 nextScreen = project(nextProj);
			float expandWidth = side * lineWidth / 2.0;
			vec2 dir;
			if(abs(curr.x - prev.x) < 0.000001 && abs(curr.y - prev.y) < 0.000001){
				dir = normalize(nextScreen - currScreen);
			} else if(abs(curr.x - next.x) < 0.000001 && abs(curr.y - next.y) < 0.000001){
				dir = normalize(currScreen - prevScreen);
			} else {
				vec2 dirA = normalize(currScreen - prevScreen);
				vec2 dirB = normalize(nextScreen - currScreen);
				dir = normalize(dirA + dirB);
				float miter = 1.0 / max(dot(dir, dirA), 0.5);
				expandWidth *= miter;
			}
			dir = vec2(-dir.y, dir.x) * expandWidth;
			currScreen += dir;
			currProj = unproject(currScreen, currProj.z, currProj.w);
		
			gl_Position = currProj;
		
		
		  v_TimeOut = timeOut;
      v_CycleTimeOut = CycleTime - currProj.w / 100.;
		}
		`,
  fragmentShader: `
		precision highp float;
		
		uniform vec4 FColor;
    uniform vec4 BackColor;
    uniform float CurrentTime;
    uniform float TraceTime;
		varying float v_TimeOut;
    varying float v_CycleTimeOut;

		void main() {
		    float backAlpha ;
		    vec4 backColor = BackColor;
        float modTime = mod(CurrentTime, v_CycleTimeOut);
        float alpha = 0.0;
        if(v_TimeOut > modTime){
          alpha = 0.0;
        }
        else{
          alpha = (TraceTime - (modTime - v_TimeOut)) / TraceTime;
        }
        gl_FragColor = mix(backColor, FColor, alpha);
    }     
		`,
};

class AscendingLine extends THREE.ShaderMaterial {
  constructor(parameters) {
    super({
      transparent: true,
      uniforms: THREE.UniformsUtils.clone(
        THREE.ShaderLib["ascendingLine"].uniforms
      ),
      vertexShader: THREE.ShaderLib["ascendingLine"].vertexShader,
      fragmentShader: THREE.ShaderLib["ascendingLine"].fragmentShader,
    });

    parameters = parameters || {};

    this.resolution = parameters.resolution;
    this.near = parameters.near;
    this.far = parameters.far;
    this.CurrentTime = parameters.CurrentTime;

    Object.defineProperties(this, {
      lineWidth: {
        enumerable: true,
        get: function () {
          return this.uniforms.lineWidth.value;
        },

        set: function (value) {
          this.uniforms.lineWidth.value = value;
        },
      },
      FColor: {
        enumerable: true,
        get: function () {
          return this.uniforms.FColor.value;
        },

        set: function (value) {
          this.uniforms.FColor.value = value;
        },
      },
      resolution: {
        enumerable: true,
        get: function () {
          return this.uniforms.resolution.value;
        },

        set: function (value) {
          this.uniforms.resolution.value = value;
        },
      },
      near: {
        enumerable: true,
        get: function () {
          return this.uniforms.near.value;
        },

        set: function (value) {
          this.uniforms.near.value = value;
        },
      },
      far: {
        enumerable: true,
        get: function () {
          return this.uniforms.far.value;
        },

        set: function (value) {
          this.uniforms.far.value = value;
        },
      },
      CurrentTime: {
        enumerable: true,
        get: function () {
          return this.uniforms.CurrentTime.value;
        },

        set: function (value) {
          this.uniforms.CurrentTime.value = value;
        },
      },
      TraceTime: {
        enumerable: true,
        get: function () {
          return this.uniforms.TraceTime.value;
        },

        set: function (value) {
          this.uniforms.TraceTime.value = value;
        },
      },
      BackColor: {
        enumerable: true,
        get: function () {
          return this.uniforms.BackColor.value;
        },

        set: function (value) {
          this.uniforms.BackColor.value = value;
        },
      },
      CycleTime: {
        enumerable: true,
        get: function () {
          return this.uniforms.CycleTime.value;
        },

        set: function (value) {
          this.uniforms.CycleTime.value = value;
        },
      },
    });

    this.setValues(parameters);
  }
}

export default AscendingLine;
