/**
 * Converts a Blob URL to a Base64 string.
 */
export const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Generates the full HTML string for the standalone file.
 * Includes the Base64 image and the vanilla JS particle logic.
 */
export const generateStandaloneHTML = (base64Image: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHΞN™ Particle Art</title>
    <style>
        body {
            background-color: #000;
            margin: 0;
            padding: 0;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        canvas {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }

        /* Footer Styles */
        #signature {
            position: absolute;
            bottom: 30px;
            z-index: 2;
            font-size: 11px;
            letter-spacing: 5px;
            font-weight: 400;
            text-transform: uppercase;
            color: #333; 
            font-family: sans-serif;
            text-decoration: none;
            
            /* Gradient Shimmer */
            background: linear-gradient(
                110deg, 
                #333 0%, 
                #444 30%, 
                #fff 50%, 
                #444 70%, 
                #333 100%
            );
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            
            animation: shimmer 5s ease-in-out infinite alternate;
        }

        @keyframes shimmer {
            0% { background-position: -50% center; }
            100% { background-position: 150% center; }
        }
    </style>
</head>
<body>

    <a id="signature" href="https://T.me/shervini" target="_blank">Exclusive SHΞN™ made</a>
    <canvas id="canvas"></canvas>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        let particlesArray = [];
        const mouse = {
            x: null,
            y: null,
            radius: 100
        };

        // Embed the processed image directly
        const imageURL = "${base64Image}";
        const png = new Image();
        // No crossOrigin needed for base64
        png.src = imageURL;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor(originX, originY, r, g, b) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                
                this.originX = originX;
                this.originY = originY;
                
                this.r = r;
                this.g = g;
                this.b = b;
                this.alpha = 0; 
                
                this.size = 1.1;
                this.vx = 0;
                this.vy = 0;
                
                // Physics
                this.friction = 0.92; 
                this.ease = 0.08; 

                // Randomness
                this.weight = Math.random() * 1.5 + 0.5;
                this.angleOffset = (Math.random() - 0.5) * 2.0; 
                this.noise = (Math.random() - 0.5) * 50; 
                
                this.fadeSpeed = 0.02 + Math.random() * 0.02;
            }

            draw() {
                ctx.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.alpha + ")";
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }

            update() {
                if (this.alpha < 1) {
                    this.alpha += this.fadeSpeed;
                }

                const dx = (mouse.x || -1000) - this.x;
                const dy = (mouse.y || -1000) - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const effectiveRadius = mouse.radius + this.noise;

                if (distance < effectiveRadius) {
                    const force = effectiveRadius - distance;
                    const angle = Math.atan2(dy, dx) + this.angleOffset;
                    
                    const pushX = Math.cos(angle) * force * this.weight;
                    const pushY = Math.sin(angle) * force * this.weight;
                    
                    this.vx -= pushX * 0.08;
                    this.vy -= pushY * 0.08;
                }

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

        function init(image) {
            particlesArray = [];
            
            let maxDrawWidth = 700; 
            if (window.innerWidth < 800) maxDrawWidth = window.innerWidth - 40;

            const aspectRatio = image.width / image.height;
            const drawWidth = maxDrawWidth;
            const drawHeight = Math.floor(drawWidth / aspectRatio);

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = drawWidth;
            tempCanvas.height = drawHeight;
            
            tempCtx.drawImage(image, 0, 0, drawWidth, drawHeight);
            const imageData = tempCtx.getImageData(0, 0, drawWidth, drawHeight);
            const data = imageData.data;

            const startX = (canvas.width - drawWidth) / 2;
            const startY = (canvas.height - drawHeight) / 2;

            const gap = 1; 

            for (let y = 0; y < drawHeight; y += gap) {
                for (let x = 0; x < drawWidth; x += gap) {
                    const index = (y * 4 * drawWidth) + (x * 4);
                    const alpha = data[index + 3];

                    if (alpha > 128) {
                        const red = data[index];
                        const green = data[index + 1];
                        const blue = data[index + 2];
                        
                        if (red > 15 || green > 15 || blue > 15) {
                            particlesArray.push(new Particle(startX + x, startY + y, red, green, blue));
                        }
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].draw();
                particlesArray[i].update();
            }
            requestAnimationFrame(animate);
        }

        png.onload = function() {
            init(png);
            animate();
        };

        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (particlesArray.length) init(png);
        });

        window.addEventListener('mousemove', function(e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('touchmove', function(e) {
            e.preventDefault(); 
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }, { passive: false });

        window.addEventListener('touchend', function() {
            mouse.x = null;
            mouse.y = null;
        });
        
        window.addEventListener('mouseout', function() {
            mouse.x = null;
            mouse.y = null;
        });
    </script>
</body>
</html>`;
};
