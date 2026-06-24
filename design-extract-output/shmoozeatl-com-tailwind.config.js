/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(46, 18%, 97%)',
            '100': 'hsl(46, 18%, 94%)',
            '200': 'hsl(46, 18%, 86%)',
            '300': 'hsl(46, 18%, 76%)',
            '400': 'hsl(46, 18%, 64%)',
            '500': 'hsl(46, 18%, 50%)',
            '600': 'hsl(46, 18%, 40%)',
            '700': 'hsl(46, 18%, 32%)',
            '800': 'hsl(46, 18%, 24%)',
            '900': 'hsl(46, 18%, 16%)',
            '950': 'hsl(46, 18%, 10%)',
            DEFAULT: '#e1ded4'
        },
        secondary: {
            '50': 'hsl(198, 100%, 97%)',
            '100': 'hsl(198, 100%, 94%)',
            '200': 'hsl(198, 100%, 86%)',
            '300': 'hsl(198, 100%, 76%)',
            '400': 'hsl(198, 100%, 64%)',
            '500': 'hsl(198, 100%, 50%)',
            '600': 'hsl(198, 100%, 40%)',
            '700': 'hsl(198, 100%, 32%)',
            '800': 'hsl(198, 100%, 24%)',
            '900': 'hsl(198, 100%, 16%)',
            '950': 'hsl(198, 100%, 10%)',
            DEFAULT: '#0099dd'
        },
        accent: {
            '50': 'hsl(10, 85%, 97%)',
            '100': 'hsl(10, 85%, 94%)',
            '200': 'hsl(10, 85%, 86%)',
            '300': 'hsl(10, 85%, 76%)',
            '400': 'hsl(10, 85%, 64%)',
            '500': 'hsl(10, 85%, 50%)',
            '600': 'hsl(10, 85%, 40%)',
            '700': 'hsl(10, 85%, 32%)',
            '800': 'hsl(10, 85%, 24%)',
            '900': 'hsl(10, 85%, 16%)',
            '950': 'hsl(10, 85%, 10%)',
            DEFAULT: '#f1694f'
        },
        'neutral-50': '#000000',
        'neutral-100': '#333333',
        'neutral-200': '#ffffff',
        'neutral-300': '#efece6',
        'neutral-400': '#bbbbbb',
        'neutral-500': '#cdd5df',
        'neutral-600': '#a9a9a9',
        background: '#e1ded4',
        foreground: '#000000'
    },
    fontFamily: {
        body: [
            'Google Sans Text',
            'sans-serif'
        ],
        heading: [
            'Shrikhand',
            'sans-serif'
        ]
    },
    fontSize: {
        '18': [
            '18px',
            {
                lineHeight: '23.4px'
            }
        ],
        '21': [
            '21px',
            {
                lineHeight: '24.15px',
                letterSpacing: '-0.42px'
            }
        ],
        '48': [
            '48px',
            {
                lineHeight: '48px'
            }
        ],
        '56': [
            '56px',
            {
                lineHeight: '24px'
            }
        ],
        '62.08': [
            '62.08px',
            {
                lineHeight: '65.5565px',
                letterSpacing: '-1.2416px'
            }
        ],
        '54.4': [
            '54.4px',
            {
                lineHeight: '76.16px',
                letterSpacing: '-1.088px'
            }
        ],
        '52.1': [
            '52.1px',
            {
                lineHeight: '24px'
            }
        ],
        '43.648': [
            '43.648px',
            {
                lineHeight: '48.6064px',
                letterSpacing: '-0.87296px'
            }
        ],
        '25.216': [
            '25.216px',
            {
                lineHeight: '29.533px',
                letterSpacing: '-0.50432px'
            }
        ],
        '23.68': [
            '23.68px',
            {
                lineHeight: '28.416px',
                letterSpacing: '-0.4736px'
            }
        ],
        '22.144': [
            '22.144px',
            {
                lineHeight: '33.216px'
            }
        ],
        '19.5': [
            '19.5px',
            {
                lineHeight: '23.4px',
                letterSpacing: '-0.39px'
            }
        ],
        '19.2': [
            '19.2px',
            {
                lineHeight: '19.2px'
            }
        ],
        '16.5': [
            '16.5px',
            {
                lineHeight: 'normal'
            }
        ],
        '16.32': [
            '16.32px',
            {
                lineHeight: '16.32px'
            }
        ]
    },
    spacing: {
        '2': '4px',
        '11': '22px',
        '15': '30px',
        '16': '32px',
        '19': '38px',
        '20': '40px',
        '24': '48px',
        '32': '64px',
        '42': '84px',
        '73': '146px',
        '137': '274px',
        '151': '302px',
        '1px': '1px',
        '35px': '35px',
        '43px': '43px',
        '51px': '51px',
        '77px': '77px',
        '139px': '139px',
        '323px': '323px',
        '369px': '369px'
    },
    borderRadius: {
        xs: '2px',
        lg: '12px',
        full: '300px'
    },
    boxShadow: {
        sm: 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px',
        xs: 'rgba(0, 0, 0, 0.05) 0px 2px 1px 0px, rgba(0, 0, 0, 0.25) 0px 0px 1px 0px',
        lg: 'rgba(0, 0, 0, 0.12) 0px 18px 13.5px 0px, rgba(0, 0, 0, 0.1) 0px 7.5px 6px 0px, rgba(0, 0, 0, 0.08) 0px 4.5px 3px 0px'
    },
    screens: {
        '240px': '240px',
        sm: '576px',
        md: '769px',
        lg: '1025px',
        xl: '1281px'
    },
    transitionDuration: {
        '75': '0.075s',
        '100': '0.1s',
        '140': '0.14s',
        '150': '0.15s',
        '170': '0.17s',
        '200': '0.2s',
        '250': '0.25s',
        '300': '0.3s',
        '350': '0.35s',
        '400': '0.4s',
        '500': '0.5s',
        '600': '0.6s',
        '1000': '1s'
    },
    transitionTimingFunction: {
        default: 'ease',
        linear: 'linear',
        custom: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    container: {
        center: true,
        padding: '0px'
    },
    maxWidth: {
        container: '100%'
    }
},
  },
};
