const NEXT_PUBLIC_SUPABASE_ANON_KEY=`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYnhtcG9yaXp6cWZsbmZ0YXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyNDQ5MTIsImV4cCI6MjAzNzgyMDkxMn0.UIEJiUNkLsW28tBHmG-RQDW-I5JNlJLt62CSk9D_qG8`

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
const supabaseUrl = 'https://fabxmporizzqflnftavs.supabase.co'
const supabaseKey = NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const { data, error } = await supabase
    .schema('storage')
    .from('objects')
    .select('id, name')

const URL_PREFIX = 'https://fabxmporizzqflnftavs.supabase.co/storage/v1/object/public/archives/'
let bucketData = getLatestNames(data)
fs.writeFileSync('data/bucket-urls.json', JSON.stringify(bucketData, null, 2), 'utf-8');

function getLatestNames(data) {
    const latestNamesMap = new Map();
  
    data.forEach(({ name }) => {
      // Extract the prefix (everything before the timestamp)
      const [prefix, timestamp] = name.split('/');
      const url = `${URL_PREFIX}${name}`
      
      // If the prefix doesn't exist in the map, add it
      if (!latestNamesMap.has(prefix)) {
        latestNamesMap.set(prefix, url);
      } else {
        // Compare the current timestamp with the one already in the map
        const currentTimestamp = new Date(timestamp.split('.json')[0]);
        const existingName = latestNamesMap.get(prefix);
        const existingTimestamp = new Date(existingName.split('/')[1].split('.json')[0]);
        
        // If the current timestamp is more recent, update the map
        if (currentTimestamp > existingTimestamp) {
          latestNamesMap.set(prefix, url);
        }
      }
    });
  
    return Object.fromEntries(latestNamesMap);
  }
  


////////////
// const { data, error } = await supabase
//   .schema('public')
//   .from('profile')
//   .select('*')
// console.log(data)

