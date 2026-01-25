// CSS animations as string for inline styles

export const animations = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes celebrateBounce {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  @keyframes confettiFall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
  }
  @keyframes fireGlow {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  @keyframes stoneGlow {
    0%, 100% { box-shadow: 0 4px 16px rgba(74, 124, 89, 0.4), 0 0 20px rgba(74, 124, 89, 0.2); }
    50% { box-shadow: 0 4px 24px rgba(74, 124, 89, 0.6), 0 0 30px rgba(74, 124, 89, 0.3); }
  }
  @keyframes stoneDrop {
    0% { transform: translateY(0); opacity: 1; }
    60% { transform: translateY(100px); opacity: 1; }
    80% { transform: translateY(90px); opacity: 1; }
    100% { transform: translateY(100px); opacity: 0; }
  }
  @keyframes gentleWave {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }
  * { box-sizing: border-box; }
  button:hover:not(:disabled) { transform: translateY(-1px); }
  button:active:not(:disabled) { transform: translateY(0); }
  input:focus, textarea:focus {
    border-color: #4A7C59 !important;
    outline: none;
  }
`;
