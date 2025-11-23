/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Plus Jakarta Sans', 'sans-serif'],
			},
			colors: {
				primary: {
					light: '#1e40af',
					dark: '#3b82f6',
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					light: '#15803d',
					dark: '#22c55e',
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				accent: {
					light: '#d97706',
					dark: '#f59e0b',
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				background: {
					light: '#f9fafb',
					dark: '#111827',
					DEFAULT: 'hsl(var(--background))',
				},
				foreground: {
					light: '#111827',
					dark: '#e5e7eb',
					DEFAULT: 'hsl(var(--foreground))',
				},
				card: {
					light: '#ffffff',
					dark: '#1f2937',
					DEFAULT: 'hsl(var(--card)/0.1)',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					light: '#ffffff',
					dark: '#1f2937',
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				muted: {
					light: '#e5e7eb',
					dark: '#374151',
					DEFAULT: 'hsl(var(--muted))',
					foreground: {
						light: '#6b7280',
						dark: '#9ca3af',
						DEFAULT: 'hsl(var(--muted-foreground))',
					},
				},
				border: {
					light: '#d1d5db',
					dark: '#4b5563',
					DEFAULT: 'hsl(var(--border))',
				},
				input: {
					light: '#d1d5db',
					dark: '#4b5563',
					DEFAULT: 'hsl(var(--input))',
				},
				ring: {
					light: '#1e40af',
					dark: '#3b82f6',
					DEFAULT: 'hsl(var(--ring))',
				},
				destructive: {
					light: '#b91c1c',
					dark: '#ef4444',
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				success: {
					light: '#15803d',
					dark: '#22c55e',
					DEFAULT: 'hsl(var(--success))',
				},
				warning: {
					light: '#d97706',
					dark: '#f59e0b',
					DEFAULT: 'hsl(var(--warning))',
				},
				chart: {
					1: 'hsl(var(--chart-1))',
					2: 'hsl(var(--chart-2))',
					3: 'hsl(var(--chart-3))',
					4: 'hsl(var(--chart-4))',
					5: 'hsl(var(--chart-5))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};