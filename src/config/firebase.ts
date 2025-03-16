
// This is a stub file to prevent import errors.
// In a real application, this would contain Firebase configuration.

export const auth = {
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Mock implementation
    callback(null);
    return () => {}; // Unsubscribe function
  },
  signOut: async () => {
    console.log("Mock sign out");
    return Promise.resolve();
  }
};

export const db = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({
        exists: false,
        data: () => null
      }),
      set: async (data: any) => {
        console.log(`Mock set data to ${path}/${id}:`, data);
        return Promise.resolve();
      }
    })
  })
};
