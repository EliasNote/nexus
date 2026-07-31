import { useRef, useEffect } from "react";

type RGBColor = { r: number; g: number; b: number };

type Letter = {
  char: string;
  color: RGBColor;
  startColor: RGBColor;
  targetColor: RGBColor;
  colorProgress: number;
};

type LetterGlitchProps = {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
  classname?: string;
};

// ["#2563eb", "#ffffff", "#71717a"]
const DEFAULT_GLITCH_COLORS = ["#60a5fa", "#61dca3", "#61b3dc", "#dbeafe"];

const LetterGlitch = ({
  glitchColors = DEFAULT_GLITCH_COLORS,
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",
  classname = "",
}: LetterGlitchProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const dirtyIndices = useRef<Set<number>>(new Set());

  const letters = useRef<Letter[]>([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(0);
  const lastDrawTime = useRef(0);
  const glitchColorsKey = glitchColors.join(",");

  const lettersAndSymbols = Array.from(characters);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => {
    return lettersAndSymbols[
      Math.floor(Math.random() * lettersAndSymbols.length)
    ];
  };

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const availableColors = glitchColors
    .map(hexToRgb)
    .filter((color): color is RGBColor => color !== null);

  const getRandomColor = () => {
    const color =
      availableColors[Math.floor(Math.random() * availableColors.length)] ??
      { r: 97, g: 220, b: 163 };
    return { ...color };
  };

  const interpolateColor = (
    start: RGBColor,
    end: RGBColor,
    factor: number,
  ) => {
    return {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor),
    };
  };

  const colorToCss = ({ r, g, b }: RGBColor) => `rgb(${r}, ${g}, ${b})`;

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => {
      const color = getRandomColor();
      return {
        char: getRandomChar(),
        color,
        startColor: { ...color },
        targetColor: getRandomColor(),
        colorProgress: 1,
      };
    });
    dirtyIndices.current.clear();
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.current.font = `${fontSize}px monospace`;
      context.current.textBaseline = "top";
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    if (context.current) {
      context.current.fillStyle = "#000";
      context.current.fillRect(0, 0, rect.width, rect.height);
    }
  };

  const drawLetter = (index: number) => {
    if (!context.current || !letters.current[index]) return;

    const ctx = context.current;
    const letter = letters.current[index];
    const x = (index % grid.current.columns) * charWidth;
    const y = Math.floor(index / grid.current.columns) * charHeight;

    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, charWidth, charHeight);
    ctx.fillStyle = colorToCss(letter.color);
    ctx.fillText(letter.char, x, y);
  };

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0 || !canvasRef.current)
      return;

    if (dirtyIndices.current.size > 0) {
      dirtyIndices.current.forEach((index) => {
        drawLetter(index);
      });
      dirtyIndices.current.clear();
    }
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.005));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;

      const letter = letters.current[index];
      letter.char = getRandomChar();
      letter.targetColor = getRandomColor();

      if (!smooth) {
        letter.color = { ...letter.targetColor };
        letter.startColor = { ...letter.targetColor };
        letter.colorProgress = 1;
      } else {
        letter.startColor = { ...letter.color };
        letter.colorProgress = 0;
      }

      dirtyIndices.current.add(index);
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    letters.current.forEach((letter, index) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.15;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        letter.color = interpolateColor(
          letter.startColor,
          letter.targetColor,
          letter.colorProgress,
        );
        needsRedraw = true;
        dirtyIndices.current.add(index);
      }
    });

    return needsRedraw;
  };

  const animate = (now: number) => {
    if (!isVisibleRef.current) return;

    let needsRedraw = false;

    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters();
      needsRedraw = true;
      lastGlitchTime.current = now;
    }

    if (smooth) {
      const smoothRedraw = handleSmoothTransitions();
      needsRedraw = needsRedraw || smoothRedraw;
    }

    if (needsRedraw && now - lastDrawTime.current >= 16) {
      drawLetters();
      lastDrawTime.current = now;
    }

    animationRef.current = isVisibleRef.current
      ? requestAnimationFrame(animate)
      : null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d", { alpha: false });
    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
        resizeCanvas();
        animationRef.current = isVisibleRef.current
          ? requestAnimationFrame(animate)
          : null;
      }, 100);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting && animationRef.current === null) {
          const now = performance.now();
          lastGlitchTime.current = now;
          lastDrawTime.current = now;
          animationRef.current = requestAnimationFrame(animate);
        } else if (!entry.isIntersecting && animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(canvas);
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters, glitchColorsKey, glitchSpeed, smooth]);

  return (
    <div className={`w-full h-full bg-black overflow-hidden ${classname}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {outerVignette && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,1)_100%)]"></div>
      )}
      {centerVignette && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0)_60%)]"></div>
      )}
    </div>
  );
};

export default LetterGlitch;
