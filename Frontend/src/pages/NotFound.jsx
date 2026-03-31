import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particles = [];
    const particleCount = 80;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden px-4">
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Glass Card */}
      <div
        className="relative z-10 text-center max-w-md w-full 
                      bg-white/10 backdrop-blur-xl 
                      border border-white/20 
                      rounded-2xl shadow-2xl 
                      p-10 transition-all duration-500
                      hover:scale-105"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 p-6 rounded-full border border-white/20 animate-bounce">
            <FaExclamationTriangle className="text-yellow-400 text-5xl" />
          </div>
        </div>

        <h1 className="text-7xl font-extrabold text-white mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-white mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-300 mb-8">
          The page you are looking for doesn’t exist.
        </p>

        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 
                     hover:from-purple-600 hover:to-blue-600 
                     text-white font-semibold px-6 py-3 
                     rounded-xl transition-all duration-300 
                     shadow-lg hover:shadow-purple-500/40"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
