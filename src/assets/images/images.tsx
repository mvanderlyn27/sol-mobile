export const BG_01 = require("./backgrounds/BG_Paper_01.jpg");
export const BG_02 = require("./backgrounds/BG_Paper_02.jpg");
export const BG_03 = require("./backgrounds/BG_Paper_03.jpg");
export const BG_04 = require("./backgrounds/BG_Paper_04.jpg");
export const BG_05 = require("./backgrounds/BG_Paper_05.jpg");
export const BG_09 = require("./backgrounds/BG_Paper_09.jpg");
export const ColorWheel = require("./icons/color-wheel.png");

export const DefaultAvatar = require("./Default_Avatar.jpg");

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
    case "bg_09":
      return BG_09;
    case "color_wheel":
      return ColorWheel;
    case "default_avatar":
      return DefaultAvatar;
    default:
      return BG_04;
  }
};
