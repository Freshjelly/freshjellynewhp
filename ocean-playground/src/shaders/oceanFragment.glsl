uniform float uTime;
uniform vec3 uColorDeep;
uniform vec3 uColorSurface;
uniform float uOpacity;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Calculate depth-based color mixing
    float depth = vPosition.y;
    float depthFactor = smoothstep(-5.0, 5.0, depth);
    
    // Mix colors based on depth
    vec3 color = mix(uColorDeep, uColorSurface, depthFactor);
    
    // Add some wave-based color variation
    float wave = sin(vPosition.x * 0.1 + uTime) * 0.1 + 0.9;
    color *= wave;
    
    // Simple fresnel effect
    float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
    color = mix(color, uColorSurface, fresnel * 0.3);
    
    // Add some sparkle effect
    float sparkle = sin(vPosition.x * 5.0 + uTime * 3.0) * sin(vPosition.z * 5.0 + uTime * 2.0);
    sparkle = smoothstep(0.8, 1.0, sparkle);
    color += sparkle * vec3(0.8, 0.9, 1.0) * 0.2;
    
    gl_FragColor = vec4(color, uOpacity);
}