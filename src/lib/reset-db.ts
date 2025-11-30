// Database reset utility - run this in browser console to see fresh itinerary
// Usage: Open browser console and run: resetAndReload()

export async function resetDatabase() {
  const dbName = 'trip-planner-db';
  
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    
    request.onsuccess = () => {
      console.log('✅ Database deleted successfully');
      resolve();
    };
    
    request.onerror = () => {
      console.error('❌ Error deleting database');
      reject(request.error);
    };
    
    request.onblocked = () => {
      console.warn('⚠️ Database deletion blocked. Close all tabs and try again.');
    };
  });
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).resetAndReload = async () => {
    await resetDatabase();
    console.log('🔄 Reloading page...');
    window.location.reload();
  };
  
  console.log('💡 To reset and see fresh itinerary, run: resetAndReload()');
}
