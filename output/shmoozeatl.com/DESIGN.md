---
name: "The Southern Shmooze"
description: "Design tokens extracted from https://www.shmoozeatl.com/"
colors:
  primary: "#000000"
  secondary: "#0099DD"
  surface: "#FFFFFF"
  on-surface: "#333333"
typography:
  text-1:
    fontFamily: "Shrikhand"
    fontSize: "85.12px"
    fontWeight: 400
    lineHeight: 1.06
  text-2:
    fontFamily: "Bitter"
    fontSize: "78.7px"
    fontWeight: 400
    lineHeight: 0.3
  text-3:
    fontFamily: "Shrikhand"
    fontSize: "78.7px"
    fontWeight: 400
    lineHeight: 1
  text-4:
    fontFamily: "Shrikhand"
    fontSize: "73.6px"
    fontWeight: 400
    lineHeight: 1.4
  text-5:
    fontFamily: "Shrikhand"
    fontSize: "57.472px"
    fontWeight: 400
    lineHeight: 1.11
  text-6:
    fontFamily: "Shrikhand"
    fontSize: "29.824px"
    fontWeight: 400
    lineHeight: 1.17
  text-7:
    fontFamily: "Shrikhand"
    fontSize: "27.52px"
    fontWeight: 400
    lineHeight: 1.2
  text-8:
    fontFamily: "Bitter"
    fontSize: "25.216px"
    fontWeight: 400
    lineHeight: 1.5
  text-9:
    fontFamily: "Shrikhand"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.15
  text-10:
    fontFamily: "Shrikhand"
    fontSize: "19.5px"
    fontWeight: 700
    lineHeight: 1.2
  text-11:
    fontFamily: "Bitter"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  text-12:
    fontFamily: "Roboto"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.3
  text-13:
    fontFamily: "Shrikhand"
    fontSize: "16.5px"
    fontWeight: 700
    lineHeight: 1.25
  text-14:
    fontFamily: "sans-serif"
    fontSize: "16px"
    fontWeight: 400
  text-15:
    fontFamily: "Bitter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1
  text-16:
    fontFamily: "Shrikhand"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.2
  text-17:
    fontFamily: "Bitter"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
  text-18:
    fontFamily: "Bitter"
    fontSize: "15px"
    fontWeight: 400
  text-19:
    fontFamily: "Roboto"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.3
  text-20:
    fontFamily: "Roboto"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.3
  text-21:
    fontFamily: "Bitter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 2.86
  text-22:
    fontFamily: "sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  text-23:
    fontFamily: "Bitter"
    fontSize: "13.696px"
    fontWeight: 400
    lineHeight: 1.5
  text-24:
    fontFamily: "sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
  text-25:
    fontFamily: "Bitter"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1
  text-26:
    fontFamily: "Roboto"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.4
  text-27:
    fontFamily: "Roboto"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.4
spacing:
  base: "8px"
  xs: "1px"
  sm: "1.6px"
  md: "2px"
  lg: "3.75px"
  xl: "4px"
  xxl: "4.75px"
  xxxl: "5px"
  xxxxl: "6px"
rounded:
  sm: "2px"
  md: "12px"
  lg: "25.84px"
  xl: "300px"
  full: "9999px"
components:
  button-observed:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "32px 48px"
  input-observed:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "0px"
    padding: "7.5px 11.25px"
---

# Design System

## Overview
Design tokens extracted from shmoozeatl.com. The YAML front matter contains machine-readable values observed by Dembrandt when available; the sections below summarize the extracted evidence without redesigning or correcting the source site.

## Colors
- **Primary** (#000000): Observed color token extracted from the site's palette, semantic CSS, or component styles.
- **Secondary** (#0099DD): Observed color token extracted from the site's palette, semantic CSS, or component styles.
- **Surface** (#FFFFFF): Observed color token extracted from the site's palette, semantic CSS, or component styles.
- **On Surface** (#333333): Observed color token extracted from the site's palette, semantic CSS, or component styles.

## Typography
- **Text 1**: Shrikhand, 85.12px, regular
- **Text 2**: Bitter, 78.7px, regular
- **Text 3**: Shrikhand, 78.7px, regular
- **Text 4**: Shrikhand, 73.6px, regular
- **Text 5**: Shrikhand, 57.472px, regular
- **Text 6**: Shrikhand, 29.824px, regular
- **Font source**: Google Fonts (Shrikhand, Bitter, Roboto, Google Sans Text)

## Layout
Observed spacing scale: 8px spacing scale.
- **Spacing tokens**: base 8px, xs 1px, sm 1.6px, md 2px, lg 3.75px, xl 4px, xxl 4.75px, xxxl 5px, xxxxl 6px
- **Responsive breakpoints**: 768px, 767px

## Elevation & Depth
Observed box-shadow styles: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; rgb(0, 0, 0) 0px 0px 0px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 1px

## Shapes
Observed rounded-corner tokens: sm 2px, md 12px, lg 25.84px, xl 300px, full 9999px.

## Components
- **Buttons**: Observed sample with radius 300px, background #000000, text #FFFFFF, padding 32px 48px, border 3px solid rgb(0, 0, 0)
- **Inputs**: Observed sample with 1px solid border, 0px radius
