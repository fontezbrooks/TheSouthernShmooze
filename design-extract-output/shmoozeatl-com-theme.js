// React Theme — extracted from https://www.shmoozeatl.com/
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
 *   };
 *   fonts: {
    body: string;
 *   };
 *   fontSizes: {
    '21': string;
    '48': string;
    '56': string;
    '62.08': string;
    '54.4': string;
    '52.1': string;
    '43.648': string;
    '25.216': string;
    '23.68': string;
    '22.144': string;
    '19.5': string;
    '19.2': string;
 *   };
 *   space: {
    '1': string;
    '4': string;
    '22': string;
    '30': string;
    '32': string;
    '35': string;
    '38': string;
    '40': string;
    '43': string;
    '48': string;
    '51': string;
    '64': string;
    '77': string;
    '84': string;
    '139': string;
    '146': string;
 *   };
 *   radii: {
    xs: string;
    lg: string;
    full: string;
 *   };
 *   shadows: {
    sm: string;
    xs: string;
    lg: string;
 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */

export const theme = {
  "colors": {
    "primary": "#e1ded4",
    "secondary": "#0099dd",
    "accent": "#f1694f",
    "background": "#e1ded4",
    "foreground": "#000000",
    "neutral50": "#000000",
    "neutral100": "#333333",
    "neutral200": "#ffffff",
    "neutral300": "#efece6",
    "neutral400": "#bbbbbb",
    "neutral500": "#cdd5df",
    "neutral600": "#a9a9a9"
  },
  "fonts": {
    "body": "'Google Sans Text', sans-serif"
  },
  "fontSizes": {
    "21": "21px",
    "48": "48px",
    "56": "56px",
    "62.08": "62.08px",
    "54.4": "54.4px",
    "52.1": "52.1px",
    "43.648": "43.648px",
    "25.216": "25.216px",
    "23.68": "23.68px",
    "22.144": "22.144px",
    "19.5": "19.5px",
    "19.2": "19.2px"
  },
  "space": {
    "1": "1px",
    "4": "4px",
    "22": "22px",
    "30": "30px",
    "32": "32px",
    "35": "35px",
    "38": "38px",
    "40": "40px",
    "43": "43px",
    "48": "48px",
    "51": "51px",
    "64": "64px",
    "77": "77px",
    "84": "84px",
    "139": "139px",
    "146": "146px"
  },
  "radii": {
    "xs": "2px",
    "lg": "12px",
    "full": "300px"
  },
  "shadows": {
    "sm": "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px",
    "xs": "rgba(0, 0, 0, 0.05) 0px 2px 1px 0px, rgba(0, 0, 0, 0.25) 0px 0px 1px 0px",
    "lg": "rgba(0, 0, 0, 0.12) 0px 18px 13.5px 0px, rgba(0, 0, 0, 0.1) 0px 7.5px 6px 0px, rgba(0, 0, 0, 0.08) 0px 4.5px 3px 0px"
  },
  "states": {
    "hover": {
      "opacity": 0.08
    },
    "focus": {
      "opacity": 0.12
    },
    "active": {
      "opacity": 0.16
    },
    "disabled": {
      "opacity": 0.38
    }
  }
};

// MUI v5 theme
export const muiTheme = {
  "palette": {
    "primary": {
      "main": "#e1ded4",
      "light": "hsl(46, 18%, 95%)",
      "dark": "hsl(46, 18%, 71%)"
    },
    "secondary": {
      "main": "#0099dd",
      "light": "hsl(198, 100%, 58%)",
      "dark": "hsl(198, 100%, 28%)"
    },
    "background": {
      "default": "#e1ded4",
      "paper": "#000000"
    },
    "text": {
      "primary": "#000000",
      "secondary": "#ffffff"
    }
  },
  "typography": {
    "fontFamily": "'Bitter', sans-serif",
    "h1": {
      "fontSize": "43.648px",
      "fontWeight": "400",
      "lineHeight": "48.6064px"
    }
  },
  "shape": {
    "borderRadius": 2
  },
  "shadows": [
    "rgba(0, 0, 0, 0) 0px 0px 0px 1px",
    "rgb(0, 0, 0) 0px 0px 0px 0px",
    "rgba(0, 0, 0, 0.05) 0px 2px 1px 0px, rgba(0, 0, 0, 0.25) 0px 0px 1px 0px",
    "rgb(128, 128, 128) 0px 0px 5px 0px",
    "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px"
  ]
};

export default theme;
