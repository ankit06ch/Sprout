import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TrendingUp, TrendingDown, Package, DollarSign, Target, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

const ThreeDStore: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const clickableButtonsRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Animation state
  const animationStateRef = useRef({
    autoRotate: true,
    autoRotateSpeed: 0.0005,
    mouseX: 0,
    mouseY: 0,
    isMouseDown: false,
    isRightClick: false,
    cameraDistance: 45,
    cameraAngleX: -0.4,
    cameraAngleY: 0,
    cameraPanX: 0,
    cameraPanY: 0,
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: '' });
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isSplitView, setIsSplitView] = useState(false);

  // Comprehensive product data with statistics, graphs, and recommendations
  const productData = {
    'isle-1': {
      title: 'Fresh Produce',
      category: 'Food',
      description: 'Fresh fruits and vegetables, organic options available. Daily deliveries ensure peak freshness and quality.',
      statistics: {
        revenue: 45230,
        unitsSold: 2847,
        accuracy: 94.2,
        waste: 2.1,
        margin: 35.5,
        growth: 12.8
      },
      topProducts: [
        { name: 'Organic Bananas', sales: 1250, trend: 'up' },
        { name: 'Fresh Spinach', sales: 980, trend: 'up' },
        { name: 'Avocados', sales: 756, trend: 'stable' },
        { name: 'Bell Peppers', sales: 623, trend: 'down' }
      ],
      recommendations: [
        { type: 'success', message: 'Organic bananas showing 23% growth - consider expanding inventory' },
        { type: 'warning', message: 'Bell peppers declining - check supplier quality and pricing' },
        { type: 'info', message: 'Peak season approaching - stock up on summer vegetables' }
      ],
      chartData: [45, 52, 48, 61, 55, 67, 73, 69, 58, 72, 78, 82]
    },
    'isle-2': {
      title: 'Dairy & Eggs',
      category: 'Food',
      description: 'Milk, cheese, yogurt, and farm-fresh eggs. Local dairy products and plant-based alternatives.',
      statistics: {
        revenue: 38950,
        unitsSold: 1923,
        accuracy: 91.8,
        waste: 1.8,
        margin: 28.3,
        growth: 8.7
      },
      topProducts: [
        { name: 'Whole Milk', sales: 1450, trend: 'up' },
        { name: 'Greek Yogurt', sales: 1120, trend: 'up' },
        { name: 'Farm Eggs', sales: 890, trend: 'stable' },
        { name: 'Cheddar Cheese', sales: 745, trend: 'up' }
      ],
      recommendations: [
        { type: 'success', message: 'Greek yogurt trend up 18% - premium positioning working' },
        { type: 'info', message: 'Local dairy partnerships driving customer loyalty' },
        { type: 'warning', message: 'Monitor egg prices - supplier costs increasing' }
      ],
      chartData: [38, 42, 39, 45, 48, 52, 49, 51, 47, 53, 56, 58]
    },
    'isle-3': {
      title: 'Meat & Seafood',
      category: 'Food',
      description: 'Premium cuts of meat, fresh seafood, and deli selections. Butcher services available on request.',
      statistics: {
        revenue: 56780,
        unitsSold: 1456,
        accuracy: 89.5,
        waste: 3.2,
        margin: 42.1,
        growth: 15.3
      },
      topProducts: [
        { name: 'Salmon Fillet', sales: 1680, trend: 'up' },
        { name: 'Ground Beef', sales: 1420, trend: 'up' },
        { name: 'Chicken Breast', sales: 1350, trend: 'stable' },
        { name: 'Shrimp', sales: 980, trend: 'down' }
      ],
      recommendations: [
        { type: 'success', message: 'Salmon premium positioning successful - 25% margin growth' },
        { type: 'warning', message: 'Shrimp waste rate high - optimize ordering quantities' },
        { type: 'info', message: 'Butcher services driving premium meat sales' }
      ],
      chartData: [56, 62, 58, 67, 71, 69, 73, 78, 75, 82, 85, 88]
    },
    'isle-4': {
      title: 'Bakery & Bread',
      category: 'Food',
      description: 'Fresh-baked bread, pastries, and cakes. Daily baking ensures the freshest selection.',
      statistics: {
        revenue: 28450,
        unitsSold: 2156,
        accuracy: 92.7,
        waste: 4.1,
        margin: 31.2,
        growth: 6.9
      },
      topProducts: [
        { name: 'Sourdough Bread', sales: 890, trend: 'up' },
        { name: 'Croissants', sales: 756, trend: 'up' },
        { name: 'Muffins', sales: 623, trend: 'stable' },
        { name: 'Bagels', sales: 587, trend: 'down' }
      ],
      recommendations: [
        { type: 'warning', message: 'High waste rate - optimize baking schedules' },
        { type: 'success', message: 'Artisanal breads driving premium sales' },
        { type: 'info', message: 'Morning rush peak - consider pre-baking popular items' }
      ],
      chartData: [28, 32, 29, 35, 38, 41, 39, 42, 37, 44, 46, 48]
    },
    'fridge-back': {
      title: 'Frozen Foods',
      category: 'Fridge',
      description: 'Frozen vegetables, fruits, ice cream, frozen meals, and specialty frozen items. Temperature controlled for optimal preservation.',
      statistics: {
        revenue: 42300,
        unitsSold: 1876,
        accuracy: 95.1,
        waste: 0.8,
        margin: 38.7,
        growth: 18.2
      },
      topProducts: [
        { name: 'Frozen Berries', sales: 1120, trend: 'up' },
        { name: 'Ice Cream', sales: 980, trend: 'up' },
        { name: 'Frozen Meals', sales: 845, trend: 'stable' },
        { name: 'Frozen Vegetables', sales: 756, trend: 'up' }
      ],
      recommendations: [
        { type: 'success', message: 'Excellent accuracy and low waste - optimal category performance' },
        { type: 'info', message: 'Frozen berries trend up 22% - health-conscious consumers' },
        { type: 'success', message: 'Premium ice cream brands driving margin growth' }
      ],
      chartData: [42, 45, 43, 48, 52, 49, 53, 56, 51, 58, 61, 64]
    },
    'fridge-left': {
      title: 'Beverages & Drinks',
      category: 'Fridge',
      description: 'Cold beverages, juices, sodas, energy drinks, and specialty drinks. Always chilled and refreshing.',
      statistics: {
        revenue: 35670,
        unitsSold: 3245,
        accuracy: 93.8,
        waste: 1.2,
        margin: 24.5,
        growth: 11.4
      },
      topProducts: [
        { name: 'Sparkling Water', sales: 1450, trend: 'up' },
        { name: 'Energy Drinks', sales: 1230, trend: 'up' },
        { name: 'Fresh Juices', sales: 980, trend: 'stable' },
        { name: 'Soda', sales: 890, trend: 'down' }
      ],
      recommendations: [
        { type: 'success', message: 'Sparkling water up 28% - health trend continues' },
        { type: 'warning', message: 'Soda declining - focus on premium alternatives' },
        { type: 'info', message: 'Energy drinks peak in afternoon - optimize restocking' }
      ],
      chartData: [35, 38, 36, 42, 45, 48, 46, 49, 44, 51, 53, 56]
    },
    'fridge-right': {
      title: 'Fresh Dairy Products',
      category: 'Fridge',
      description: 'Fresh milk, premium cheeses, yogurts, and other dairy products. Maintained at perfect temperatures.',
      statistics: {
        revenue: 41230,
        unitsSold: 2156,
        accuracy: 94.5,
        waste: 1.5,
        margin: 29.8,
        growth: 9.7
      },
      topProducts: [
        { name: 'Organic Milk', sales: 1350, trend: 'up' },
        { name: 'Premium Cheese', sales: 1120, trend: 'up' },
        { name: 'Yogurt Cups', sales: 980, trend: 'stable' },
        { name: 'Butter', sales: 756, trend: 'down' }
      ],
      recommendations: [
        { type: 'success', message: 'Organic dairy premium positioning successful' },
        { type: 'info', message: 'Temperature control maintaining quality standards' },
        { type: 'warning', message: 'Butter sales declining - check pricing vs competitors' }
      ],
      chartData: [41, 44, 42, 47, 50, 53, 51, 54, 49, 56, 58, 61]
    }
  };

  // Create isle tower
  const createIsleTower = (x: number, z: number, width: number, depth: number, height: number, isleId: string): THREE.Group => {
    const scene = sceneRef.current!;
    const isle = new THREE.Group();
    
    // Materials
    const isleMaterial = new THREE.MeshLambertMaterial({ color: 0x99cb9c });
    const productMaterial = new THREE.MeshLambertMaterial({ color: 0x7db882 });
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x4a7c59, transparent: true, opacity: 0.8 });
    
    // Base structure
    const baseGeometry = new THREE.BoxGeometry(width, 0.2, depth);
    const base = new THREE.Mesh(baseGeometry, isleMaterial);
    base.position.y = 0.1;
    base.castShadow = true;
    isle.add(base);
    
    // Vertical supports
    for (let i = 0; i <= Math.floor(width / 3); i++) {
      for (let j = 0; j <= Math.floor(depth / 3); j++) {
        const supportGeometry = new THREE.BoxGeometry(0.2, height, 0.2);
        const support = new THREE.Mesh(supportGeometry, isleMaterial);
        support.position.set(-width/2 + i * 3, height/2, -depth/2 + j * 3);
        support.castShadow = true;
        isle.add(support);
      }
    }
    
    // Shelves (multiple levels)
    for (let level = 1; level <= 4; level++) {
      const shelfGeometry = new THREE.BoxGeometry(width - 0.2, 0.1, depth - 0.2);
      const shelf = new THREE.Mesh(shelfGeometry, isleMaterial);
      shelf.position.y = level * (height / 5);
      shelf.castShadow = true;
      isle.add(shelf);
      
      // Products on shelves
      const productsPerRow = Math.floor((width - 1) / 1.2);
      const productsPerCol = Math.floor((depth - 1) / 1.2);
      
      for (let i = 0; i < productsPerRow; i++) {
        for (let j = 0; j < productsPerCol; j++) {
          const productGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.8);
          const product = new THREE.Mesh(productGeometry, productMaterial);
          product.position.set(
            -width/2 + 0.6 + i * 1.2, 
            level * (height / 5) + 0.35, 
            -depth/2 + 0.6 + j * 1.2
          );
          product.castShadow = true;
          isle.add(product);
        }
      }
    }
    
    // Create hovering button
    const buttonGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(0, height + 1.5, 0);
    button.userData = { isleId: isleId, clickable: true };
    clickableButtonsRef.current.push(button);
    isle.add(button);
    
    isle.position.set(x, 0, z);
    return isle;
  };

  // Create connected fridge wall
  const createFridgeWall = (startX: number, startZ: number, endX: number, endZ: number, segments: number, height: number = 7, wallId?: string): THREE.Group => {
    const fridgeWall = new THREE.Group();
    
    const totalLength = Math.sqrt((endX - startX) ** 2 + (endZ - startZ) ** 2);
    const segmentLength = totalLength / segments;
    const angle = Math.atan2(endZ - startZ, endX - startX);
    
    // Materials
    const fridgeMaterial = new THREE.MeshLambertMaterial({ color: 0x559b59 });
    const glassMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87ceeb, 
      transparent: true, 
      opacity: 0.2
    });
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x4a7c59, transparent: true, opacity: 0.8 });
    
    for (let i = 0; i < segments; i++) {
      const fridge = new THREE.Group();
      
      // Calculate position for this segment
      const segmentX = startX + (i * segmentLength + segmentLength/2) * Math.cos(angle);
      const segmentZ = startZ + (i * segmentLength + segmentLength/2) * Math.sin(angle);
      
      // Main fridge body
      const bodyGeometry = new THREE.BoxGeometry(segmentLength * 0.9, height, 3);
      const body = new THREE.Mesh(bodyGeometry, fridgeMaterial);
      body.position.y = height / 2;
      body.castShadow = true;
      fridge.add(body);
      
      // Glass doors
      const glassGeometry = new THREE.BoxGeometry(segmentLength * 0.85, height - 1, 0.1);
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.set(0, height / 2, 1.55);
      fridge.add(glass);
      
      // Inner shelves
      for (let level = 1; level <= 4; level++) {
        const shelfGeometry = new THREE.BoxGeometry(segmentLength * 0.8, 0.05, 2.8);
        const shelf = new THREE.Mesh(shelfGeometry, new THREE.MeshLambertMaterial({ color: 0xdddddd }));
        shelf.position.y = level * (height / 5);
        fridge.add(shelf);
        
        // Products inside
        const numProducts = Math.floor(segmentLength / 1.5);
        for (let p = 0; p < numProducts; p++) {
          const productGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6);
          const product = new THREE.Mesh(productGeometry, new THREE.MeshLambertMaterial({ color: 0x7db882 }));
          product.position.set(
            -(segmentLength * 0.4) + p * 1.2 + 0.6, 
            level * (height / 5) + 0.25, 
            0.5
          );
          fridge.add(product);
        }
      }
      
      fridge.position.set(segmentX, 0, segmentZ);
      fridge.rotation.y = angle;
      fridgeWall.add(fridge);
    }
    
    // Add hovering button for this fridge wall
    if (wallId) {
      const buttonGeometry = new THREE.SphereGeometry(1.2, 16, 16);
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      
      // Position button at center of wall
      const centerX = (startX + endX) / 2;
      const centerZ = (startZ + endZ) / 2;
      button.position.set(centerX, height + 2, centerZ);
      button.userData = { isleId: wallId, clickable: true };
      clickableButtonsRef.current.push(button);
      fridgeWall.add(button);
    }
    
    return fridgeWall;
  };

  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0xffffff);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -60;
    directionalLight.shadow.camera.right = 60;
    directionalLight.shadow.camera.top = 60;
    directionalLight.shadow.camera.bottom = -60;
    scene.add(directionalLight);

    // Store floor
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xc3ebc5 });
    const floorGeometry = new THREE.PlaneGeometry(80, 80);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add walls underneath
    const wallHeight = 5;
    const wallGeometry = new THREE.PlaneGeometry(80, wallHeight);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });

    const bottomWall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    bottomWall1.rotation.x = Math.PI / 2;
    bottomWall1.position.y = -wallHeight / 2;
    bottomWall1.position.z = -40;
    scene.add(bottomWall1);

    const bottomWall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    bottomWall2.rotation.x = -Math.PI / 2;
    bottomWall2.position.y = -wallHeight / 2;
    bottomWall2.position.z = 40;
    scene.add(bottomWall2);

    // Store dimensions and spacing
    const storeWidth = 50;
    const storeDepth = 40;
    const margin = 6;

    // Create connected fridge walls on 3 sides
    scene.add(createFridgeWall(-storeWidth/2, -storeDepth/2, storeWidth/2, -storeDepth/2, 10, 7, 'fridge-back'));
    scene.add(createFridgeWall(-storeWidth/2, -storeDepth/2, -storeWidth/2, storeDepth/2, 8, 7, 'fridge-left'));
    scene.add(createFridgeWall(storeWidth/2, -storeDepth/2, storeWidth/2, storeDepth/2, 8, 7, 'fridge-right'));

    // Calculate isle positions with equal margins
    const isleWidth = 6;
    const isleDepth = 12;
    const numIsles = 4;
    const availableWidth = storeWidth - 2 * margin;
    const totalIsleWidth = numIsles * isleWidth;
    const totalSpacing = availableWidth - totalIsleWidth;
    const spaceBetweenIsles = totalSpacing / (numIsles - 1);

    // Create isle towers
    for (let i = 0; i < numIsles; i++) {
      const isleX = -storeWidth/2 + margin + isleWidth/2 + i * (isleWidth + spaceBetweenIsles);
      const isleZ = 0;
      scene.add(createIsleTower(isleX, isleZ, isleWidth, isleDepth, 6, `isle-${i + 1}`));
    }

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Initialize camera position
    camera.position.set(35, 20, 35);
    camera.lookAt(0, 5, 0);

    // Mouse events
    const handleMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(clickableButtonsRef.current);

      if (intersects.length > 0) {
        const clickedButton = intersects[0].object;
        if (clickedButton.userData.clickable) {
          const isleId = clickedButton.userData.isleId;
          setSelectedProduct(isleId);
          setIsSplitView(true);
          animationStateRef.current.autoRotate = false;
        }
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      animationStateRef.current.isMouseDown = true;
      animationStateRef.current.isRightClick = event.button === 2;
      animationStateRef.current.mouseX = event.clientX;
      animationStateRef.current.mouseY = event.clientY;
      animationStateRef.current.autoRotate = false;
    };

    const handleMouseUp = () => {
      animationStateRef.current.isMouseDown = false;
      animationStateRef.current.isRightClick = false;
      setTimeout(() => {
        if (!animationStateRef.current.isMouseDown) animationStateRef.current.autoRotate = true;
      }, 2000);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (animationStateRef.current.isMouseDown) {
        const deltaX = event.clientX - animationStateRef.current.mouseX;
        const deltaY = event.clientY - animationStateRef.current.mouseY;
        
        if (animationStateRef.current.isRightClick) {
          animationStateRef.current.cameraPanX -= deltaX * 0.05;
          animationStateRef.current.cameraPanY += deltaY * 0.05;
        } else {
          animationStateRef.current.cameraAngleY += deltaX * 0.01;
          animationStateRef.current.cameraAngleX += deltaY * 0.01;
          animationStateRef.current.cameraAngleX = Math.max(-Math.PI/2, Math.min(Math.PI/2, animationStateRef.current.cameraAngleX));
        }
        
        animationStateRef.current.mouseX = event.clientX;
        animationStateRef.current.mouseY = event.clientY;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      animationStateRef.current.cameraDistance += event.deltaY * 0.03;
      animationStateRef.current.cameraDistance = Math.max(15, Math.min(100, animationStateRef.current.cameraDistance));
      animationStateRef.current.autoRotate = false;
      setTimeout(() => {
        if (!animationStateRef.current.isMouseDown) animationStateRef.current.autoRotate = true;
      }, 2000);
    };

    // Add event listeners
    renderer.domElement.addEventListener('click', handleMouseClick);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const state = animationStateRef.current;

      // Auto rotation
      if (state.autoRotate) {
        state.cameraAngleY += state.autoRotateSpeed;
      }

      // Update camera position
      camera.position.x = Math.sin(state.cameraAngleY) * Math.cos(state.cameraAngleX) * state.cameraDistance + state.cameraPanX;
      camera.position.y = Math.sin(state.cameraAngleX) * state.cameraDistance + state.cameraPanY + 10;
      camera.position.z = Math.cos(state.cameraAngleY) * Math.cos(state.cameraAngleX) * state.cameraDistance;
      
      camera.lookAt(state.cameraPanX, state.cameraPanY + 5, 0);

      // Animate hovering buttons
      clickableButtonsRef.current.forEach((button, index) => {
        button.position.y += Math.sin(Date.now() * 0.002 + index) * 0.01;
        button.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const closeModal = () => {
    setShowModal(false);
    animationStateRef.current.autoRotate = true;
  };

  const closeSplitView = () => {
    setIsSplitView(false);
    setSelectedProduct(null);
    animationStateRef.current.autoRotate = true;
  };

  // Simple chart component
  const SimpleChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="h-20 flex items-end justify-between space-x-1">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className={`bg-${color}-500 rounded-t`}
              style={{ height: `${height}%`, width: `${100 / data.length}%` }}
            />
          );
        })}
      </div>
    );
  };

  // Product details panel
  const ProductDetailsPanel: React.FC<{ productId: string }> = ({ productId }) => {
    const product = productData[productId as keyof typeof productData];
    if (!product) return null;

    const { statistics, topProducts, recommendations, chartData } = product;

    return (
      <div className="flex-1 p-6 bg-gray-50 border-l border-gray-200 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{product.title}</h3>
            <p className="text-sm text-gray-600">{product.category} • {product.description}</p>
          </div>
          <button
            onClick={closeSplitView}
            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${statistics.revenue.toLocaleString()}</div>
            <div className="text-xs text-green-600">+{statistics.growth}% vs last month</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Units Sold</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{statistics.unitsSold.toLocaleString()}</div>
            <div className="text-xs text-blue-600">This month</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{statistics.accuracy}%</div>
            <div className="text-xs text-purple-600">Forecast accuracy</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Waste Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{statistics.waste}%</div>
            <div className="text-xs text-orange-600">Industry avg: 8.2%</div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-gray-900">12-Month Performance</h4>
          </div>
          <SimpleChart data={chartData} color="blue" />
          <div className="text-xs text-gray-500 mt-2">Monthly revenue in thousands</div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Top Performing Products</h4>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{product.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">${product.sales.toLocaleString()}</span>
                  {product.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : product.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">AI Recommendations</h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                rec.type === 'success' ? 'bg-green-50 border border-green-200' :
                rec.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-start gap-2">
                  {rec.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : rec.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  ) : (
                    <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                  )}
                  <p className={`text-sm ${
                    rec.type === 'success' ? 'text-green-800' :
                    rec.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {rec.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/20 backdrop-blur-md border-[0.5px] border-white/30 rounded-xl p-6 shadow-lg">
      <div className="text-2xl font-bold text-gray-800 mb-4">
        Buford Highway International Market
      </div>
      
      <div className={`flex ${isSplitView ? 'h-[600px]' : 'h-[600px]'} rounded-2xl overflow-hidden border-[0.5px] border-green-800/30 transition-all duration-300`}>
        {/* 3D Store Container */}
        <div 
          ref={containerRef} 
          className={`${isSplitView ? 'w-1/2' : 'w-full'} h-full transition-all duration-300`}
        />
        
        {/* Product Details Panel */}
        {isSplitView && selectedProduct && (
          <ProductDetailsPanel productId={selectedProduct} />
        )}
        
        {/* Modal (kept for backward compatibility) */}
        {showModal && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={closeModal}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-xl z-50 max-w-md">
              <h3 className="text-xl font-bold text-green-600 mb-3">{modalData.title}</h3>
              <p className="text-gray-700 mb-4">{modalData.content}</p>
              <button
                onClick={closeModal}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThreeDStore;
