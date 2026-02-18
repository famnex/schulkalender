/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom color placeholders for dynamic settings
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
            }
        },
    },
    plugins: [],
}
