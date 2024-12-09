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
export const resizeImage = async (uri: string, originalWidth: number, originalHeight: number) => {
  // const MAX_DIMENSION = 1024; // Define the maximum width or height
  // const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // const aspectRatio = originalWidth / originalHeight;
  // let newWidth, newHeight;

  // if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
  //   if (aspectRatio > 1) {
  //     newWidth = MAX_DIMENSION;
  //     newHeight = Math.round(MAX_DIMENSION / aspectRatio);
  //   } else {
  //     newHeight = MAX_DIMENSION;
  //     newWidth = Math.round(MAX_DIMENSION * aspectRatio);
  //   }
  // } else {
  //   newWidth = originalWidth;
  //   newHeight = originalHeight;
  // }

  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    // [{ resize: { width: originalWidth, height: originalHeight} }],
    [],
    {
      compress: 0.8, // Adjust compression level
      format: ImageManipulator.SaveFormat.JPEG, // Use JPEG for good quality and size balance
    }
  );

  return manipResult.uri;
};
