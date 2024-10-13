import { AnimatePresence } from "moti";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable } from "react-native";
import { useData } from "@/src/contexts/DataProvider";
import AntDesign from "@expo/vector-icons/AntDesign";
import tailwindConfig from "@/tailwind.config"; // Adjust this path to where your config is located
import { useJournal } from "@/src/contexts/JournalProvider";

const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledAnt = styled(AntDesign);

export default function DateSelector() {
  const { toDayString, selectedDate, setCurrentPageDate, dailyEntryAvailable } = useData();
  const { dateSelectorVisible } = useJournal();
  const today = toDayString(new Date());
  const curDay = selectedDate;

  const parseSelectedDate = (dateString: string): Date => {
    const [month, day, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // Month is zero-indexed
  };

  const onBack = () => {
    console.log(selectedDate, new Date(selectedDate ? parseSelectedDate(selectedDate) : today));
    const previousDate = new Date(selectedDate ? parseSelectedDate(selectedDate) : today);
    console.log("curDate", previousDate);
    previousDate.setDate(previousDate.getDate() - 1);
    console.log("previousDate", previousDate);
    setCurrentPageDate(toDayString(previousDate));
  };

  const onForward = () => {
    const nextDate = new Date(selectedDate ? parseSelectedDate(selectedDate) : today);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentPageDate(toDayString(nextDate));
  };

  const isToday = curDay === today;
  if (!dateSelectorVisible) return null;
  return (
    <AnimatePresence>
      <StyledMotiView
        className="absolute top-20 left-0 right-0 cursor-pointer-events-block" // Adjusted for spacing at the top
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <StyledView className="flex-1 justify-center items-center">
          <StyledMotiView
            className="flex-row rounded-2xl justify-center items-center"
            animate={{
              backgroundColor: dailyEntryAvailable && selectedDate === toDayString(new Date()) ? "#F99603" : "#262326", // Example colors for primary and darkPrimary
            }}
            transition={{ type: "timing", duration: 300 }}>
            <StyledPressable onPress={onBack}>
              {({ pressed }) => (
                <StyledMotiView
                  animate={{
                    scale: pressed ? 0.75 : 1,
                  }}
                  transition={{ type: "timing", duration: 100 }}
                  className="p-4">
                  <StyledAnt className="text-secondary" name="left" size={20} />
                </StyledMotiView>
              )}
            </StyledPressable>

            <StyledText className="text-white p-4 text-secondary">{curDay}</StyledText>

            <StyledPressable onPress={onForward} disabled={isToday}>
              {({ pressed }) => (
                <StyledMotiView
                  animate={{
                    scale: pressed ? 0.75 : 1,
                    opacity: isToday ? 0.5 : 1,
                  }}
                  transition={{ type: "timing", duration: 100 }}
                  className="p-4">
                  <StyledAnt className="text-secondary" name="right" size={20} />
                </StyledMotiView>
              )}
            </StyledPressable>
          </StyledMotiView>
        </StyledView>
      </StyledMotiView>
    </AnimatePresence>
  );
}
