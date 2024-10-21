import { Database } from "@/src/types/supabase.types";
import { createSeedClient } from "@snaplet/seed";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { copycat, faker } from "@snaplet/copycat";

// Number of days for which to create page entries in the past
const DAYS_IN_PAST = 5;

const main = async () => {
  const seed = await createSeedClient({ dryRun: true });

  // Truncate all tables in the database
  await seed.$resetDatabase();

  // Seed the database with 10 waitlist entries
  const supabase = createClient<Database>(
    "http://127.0.0.1:54321",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
  );

  const PASSWORD = "testuser";
  for (let i = 0; i < 5; i += 1) {
    const email = copycat.email(i).toLowerCase();
    const avatar: string = faker.image.avatarGitHub();
    const fullName: string = copycat.fullName(i);
    const userName: string = copycat.username(i);
    await supabase.auth.signUp({
      email,
      password: PASSWORD,
      options: {
        data: {
          name: fullName,
        },
      },
    });
  }

  // Since `supabase.auth.signUp` creates a user, we should now have all the profiles created as well
  const { data: databaseProfiles } = await supabase.from("profiles").select("*");

  // Update each profile's avatar URL and create page entries
  for (const profile of databaseProfiles ?? []) {
    const avatar_url = `https://api.dicebear.com/9.x/miniavs/svg?seed=${profile.name}`;

    // Update the profile's avatar URL
    const { error } = await supabase.from("profiles").update({ avatar_url }).eq("id", profile.id);
    if (error) {
      console.error(`Failed to update avatar URL for profile: ${profile.name}`);
      continue;
    }

    // Create page entries for the current day and the past DAYS_IN_PAST days
    for (let dayOffset = 0; dayOffset <= DAYS_IN_PAST; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);

      const formattedDate = date.toISOString().split("T")[0]; // Format the date as YYYY-MM-DD

      // Uncomment to insert a new page entry associated with the profile
      // await supabase
      //   .from("pages")
      //   .insert({
      //     created_by: profile.id,
      //     created_at: formattedDate,
      //     title: `Journal Entry for ${formattedDate}`,
      //     content: `This is a sample content for ${formattedDate}`,
      //   });

      // console.log(`Created page entry for ${profile.name} on ${formattedDate}`);
    }
  }

  process.exit();
};

main();
