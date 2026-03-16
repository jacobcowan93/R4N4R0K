/**
 * Centralised image references.
 * Place the corresponding files in mobile/assets/images/ before building.
 *
 * Expected files:
 *   bg-open-world.jpg      — two characters in open world (gameplay screenshot)
 *   bg-promo.jpg           — three characters promo art (dark/warm lighting)
 *   logo-arc-light.png     — ARC Raiders logo on light background
 *   bg-dark-interior.jpg   — three characters in dark interior setting
 *   bg-banner.jpg          — ARC Raiders dark banner with coloured diagonal stripes
 */
export const Images = {
  bgOpenWorld: require('../../assets/images/bg-open-world.jpg'),
  bgPromo: require('../../assets/images/bg-promo.jpg'),
  logoArcLight: require('../../assets/images/logo-arc-light.png'),
  bgDarkInterior: require('../../assets/images/bg-dark-interior.jpg'),
  bgBanner: require('../../assets/images/bg-banner.jpg'),
} as const;
