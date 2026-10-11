// Turns the saved setting ("cream", "dark" or "system") into the theme to show right now.
export const resolveTheme = (setting) =>
  setting === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'cream') : setting
