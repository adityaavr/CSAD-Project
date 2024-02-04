// ThreeDFiberAnimation.jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { useTransform, useScroll, useTime } from "framer-motion";
import { degreesToRadians, progress, mix } from "popmotion";
import * as THREE from 'three';

const color = "#1f2023";

const Icosahedron = () => (
    <mesh rotation={[0.35, 0, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial wireframe color={color} />
    </mesh>
);

const Star = ({ p }) => {
    const ref = useRef();

    useEffect(() => {
        const distance = mix(2, 3.5, Math.random());
        const yAngle = mix(degreesToRadians(80), degreesToRadians(100), Math.random());
        const xAngle = degreesToRadians(360) * p;
        ref.current.position.setFromSphericalCoords(distance, yAngle, xAngle);
    }, [p]);

    return (
        <mesh ref={ref}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial wireframe color={color} />
        </mesh>
    );
};

const Scene = ({ numStars = 100 }) => {
    const { scrollYProgress } = useScroll();
    const yAngle = useTransform(scrollYProgress, [0, 1], [0.001, degreesToRadians(180)]);
    const distance = useTransform(scrollYProgress, [0, 1], [10, 3]);
    const time = useTime();

    useFrame(({ camera }) => {
        camera.position.setFromSphericalCoords(distance.get(), yAngle.get(), time.get() * 0.0005);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    });

    return (
        <>
            <Icosahedron />
            {Array.from({ length: numStars }, (_, i) => <Star key={i} p={progress(0, numStars, i)} />)}
        </>
    );
};

const ThreeDFiberAnimation = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full z-0">
            <Canvas gl={{ antialias: false }} camera={{ position: [0, 0, 5], fov: 75 }}>
                <Scene />
            </Canvas>
        </div>
    );
};

export default ThreeDFiberAnimation;
