import { styled } from "nativewind";
import React from "react";
import { Text } from "react-native";

const StyledText = styled(Text);

export const TextWithBackground = ({
  text,
  fontSize,
  backgroundColor,
  textColor,
  fontFamily = "Calibri",
  textAlign = "left",
}: {
  text: string;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
}) => {
  return (
    <StyledText
      style={{
        fontSize,
        fontFamily,
        textAlign,
        color: textColor,
        lineHeight: fontSize * 1.1, // Adjust line height for better readability
      }}>
      {text.split("\n").map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {line.split(" ").map((word, wordIndex) => (
            <StyledText
              key={wordIndex}
              style={{
                backgroundColor: backgroundColor !== "transparent" ? backgroundColor : "transparent",
                color: textColor,
              }}>
              {word}
            </StyledText>
          ))}
          {lineIndex < text.split("\n").length - 1 && "\n"}
        </React.Fragment>
      ))}
    </StyledText>
  );
};
