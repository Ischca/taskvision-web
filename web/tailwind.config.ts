import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // メインカラーパレット
        primary: {
          50: '#f0f8ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // 各タイムブロックのカラー
        morning: {
          light: '#e0f2fe', // 薄い青
          border: '#7dd3fc',
          text: '#0284c7',
        },
        forenoon: {
          light: '#fef3c7', // 薄い黄色
          border: '#fcd34d',
          text: '#b45309',
        },
        noon: {
          light: '#dcfce7', // 薄い緑
          border: '#86efac',
          text: '#15803d',
        },
        afternoon: {
          light: '#ffedd5', // 薄いオレンジ
          border: '#fdba74',
          text: '#c2410c',
        },
        evening: {
          light: '#f3e8ff', // 薄い紫
          border: '#d8b4fe',
          text: '#7e22ce',
        },
      },
      fontFamily: {
        sans: ['var(--font-m-plus-rounded)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
        hover: '0 6px 20px rgba(0, 0, 0, 0.1)',
        card: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#0ea5e9',
          'primary-focus': '#0284c7',
          'primary-content': '#ffffff',
          secondary: '#f59e0b',
          'secondary-focus': '#d97706',
          'secondary-content': '#ffffff',
          accent: '#8b5cf6',
          'accent-focus': '#7c3aed',
          'accent-content': '#ffffff',
          neutral: '#3d4451',
          'neutral-focus': '#2a2e37',
          'neutral-content': '#ffffff',
          'base-100': '#ffffff',
          'base-200': '#f9fafb',
          'base-300': '#f3f4f6',
          'base-content': '#1f2937',
          info: '#3abff8',
          success: '#22c55e',
          warning: '#fbbd23',
          error: '#f87272',
          '--rounded-box': '1rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '0.5rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-text-case': 'capitalize',
          '--btn-focus-scale': '0.95',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem',
        },
      },
      {
        dark: {
          primary: '#0ea5e9',
          'primary-focus': '#0284c7',
          'primary-content': '#ffffff',
          secondary: '#f59e0b',
          'secondary-focus': '#d97706',
          'secondary-content': '#ffffff',
          accent: '#8b5cf6',
          'accent-focus': '#7c3aed',
          'accent-content': '#ffffff',
          neutral: '#3d4451',
          'neutral-focus': '#2a2e37',
          'neutral-content': '#ffffff',
          'base-100': '#1f2937',
          'base-200': '#111827',
          'base-300': '#0f172a',
          'base-content': '#f3f4f6',
          info: '#3abff8',
          success: '#22c55e',
          warning: '#fbbd23',
          error: '#f87272',
          '--rounded-box': '1rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '0.5rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-text-case': 'capitalize',
          '--btn-focus-scale': '0.95',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem',
        },
      },
    ],
  },
};
export default config;
