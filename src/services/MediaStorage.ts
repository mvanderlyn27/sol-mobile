// mediaStorage.js
import * as FileSystem from "expo-file-system";

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
