export function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshBasicMaterial color="#ffd54a" toneMapped={false} />
    </mesh>
  );
}
