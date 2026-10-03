// Prices are in cents. Put photos in public/images/products/ using each "image" filename.
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const P = (id, name, price, desc) => ({ id, name, price, desc, sizes: SIZES, image: `images/products/dress-${id}.jpg` });
module.exports = [
  P(1, 'Lace-Up Ribbon Slip Dress', 5800, 'Black chiffon with satin lace-up sides and a tiered hem.'),
  P(2, 'Black Lace Puff-Sleeve Dress', 6400, 'Floral lace over a tie-front bodice, with ruffled sleeves.'),
  P(3, 'Midnight Chiffon Tiered Dress', 6200, 'Three soft ruffle tiers, light enough for a night walk.'),
  P(4, 'Shrine Maiden Sailor Dress', 7200, 'A sailor collar and red scarf on a pleated skirt.'),
  P(5, 'Moth Lace Babydoll Dress', 5600, 'A short, airy babydoll cut with scalloped lace trim.'),
  P(6, 'Crimson Ribbon Pinafore Dress', 6800, 'Black pinafore with a single red satin ribbon at the chest.'),
  P(7, 'Lantern Velvet Mini Dress', 7400, 'Soft velvet in deep plum with a square neckline.'),
  P(8, 'Ivory Ruffle Night Dress', 6000, 'Cream cotton with lace edges, inspired by the wandering girls.'),
  P(9, 'Veil Chiffon Maxi Dress', 8200, 'A floor-length black chiffon dress with sheer, floaty sleeves.'),
  P(10, 'Camera Strap Corset Dress', 7800, 'A laced corset bodice with a soft ruffled skirt and satin straps.'),
  P(11, 'Plaid Ribbon School Dress', 6600, 'Black and white plaid with a big bow and lace-trimmed tiers.'),
  P(12, 'Rain Garden Smock Dress', 5400, 'A loose cotton smock in dusty rose with a gathered neckline.'),
  P(13, 'Gothic Rose Lace Dress', 7000, 'Long-sleeve black lace with a high collar and rose appliques.'),
  P(14, 'Twilight Satin Slip Dress', 6300, 'A bias-cut satin slip in deep plum with thin adjustable straps.'),
  P(15, 'Haunted Parlour Pinafore', 6900, 'A pleated pinafore in charcoal wool blend over a white blouse.'),
  P(16, 'Moonlit Bow Tiered Dress', 7500, 'Layered tulle tiers with an oversized satin bow at the waist.'),
];