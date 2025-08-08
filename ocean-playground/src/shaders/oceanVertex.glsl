uniform float uTime;
uniform float uWaveStrength;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Simple noise function for wave generation
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vUv = uv;
    vPosition = position;
    
    // Create wave animation
    vec3 pos = position;
    float wave1 = sin(pos.x * 0.3 + uTime * 2.0) * 0.5;
    float wave2 = sin(pos.z * 0.2 + uTime * 1.5) * 0.3;
    float wave3 = sin((pos.x + pos.z) * 0.1 + uTime * 3.0) * 0.2;
    
    pos.y += (wave1 + wave2 + wave3) * uWaveStrength;
    
    // Calculate normal for lighting
    float dx = cos(pos.x * 0.3 + uTime * 2.0) * 0.3 * 0.5;
    float dz = cos(pos.z * 0.2 + uTime * 1.5) * 0.2 * 0.3;
    
    vNormal = normalize(vec3(-dx, 1.0, -dz));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}