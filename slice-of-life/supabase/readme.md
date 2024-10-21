# Setting up local database

- install docker 
  - <https://docs.docker.com/desktop/install/mac-install/>
- install supabase cli
  - brew install supabase/tap/supabase
- startup db (seeds the seeds.sql file, puts in fonts and frames, but templates isn't working yet)
  - supabase start
- after db is up, seed the storage
  - supabase seed buckets
- create test users (must be run inside /supabase folder)
  - npm genUsers
