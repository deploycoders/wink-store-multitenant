const { getAdminSupabaseClient } = require("./src/lib/supabase/admin");

async function checkSchema() {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.rpc('get_column_names', { table_name: 'orders' });
  
  if (error) {
    // Fallback: try to select one row and see keys
    const { data: row, error: rowError } = await supabase.from('orders').select('*').limit(1).single();
    if (rowError) {
      console.error("Error:", rowError);
    } else {
      console.log("Columns:", Object.keys(row));
    }
  } else {
    console.log("Columns (RPC):", data);
  }
}

checkSchema();
