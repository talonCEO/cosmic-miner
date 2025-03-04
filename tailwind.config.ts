
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				game: {
					primary: '#0a0a20',
					secondary: '#1a1a3a',
					accent: '#6366f1',
					text: '#e0e0ff',
					'text-secondary': '#a0a0d0',
					'upgrade-bg': '#15152a',
					'upgrade-border': '#3f3f7d'
				},
				// Space theme colors
				space: {
					primary: '#0a0a20',
					secondary: '#1a1a3a',
					accent: '#6366f1',
					highlight: '#9f7aea',
					nebula: '#bf61ff',
					star: '#fffacd',
					meteor: '#ff6b6b',
					dark: '#050510',
					dust: '#a0a0d050'
				},
				// Mining theme colors
				element: {
					hydrogen: '#81D4FA',
					carbon: '#424242',
					oxygen: '#90CAF9',
					silicon: '#BBDEFB',
					aluminum: '#B0BEC5',
					iron: '#CB8D73',
					copper: '#D87F46',
					silver: '#E0E0E0',
					gold: '#FFC107',
					platinum: '#E1E1E1',
					uranium: '#26A69A',
					rare: '#BA68C8'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-click': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(0.95)' }
				},
				'float-up': {
					'0%': { opacity: '1', transform: 'translateY(0) rotate(0deg)' },
					'100%': { opacity: '0', transform: 'translateY(-20px) rotate(10deg)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'mining': {
					'0%': { transform: 'rotate(-5deg)' },
					'50%': { transform: 'rotate(5deg)' },
					'100%': { transform: 'rotate(-5deg)' }
				},
				'float-vertical': {
					'0%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(40px)' },
					'100%': { transform: 'translateY(0)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'orbit': {
					'0%': { transform: 'rotate(0deg) translateX(50px) rotate(0deg)' },
					'100%': { transform: 'rotate(360deg) translateX(50px) rotate(-360deg)' }
				},
				'twinkle': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.5', transform: 'scale(0.7)' }
				},
				'meteor': {
					'0%': { transform: 'translateX(0) translateY(0)', opacity: '1' },
					'100%': { transform: 'translateX(-500px) translateY(500px)', opacity: '0' }
				},
				'rotate-3d': {
					'0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
					'50%': { transform: 'rotateX(180deg) rotateY(90deg)' },
					'100%': { transform: 'rotateX(360deg) rotateY(0deg)' }
				},
				'drift': {
					'0%': { transform: 'translate(0, 0) rotate(0deg)' },
					'33%': { transform: 'translate(30px, 20px) rotate(5deg)' },
					'66%': { transform: 'translate(-20px, 40px) rotate(-5deg)' },
					'100%': { transform: 'translate(0, 0) rotate(0deg)' }
				},
				'asteroid-rotate': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-click': 'pulse-click 0.3s ease-in-out',
				'float-up': 'float-up 1s ease-out forwards',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.5s ease-out',
				'slide-down': 'slide-down 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'mining': 'mining 0.5s ease-in-out infinite',
				'float-vertical': 'float-vertical 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite linear',
				'orbit': 'orbit 8s linear infinite',
				'twinkle': 'twinkle 3s ease-in-out infinite',
				'meteor': 'meteor 2s forwards',
				'rotate-3d': 'rotate-3d 20s linear infinite',
				'drift': 'drift 20s ease-in-out infinite',
				'asteroid-rotate': 'asteroid-rotate 30s linear infinite'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities, theme, e }: any) {
			const newUtilities = {
				'.clip-triangle': {
					clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
				},
				'.clip-hexagon': {
					clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
				},
				'.clip-asteroid': {
					clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
				},
				'.text-shadow-sm': {
					textShadow: '0 1px 2px rgba(0,0,0,0.5)'
				},
				'.text-shadow-md': {
					textShadow: '0 2px 4px rgba(0,0,0,0.5)'
				},
				'.text-shadow-glow': {
					textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(100,100,255,0.3)'
				},
				'.bg-space-dust': {
					backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
				},
			};
			addUtilities(newUtilities);
		}
	],
} satisfies Config;
