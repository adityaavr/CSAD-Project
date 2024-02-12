import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

const FloatingSphere = ({ position, color, speed, distort, scale, followMouse }) => {
    const meshRef = useRef();
    const [mousePosition, setMousePosition] = useState([0, 0]);
    const [velocity, setVelocity] = useState([0, 0]);

    useEffect(() => {
        if (followMouse) {
            const handleMouseMove = (e) => {
                setMousePosition([(e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1]);
            };

            window.addEventListener('mousemove', handleMouseMove);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, [followMouse]);

    useFrame(() => {
        meshRef.current.rotation.x += 0.01 * speed;
        meshRef.current.rotation.y += 0.01 * speed;

        if (followMouse) {
            const targetX = mousePosition[0] * 10;
            const targetY = mousePosition[1] * 10;

            // Smoothly interpolate the position towards the target
            const newX = meshRef.current.position.x + (targetX - meshRef.current.position.x) * 0.1;
            const newY = meshRef.current.position.y + (targetY - meshRef.current.position.y) * 0.1;

            // Apply bounciness to the motion
            const bounceX = (targetX - meshRef.current.position.x) * 0.05;
            const bounceY = (targetY - meshRef.current.position.y) * 0.05;

            // Update velocity based on bounciness
            setVelocity([bounceX, bounceY]);

            // Update position with velocity
            meshRef.current.position.x = newX + velocity[0];
            meshRef.current.position.y = newY + velocity[1];
        } else {
            meshRef.current.position.y += Math.sin(meshRef.current.rotation.x) * scale * 0.1;
        }
    });

    return (
        <Sphere ref={meshRef} args={[scale, 32, 32]} position={position}>
            <MeshDistortMaterial color={color} speed={speed} distort={distort} />
        </Sphere>
    );
};

const generateSpheres = (count) => {
    const spheres = [];
    const range = 35; // Adjust the range to cover a larger area

    for (let i = 0; i < count; i++) {
        spheres.push({
            position: [
                (Math.random() - 0.5) * range,
                (Math.random() - 0.5) * range,
                (Math.random() - 0.5) * range,
            ],
            color: `hsl(${Math.random() * 360}, 100%, 75%)`,
            speed: Math.random() + 0.5,
            distort: Math.random() * 0.5 + 0.1,
            scale: Math.random() * 0.5 + 0.5,
        });
    }
    return spheres;
};

const FloatingSpheresAnimation = () => {
    const sphereData = generateSpheres(50); // Generate 50 spheres

    return (
        <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
            <Canvas camera={{ fov: 75, position: [0, 0, 20] }}>
                <ambientLight intensity={2.0} />
                <pointLight position={[10, 10, 10]} intensity={0.7} />
                {sphereData.map((data, index) => (
                    <FloatingSphere
                        key={index}
                        position={data.position}
                        color={data.color}
                        speed={data.speed}
                        distort={data.distort}
                        scale={data.scale}
                        followMouse={index === 0} // Only the first sphere follows the mouse
                    />
                ))}
            </Canvas>
        </div>
    );
};

export default FloatingSpheresAnimation;
