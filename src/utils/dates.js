// A friendly date like "Monday, 12 October 2026"
export const friendlyDate = (d = new Date()) =>
  d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// Which day of the year it is (1-366). Used to pick the same reminder all day.
export const dayOfYear = (d = new Date()) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
