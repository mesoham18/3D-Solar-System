import React, { useEffect, useRef, useState } from 'react';
import { 
  Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, PointLight, 
  SphereGeometry, MeshPhongMaterial, Mesh, Color, Vector3, Clock, Group, 
  BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, 
  DirectionalLight, RingGeometry, MeshBasicMaterial, LineBasicMaterial,
  BufferAttribute, Line, AdditiveBlending, ShaderMaterial, DoubleSide,
  TextureLoader, RepeatWrapping
} from 'three';
import { Play, Pause, RotateCcw, Zap, Info } from 'lucide-react';
import { PlanetData, createPlanetData } from '../utils/planetData';
import ControlPanel from './ControlPanel';

const SolarSystem: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene>();
  const rendererRef = useRef<WebGLRenderer>();
  const cameraRef = useRef<PerspectiveCamera>();
  const clockRef = useRef<Clock>();
  const planetsRef = useRef<Array<{ mesh: Mesh; group: Group; data: PlanetData; trail: Points }>>([]);
  const animationIdRef = useRef<number>();
  const starsRef = useRef<Points>();
  const nebulaeRef = useRef<Points[]>([]);
  
  // Use refs for values that need to be accessed in the animation loop
  const isPlayingRef = useRef<boolean>(true);
  const planetSpeedsRef = useRef<Record<string, number>>({});
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [planetSpeeds, setPlanetSpeeds] = useState<Record<string, number>>({});
  const [cameraDistance, setCameraDistance] = useState(200);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);

  // Update refs when state changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    planetSpeedsRef.current = planetSpeeds;
  }, [planetSpeeds]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with enhanced background
    const scene = new Scene();
    scene.background = new Color(0x000008);
    sceneRef.current = scene;

    // Camera setup
    const camera = new PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 120, cameraDistance);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Enhanced renderer with better quality
    const renderer = new WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = 2;
    renderer.outputColorSpace = 'srgb';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const clock = new Clock();
    clockRef.current = clock;

    // Enhanced lighting system
    const ambientLight = new AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    // Main sun light
    const sunLight = new PointLight(0xffffff, 3, 0, 0.5);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.far = 1000;
    scene.add(sunLight);

    // Rim lighting
    const rimLight1 = new DirectionalLight(0x4169e1, 0.8);
    rimLight1.position.set(200, 200, 200);
    scene.add(rimLight1);

    const rimLight2 = new DirectionalLight(0x9932cc, 0.6);
    rimLight2.position.set(-200, -200, -200);
    scene.add(rimLight2);

    // Create enhanced starfield with multiple layers
    const createStarField = (count: number, size: number, distance: number, color: number) => {
      const geometry = new BufferGeometry();
      const vertices = [];
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * distance;
        const y = (Math.random() - 0.5) * distance;
        const z = (Math.random() - 0.5) * distance;
        vertices.push(x, y, z);
      }
      geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
      
      const material = new PointsMaterial({
        color: color,
        size: size,
        transparent: true,
        opacity: Math.random() * 0.8 + 0.2,
        blending: AdditiveBlending
      });
      
      return new Points(geometry, material);
    };

    // Multiple star layers for depth
    const stars1 = createStarField(8000, 1.2, 2500, 0xffffff);
    const stars2 = createStarField(4000, 0.8, 2000, 0x87ceeb);
    const stars3 = createStarField(2000, 1.5, 1500, 0xffd700);
    
    scene.add(stars1, stars2, stars3);
    starsRef.current = stars1;

    // Create colorful nebulae
    const createNebula = (color: number, position: Vector3) => {
      const geometry = new BufferGeometry();
      const vertices = [];
      for (let i = 0; i < 1000; i++) {
        const x = position.x + (Math.random() - 0.5) * 400;
        const y = position.y + (Math.random() - 0.5) * 400;
        const z = position.z + (Math.random() - 0.5) * 400;
        vertices.push(x, y, z);
      }
      geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
      
      const material = new PointsMaterial({
        color: color,
        size: 3,
        transparent: true,
        opacity: 0.1,
        blending: AdditiveBlending
      });
      
      return new Points(geometry, material);
    };

    const nebula1 = createNebula(0xff6b9d, new Vector3(500, 300, -800));
    const nebula2 = createNebula(0x4ecdc4, new Vector3(-600, -400, 900));
    const nebula3 = createNebula(0xffe66d, new Vector3(800, -200, -600));
    
    scene.add(nebula1, nebula2, nebula3);
    nebulaeRef.current = [nebula1, nebula2, nebula3];

    // Enhanced Sun with glow effect
    const sunGeometry = new SphereGeometry(10, 64, 64);
    const sunMaterial = new MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xff6600,
      emissiveIntensity: 0.6,
      shininess: 100
    });
    const sun = new Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun corona effect
    const coronaGeometry = new SphereGeometry(15, 32, 32);
    const coronaMaterial = new MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.1,
      blending: AdditiveBlending
    });
    const corona = new Mesh(coronaGeometry, coronaMaterial);
    scene.add(corona);

    // Create orbital paths
    const createOrbitPath = (radius: number) => {
      const geometry = new BufferGeometry();
      const points = [];
      for (let i = 0; i <= 128; i++) {
        const angle = (i / 128) * Math.PI * 2;
        points.push(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        );
      }
      geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
      
      const material = new LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
      });
      
      return new Line(geometry, material);
    };

    // Create planets with enhanced materials and trails
    const planetData = createPlanetData();
    const planets: Array<{ mesh: Mesh; group: Group; data: PlanetData; trail: Points }> = [];
    const initialSpeeds: Record<string, number> = {};

    planetData.forEach((data) => {
      // Create orbit path
      const orbitPath = createOrbitPath(data.distance);
      scene.add(orbitPath);

      // Enhanced planet material with better lighting
      const geometry = new SphereGeometry(data.size, 64, 64);
      const material = new MeshPhongMaterial({
        color: data.color,
        shininess: 50,
        specular: 0x222222,
        transparent: false,
        opacity: 1.0
      });
      
      const planet = new Mesh(geometry, material);
      planet.castShadow = true;
      planet.receiveShadow = true;
      planet.userData = { planetData: data };

      // Create planet glow
      const glowGeometry = new SphereGeometry(data.size * 1.2, 32, 32);
      const glowMaterial = new MeshBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.1,
        blending: AdditiveBlending
      });
      const glow = new Mesh(glowGeometry, glowMaterial);
      
      // Create orbital trail
      const trailGeometry = new BufferGeometry();
      const trailPositions = [];
      for (let i = 0; i < 200; i++) {
        trailPositions.push(0, 0, 0);
      }
      trailGeometry.setAttribute('position', new Float32BufferAttribute(trailPositions, 3));
      
      const trailMaterial = new PointsMaterial({
        color: data.color,
        size: 0.5,
        transparent: true,
        opacity: 0.6,
        blending: AdditiveBlending
      });
      const trail = new Points(trailGeometry, trailMaterial);
      scene.add(trail);

      // Create orbital group
      const group = new Group();
      planet.position.set(data.distance, 0, 0);
      glow.position.copy(planet.position);
      
      group.add(planet);
      group.add(glow);
      scene.add(group);

      // Add rings for Saturn
      if (data.name === 'Saturn') {
        const ringGeometry = new RingGeometry(data.size * 1.5, data.size * 2.5, 64);
        const ringMaterial = new MeshBasicMaterial({
          color: 0xfad5a5,
          transparent: true,
          opacity: 0.6,
          side: DoubleSide
        });
        const rings = new Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        rings.position.copy(planet.position);
        group.add(rings);
      }

      planets.push({ mesh: planet, group, data, trail });
      initialSpeeds[data.name] = data.speed;
    });

    planetsRef.current = planets;
    setPlanetSpeeds(initialSpeeds);
    planetSpeedsRef.current = initialSpeeds;

    // Enhanced animation loop with proper ref-based state access
    const animate = () => {
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Animate sun with pulsing effect (always running)
      sun.rotation.y += deltaTime * 0.5;
      corona.rotation.y -= deltaTime * 0.3;
      corona.scale.setScalar(1 + Math.sin(elapsedTime * 2) * 0.1);

      // Animate planets with trails - ONLY when playing (using ref for current state)
      if (isPlayingRef.current) {
        planets.forEach(({ mesh, group, data, trail }) => {
          // Get current speed from ref, fallback to default
          const currentSpeed = planetSpeedsRef.current[data.name] !== undefined 
            ? planetSpeedsRef.current[data.name] 
            : data.speed;
          
          // Apply orbital rotation based on current speed
          if (currentSpeed > 0) {
            group.rotation.y += deltaTime * currentSpeed * 0.2;
            
            // Apply planet self-rotation
            mesh.rotation.y += deltaTime * (currentSpeed * 3);

            // Update trail only when moving
            const positions = trail.geometry.attributes.position.array as Float32Array;
            const worldPosition = new Vector3();
            mesh.getWorldPosition(worldPosition);
            
            // Shift existing positions
            for (let i = positions.length - 3; i >= 3; i -= 3) {
              positions[i] = positions[i - 3];
              positions[i + 1] = positions[i - 2];
              positions[i + 2] = positions[i - 1];
            }
            
            // Add new position
            positions[0] = worldPosition.x;
            positions[1] = worldPosition.y;
            positions[2] = worldPosition.z;
            
            trail.geometry.attributes.position.needsUpdate = true;
          }
        });
      }

      // Animate background elements (always running for ambiance)
      if (starsRef.current) {
        starsRef.current.rotation.y += deltaTime * 0.0001;
        stars2.rotation.y -= deltaTime * 0.0002;
        stars3.rotation.y += deltaTime * 0.0003;
      }

      nebulaeRef.current.forEach((nebula, index) => {
        nebula.rotation.y += deltaTime * (0.0001 * (index + 1));
        nebula.rotation.x += deltaTime * (0.0002 * (index + 1));
      });

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Enhanced mouse controls
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      const spherical = new Vector3();
      spherical.setFromSpherical({
        radius: cameraDistance,
        phi: Math.max(0.1, Math.min(Math.PI - 0.1, Math.acos(camera.position.y / cameraDistance) - deltaY * 0.01)),
        theta: Math.atan2(camera.position.x, camera.position.z) - deltaX * 0.01
      });
      
      camera.position.copy(spherical);
      camera.lookAt(0, 0, 0);
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (event: WheelEvent) => {
      const newDistance = Math.max(80, Math.min(500, cameraDistance + event.deltaY * 0.3));
      setCameraDistance(newDistance);
      
      const direction = new Vector3();
      direction.subVectors(camera.position, new Vector3(0, 0, 0)).normalize();
      camera.position.copy(direction.multiplyScalar(newDistance));
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Remove dependencies to prevent recreation

  // Separate effect for camera distance updates
  useEffect(() => {
    if (cameraRef.current) {
      const camera = cameraRef.current;
      const direction = new Vector3();
      direction.subVectors(camera.position, new Vector3(0, 0, 0)).normalize();
      camera.position.copy(direction.multiplyScalar(cameraDistance));
    }
  }, [cameraDistance]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const resetSpeeds = () => {
    const planetData = createPlanetData();
    const initialSpeeds: Record<string, number> = {};
    planetData.forEach((data) => {
      initialSpeeds[data.name] = data.speed;
    });
    setPlanetSpeeds(initialSpeeds);
  };

  const handleSpeedChange = (planetName: string, speed: number) => {
    setPlanetSpeeds(prev => ({
      ...prev,
      [planetName]: speed
    }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Fixed Control Panel with proper positioning */}
      <div className="fixed top-6 left-6 z-50 max-h-[calc(100vh-3rem)]">
        <ControlPanel
          planets={createPlanetData()}
          speeds={planetSpeeds}
          onSpeedChange={handleSpeedChange}
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
          onResetSpeeds={resetSpeeds}
        />
      </div>

      {/* Enhanced Instructions with glassmorphism */}
      <div className="fixed bottom-6 right-6 z-40 bg-black/20 backdrop-blur-md border border-white/10 text-white p-6 rounded-2xl max-w-sm shadow-2xl">
        <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Controls
          </span>
        </h3>
        <ul className="text-sm space-y-2 text-gray-200">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Drag to rotate camera
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Scroll to zoom in/out
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Adjust planet speeds with sliders
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            Play/pause animation
          </li>
        </ul>
      </div>

      {/* Floating animation status */}
      <div className="fixed bottom-6 left-6 z-40 bg-black/20 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full shadow-2xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="text-sm font-medium">
            {isPlaying ? 'Simulation Running' : 'Simulation Paused'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SolarSystem;