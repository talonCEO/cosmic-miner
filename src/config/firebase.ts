
// This is a stub file to prevent import errors.
// In a real application, this would contain Firebase configuration.

interface MockUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export const auth = {
  onAuthStateChanged: (callback: (user: MockUser | null) => void) => {
    // Mock implementation
    const mockUser: MockUser = {
      uid: "local-user",
      displayName: "Cosmic Miner",
      email: "player@example.com",
      photoURL: null
    };
    
    // Simulate a logged-in user
    setTimeout(() => callback(mockUser), 500);
    
    return () => {}; // Unsubscribe function
  },
  signOut: async () => {
    console.log("Mock sign out");
    return Promise.resolve();
  },
  currentUser: {
    uid: "local-user",
    displayName: "Cosmic Miner",
    email: "player@example.com",
    photoURL: null
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
      },
      update: async (data: any) => {
        console.log(`Mock update data in ${path}/${id}:`, data);
        return Promise.resolve();
      }
    }),
    where: (field: string, op: string, value: any) => ({
      get: async () => ({
        empty: true,
        docs: []
      })
    })
  })
};
