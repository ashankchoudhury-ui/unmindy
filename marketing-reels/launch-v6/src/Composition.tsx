import { 
  Composition, 
  Sequence, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate, 
  spring,
  AbsoluteFill,
  Audio,
  Img,
  staticFile
} from "remotion";

// 1080x1920 portrait, 35 seconds
const FPS = 30;
const DURATION = 35 * FPS;
const W = 1080;
const H = 1920;

// Animated text with spring
const AnimatedText: React.FC<{
  text: string;
  fontSize: number;
  color: string;
  y: number;
  startFrame: number;
  endFrame: number;
  fontWeight?: number;
  letterSpacing?: number;
}> = ({ text, fontSize, color, y, startFrame, endFrame, fontWeight = 800, letterSpacing = -0.02 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;
  
  if (localFrame < 0 || frame > endFrame) return null;
  
  const progress = Math.min(localFrame / duration, 1);
  
  const scale = interpolate(progress, [0, 0.6, 1], [0.8, 1.05, 1]);
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1]);
  const yOffset = interpolate(progress, [0, 0.7, 1], [30, -5, 0]);
  
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity,
        transform: `translateY(${yOffset}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          fontWeight,
          color,
          letterSpacing: `${letterSpacing}em`,
          textAlign: "center",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          lineHeight: 1.1,
          position: "absolute",
          top: `${y}px`,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: `${W * 0.9}px`,
        }}
      >
        {text.split('\n').map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Floating geometric shape
const FloatingShape: React.FC<{
  type: 'circle' | 'square' | 'line';
  size: number;
  color: string;
  startFrame: number;
  endFrame: number;
  x: number;
  y: number;
}> = ({ type, size, color, startFrame, endFrame, x, y }) => {
  const frame = useCurrentFrame();
  
  const localFrame = frame - startFrame;
  if (localFrame < 0 || frame > endFrame) return null;
  
  const progress = localFrame / (endFrame - startFrame);
  const floatY = Math.sin(progress * Math.PI * 2) * 15;
  const rotation = progress * 360;
  const scale = interpolate(progress, [0, 0.2, 1], [0, 1, 1]);
  
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `translate(${x}px, ${y + floatY}px) rotate(${rotation}deg) scale(${scale})`,
        opacity: 0.3,
      }}
    >
      {type === 'circle' && (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            border: `2px solid ${color}`,
          }}
        />
      )}
      {type === 'square' && (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            border: `2px solid ${color}`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// Main video component
export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        width: W,
        height: H,
        overflow: 'hidden',
      }}
    >
      <Audio src={staticFile("narration-timed.wav")} />
      
      {/* Scene 1: 0-4s (0-120 frames) */}
      <Sequence from={0} durationInFrames={120}>
        <AnimatedText text="THE AVERAGE PERSON" fontSize={52} color="#777777" y={380} startFrame={10} endFrame={100} />
        <AnimatedText text="147×" fontSize={240} color="#ffffff" y={580} startFrame={20} endFrame={110} fontWeight={900} />
        <AnimatedText text="DAILY UNLOCKS" fontSize={60} color="#777777" y={820} startFrame={50} endFrame={110} />
        <FloatingShape type="circle" size={120} color="#333333" startFrame={0} endFrame={120} x={200} y={1400} />
        <FloatingShape type="square" size={80} color="#333333" startFrame={0} endFrame={120} x={850} y={1600} />
      </Sequence>
      
      {/* Scene 2: 4-9s (120-270 frames) */}
      <Sequence from={120} durationInFrames={150}>
        <AnimatedText 
          text="Most of it\nisn't even\nyour choice." 
          fontSize={120} 
          color="#ffffff" 
          y={700} 
          startFrame={10} 
          endFrame={130} 
          fontWeight={700}
        />
      </Sequence>
      
      {/* Scene 3: 9-14s (270-420 frames) */}
      <Sequence from={270} durationInFrames={150}>
        <AnimatedText text="THE PROBLEM" fontSize={48} color="#777777" y={380} startFrame={10} endFrame={100} />
        <AnimatedText text="Your brain\nis on autopilot." fontSize={130} color="#ffffff" y={640} startFrame={20} endFrame={140} fontWeight={800} />
      </Sequence>
      
      {/* Scene 4: 14-22s (420-660 frames) */}
      <Sequence from={420} durationInFrames={240}>
        <AnimatedText text="UNMINDY" fontSize={170} color="#ffffff" y={700} startFrame={30} endFrame={220} fontWeight={900} letterSpacing={-0.03} />
        <AnimatedText text="CATCHES YOU IN 3 SECONDS" fontSize={58} color="#777777" y={940} startFrame={70} endFrame={220} />
        <Img
          src={staticFile("pause-bars.png")}
          style={{
            position: 'absolute',
            top: '520px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '120px',
            opacity: interpolate(frame, [420, 450], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        />
      </Sequence>
      
      {/* Scene 5: 22-28s (660-840 frames) */}
      <Sequence from={660} durationInFrames={180}>
        <AnimatedText text="Catch. Ask. Lock." fontSize={140} color="#ffffff" y={700} startFrame={10} endFrame={160} fontWeight={800} />
      </Sequence>
      
      {/* Scene 6: 28-35s (840-1050 frames) */}
      <Sequence from={840} durationInFrames={210}>
        <AnimatedText text="UNMINDY" fontSize={190} color="#ffffff" y={620} startFrame={20} endFrame={190} fontWeight={900} letterSpacing={-0.03} />
        <AnimatedText text="Break the scroll." fontSize={80} color="#ffffff" y={860} startFrame={60} endFrame={200} fontWeight={700} />
        <AnimatedText text="landing-nine-pi-85.vercel.app" fontSize={52} color="#777777" y={980} startFrame={80} endFrame={200} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Register composition
export const RemotionRoot = () => {
  return (
    <Composition
      id="UNMINDYLaunch"
      component={MyComponent}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
    />
  );
};
