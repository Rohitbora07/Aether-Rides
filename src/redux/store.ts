// This is the modern way to create a Redux store (replaces createStore).
// It automatically sets up: Redux DevTools, Thunk middleware (for async actions), Good default configurations
import { configureStore } from "@reduxjs/toolkit";
// This reducer controls how the "user" part of the state changes.
import userReducer from "./userSlice"

export const store = configureStore({

    
    reducer: {  // The "reducer" field defines how different parts of state are managed.

        // "user" is the key in the global state.
        // userReducer is the function that manages this slice.
        // So your state will look like:
        // {
        //   user: { userData: ... }
        // }
        user: userReducer
    },
});


// -------- TYPESCRIPT HELPERS --------


// RootState type:
// This extracts the type of the entire Redux state automatically.
// typeof store.getState → gets the function type
// ReturnType → extracts the return value type of that function
export type RootState = ReturnType<typeof store.getState>;

// Example resulting type:
// {
//   user: {
//     userData: IUser | null
//   }
// }


// AppDispatch type:
// This extracts the type of the dispatch function from the store.
// Useful so TypeScript knows what actions you can dispatch.
export type AppDispatch = typeof store.dispatch;