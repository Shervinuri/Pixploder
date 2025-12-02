import React, { useEffect, useRef } from 'react';
import { MousePosition } from '../types';

interface ParticleCanvasProps {
  imageSrc: string;
}

class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  friction: number;
  ease: number;
  weight: number;
  angleOffset: number;
  noise: number;
  alpha: number;
  fadeSpeed: number;

  constructor(originX: number, originY: number, r: number, g: number, b: number, canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.originX = originX;
    this.originY = originY;
    this.color = `rgb(${r}, ${g}, ${b})`;
    
    this.size = 1.1;
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.92;
    this.ease = 0.08;
    
    // Physics randomization
    this.weight = Math.random() * 1.5 + 0.5;
    this.angleOffset = (Math.random() - 0.5) * 2.0;
    this.noise = (Math.random() - 0.5) * 50;
    
    this.alpha = 0;
    this.fadeSpeed = 0.02 + Math.random() * 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color.replace('rgb', 'rgba').replace(')', `, ${this.alpha})`);
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  update(mouse: MousePosition) {
    // Fade in
    if (this.alpha < 1) {
      this.alpha += this.fadeSpeed;
    }

    // Mouse Interaction
    const dx = (mouse.x || 0) - this.x;
    const dy = (mouse.y || 0) - this.y;
    // Only calculate distance if mouse is on screen
    const distance = (mouse.x !== null) ? Math.sqrt(dx * dx + dy * dy) : 10000;
    
    const effectiveRadius = mouse.radius + this.noise;

    if (distance < effectiveRadius) {
      const force = effectiveRadius - distance;
      const angle = Math.atan2(dy, dx) + this.angleOffset;
      
      const pushX = Math.cos(angle) * force * this.weight;
      const pushY = Math.sin(angle) * force * this.weight;
      
      this.vx -= pushX * 0.08;
      this.vy -= pushY * 0.08;
    }

    // Return home
    const dxHome = this.originX - this.x;
    const dyHome = this.originY - this.y;
    
    this.vx += dxHome * this.ease;
    this.vy += dyHome * this.ease;

    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;
  }
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef<MousePosition>({ x: null, y: null, radius: 100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageSrc;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (image.complete) {
        initParticles(image);
      }
    };

    const initParticles = (img: HTMLImageElement) => {
      particlesRef.current = [];
      
      let maxDrawWidth = 700;
      if (window.innerWidth < 800) maxDrawWidth = window.innerWidth - 40;

      const aspectRatio = img.width / img.height;
      const drawWidth = maxDrawWidth;
      const drawHeight = Math.floor(drawWidth / aspectRatio);

      // Create off-screen canvas to read pixel data
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCanvas.width = drawWidth;
      tempCanvas.height = drawHeight;
      
      tempCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
      const imageData = tempCtx.getImageData(0, 0, drawWidth, drawHeight);
      const data = imageData.data;

      const startX = (canvas.width - drawWidth) / 2;
      const startY = (canvas.height - drawHeight) / 2;
      const gap = 1;

      for (let y = 0; y < drawHeight; y += gap) {
        for (let x = 0; x < drawWidth; x += gap) {
          const index = (y * 4 * drawWidth) + (x * 4);
          const alpha = data[index + 3];

          // Threshold for creating a particle
          if (alpha > 128) {
            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            
            // Check for color presence (since we removed background, this is less critical but good for noise reduction)
            if (red > 15 || green > 15 || blue > 15) {
              particlesRef.current.push(
                new Particle(startX + x, startY + y, red, green, blue, canvas.width, canvas.height)
              );
            }
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].draw(ctx);
        particlesRef.current[i].update(mouseRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    image.onload = () => {
      handleResize();
      animate();
    };

    // Event Listeners
    window.addEventListener('resize', handleResize);
    
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.x;
      mouseRef.current.y = e.y;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      mouseRef.current.x = e.touches[0].clientX;
      mouseRef.current.y = e.touches[0].clientY;
    };

    const onEnd = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('mouseout', onEnd);

    // Initial setup
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('mouseout', onEnd);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [imageSrc]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 z-[1] block" />;
};

export default ParticleCanvas;
