export const BG_01 = require("./backgrounds/BG_Paper_01.jpg");
export const BG_02 = require("./backgrounds/BG_Paper_02.jpg");
export const BG_03 = require("./backgrounds/BG_Paper_03.jpg");
export const BG_04 = require("./backgrounds/BG_Paper_04.jpg");
export const BG_05 = require("./backgrounds/BG_Paper_05.jpg");
export const BG_06 = require("./backgrounds/BG_Paper_06.jpg");
export const BG_07 = require("./backgrounds/BG_Paper_07.jpg");
export const BG_08 = require("./backgrounds/BG_Paper_08.jpg");
export const BG_09 = require("./backgrounds/BG_Paper_09.jpg");
export const Tutorial_01 = require("./tutorial/Tutorials_p01.png");
export const Tutorial_02 = require("./tutorial/Tutorials_p02.png");
export const Tutorial_03 = require("./tutorial/Tutorials_p03.png");
export const Tutorial_04 = require("./tutorial/Tutorials_p04.png");
export const Tutorial_05 = require("./tutorial/Tutorials_p05.png");
export const Tutorial_06 = require("./tutorial/Tutorials_p06.png");
export const Tutorial_07 = require("./tutorial/Tutorials_p07.png");
export const Tutorial_08 = require("./tutorial/Tutorials_p08.png");
export const Tutorial_09 = require("./tutorial/Tutorials_p09.png");
export const Tutorial_10 = require("./tutorial/Tutorials_p10.png");
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
    case "bg_06":
      return BG_06;
    case "bg_07":
      return BG_07;
    case "bg_08":
      return BG_08;
    case "bg_09":
      return BG_09;
    case "tutorial_01":
      return Tutorial_01;
    case "tutorial_02":
      return Tutorial_02;
    case "tutorial_03":
      return Tutorial_03;
    case "tutorial_04":
      return Tutorial_04;
    case "tutorial_05":
      return Tutorial_05;
    case "tutorial_06":
      return Tutorial_06;
    case "tutorial_07":
      return Tutorial_07;
    case "tutorial_08":
      return Tutorial_08;
    case "tutorial_09":
      return Tutorial_09;
    case "tutorial_10":
      return Tutorial_10;
    case "default_avatar":
      return DefaultAvatar;
    default:
      return BG_04;
  }
};
