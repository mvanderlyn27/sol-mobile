import { useData } from "@/src/contexts/DataProvider";
import { Ionicons } from "@expo/vector-icons";
import { AnimatePresence, MotiView, Text } from "moti";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Pressable, TextInput } from "react-native";
import Toast from "react-native-root-toast";
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
export default function ProfileName() {
  const { profile, updateProfile, profileError } = useData();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(profile?.name);
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  useEffect(() => {
    const isNameChanged = name !== profile?.name;

    setHasChanges(isNameChanged);
  }, [name]);
  const handleSave = async () => {
    setUpdating(true);
    if (!name) {
      Toast.show("Please enter a name", {});
      return;
    }
    await updateProfile({ name });
    if (profileError) {
      setUpdating(false);
      Toast.show("Update Failed, please try again", {});
      return;
    }
    Toast.show("Updated", {});
    setEditMode(false);
    setHasChanges(false);
    return;
  };
  return (
    <AnimatePresence>
      {editMode ? (
        <StyledMotiView className="px-14 py-4 w-full flex-col justify-center items-center">
          <StyledMotiView
            className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between px-4 py-3"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 500 }}>
            <StyledText className="text-secondary">Name:</StyledText>
            <StyledTextInput
              value={name ?? ""}
              //   editable={isEditing.password}
              onChangeText={setName}
              className="flex-1 ml-4 text-secondary"
            />
            {/* <StyledPressable onPress={() => setIsEditing({ ...isEditing, password: !isEditing.password })}> */}
            <Ionicons name="pencil" size={20} color="#E7DBCB" />
            {/* </StyledPressable> */}
          </StyledMotiView>
          {/* save */}
          <StyledMotiView className="w-full flex-row gap-4">
            <StyledPressable onPress={() => setEditMode(false)} className={`flex-1 py-3 mb-2 bg-red-500 rounded-lg`}>
              <StyledText className="text-center text-white">Cancel</StyledText>
            </StyledPressable>
            <StyledPressable
              onPress={handleSave}
              disabled={!hasChanges || updating}
              className={`flex-1 py-3 mb-2 ${
                !hasChanges || updating ? "bg-gray-400" : "bg-secondary"
              } border border-darkPrimary rounded-lg`}>
              <StyledText className="text-center text-darkPrimary">Save Changes</StyledText>
            </StyledPressable>
          </StyledMotiView>
        </StyledMotiView>
      ) : (
        <StyledPressable
          onPress={() => setEditMode(true)}
          className="flex-row py-4 gap-2 justify-center items-center w-full">
          <StyledText className="text-xl text-secondary" style={{ fontFamily: "PragmaticaExtended" }}>
            {name?.toUpperCase()}
          </StyledText>
          <Ionicons name="pencil" size={20} color="#E7DBCB" />
        </StyledPressable>
      )}
    </AnimatePresence>
  );
}
