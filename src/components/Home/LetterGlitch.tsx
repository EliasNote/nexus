import { useRef, useEffect } from "react";

type LetterGlitchProps = {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
  classname?: string;
};

const LetterGlitch = ({
  glitchColors = ["#2b4539", "#61dca3", "#61b3dc"],
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

  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());
  const lastDrawTime = useRef(Date.now());

  const lettersAndSymbols = Array.from(characters);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => {
    return lettersAndSymbols[
      Math.floor(Math.random() * lettersAndSymbols.length)
    ];
  };

  const getRandomColor = () => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
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

  const interpolateColor = (
    start: { r: number; g: number; b: number },
    end: { r: number; g: number; b: number },
    factor: number,
  ) => {
    const result = {
      r: Math.round(start.r + (end.r - start.r) * factor),
      g: Math.round(start.g + (end.g - start.g) * factor),
      b: Math.round(start.b + (end.b - start.b) * factor),
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }));
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
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const drawLetter = (index: number) => {
    if (!context.current || !letters.current[index]) return;

    const ctx = context.current;
    const letter = letters.current[index];
    const x = (index % grid.current.columns) * charWidth;
    const y = Math.floor(index / grid.current.columns) * charHeight;

    // Limpar área anterior (com margem)
    ctx.clearRect(x - 1, y - 1, charWidth + 2, charHeight + 2);

    // Desenhar novo caractere
    ctx.fillStyle = letter.color;
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
    ctx.fillText(letter.char, x, y);
  };

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0 || !canvasRef.current)
      return;

    // Se há índices sujos, desenhar apenas eles
    if (dirtyIndices.current.size > 0) {
      dirtyIndices.current.forEach((index) => {
        drawLetter(index);
      });
      dirtyIndices.current.clear();
    }
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    // Atualizar apenas 0.5-1% dos caracteres
    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.005));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;

      const letter = letters.current[index];
      letter.char = getRandomChar();
      letter.targetColor = getRandomColor();

      if (!smooth) {
        letter.color = letter.targetColor;
        letter.colorProgress = 1;
      } else {
        letter.colorProgress = 0;
      }

      // Marcar como sujo para redraw
      dirtyIndices.current.add(index);
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    letters.current.forEach((letter, index) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.15;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(
            startRgb,
            endRgb,
            letter.colorProgress,
          );
          needsRedraw = true;
          dirtyIndices.current.add(index);
        }
      }
    });

    return needsRedraw;
  };

  const animate = () => {
    if (!isVisibleRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const now = Date.now();
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

    // Desenhar apenas se houver mudanças e passou o throttle
    if (needsRedraw && now - lastDrawTime.current >= 16) {
      drawLetters();
      lastDrawTime.current = now;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d", { alpha: false });
    resizeCanvas();
    animate();

    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
        resizeCanvas();
        animate();
      }, 100);
    };

    // Intersection Observer para pausar quando não visível
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
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
  }, [glitchSpeed, smooth]);

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
