// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["Syne", "sans-serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg:       "#0a0a0c",
        surface:  "#111114",
        card:     "#161619",
        "card-hi":"#1c1c20",
        border:   "#242428",
        "border-hi":"#2e2e35",
        text1:    "#f0f0f5",
        text2:    "#8888a0",
        text3:    "#444456",
        green:    "#22c55e",
        blue:     "#3b82f6",
        amber:    "#f59e0b",
        red:      "#ef4444",
        purple:   "#a855f7",
      },
    },
  },
  plugins: [],
};
