import React, { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Sphere, Box, Torus, Cone, Cylinder } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * Individual Interactive Object Component
 */
const InteractiveObject = ({ 
  position, 
  objectData, 
  onHover, 
  onLeave,
  isMobile 
}) => {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const { camera, gl } = useThree()

  // Base floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      const floatY = position[1] + Math.sin(time * objectData.floatSpeed + objectData.id) * 0.2
      const rotateY = time * objectData.rotateSpeed
      
      meshRef.current.position.y = floatY
      meshRef.current.rotation.y = rotateY
      
      // Scale animation when hovered
      const targetScale = hovered ? 1.2 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  const handlePointerOver = (event) => {
    event.stopPropagation()
    setHovered(true)
    gl.domElement.style.cursor = 'pointer'
    
    // Calculate screen position for label
    const vector = new THREE.Vector3(...position)
    vector.project(camera)
    
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight
    
    onHover(objectData, { x, y })
  }

  const handlePointerOut = () => {
    setHovered(false)
    gl.domElement.style.cursor = 'auto'
    onLeave()
  }

  const handleClick = () => {
    setClicked(true)
    // Add click animation
    gsap.to(meshRef.current.scale, {
      x: 1.3,
      y: 1.3,
      z: 1.3,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    })
    setTimeout(() => setClicked(false), 200)
  }

  // Render different shapes based on object type
  const renderGeometry = () => {
    switch (objectData.type) {
      case 'shell':
        return <Cone args={[0.8, 1.2, 8]} />
      case 'bottle':
        return <Cylinder args={[0.3, 0.4, 1.5, 8]} />
      case 'treasure':
        return <Box args={[1.2, 0.8, 0.8]} />
      case 'ring':
        return <Torus args={[0.6, 0.2, 8, 16]} />
      case 'coral':
        return (
          <group>
            <Sphere args={[0.4]} position={[0, 0, 0]} />
            <Sphere args={[0.3]} position={[0.3, 0.4, 0]} />
            <Sphere args={[0.25]} position={[-0.2, 0.5, 0.2]} />
          </group>
        )
      default:
        return <Sphere args={[0.5]} />
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      castShadow={!isMobile}
      receiveShadow={!isMobile}
    >
      {renderGeometry()}
      <meshPhysicalMaterial
        color={objectData.color}
        roughness={objectData.roughness}
        metalness={objectData.metalness}
        clearcoat={objectData.clearcoat || 0}
        transmission={objectData.transmission || 0}
        emissive={hovered ? objectData.emissiveColor : 0x000000}
        emissiveIntensity={hovered ? 0.2 : 0}
      />
    </mesh>
  )
}

/**
 * Interactive Objects Manager Component
 */
const InteractiveObjects = ({ onObjectHover, onObjectLeave, isMobile }) => {
  // Object data with descriptions
  const objects = [
    {
      id: 1,
      type: 'shell',
      position: [-8, -3, -5],
      color: 0xffd54f,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.5,
      emissiveColor: 0xffecb3,
      floatSpeed: 0.8,
      rotateSpeed: 0.2,
      title: 'Seashell Collection',
      titleJp: '貝殻コレクション',
      description: 'Beautiful shells found during beach walks. Each one tells a story of the ocean.',
      descriptionJp: 'ビーチウォーキングで見つけた美しい貝殻。それぞれが海の物語を語っています。'
    },
    {
      id: 2,
      type: 'bottle',
      position: [6, -2, -8],
      color: 0x4fc3f7,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.8,
      emissiveColor: 0x81d4fa,
      floatSpeed: 0.6,
      rotateSpeed: 0.3,
      title: 'Message in a Bottle',
      titleJp: 'ボトルメッセージ',
      description: 'A mysterious bottle containing dreams and wishes from distant shores.',
      descriptionJp: '遠い海岸からの夢と願いが込められた不思議なボトル。'
    },
    {
      id: 3,
      type: 'treasure',
      position: [-3, -4, 8],
      color: 0xffb74d,
      roughness: 0.3,
      metalness: 0.8,
      emissiveColor: 0xffc947,
      floatSpeed: 0.4,
      rotateSpeed: 0.1,
      title: 'Treasure Chest',
      titleJp: '宝箱',
      description: 'A chest full of creative treasures - code snippets, design ideas, and inspiration.',
      descriptionJp: 'クリエイティブな宝物がいっぱい - コードスニペット、デザインアイデア、そしてインスピレーション。'
    },
    {
      id: 4,
      type: 'ring',
      position: [10, -1, 3],
      color: 0xe1bee7,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 0.8,
      emissiveColor: 0xf3e5f5,
      floatSpeed: 1.0,
      rotateSpeed: 0.5,
      title: 'Life Ring',
      titleJp: '浮き輪',
      description: 'A symbol of safety and support in the vast ocean of web development.',
      descriptionJp: 'Webデベロップメントの広大な海での安全とサポートの象徴。'
    },
    {
      id: 5,
      type: 'coral',
      position: [2, -3, -12],
      color: 0xff8a65,
      roughness: 0.4,
      metalness: 0.2,
      emissiveColor: 0xffab91,
      floatSpeed: 0.3,
      rotateSpeed: 0.05,
      title: 'Digital Coral',
      titleJp: 'デジタルサンゴ',
      description: 'Growing communities and connections in the digital reef of creativity.',
      descriptionJp: 'クリエイティビティのデジタルリーフでコミュニティとつながりを育てています。'
    }
  ]

  // Filter objects for mobile (show fewer objects for performance)
  const displayObjects = isMobile ? objects.slice(0, 3) : objects

  return (
    <group>
      {displayObjects.map((obj) => (
        <InteractiveObject
          key={obj.id}
          position={obj.position}
          objectData={obj}
          onHover={onObjectHover}
          onLeave={onObjectLeave}
          isMobile={isMobile}
        />
      ))}

      {/* Ocean Floor */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={!isMobile}>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial 
          color={0x1565c0}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Add some static seaweed/kelp for atmosphere */}
      {!isMobile && (
        <>
          <mesh position={[-15, -2, -10]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.1, 0.05, 4, 6]} />
            <meshLambertMaterial color={0x2e7d32} />
          </mesh>
          <mesh position={[12, -1.5, -15]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.08, 0.04, 3.5, 6]} />
            <meshLambertMaterial color={0x388e3c} />
          </mesh>
        </>
      )}
    </group>
  )
}

export default InteractiveObjects