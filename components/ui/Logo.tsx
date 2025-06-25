"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  textColor?: string;
  className?: string;
  href?: string;
}

const Logo: React.FC<LogoProps> = ({
  showText = true,
  size = "md",
  textColor = "text-white",
  className,
  href = "/",
}) => {
  // Size mappings for the SVG
  const sizeMap = {
    sm: {
      container: "w-6 h-6",
      text: "text-lg",
      spacing: "ml-2",
    },
    md: {
      container: "w-8 h-8",
      text: "text-xl",
      spacing: "ml-3",
    },
    lg: {
      container: "w-10 h-10",
      text: "text-2xl",
      spacing: "ml-3",
    },
  };

  const logoContent = (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        className={sizeMap[size].container}
        viewBox="0,0,256,256"
      >
        <defs>
          <linearGradient
            x1="48"
            y1="29.833"
            x2="48"
            y2="35.539"
            gradientUnits="userSpaceOnUse"
            id="color-1_43987_gr1"
          >
            <stop offset="0" stopColor="#70dfff"></stop>
            <stop offset="1" stopColor="#70afff"></stop>
          </linearGradient>
          <linearGradient
            x1="21"
            y1="22.833"
            x2="21"
            y2="37.504"
            gradientUnits="userSpaceOnUse"
            id="color-2_43987_gr2"
          >
            <stop offset="0" stopColor="#70dfff"></stop>
            <stop offset="1" stopColor="#70afff"></stop>
          </linearGradient>
          <linearGradient
            x1="32"
            y1="2"
            x2="32"
            y2="61.397"
            gradientUnits="userSpaceOnUse"
            id="color-3_43987_gr3"
          >
            <stop offset="0" stopColor="#00c6ff"></stop>
            <stop offset="1" stopColor="#c822ff"></stop>
          </linearGradient>
          <linearGradient
            x1="45"
            y1="2"
            x2="45"
            y2="61.397"
            gradientUnits="userSpaceOnUse"
            id="color-4_43987_gr4"
          >
            <stop offset="0" stopColor="#00c6ff"></stop>
            <stop offset="1" stopColor="#c822ff"></stop>
          </linearGradient>
          <linearGradient
            x1="11"
            y1="2"
            x2="11"
            y2="61.397"
            gradientUnits="userSpaceOnUse"
            id="color-5_43987_gr5"
          >
            <stop offset="0" stopColor="#00c6ff"></stop>
            <stop offset="1" stopColor="#c822ff"></stop>
          </linearGradient>
          <linearGradient
            x1="28"
            y1="2"
            x2="28"
            y2="61.397"
            gradientUnits="userSpaceOnUse"
            id="color-6_43987_gr6"
          >
            <stop offset="0" stopColor="#00c6ff"></stop>
            <stop offset="1" stopColor="#c822ff"></stop>
          </linearGradient>
        </defs>
        <g
          fill="none"
          fillRule="nonzero"
          stroke="none"
          strokeWidth="1"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit="10"
          strokeDasharray=""
          strokeDashoffset="0"
          fontFamily="none"
          fontWeight="none"
          fontSize="none"
          textAnchor="none"
          style={{ mixBlendMode: "normal" }}
        >
          <g transform="scale(4,4)">
            <path
              d="M53.91,30c-0.47,2.84 -2.94,5 -5.91,5c-2.97,0 -5.44,-2.16 -5.91,-5z"
              fill="url(#color-1_43987_gr1)"
            ></path>
            <path
              d="M28,23v10c-2.21,0 -4,1.79 -4,4h-10c0,-7.73 6.27,-14 14,-14z"
              fill="url(#color-2_43987_gr2)"
            ></path>
            <path
              d="M58,29c1.103,0 2,-0.897 2,-2v-2c0,-1.103 -0.897,-2 -2,-2h-10.517c-4.511,-6.268 -11.749,-10 -19.483,-10c-13.233,0 -24,10.767 -24,24c0,13.233 10.767,24 24,24c6.837,0 13.322,-2.914 17.878,-8h12.122c1.103,0 2,-0.897 2,-2v-2c0,-1.103 -0.897,-2 -2,-2c0,-3.962 -2.321,-7.382 -5.67,-9c3.349,-1.618 5.67,-5.038 5.67,-9zM58,27h-20v-2h20zM36,49v2c0,0.686 0.348,1.293 0.876,1.653c-2.691,1.535 -5.713,2.347 -8.876,2.347c-9.587,0 -17.426,-7.541 -17.949,-17h13.05c0.465,2.279 2.484,4 4.899,4c2.757,0 5,-2.243 5,-5c0,-2.414 -1.721,-4.434 -4,-4.899v-13.051c3.806,0.206 7.359,1.574 10.287,3.95h-1.287c-1.103,0 -2,0.897 -2,2v2c0,1.103 0.897,2 2,2c0,3.962 2.322,7.382 5.67,9c-3.348,1.618 -5.67,5.038 -5.67,9c-1.103,0 -2,0.897 -2,2zM28,34c1.654,0 3,1.346 3,3c0,1.654 -1.346,3 -3,3c-1.654,0 -3,-1.346 -3,-3c0,-1.654 1.346,-3 3,-3zM27,32.101c-1.956,0.399 -3.5,1.943 -3.899,3.899h-13.05c0.505,-9.126 7.823,-16.444 16.949,-16.949zM28,59c-12.131,0 -22,-9.869 -22,-22c0,-12.131 9.869,-22 22,-22c6.594,0 12.795,2.963 16.958,8h-2.701c-3.745,-3.81 -8.907,-6 -14.257,-6c-11.028,0 -20,8.972 -20,20c0,11.028 8.972,20 20,20c4.372,0 8.504,-1.389 11.983,-4h3.113c-4.066,3.836 -9.451,6 -15.096,6zM58,51h-20v-2h20zM56,47h-16c0,-4.072 3.06,-7.436 7,-7.931v1.931h2v-1.931c3.94,0.495 7,3.859 7,7.931zM49,36.931v-1.931h-2v1.931c-3.94,-0.495 -7,-3.859 -7,-7.931h16c0,4.072 -3.06,7.436 -7,7.931z"
              fill="url(#color-3_43987_gr3)"
            ></path>
            <path
              d="M49.949,17.536l-8.484,-8.486l-1.414,1.414l8.484,8.486z"
              fill="url(#color-4_43987_gr4)"
            ></path>
            <path
              d="M15.949,10.464l-1.414,-1.414l-8.484,8.486l1.414,1.414z"
              fill="url(#color-5_43987_gr5)"
            ></path>
            <path
              d="M28,11c2.206,0 4,-1.794 4,-4c0,-2.206 -1.794,-4 -4,-4c-2.206,0 -4,1.794 -4,4c0,2.206 1.794,4 4,4zM28,5c1.103,0 2,0.897 2,2c0,1.103 -0.897,2 -2,2c-1.103,0 -2,-0.897 -2,-2c0,-1.103 0.897,-2 2,-2z"
              fill="url(#color-6_43987_gr6)"
            ></path>
          </g>
        </g>
      </svg>
      {showText && (
        <span
          className={cn(
            "font-semibold font-serif tracking-widest",
            sizeMap[size].text,
            sizeMap[size].spacing,
            textColor
          )}
        >
          Tracksy
        </span>
      )}
    </>
  );

  // Wrap in Link if href is provided
  if (href) {
    return (
      <Link href={href} className={cn("flex items-center", className)}>
        {logoContent}
      </Link>
    );
  }

  // Otherwise just return the logo without a link
  return <div className={cn("flex items-center", className)}>{logoContent}</div>;
};

export default Logo; 