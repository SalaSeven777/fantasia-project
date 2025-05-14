/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        'primary-dark-blue': {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        accent: {
          error: 'var(--accent-error)',
          warning: 'var(--accent-warning)',
          info: 'var(--accent-info)',
          success: 'var(--accent-success)',
        },
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          900: 'var(--neutral-900)',
        },
        surface: {
          main: 'var(--surface-main)',
          light: 'var(--surface-light)',
          neutral: 'var(--surface-neutral)',
          darker: 'var(--surface-darker)',
        },
        secondary: {
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
        },
        wood: {
          cool: {
            100: 'var(--wood-cool-100)',
            200: 'var(--wood-cool-200)',
            300: 'var(--wood-cool-300)',
            400: 'var(--wood-cool-400)',
          },
          neutral: {
            100: 'var(--wood-neutral-100)',
            200: 'var(--wood-neutral-200)',
            300: 'var(--wood-neutral-300)',
            400: 'var(--wood-neutral-400)',
          },
          warm: {
            100: 'var(--wood-warm-100)',
            200: 'var(--wood-warm-200)',
            300: 'var(--wood-warm-300)',
            400: 'var(--wood-warm-400)',
          }
        },
        success: 'var(--success-color)',
        error: 'var(--error-color)',
        warning: 'var(--warning-color)',
      },
      fontFamily: {
        primary: ['var(--font-family-primary)'],
        secondary: ['var(--font-family-secondary)'],
        body: ['var(--font-family-body)'],
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'card': 'var(--shadow-card)',
        'dropdown': 'var(--shadow-dropdown)',
      },
      borderRadius: {
        'none': 'var(--border-radius-none)',
        'sm': 'var(--border-radius-sm)',
        'DEFAULT': 'var(--border-radius)',
        'md': 'var(--border-radius-md)',
        'lg': 'var(--border-radius-lg)',
        'xl': 'var(--border-radius-xl)',
        '2xl': 'var(--border-radius-2xl)',
        '3xl': 'var(--border-radius-3xl)',
        'full': 'var(--border-radius-full)',
      },
      zIndex: {
        'drawer': 'var(--z-drawer)',
        'popup': 'var(--z-popup)',
        'modal': 'var(--z-modal)',
        'tooltip': 'var(--z-tooltip)',
      }
    },
  },
  plugins: [],
}