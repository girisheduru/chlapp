export const Confetti = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 10,
  }}>
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          background: ['#4A7C59', '#FFB347', '#7CB9E8', '#F4A460', '#DDA0DD', '#98D8C8'][i % 6],
          borderRadius: i % 2 === 0 ? '50%' : 2,
          left: `${Math.random() * 100}%`,
          top: -20,
          animation: `confettiFall ${2 + Math.random()}s ease-out forwards`,
          animationDelay: `${Math.random() * 0.5}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
      />
    ))}
  </div>
);
