
// Fragment shader for a space-like background with volumetric lighting
export const spaceShader = `
  precision highp float;
  
  uniform vec2 u_resolution;
  uniform float u_time;
  
  // Noise functions based on https://www.shadertoy.com/view/4dS3Wd
  float hash(float n) { return fract(sin(n) * 1e4); }
  
  float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);
    vec3 i = floor(x);
    vec3 f = fract(x);
    float n = dot(i, step);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
         mix(hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
      mix(mix(hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
         mix(hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
  }
  
  // Volumetric lighting effect
  float volumetricLight(vec2 uv, vec2 lightPos, float intensity) {
    vec2 toLight = lightPos - uv;
    float dist = length(toLight);
    return intensity / (dist * dist * 40.0 + 0.1);
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Base space background - dark blue/purple gradient
    vec3 color = mix(
      vec3(0.04, 0.04, 0.13),  // dark blue
      vec3(0.10, 0.07, 0.23),  // dark purple
      uv.y
    );
    
    // Add subtle noise for stars/nebula effect
    float noiseVal = noise(vec3(uv * 20.0, u_time * 0.05));
    color += vec3(0.15, 0.15, 0.3) * smoothstep(0.7, 0.9, noiseVal);
    
    // Add stars
    if (noiseVal > 0.97) {
      float starBrightness = smoothstep(0.97, 0.99, noiseVal);
      color += vec3(0.8, 0.8, 1.0) * starBrightness;
    }
    
    // Add volumetric light from top right
    float light1 = volumetricLight(uv, vec2(0.8, 0.2), 0.15);
    color += vec3(0.6, 0.3, 0.9) * light1;
    
    // Add volumetric light from bottom left
    float light2 = volumetricLight(uv, vec2(0.2, 0.8), 0.10);
    color += vec3(0.3, 0.4, 0.8) * light2;
    
    // Add horizontal light beam that moves over time
    float beamY = fract(u_time * 0.1);
    float beam = smoothstep(0.02, 0.0, abs(uv.y - beamY));
    color += vec3(0.6, 0.2, 0.8) * beam * 0.3;
    
    // Add iridescent highlight
    float iridescence = sin(uv.x * 20.0 + u_time) * 0.5 + 0.5;
    color += vec3(iridescence * 0.1, iridescence * 0.05, iridescence * 0.2) * smoothstep(0.4, 0.6, noiseVal);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Laser beam shader with motion
export const laserBeamShader = `
  precision highp float;
  
  uniform vec2 u_resolution;
  uniform float u_time;
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Multiple laser beams at different angles and speeds
    float beam1 = smoothstep(0.01, 0.0, abs(sin(uv.y * 6.0 + u_time * 2.0) - uv.x + sin(u_time * 0.5) * 0.5));
    float beam2 = smoothstep(0.01, 0.0, abs(cos(uv.x * 8.0 - u_time * 1.5) - uv.y + cos(u_time * 0.3) * 0.3));
    float beam3 = smoothstep(0.005, 0.0, abs(sin(uv.x * 10.0 + uv.y * 10.0 + u_time * 3.0) * 0.25));
    
    // Different colors for each beam
    vec3 color1 = vec3(0.2, 0.4, 1.0) * beam1;
    vec3 color2 = vec3(0.8, 0.2, 0.9) * beam2;
    vec3 color3 = vec3(0.1, 0.6, 0.8) * beam3;
    
    vec3 finalColor = color1 + color2 + color3;
    
    // Add glow effect
    finalColor *= 1.5;
    
    gl_FragColor = vec4(finalColor, max(max(beam1, beam2), beam3) * 0.7);
  }
`;

// Glow shader for highlights
export const glowShader = `
  precision highp float;
  
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color;
  uniform vec2 u_position;
  uniform float u_intensity;
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    float dist = distance(uv, u_position);
    float glow = u_intensity / (dist * 8.0 + 0.1);
    
    // Add pulsing effect
    glow *= (sin(u_time * 2.0) * 0.1 + 0.9);
    
    // Soft edges
    vec3 color = u_color * glow;
    
    gl_FragColor = vec4(color, min(glow, 0.8));
  }
`;
