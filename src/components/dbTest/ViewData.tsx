import { database } from "@/src/localDb/database";
import Page from "@/src/localDb/models/Page";
import { withObservables } from "@nozbe/watermelondb/react";
import { View } from "moti";
import { Text } from "moti";
import { styled } from "nativewind";
const StyledView = styled(View);

function ViewData({ pages }: { pages: Page[] }) {
  return (
    <StyledView className="flex-col justify-center">
      {pages.map((page) => (
        <Text key={page.id}>{page.canvas?.items?.length}</Text>
      ))}
    </StyledView>
  );
}
const enhance = withObservables([], () => ({
  pages: database.get<Page>("pages").query(),
}));
const EnhancedViewData = enhance(ViewData);
export default EnhancedViewData;
