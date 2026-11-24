export const formatPrice = (price: number) =>
  price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;

export const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const initials = (name: string) =>
  name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();