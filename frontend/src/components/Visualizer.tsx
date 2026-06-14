import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { VibeState } from '../types';

interface VisualizerProps {
  vibe: VibeState;
}

// Custom Fragment Shader for organic fluid plasma movement
const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_energy;
  uniform float u_valence;
  uniform float u_color_temp;
  uniform float u_weather; // 0.0 (thunder) to 1.0 (radiant)

  // 2D Simplex Noise generator
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  	+ i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Scale coordinates for noise
    vec2 st = uv * 3.0;
    
    // Speed is governed by Energy
    float speed = (0.1 + u_energy * 0.9) * 0.4;
    float time = u_time * speed;
    
    // Generate layered noise
    float n1 = snoise(st + vec2(time * 0.5, time * 0.3));
    float n2 = snoise(st * 2.0 - vec2(time * 0.2, -time * 0.4));
    float combinedNoise = (n1 + n2 * 0.5) / 1.5;
    
    // Charcoal grey & smoke colors for the background body
    vec3 smokeDark = vec3(0.005, 0.005, 0.008);
    vec3 smokeMedium = vec3(0.015, 0.015, 0.02);
    vec3 smokeLight = vec3(0.04, 0.035, 0.045);

    // Glowing hot/toxic red currents
    vec3 toxicRed = vec3(1.0, 0.0, 0.235);    // #ff003c
    vec3 deepRed = vec3(0.35, 0.0, 0.05);      // Deep Crimson
    vec3 brightAmber = vec3(0.95, 0.3, 0.0);   // Glowing Warm Orange-Red
    
    // Blend smoke base using noise
    vec3 baseSmoke = mix(smokeDark, smokeMedium, combinedNoise * 0.5 + 0.5);
    baseSmoke = mix(baseSmoke, smokeLight, snoise(st * 0.5 + vec2(time * 0.1)) * 0.5 + 0.5);
    
    // Define the glow current color based on temperature slider
    // High temp = hotter orange-red / toxic red, Low temp = deeper crimson / cold red
    vec3 glowColor = mix(deepRed, mix(toxicRed, brightAmber, u_color_temp), u_color_temp);

    // Compute active glowing flows from the noise channels
    // Higher energy creates tighter, more violent glowing veins
    float flowTension = 2.0 - u_energy * 1.5;
    float flowNoise = sin(combinedNoise * 10.0 * flowTension + time * 2.0) * 0.5 + 0.5;
    
    // Combine noise intensity and flow tension
    float flowStrength = pow(flowNoise, 4.0) * (0.05 + u_energy * 0.9);
    
    // Mix the base smoke with the glowing veins
    vec3 finalColor = mix(baseSmoke, glowColor, flowStrength * 0.45);
    
    // Modify brightness and saturation based on Valence (Melancholy to Euphoria)
    // Low Valence = desaturated & dark. High Valence = vibrant & glowing.
    float brightness = 0.4 + u_valence * 0.7;
    float saturation = 0.3 + u_valence * 0.7;
    
    // Convert to Grayscale for saturation adjustments
    float gray = dot(finalColor, vec3(0.299, 0.587, 0.114));
    finalColor = mix(vec3(gray), finalColor, saturation) * brightness;
    
    // Add Weather atmospheric overrides
    // 0.0 (Thunder): Stormy gray overlay + flickering lightning noise
    // 0.25 (Rain): Darker overlay + diagonal rain-streak noise lines
    // 0.75-1.0 (Clear-Radiant): Sunlight glow vignette
    if (u_weather < 0.2) {
      // Thunder: Add desaturation and random high-frequency brightness flash
      finalColor = mix(finalColor, vec3(0.05, 0.05, 0.06), 0.35);
      
      // Simulating a lightning stroke
      float flash = step(0.992, fract(sin(u_time * 1.5) * 43758.5453));
      finalColor += vec3(flash * 0.25);
    } else if (u_weather < 0.45) {
      // Rain: Darker slate teal tint
      finalColor = mix(finalColor, vec3(0.02, 0.05, 0.07), 0.25);
    } else if (u_weather > 0.85) {
      // Radiant: Sun flare glow vignette in the center
      float distFromCenter = distance(uv, vec2(0.5));
      float sunGlow = smoothstep(0.8, 0.0, distFromCenter) * 0.18;
      finalColor += vec3(1.0, 0.0, 0.235) * sunGlow * u_color_temp;
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Simple Vertex Shader
const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export const Visualizer: React.FC<VisualizerProps> = ({ vibe }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<{
    u_time: { value: number };
    u_resolution: { value: THREE.Vector2 };
    u_energy: { value: number };
    u_valence: { value: number };
    u_color_temp: { value: number };
    u_weather: { value: number };
  }>({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_energy: { value: vibe.energy },
    u_valence: { value: vibe.valence },
    u_color_temp: { value: vibe.colorTemp },
    u_weather: { value: 0.5 } // Default to cloudy
  });

  // Map weather strings to numerical value
  const getWeatherValue = (w: string): number => {
    switch (w) {
      case 'thunderstorm': return 0.0;
      case 'rain': return 0.25;
      case 'cloudy': return 0.5;
      case 'clear': return 0.75;
      case 'radiant': return 1.0;
      default: return 0.5;
    }
  };

  // Sync uniforms on vibe changes
  useEffect(() => {
    uniformsRef.current.u_energy.value = vibe.energy;
    uniformsRef.current.u_valence.value = vibe.valence;
    uniformsRef.current.u_color_temp.value = vibe.colorTemp;
    uniformsRef.current.u_weather.value = getWeatherValue(vibe.weather);
  }, [vibe]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
    containerRef.current.appendChild(renderer.domElement);

    uniformsRef.current.u_resolution.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());

    // Create quad covering full screen
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      depthWrite: false,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      uniformsRef.current.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      uniformsRef.current.u_resolution.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="visualizer-container" />;
};
