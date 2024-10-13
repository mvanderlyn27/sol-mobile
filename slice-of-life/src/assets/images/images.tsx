export const BG_01 = require("./BG_Paper_01.jpg");
export const BG_02 = require("./BG_Paper_02.jpg");
export const BG_03 = require("./BG_Paper_03.jpg");
export const BG_04 = require("./BG_Paper_04.jpg");
export const BG_05 = require("./BG_Paper_05.jpg");
export const BG_06 = require("./BG_Paper_06.jpg");
export const BG_07 = require("./BG_Paper_07.jpg");
export const BG_08 = require("./BG_Paper_08.jpg");
export const BG_09 = require("./BG_Paper_09.jpg");
export const Party = require("./party.jpg");

//maybe in the future store in the cloud?
export const getImageFromPath = (path: string) => {
  switch (path) {
    case "bg_01":
      return BG_01;
    case "bg_02":
      return BG_02;
    case "bg_03":
      return BG_03;
    case "bg_04":
      return BG_04;
    case "bg_05":
      return BG_05;
    case "bg_06":
      return BG_06;
    case "bg_07":
      return BG_07;
    case "bg_08":
      return BG_08;
    case "bg_09":
      return BG_09;
    case "party":
      return Party;
    default:
      return BG_04;
  }
};
