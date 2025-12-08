
// DeliveryAnimation.js
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, SoftShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './DeliveryAnimation.css';

const RobotMessenger = ({ onComplete }) => {
    const group = useRef();
    const { scene, animations } = useGLTF('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb');
    const { actions } = useAnimations(animations, group);

    // Stages: 'DELIVER' -> 'RETURN' -> 'CELEBRATE' -> 'DONE'
    const [stage, setStage] = useState('DELIVER');

    useEffect(() => {
        // Handle animation changes based on stage
        const playAnim = (name, timeScale = 1) => {
            // Stop all current animations fade out
            Object.values(actions).forEach(action => action.fadeOut(0.5));

            if (actions[name]) {
                actions[name].reset().fadeIn(0.5).play();
                actions[name].timeScale = timeScale;
            }
        };

        if (stage === 'DELIVER') {
            playAnim('Running');
        } else if (stage === 'RETURN') {
            playAnim('Running');
        } else if (stage === 'CELEBRATE') {
            playAnim('ThumbsUp', 1); // Or 'Jump' / 'Dance'
        }

    }, [stage, actions]);

    useFrame((state, delta) => {
        if (!group.current) return;
        const speed = 8 * delta;

        if (stage === 'DELIVER') {
            // Move Right
            group.current.position.x += speed;
            group.current.rotation.y = Math.PI / 2; // Face Right

            // Once off screen
            if (group.current.position.x > 12) {
                setStage('RETURN');
            }
        } else if (stage === 'RETURN') {
            // Move Left (back to center)
            group.current.position.x -= speed;
            group.current.rotation.y = -Math.PI / 2; // Face Left

            // Once back at center
            if (group.current.position.x <= 0) {
                group.current.position.x = 0;
                // Face camera for celebration
                group.current.rotation.y = 0; // Face Camera (approx 0 or PI depending on model default)
                setStage('CELEBRATE');
            }
        } else if (stage === 'CELEBRATE') {
            // Just wait for animation to play out
            // We handle the timeout logic in the parent component or here separately
            // Let's ensure rotation is correct
            group.current.rotation.y = 0; // Face forward (0 rads usually faces Z+)
        }
    });

    // Handle completion timeout after entering CELEBRATE
    useEffect(() => {
        if (stage === 'CELEBRATE') {
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 2500); // 2.5s for thumbs up
            return () => clearTimeout(timer);
        }
    }, [stage, onComplete]);

    return (
        <group ref={group} position={[-10, -2, 0]} scale={0.8}>
            <primitive object={scene} />
        </group>
    );
};

const Floor = () => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[100, 20]} />
            <meshStandardMaterial color="#ecf0f1" opacity={0.6} transparent />
        </mesh>
    );
};

const DeliveryAnimation = ({ onComplete }) => {
    // Global fallback timer
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 10000); // Increased safe timeout
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="delivery-overlay-3d">
            <Canvas shadows camera={{ position: [0, 2, 10], fov: 45 }}>
                <SoftShadows />
                <Environment preset="city" />

                <ambientLight intensity={0.5} />
                <directionalLight
                    castShadow
                    position={[2, 10, 5]}
                    intensity={1.5}
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />

                <RobotMessenger onComplete={onComplete} />
                <Floor />
            </Canvas>
            <div className="success-message-3d">
                <h2>Dispatching Request...</h2>
            </div>
        </div>
    );
};

export default DeliveryAnimation;
