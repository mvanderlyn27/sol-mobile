// mediaStorage.js
import * as FileSystem from "expo-file-system";
import { Dimensions } from "react-native";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator

// Define your media directory
const mediaDirectory = `${FileSystem.documentDirectory}media/`;

// Ensure the directory exists
const ensureMediaDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(mediaDirectory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(mediaDirectory, { intermediates: true });
  }
};

// Save a file to the media directory
export const saveMediaFile = async (uri: string) => {
  await ensureMediaDirectoryExists();

  const fileName = uri.split("/").pop(); // or use a UUID for unique names
  const newUri = `${mediaDirectory}${fileName}`;

  try {
    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });
    return newUri; // return the local URI for storage in your database
  } catch (error) {
    console.error("Error saving media file:", error);
    throw error;
  }
};

// Delete a file from the media directory
export const deleteMediaFile = async (fileUri: string) => {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (error) {
    console.error("Error deleting media file:", error);
    throw error;
  }
};

// Retrieve all files in the media directory
export const listMediaFiles = async () => {
  const files = await FileSystem.readDirectoryAsync(mediaDirectory);
  return files.map((file) => `${mediaDirectory}${file}`);
};

export const resizeImage = async (uri: string, originalWidth?: number, originalHeight?: number) => {
  // Get screen dimensions
  // const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Get original image info

  // Use the width and height from the metadata

  // Calculate new dimensions based on the screen size
  // const aspectRatio = originalWidth / originalHeight;
  // let newWidth, newHeight;

  // if (originalWidth > screenWidth || originalHeight > screenHeight) {
  //   if (aspectRatio > 1) {
  //     // Landscape
  //     newWidth = screenWidth;
  //     newHeight = Math.round(screenWidth / aspectRatio);
  //   } else {
  //     // Portrait or Square
  //     newHeight = screenHeight;
  //     newWidth = Math.round(screenHeight * aspectRatio);
  //   }
  // } else {
  //   // If the original image is already smaller than screen dimensions, keep it as is
  //   newWidth = originalWidth;
  //   newHeight = originalHeight;
  // }

  // Resize the image
  const manipResult = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 1,
    format: ImageManipulator.SaveFormat.WEBP,
  });

  return manipResult.uri; // Return the URI of the resized image
};
