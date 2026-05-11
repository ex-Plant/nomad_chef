import { Archivo_Black, Geist, Instrument_Serif } from "next/font/google";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const fontVariables = [
  archivoBlack.variable,
  instrumentSerif.variable,
  geistSans.variable,
].join(" ");
