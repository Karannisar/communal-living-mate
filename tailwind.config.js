/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        foreground: "#FFFFFF",
        card: "#1A1A1F",
        "card-foreground": "#FFFFFF",
        popover: "#1A1A1F",
        "popover-foreground": "#FFFFFF",
        primary: "#6366F1",
        "primary-foreground": "#FFFFFF",
        secondary: "#252530",
        "secondary-foreground": "#FFFFFF",
        muted: "#252530",
        "muted-foreground": "#9CA3AF",
        accent: "#252530",
        "accent-foreground": "#FFFFFF",
        destructive: "#EF4444",
        "destructive-foreground": "#FFFFFF",
        border: "#252530",
        input: "#252530",
        ring: "#6366F1",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
} 