/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // OLED-true black base for battery + contrast in dark gyms
        ink: '#0A0A0A',
        surface: '#151515',
        'surface-raised': '#1E1E1E',
        line: '#2A2A2A',
        chalk: '#EDEBE6',
        mute: '#8B8B87',
        // Olympic-plate color language, reused as functional UI signal
        plate: {
          red: '#E8432F', // 25kg — heavy lift / new PR
          blue: '#2E6FE8', // 20kg — active / in-progress set
          yellow: '#E8B930', // 15kg — deload / fatigue warning
          green: '#3FBF6B', // 10kg — completed / on-track
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
